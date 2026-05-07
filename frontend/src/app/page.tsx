"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bus,
  Building2,
  Check,
  Clock,
  Download,
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
  AlertTriangle,
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
const PWA_INSTALLED_MARK_KEY = "sg-bus-coming:pwa-installed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

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
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const pullStartYRef = useRef<number | null>(null);

  const progressFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, init);
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

  const refreshStationArrival = useCallback(
    async (stationCode: string) => {
      const normalizedCode = stationCode.trim();
      if (!normalizedCode) return;
      try {
        const response = await progressFetch("/api/weather", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stationCode: normalizedCode }),
        });
        if (!response.ok) return;
        const data = (await response.json()) as QueryResult;
        setArrivalCache((prev) => ({ ...prev, [normalizedCode]: data }));
      } catch {
        // ignore single refresh failure and keep last successful cache
      }
    },
    [progressFetch],
  );

  const refreshAllStations = useCallback(async () => {
    const uniqueStationCodes = Array.from(
      new Set(stations.map((station) => station.code.trim()).filter(Boolean)),
    );
    if (uniqueStationCodes.length === 0) return;
    await Promise.all(uniqueStationCodes.map((stationCode) => refreshStationArrival(stationCode)));
  }, [refreshStationArrival, stations]);

  useEffect(() => {
    const uniqueStationCodes = Array.from(
      new Set(stations.map((station) => station.code.trim()).filter(Boolean)),
    );
    if (uniqueStationCodes.length === 0) return;

    let cancelled = false;

    const refreshArrivalData = async () => {
      await Promise.all(uniqueStationCodes.map((stationCode) => refreshStationArrival(stationCode)));
      if (cancelled) return;
    };

    void refreshArrivalData();
    const intervalId = window.setInterval(() => {
      void refreshArrivalData();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [refreshStationArrival, stations]);

  const pullHintPulling = lang === "zh" ? "下拉刷新" : "Pull to refresh";
  const pullHintRelease = lang === "zh" ? "松手刷新" : "Release to refresh";
  const pullHintRefreshing = lang === "zh" ? "刷新中..." : "Refreshing...";
  const PULL_THRESHOLD = 72;
  const MAX_PULL_DISTANCE = 132;

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (activeTab !== "home" || isPullRefreshing) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 0) return;
    pullStartYRef.current = event.touches[0]?.clientY ?? null;
    setIsPulling(false);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (activeTab !== "home" || isPullRefreshing) return;
    if (pullStartYRef.current === null) return;
    const currentY = event.touches[0]?.clientY ?? pullStartYRef.current;
    const delta = currentY - pullStartYRef.current;
    if (delta <= 0) {
      setPullDistance(0);
      setIsPulling(false);
      return;
    }
    const dampedDistance = Math.min(MAX_PULL_DISTANCE, delta * 0.48);
    setPullDistance(dampedDistance);
    setIsPulling(true);
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (activeTab !== "home") {
      pullStartYRef.current = null;
      return;
    }
    const reachedThreshold = pullDistance >= PULL_THRESHOLD;
    pullStartYRef.current = null;
    setIsPulling(false);
    if (!reachedThreshold || isPullRefreshing) {
      setPullDistance(0);
      return;
    }
    setIsPullRefreshing(true);
    setPullDistance(PULL_THRESHOLD);
    try {
      await refreshAllStations();
    } finally {
      setPullDistance(0);
      setIsPullRefreshing(false);
    }
  };
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
      <header className="fixed top-0 right-0 left-0 z-40 bg-slate-100/95 backdrop-blur-sm">
        <div className="h-[env(safe-area-inset-top)] bg-slate-100" />
        <div className="px-4 pb-3">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-[28px] bg-transparent px-0 py-4 text-emerald-700">
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
        <div
          role="status"
          aria-live="polite"
          className="animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300 fixed left-1/2 z-[45] flex w-[min(100%-2rem,28rem)] -translate-x-1/2 items-start gap-2 rounded-2xl border border-emerald-200/70 bg-white/95 px-3.5 py-2.5 text-[11px] font-semibold leading-snug text-emerald-900 shadow-[0_10px_40px_rgba(15,118,110,0.12)] backdrop-blur-md"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 7rem)" }}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="block" size={11} strokeWidth={3} aria-hidden />
          </span>
          <span>{notification}</span>
        </div>
      )}

      <main
        className="mx-auto max-w-md p-4 pt-[calc(env(safe-area-inset-top)+5.5rem)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          void handleTouchEnd();
        }}
        onTouchCancel={() => {
          pullStartYRef.current = null;
          setIsPulling(false);
          setPullDistance(0);
        }}
      >
        {activeTab === "home" && (isPulling || isPullRefreshing || pullDistance > 0) && (
          <div
            className="overflow-hidden transition-[height,opacity] duration-200"
            style={{
              height: `${pullDistance}px`,
              opacity: Math.min(1, pullDistance / PULL_THRESHOLD),
            }}
          >
            <div
              className="flex h-full items-center justify-center gap-2 text-emerald-600 transition-transform duration-200"
              style={{ transform: `translateY(${Math.max(0, (PULL_THRESHOLD - pullDistance) * 0.28)}px)` }}
            >
              <RotateCw
                size={16}
                className={`${isPullRefreshing ? "animate-spin" : ""} ${
                  !isPullRefreshing && pullDistance >= PULL_THRESHOLD ? "rotate-180" : ""
                } transition-transform duration-200`}
              />
              <span className="text-xs font-bold">
                {isPullRefreshing
                  ? pullHintRefreshing
                  : pullDistance >= PULL_THRESHOLD
                    ? pullHintRelease
                    : pullHintPulling}
              </span>
            </div>
          </div>
        )}
        {activeTab === "home" && (
          <HomeView
            stations={stations}
            arrivalCache={arrivalCache}
            onRefreshStation={refreshStationArrival}
            t={t}
          />
        )}
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

      {activeTab === "manage" && <PwaInstallEntry t={t} lang={lang} />}

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

function PwaInstallEntry({ t, lang }: { t: I18nText; lang: Lang }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [iosInstallMode, setIosInstallMode] = useState<"profile" | "manual">("profile");
  const [isStandalone, setIsStandalone] = useState(false);

  const isIosDevice = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const iPadOS13Plus =
      navigator.platform === "MacIntel" &&
      typeof (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints === "number" &&
      ((navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0) > 1;
    return iOS || iPadOS13Plus;
  }, []);

  useEffect(() => {
    const checkStandalone = () => {
      const displayModeStandalone = Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches);
      const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setIsStandalone(displayModeStandalone || iosStandalone);
    };

    checkStandalone();
    window.addEventListener("resize", checkStandalone);
    return () => window.removeEventListener("resize", checkStandalone);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      localStorage.setItem(PWA_INSTALLED_MARK_KEY, "1");
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (isStandalone) return null;
  if (typeof window !== "undefined" && localStorage.getItem(PWA_INSTALLED_MARK_KEY) === "1") return null;

  const ios = isIosDevice();
  const canInstall = ios || Boolean(deferredPrompt);
  if (!canInstall) return null;

  const onInstall = async () => {
    if (ios) {
      setIosInstallMode("profile");
      setShowIosSheet(true);
      return;
    }
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") {
        localStorage.setItem(PWA_INSTALLED_MARK_KEY, "1");
      }
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  return (
    <>
      <div
        className="fixed right-0 left-0 z-20 px-6"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.6rem)" }}
      >
        <div className="mx-auto max-w-md">
          <button
            onClick={() => void onInstall()}
            disabled={isInstalling}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition-all active:scale-[0.99] disabled:opacity-70"
          >
            <Download size={16} />
            <span>{isInstalling ? t.installing : t.installApp}</span>
          </button>
          <p className="mt-2 px-2 text-center text-[11px] font-bold text-slate-400">
            {ios ? t.installHintIosStep1 : t.installHintAndroid}
          </p>
        </div>
      </div>

      {showIosSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-3xl bg-white px-5 pt-5 pb-7 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">{t.installHintIosTitle}</h3>
              <button
                onClick={() => setShowIosSheet(false)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                {t.close}
              </button>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setIosInstallMode("profile")}
                className={`rounded-lg px-2 py-2 text-xs font-black transition-all ${
                  iosInstallMode === "profile"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {t.installMethodProfile}
              </button>
              <button
                onClick={() => setIosInstallMode("manual")}
                className={`rounded-lg px-2 py-2 text-xs font-black transition-all ${
                  iosInstallMode === "manual" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                }`}
              >
                {t.installMethodManual}
              </button>
            </div>
            {iosInstallMode === "profile" ? (
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-600">{t.installProfileDesc}</p>
                <a
                  href={`/api/app/install-profile.mobileconfig?lang=${lang}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200"
                >
                  {t.installProfileButton}
                </a>
                <p className="text-xs font-bold text-slate-500">{t.installProfileFallback}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ol className="space-y-2 text-sm font-bold text-slate-600">
                  <li>1. {t.installHintIosStep1}</li>
                  <li>2. {t.installHintIosStep2}</li>
                  <li>3. {t.installHintIosStep3}</li>
                </ol>
                <p className="text-xs font-bold text-slate-500">{t.installManualHint}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
  onRefreshStation,
  t,
}: {
  stations: Station[];
  arrivalCache: CachedArrivalMap;
  onRefreshStation: (stationCode: string) => Promise<void>;
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
              onRefresh={() => onRefreshStation(station.code)}
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
  onRefresh?: () => void | Promise<void>;
  onAdd?: () => void;
  t?: I18nText;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const toTotalSeconds = (minutes?: number, seconds?: number) =>
    Math.max(0, (minutes ?? 0) * 60 + (seconds ?? 0));
  const mixHexColor = (from: string, to: string, t: number) => {
    const ratio = clamp(t, 0, 1);
    const fromHex = from.replace("#", "");
    const toHex = to.replace("#", "");
    const r = Math.round(
      parseInt(fromHex.slice(0, 2), 16) + (parseInt(toHex.slice(0, 2), 16) - parseInt(fromHex.slice(0, 2), 16)) * ratio,
    );
    const g = Math.round(
      parseInt(fromHex.slice(2, 4), 16) + (parseInt(toHex.slice(2, 4), 16) - parseInt(fromHex.slice(2, 4), 16)) * ratio,
    );
    const b = Math.round(
      parseInt(fromHex.slice(4, 6), 16) + (parseInt(toHex.slice(4, 6), 16) - parseInt(fromHex.slice(4, 6), 16)) * ratio,
    );
    return `rgb(${r}, ${g}, ${b})`;
  };

  const statusSoon = t?.statusSoon ?? "快到了";
  const statusComing = t?.statusComing ?? "即将到站";
  const statusArrived = t?.statusArrived ?? "已到站";
  const currentTrip = t?.currentTrip ?? "当前班次";
  const nextTripLabel = t?.nextTrip ?? "下一趟";
  const nextNextTripLabel = t?.nextNextTrip ?? "下下趟";
  const gps = t?.gpsTime ?? "GPS定位";
  const servicePaused = "服务暂停";

  const hasRealtimeData =
    arrival !== undefined &&
    (typeof arrival.nextMinutes === "number" ||
      typeof arrival.nextSeconds === "number" ||
      typeof arrival.nextArrival === "string");

  const mainTripTotalSeconds = toTotalSeconds(arrival?.nextMinutes, arrival?.nextSeconds);
  const nextTripTotalSeconds = toTotalSeconds(arrival?.next2Minutes, arrival?.next2Seconds);
  const isArrived = mainTripTotalSeconds <= 0;

  const mainTrip = {
    min: Math.floor(mainTripTotalSeconds / 60),
    sec: mainTripTotalSeconds % 60,
    time: arrival?.nextArrival ?? "11:27:56",
    status: isArrived
      ? statusArrived
      : mainTripTotalSeconds <= 3 * 60
        ? statusSoon
        : statusComing,
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
  // Progress follows the countdown between "next" and "current". Once arrived, pin at 100%.
  const progress = isArrived
    ? 100
    : nextTripTotalSeconds > 0
      ? clamp(((nextTripTotalSeconds - mainTripTotalSeconds) / nextTripTotalSeconds) * 100, 0, 100)
      : 0;
  const arrivalColor = "#f54a00";
  const isWithinTwoMinutes = mainTripTotalSeconds < 120;
  const progressRatio = clamp(progress / 100, 0, 1);
  const nearArrivalRatio = clamp((120 - mainTripTotalSeconds) / 120, 0, 1);
  const progressStartColor = isArrived
    ? arrivalColor
    : isWithinTwoMinutes
      ? mixHexColor("#fed7aa", arrivalColor, nearArrivalRatio)
      : mixHexColor("#d1fae5", "#6ee7b7", progressRatio);
  const progressEndColor = isArrived
    ? arrivalColor
    : isWithinTwoMinutes
      ? mixHexColor("#fb923c", arrivalColor, nearArrivalRatio)
      : mixHexColor("#34d399", "#059669", progressRatio);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

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
            onClick={() => {
              void handleRefresh();
            }}
            className="rounded-lg p-1.5 transition-all hover:bg-white/20"
          >
            <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {!hasRealtimeData ? (
          <div className="relative flex min-h-[170px] -translate-y-3 flex-col items-center justify-center overflow-hidden rounded-2xl px-4 text-center">
            <div className="relative mb-2 rounded-2xl bg-white p-3 shadow-sm shadow-amber-100/70">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <p className="relative text-base font-black tracking-wide text-amber-700">{servicePaused}</p>
            <p className="relative mt-1 text-xs font-bold tracking-wide text-amber-500/90">
              暂无实时到站数据
            </p>
          </div>
        ) : (
          <>
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
            <span
              className={`rounded-lg px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md ${
                isArrived ? "bg-[#f54a00] shadow-orange-100" : "bg-orange-600 shadow-orange-100"
              }`}
            >
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
            className="absolute top-0 left-0 h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: isArrived
                ? arrivalColor
                : `linear-gradient(to right, ${progressStartColor}, ${progressEndColor})`,
            }}
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
          </>
        )}
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
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <MapPin size={18} className="text-emerald-500" />
          {t.manageTitle}
        </h2>
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
      <h2 className="flex items-center gap-2 px-1 text-lg font-black text-slate-800">
        <Building2 size={18} className="text-emerald-500" />
        {t.searchCityTitle}
      </h2>

      <div className="flex items-center rounded-[20px] border border-slate-200 bg-white px-2 py-1.5 shadow-md">
        <div className="pl-2 text-emerald-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          inputMode="numeric"
          placeholder={t.searchPlaceholder}
          value={queryCode}
          onChange={(e) => setQueryCode(e.target.value)}
          className="flex-1 border-none bg-transparent px-2.5 py-2 text-base font-black text-slate-700 outline-none placeholder:text-slate-300 focus:ring-0"
        />
        <button
          onClick={() => {
            void fetchBusData();
          }}
          disabled={loading}
          className="h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-xs font-black text-white shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : t.searchButton}
        </button>
      </div>

      {error && <p className="px-2 text-sm font-bold text-rose-600">{error}</p>}

      {!results?.data?.length && (
        <div className="px-2 py-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-600">
            <Signpost size={18} />
          </div>
          <p className="text-sm font-black tracking-tight text-slate-700">{t.searchEmptyTitle}</p>
          <p className="mt-1.5 text-xs font-bold leading-5 text-slate-500">{t.searchEmptyHint}</p>
        </div>
      )}

      {results?.data?.length ? (
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
      ) : null}
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
