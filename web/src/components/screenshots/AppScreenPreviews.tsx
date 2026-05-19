import { MapPin, Search, Signpost } from "lucide-react"
import { useLang } from "@/contexts/LangContext"
import { BusArrivalCardPreview } from "./BusArrivalCardPreview"

export function WaitingHallPreview() {
  const { t } = useLang()

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 px-0.5 text-sm font-black text-slate-800">
        <Signpost size={14} className="text-emerald-500" />
        {t.previewWaitingHall}
      </h3>
      <BusArrivalCardPreview />
      <BusArrivalCardPreview
        route="371"
        stationLabel="Home"
        nowMin={4}
        nowSec={12}
        gpsTime="14:52:18"
        nextMin={18}
        nextSec={5}
        nextArrival="15:06:00"
        laterMin={32}
        laterSec={20}
        laterArrival="15:20:00"
        progress={35}
        compact
      />
    </div>
  )
}

export function SearchStopPreview() {
  const { t } = useLang()

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Search size={16} />
          <span className="text-xs font-bold">67009</span>
        </div>
      </div>
      <p className="px-0.5 text-[10px] font-bold text-slate-400">
        SengKang · {t.previewRoutes}
      </p>
      <BusArrivalCardPreview />
    </div>
  )
}

export function SavedStopsPreview() {
  const { t } = useLang()

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 px-0.5 text-sm font-black text-slate-800">
        <MapPin size={14} className="text-emerald-500" />
        {t.previewSavedStops}
      </h3>
      <StationRow name="Home" code="67661" routes={["371"]} />
      <StationRow name="SengKang" code="67009" routes={["159", "371"]} active />
      <BusArrivalCardPreview compact />
    </div>
  )
}

export function SearchHintPreview() {
  const { t } = useLang()

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-emerald-400 bg-white px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-emerald-500" />
          <span className="text-xs font-bold text-slate-300">
            {t.previewSearchPlaceholder}
          </span>
        </div>
      </div>
      <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <HintRow primary="67009" secondary="SengKang Interchange" />
        <HintRow primary="67661" secondary="Compassvale Dr" />
        <HintRow primary="77009" secondary="Yishun" muted />
      </div>
    </div>
  )
}

function StationRow({
  name,
  code,
  routes,
  active,
}: {
  name: string
  code: string
  routes: string[]
  active?: boolean
}) {
  const { t } = useLang()

  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 shadow-sm ${
        active
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm font-black text-slate-800">{name}</p>
      <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
        {t.previewStopCode} {code}
      </p>
      <div className="mt-1.5 flex gap-1">
        {routes.map((r) => (
          <span
            key={r}
            className="rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black text-emerald-700"
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  )
}

function HintRow({
  primary,
  secondary,
  muted,
}: {
  primary: string
  secondary: string
  muted?: boolean
}) {
  return (
    <div
      className={`rounded-xl px-2 py-1.5 ${muted ? "opacity-50" : "hover:bg-slate-50"}`}
    >
      <p className="text-xs font-black text-slate-800">{primary}</p>
      <p className="text-[10px] font-medium text-slate-400">{secondary}</p>
    </div>
  )
}
