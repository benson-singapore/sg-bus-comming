import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type ArrivelahETA = {
  time?: string;
  duration_ms?: number;
};

type ArrivelahService = {
  no: string;
  next?: ArrivelahETA;
  next2?: ArrivelahETA;
  next3?: ArrivelahETA;
};

type ArrivelahResponse = {
  services?: ArrivelahService[];
};

const ARRIVELAH_ENDPOINT = "https://arrivelah2.busrouter.sg/";

function toMinutesAndSeconds(durationMs?: number) {
  if (!durationMs || durationMs <= 0) {
    return { min: 0, sec: 0 };
  }
  const totalSeconds = Math.floor(durationMs / 1000);
  return {
    min: Math.floor(totalSeconds / 60),
    sec: totalSeconds % 60,
  };
}

function formatTime(isoTime?: string) {
  if (!isoTime) return "--:--:--";
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "--:--:--";
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

async function buildStationResponse(stationCode: string) {
  const targetUrl = new URL(ARRIVELAH_ENDPOINT);
  targetUrl.searchParams.set("id", stationCode);

  const response = await fetch(targetUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "upstream request failed", status: response.status },
      { status: 502 },
    );
  }

  const upstream = (await response.json()) as ArrivelahResponse;
  const data =
    upstream.services?.map((service) => {
      const next = toMinutesAndSeconds(service.next?.duration_ms);
      const next2 = toMinutesAndSeconds(service.next2?.duration_ms);
      const next3 = toMinutesAndSeconds(service.next3?.duration_ms);

      return {
        route: service.no,
        nextMinutes: next.min,
        nextSeconds: next.sec,
        nextArrival: formatTime(service.next?.time),
        next2Minutes: next2.min,
        next2Seconds: next2.sec,
        next2Arrival: formatTime(service.next2?.time),
        next3Minutes: next3.min,
        next3Seconds: next3.sec,
        next3Arrival: formatTime(service.next3?.time),
      };
    }) ?? [];

  return NextResponse.json({
    stationName: `站点 ${stationCode}`,
    data,
  });
}

export async function GET(request: NextRequest) {
  const stationCode = new URL(request.url).searchParams.get("city");
  if (!stationCode) {
    return NextResponse.json({ error: "city query is required" }, { status: 400 });
  }

  try {
    return await buildStationResponse(stationCode);
  } catch {
    return NextResponse.json({ error: "failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { stationCode?: string };
    const stationCode = body.stationCode?.trim();
    if (!stationCode) {
      return NextResponse.json({ error: "stationCode is required" }, { status: 400 });
    }
    return await buildStationResponse(stationCode);
  } catch {
    return NextResponse.json({ error: "failed to fetch data" }, { status: 500 });
  }
}
