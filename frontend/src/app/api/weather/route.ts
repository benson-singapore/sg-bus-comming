import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type ArrivelahETA = {
  time?: string;
  duration_ms?: number;
  // SD = 单层, DD = 双层, BD = 铰接式
  type?: string;
  // SEA = 有座位, SDA = 可站立, LSD = 站立空间有限
  load?: string;
  // WAB = 无障碍
  feature?: string;
  monitored?: number;
};

type ArrivelahService = {
  no: string;
  operator?: string;
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
  return date.toLocaleTimeString("zh-CN", {
    hour12: false,
    timeZone: "Asia/Singapore",
  });
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
        operator: service.operator ?? "",
        nextMinutes: next.min,
        nextSeconds: next.sec,
        nextArrival: formatTime(service.next?.time),
        nextType: service.next?.type ?? "",
        nextLoad: service.next?.load ?? "",
        nextFeature: service.next?.feature ?? "",
        nextMonitored: service.next?.monitored ?? 0,
        next2Minutes: next2.min,
        next2Seconds: next2.sec,
        next2Arrival: formatTime(service.next2?.time),
        next2Type: service.next2?.type ?? "",
        next2Load: service.next2?.load ?? "",
        next2Feature: service.next2?.feature ?? "",
        next2Monitored: service.next2?.monitored ?? 0,
        next3Minutes: next3.min,
        next3Seconds: next3.sec,
        next3Arrival: formatTime(service.next3?.time),
        next3Type: service.next3?.type ?? "",
        next3Load: service.next3?.load ?? "",
        next3Feature: service.next3?.feature ?? "",
        next3Monitored: service.next3?.monitored ?? 0,
      };
    }) ?? [];

  return NextResponse.json({
    // 只返回原始站码，展示文案交给前端按当前语言组装，避免接口返回写死的中文
    stationCode,
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
