"use client";

import NProgress from "nprogress";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bus,
  Clock,
  Languages,
  Loader2,
  MapPin,
  Navigation2,
  Signpost,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { dictionary, getInitialLang, saveLang, type Lang } from "./i18n";

type I18nText = (typeof dictionary)[Lang];

type Station = {
  id: string;
  name: string;
  code: string;
  routes: string;
};

type BusCardData = {
  route: string;
  nextMinutes?: number;
  nextSeconds?: number;
  nextArrival?: string;
  next2Minutes?: number;
  next2Seconds?: number;
  next2Arrival?: string;
  next3Minutes?: number;
  next3Seconds?: number;
  next3Arrival?: string;
};

type QueryResult = {
  stationName: string;
  data: BusCardData[];
};

type TabKey = "home" | "query" | "manage";
type CachedArrivalMap = Record<string, QueryResult>;
const STATIONS_STORAGE_KEY = "sg-bus-coming:stations";
const ARRIVAL_CACHE_KEY = "sg-bus-coming:arrival-cache";

const normalizeRouteKey = (route: string) => route.replace("路", "").trim().toUpperCase();

const SHARE_CODE_QUERY_KEY = "share_code";
const SHARE_CODE_PRESETS: Record<string, Station[]> = {
  // 通过分享码初始化站点（仅在本地无缓存时生效）
  "371": [
    { id: "share-371-1", name: "Home", code: "67661", routes: "371" },
    { id: "share-371-2", name: "SengKang", code: "67009", routes: "371" },
  ],
};

export default function Home() {
  const [lang, setLang] = useState<Lang>(() => getInitialLang());
  const t: I18nText = dictionary[lang];

  useEffect(() => {
    // 以缓存语言为准（解决 SSR 首屏固定 zh 导致的“刷新后语言不一致”）
    setLang(getInitialLang());
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [stations, setStations] = useState<Station[]>(() => {
    if (typeof window === "undefined") {
      // SSR 阶段无法读取 URL 与缓存，这里保持空白，交由客户端初始化
      return [];
    }
    try {
      const raw = localStorage.getItem(STATIONS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Station[]) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // ignore broken cache and use defaults
    }
    // 本地无缓存时默认空白；如果带分享码则注入预设站点
    const shareCode = new URLSearchParams(window.location.search).get(SHARE_CODE_QUERY_KEY) ?? "";
    return SHARE_CODE_PRESETS[shareCode] ?? [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [addModalDraft, setAddModalDraft] = useState<Omit<Station, "id">>({
    name: "",
    code: "",
    routes: "",
  });
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.08 });
  }, []);

  useEffect(() => {
    if (pendingRequests > 0) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [pendingRequests]);

  const progressFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    setPendingRequests((n) => n + 1);
    try {
      return await fetch(input, init);
    } finally {
      setPendingRequests((n) => Math.max(0, n - 1));
    }
  }, []);
  const [arrivalCache, setArrivalCache] = useState<CachedArrivalMap>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(ARRIVAL_CACHE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CachedArrivalMap) : {};
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // ignore broken cache
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STATIONS_STORAGE_KEY, JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem(ARRIVAL_CACHE_KEY, JSON.stringify(arrivalCache));
  }, [arrivalCache]);

  useEffect(() => {
    const uniqueStationCodes = Array.from(
      new Set(stations.map((station) => station.code.trim()).filter(Boolean)),
    );
    if (uniqueStationCodes.length === 0) return;

    let cancelled = false;

    const refreshArrivalData = async () => {
      const requests = uniqueStationCodes.map(async (stationCode) => {
        try {
          const response = await progressFetch("/api/weather", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ stationCode }),
          });
          if (!response.ok) return null;
          const data = (await response.json()) as QueryResult;
          return { stationCode, data };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(requests);
      if (cancelled) return;

      setArrivalCache((prev) => {
        const next = { ...prev };
        for (const item of results) {
          if (!item) continue;
          next[item.stationCode] = item.data;
        }
        return next;
      });
    };

    void refreshArrivalData();
    const intervalId = window.setInterval(() => {
      void refreshArrivalData();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [progressFetch, stations]);
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addStation = (newStation: Omit<Station, "id">) => {
    setStations((prev) => [...prev, { ...newStation, id: Date.now().toString() }]);
    setIsAddModalOpen(false);
    notify(t.added);
  };

  const updateStation = (stationId: string, updated: Omit<Station, "id">) => {
    setStations((prev) =>
      prev.map((station) => (station.id === stationId ? { ...station, ...updated } : station)),
    );
    setIsAddModalOpen(false);
    setEditingStationId(null);
    notify(t.updated);
  };

  const removeStation = (id: string) => {
    setStations((prev) => prev.filter((s) => s.id !== id));
    notify(t.removed);
  };

  const reorderStations = (fromIndex: number, toIndex: number) => {
    setStations((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    notify(t.stationSorted);
  };

  const reorderStationRoutes = (stationId: string, fromIndex: number, toIndex: number) => {
    setStations((prev) =>
      prev.map((station) => {
        if (station.id !== stationId) return station;
        const routes = station.routes
          .split(",")
          .map((route) => route.trim())
          .filter(Boolean);
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= routes.length ||
          toIndex >= routes.length ||
          fromIndex === toIndex
        ) {
          return station;
        }
        const nextRoutes = [...routes];
        const [moved] = nextRoutes.splice(fromIndex, 1);
        nextRoutes.splice(toIndex, 0, moved);
        return {
          ...station,
          routes: nextRoutes.join(", "),
        };
      }),
    );
    notify(t.routeSorted);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-[calc(env(safe-area-inset-bottom)+7.5rem)] selection:bg-emerald-100">
      <header className="z-20 bg-slate-100">
        <div className="h-[env(safe-area-inset-top)] bg-slate-100" />
        <div className="px-4 pb-3">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-[28px] bg-transparent px-5 py-4 text-emerald-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 p-2 shadow-sm shadow-emerald-200/80">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="flex items-baseline text-[30px] leading-none font-black tracking-tight">
                  <span>{t.appTitle}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = lang === "zh" ? "en" : "zh";
                  setLang(next);
                  saveLang(next);
                }}
                className="rounded-2xl bg-transparent p-3 text-emerald-600 transition-all hover:bg-emerald-100/50"
              >
                <Languages size={18} className="text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div className="animate-in fade-in slide-in-from-top-4 fixed top-3 left-1/2 z-[100] -translate-x-1/2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-orange-300/60">
          {notification}
        </div>
      )}

      <main className="mx-auto max-w-md p-4">
        {activeTab === "home" && <HomeView stations={stations} arrivalCache={arrivalCache} t={t} />}
        {activeTab === "manage" && (
          <ManageView
            stations={stations}
            onRemove={removeStation}
            onReorder={reorderStations}
            onReorderRoutes={reorderStationRoutes}
            onOpenEdit={(station) => {
              setEditingStationId(station.id);
              setAddModalDraft({
                name: station.name,
                code: station.code,
                routes: station.routes,
              });
              setAddModalKey((prev) => prev + 1);
              setIsAddModalOpen(true);
            }}
            onOpenAdd={() => {
              setEditingStationId(null);
              setAddModalDraft({ name: "", code: "", routes: "" });
              setAddModalKey((prev) => prev + 1);
              setIsAddModalOpen(true);
            }}
            t={t}
          />
        )}
        {activeTab === "query" && (
          <QueryView
            cachedArrivalMap={arrivalCache}
            onCacheArrival={(stationCode, data) =>
              setArrivalCache((prev) => ({ ...prev, [stationCode]: data }))
            }
            progressFetch={progressFetch}
            onQuickAdd={(draft) => {
              setEditingStationId(null);
              setAddModalDraft(draft);
              setAddModalKey((prev) => prev + 1);
              setIsAddModalOpen(true);
            }}
            t={t}
          />
        )}
      </main>

      <div
        className="fixed right-0 left-0 z-30 px-6"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        <nav className="mx-auto flex max-w-md items-center justify-around rounded-[32px] border border-slate-200 bg-white/95 px-3 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <NavButton
            active={activeTab === "home"}
            onClick={() => setActiveTab("home")}
            icon={<Clock size={22} />}
            label={t.tabArrivals}
          />
          <NavButton
            active={activeTab === "query"}
            onClick={() => setActiveTab("query")}
            icon={<Search size={22} />}
            label={t.tabDiscover}
          />
          <NavButton
            active={activeTab === "manage"}
            onClick={() => setActiveTab("manage")}
            icon={<Settings size={22} />}
            label={t.tabManage}
          />
        </nav>
      </div>

      {isAddModalOpen && (
        <AddStationModal
          key={addModalKey}
          mode={editingStationId ? "edit" : "add"}
          initialData={addModalDraft}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStationId(null);
          }}
          onSave={(station) => {
            if (editingStationId) {
              updateStation(editingStationId, station);
              return;
            }
            addStation(station);
          }}
          t={t}
        />
      )}
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-6 py-2 transition-all duration-300 ${
        active ? "bg-emerald-50 text-emerald-600" : "text-slate-400"
      }`}
    >
      <div className={`${active ? "scale-110" : "scale-100"} transition-transform`}>
        {icon}
      </div>
      <span
        className={`text-[10px] font-black tracking-wider uppercase ${
          active ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function HomeView({
  stations,
  arrivalCache,
  t,
}: {
  stations: Station[];
  arrivalCache: CachedArrivalMap;
  t: I18nText;
}) {
  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <MapPin size={32} className="text-emerald-200" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">暂无收藏站点</h3>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800">
          <Signpost size={18} className="text-emerald-500" />
          {t.hallTitle}
        </h2>
      </div>

      {stations.map((station) => (
        <div key={station.id} className="space-y-4">
          {station.routes.split(",").map((route) => (
            <EnhancedBusCard
              key={`${station.id}-${route}`}
              route={route.trim()}
              stationName={station.name}
              arrival={arrivalCache[station.code]?.data.find(
                (item) => normalizeRouteKey(item.route) === normalizeRouteKey(route),
              )}
              t={t}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function EnhancedBusCard({
  route,
  stationName,
  arrival,
  onRefresh,
  onAdd,
  t,
}: {
  route: string;
  stationName: string;
  arrival?: BusCardData;
  onRefresh?: () => void;
  onAdd?: () => void;
  t?: I18nText;
}) {
  const statusSoon = t?.statusSoon ?? "快到了";
  const statusComing = t?.statusComing ?? "即将到站";
  const currentTrip = t?.currentTrip ?? "当前班次";
  const nextTripLabel = t?.nextTrip ?? "下一趟";
  const nextNextTripLabel = t?.nextNextTrip ?? "下下趟";
  const gps = t?.gpsTime ?? "GPS定位";

  const mainTrip = {
    min: arrival?.nextMinutes ?? 2,
    sec: arrival?.nextSeconds ?? 3,
    time: arrival?.nextArrival ?? "11:27:56",
    status: (arrival?.nextMinutes ?? 2) <= 3 ? statusSoon : statusComing,
  };
  const nextTrip = {
    min: arrival?.next2Minutes ?? 14,
    sec: arrival?.next2Seconds ?? 20,
    arrival: arrival?.next2Arrival ?? "11:40:13",
  };
  const lastTrip = {
    min: arrival?.next3Minutes ?? 24,
    sec: arrival?.next3Seconds ?? 29,
    arrival: arrival?.next3Arrival ?? "11:50:22",
  };
  const progress = 85;

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-md transition-all hover:border-emerald-200 hover:shadow-lg">
      <div className="flex items-center justify-between bg-emerald-500 px-5 py-3 text-white">
        <div className="flex items-center gap-3">
          <h3 className="text-xl leading-none font-black">{route}</h3>
          <span className="border-l border-white/30 pl-3 text-[11px] font-bold opacity-80">
            {stationName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onAdd && (
            <button onClick={onAdd} className="rounded-lg p-1.5 transition-all hover:bg-white/20">
              <Plus size={14} />
            </button>
          )}
          <button
            onClick={onRefresh}
            className="rounded-lg p-1.5 transition-all hover:bg-white/20"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase">
                {currentTrip}
              </span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-4xl font-black tracking-tighter text-slate-900">
                {mainTrip.min}
              </span>
              <span className="mr-2 text-sm font-bold text-slate-800">分</span>
              <span className="text-4xl font-black tracking-tighter text-slate-900">
                {mainTrip.sec}
              </span>
              <span className="text-sm font-bold text-slate-800">秒</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <span className="rounded-lg bg-orange-600 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md shadow-orange-100">
              {mainTrip.status}
            </span>
            <p className="flex items-center justify-end gap-1 text-[9px] font-black text-slate-400 uppercase">
              <MapPin size={10} className="text-rose-400" /> {gps}: {mainTrip.time}
            </p>
          </div>
        </div>

        <div className="relative mt-2 mb-6 px-1">
          <div className="h-2 w-full rounded-full border border-slate-200/50 bg-slate-100 shadow-inner" />
          <div
            className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-400 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute -top-3.5 flex -translate-x-1/2 flex-col items-center transition-all duration-1000"
            style={{ left: `${progress}%` }}
          >
            <div className="rounded-md border border-white bg-orange-500 p-1.5 shadow-md">
              <Bus size={12} className="fill-current text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-3 items-center px-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {nextTripLabel}
            </span>
            <span className="text-center font-mono text-sm font-black tracking-tight text-slate-700">
              {nextTrip.min}m {nextTrip.sec}s
            </span>
            <div className="flex items-center justify-end gap-1.5">
              <Clock size={10} className="text-slate-300" />
              <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500">
                {nextTrip.arrival}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center px-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {nextNextTripLabel}
            </span>
            <span className="text-center font-mono text-sm font-black tracking-tight text-slate-700">
              {lastTrip.min}m {lastTrip.sec}s
            </span>
            <div className="flex items-center justify-end gap-1.5">
              <Clock size={10} className="text-slate-300" />
              <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500">
                {lastTrip.arrival}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageView({
  stations,
  onRemove,
  onReorder,
  onReorderRoutes,
  onOpenEdit,
  onOpenAdd,
  t,
}: {
  stations: Station[];
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onReorderRoutes: (stationId: string, fromIndex: number, toIndex: number) => void;
  onOpenEdit: (station: Station) => void;
  onOpenAdd: () => void;
  t: I18nText;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingRoute, setDraggingRoute] = useState<{
    stationId: string;
    routeIndex: number;
  } | null>(null);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
      <div className="mt-2 flex items-center justify-between px-1">
        <h2 className="text-xl font-black tracking-tight text-slate-800">{t.manageTitle}</h2>
        <button
          onClick={onOpenAdd}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-2.5 font-black text-white shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="text-sm tracking-wide">{t.addStation}</span>
        </button>
      </div>

      <div className="grid gap-2.5">
        {stations.map((station, index) => (
          <div
            key={station.id}
            draggable
            onDragStart={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('[data-route-chip="true"]')) {
                e.preventDefault();
                return;
              }
              setDraggingIndex(index);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingIndex === null) return;
              onReorder(draggingIndex, index);
              setDraggingIndex(null);
            }}
            onDragEnd={() => setDraggingIndex(null)}
            className={`group flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm transition-all ${
              draggingIndex === index
                ? "border-emerald-300 shadow-emerald-100"
                : "border-slate-200 hover:border-emerald-200 hover:shadow-md"
            }`}
          >
            <div className="space-y-1">
              <h3 className="text-base leading-none font-black text-slate-800">{station.name}</h3>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {t.stopCode}: {station.code}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {station.routes.split(",").map((r, routeIndex) => (
                  <span
                    key={`${station.id}-${r}`}
                    data-route-chip="true"
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggingRoute({ stationId: station.id, routeIndex });
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      if (!draggingRoute || draggingRoute.stationId !== station.id) return;
                      onReorderRoutes(station.id, draggingRoute.routeIndex, routeIndex);
                      setDraggingRoute(null);
                    }}
                    onDragEnd={() => setDraggingRoute(null)}
                    className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700"
                  >
                    {r.trim()}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="cursor-grab text-xs font-black tracking-widest text-slate-300">{t.drag}</span>
              <button
                onClick={() => onOpenEdit(station)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300 transition-all hover:bg-amber-50 hover:text-amber-600"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onRemove(station.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueryView({
  cachedArrivalMap,
  onCacheArrival,
  progressFetch,
  onQuickAdd,
  t,
}: {
  cachedArrivalMap: CachedArrivalMap;
  onCacheArrival: (stationCode: string, data: QueryResult) => void;
  progressFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  onQuickAdd: (draft: Omit<Station, "id">) => void;
  t: I18nText;
}) {
  const [queryCode, setQueryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCode, setLastSearchedCode] = useState("");

  const fetchBusData = async (forceCode?: string) => {
    const stationCode = (forceCode ?? queryCode).trim();
    if (!stationCode) return;

    setLoading(true);
    setError(null);
    const cached = cachedArrivalMap[stationCode];
    if (cached) {
      setResults(cached);
    } else {
      setResults(null);
    }

    try {
      const response = await progressFetch("/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stationCode }),
      });
      if (!response.ok) {
        throw new Error(t.queryFailed);
      }
      const data = (await response.json()) as QueryResult;
      setResults(data);
      setLastSearchedCode(stationCode);
      onCacheArrival(stationCode, data);
    } catch {
      setError(t.searchFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left-4 space-y-5 duration-500">
      <h2 className="px-1 text-lg font-black text-slate-800">{t.searchCityTitle}</h2>

      <div className="flex items-center rounded-[24px] border border-slate-200 bg-white p-2 shadow-md">
        <div className="pl-3 text-emerald-500">
          <Search size={22} />
        </div>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={queryCode}
          onChange={(e) => setQueryCode(e.target.value)}
          className="flex-1 border-none bg-transparent px-3 py-3 text-base font-black text-slate-700 outline-none placeholder:text-slate-300 focus:ring-0"
        />
        <button
          onClick={() => {
            void fetchBusData();
          }}
          disabled={loading}
          className="h-11 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : t.searchButton}
        </button>
      </div>

      {error && <p className="px-2 text-sm font-bold text-rose-600">{error}</p>}

      {results && (
        <div className="space-y-4">
          <p className="px-2 text-center text-[10px] font-black tracking-widest text-emerald-600 uppercase">
            {results.stationName} {t.realtimeStatus}
          </p>
          <div className="space-y-4">
            {results.data.map((item, idx) => (
              <EnhancedBusCard
                key={`${item.route}-${idx}`}
                route={item.route}
                stationName={results.stationName}
                arrival={item}
                onRefresh={() => fetchBusData(lastSearchedCode)}
                onAdd={() =>
                  onQuickAdd({
                    name: "",
                    code: lastSearchedCode,
                    routes: item.route,
                  })
                }
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddStationModal({
  mode,
  initialData,
  onClose,
  onSave,
  t,
}: {
  mode: "add" | "edit";
  initialData: Omit<Station, "id">;
  onClose: () => void;
  onSave: (station: Omit<Station, "id">) => void;
  t: I18nText;
}) {
  const [formData, setFormData] = useState(initialData);
  const hasAutoSavedRef = useRef(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const canAutoSave =
    mode === "add" && formData.code.trim() !== "" && formData.routes.trim() !== "";

  const normalizeRoutes = (routes: string) =>
    routes
      .replaceAll("，", ",")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");

  const saveAndClose = () => {
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      routes: normalizeRoutes(formData.routes),
    };
    if (!payload.name || !payload.code) return;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 backdrop-blur-sm">
      <div className="animate-in slide-in-from-bottom w-full max-w-md overflow-hidden rounded-t-3xl border-t border-white bg-white shadow-2xl duration-500">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800">
              {mode === "edit" ? t.addModalEditTitle : t.addModalAddTitle}
            </h2>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              {mode === "edit" ? t.addModalEditHint : t.addModalAddHint}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white p-1.5 text-slate-400 shadow-sm">
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAndClose();
          }}
          className="space-y-4 px-5 pt-4 pb-6"
        >
          <div className="space-y-1.5">
            <label className="pl-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {t.stationNameLabel}
            </label>
            <input
              ref={nameInputRef}
              required
              type="text"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              onBlur={() => {
                if (!canAutoSave || hasAutoSavedRef.current) return;
                if (!formData.name.trim()) return;
                hasAutoSavedRef.current = true;
                saveAndClose();
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="pl-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                {t.stationCodeLabel}
              </label>
              <input
                required
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="pl-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                {t.routesLabel}
              </label>
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder={t.routesPlaceholder}
                value={formData.routes}
                onChange={(e) => setFormData((prev) => ({ ...prev, routes: e.target.value }))}
              />
              <p className="pl-1 text-[10px] font-bold text-slate-400">{t.routesHint}</p>
            </div>
          </div>
          <button
            type="submit"
            className="mt-1 w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-black tracking-wide text-white uppercase shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            {mode === "edit" ? t.confirmEdit : t.confirmAdd}
          </button>
        </form>
      </div>
    </div>
  );
}
