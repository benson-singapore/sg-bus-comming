import { Bus, Clock, MapPin, Plus, RotateCw } from "lucide-react"
import { useLang } from "@/contexts/LangContext"

export type BusArrivalCardPreviewProps = {
  route?: string
  stationLabel?: string
  nowMin?: number
  nowSec?: number
  gpsTime?: string
  nextMin?: number
  nextSec?: number
  nextArrival?: string
  laterMin?: number
  laterSec?: number
  laterArrival?: string
  progress?: number
  compact?: boolean
}

export function BusArrivalCardPreview({
  route = "159",
  stationLabel,
  nowMin = 1,
  nowSec = 37,
  gpsTime = "14:49:00",
  nextMin = 11,
  nextSec = 37,
  nextArrival = "14:59:00",
  laterMin = 23,
  laterSec = 37,
  laterArrival = "15:11:00",
  progress = 72,
  compact = false,
}: BusArrivalCardPreviewProps) {
  const { t } = useLang()
  const stopLabel = stationLabel ?? t.cardStation

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md ${
        compact ? "origin-top scale-[0.92]" : ""
      }`}
    >
      <div className="flex items-center justify-between bg-emerald-500 px-4 py-2.5 text-white">
        <CardHeader route={route} stopLabel={stopLabel} />
        <HeaderActions />
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <NowLabel text={t.cardNow} />
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {nowMin}
              </span>
              <span className="mr-1.5 text-sm font-bold text-slate-800">{t.cardMin}</span>
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {nowSec}
              </span>
              <span className="text-sm font-bold text-slate-800">{t.cardSec}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-lg bg-orange-600 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
              {t.cardArriving}
            </span>
            <p className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
              <MapPin size={10} className="text-rose-400" />
              {t.cardGps}: {gpsTime}
            </p>
          </div>
        </div>

        <ProgressBar progress={progress} />

        <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
          <TripRow label={t.cardNext} min={nextMin} sec={nextSec} arrival={nextArrival} />
          <TripRow label={t.cardLater} min={laterMin} sec={laterSec} arrival={laterArrival} />
        </div>
      </div>
    </div>
  )
}

function CardHeader({ route, stopLabel }: { route: string; stopLabel: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <h3 className="text-lg leading-none font-black">{route}</h3>
      <span className="border-l border-white/30 pl-2.5 text-[10px] font-bold opacity-90">
        {stopLabel}
      </span>
    </div>
  )
}

function NowLabel({ text }: { text: string }) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">
        {text}
      </span>
    </div>
  )
}

function HeaderActions() {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className="rounded-lg p-1.5" aria-hidden>
        <Plus size={14} />
      </button>
      <button type="button" className="rounded-lg p-1.5" aria-hidden>
        <RotateCw size={14} />
      </button>
    </div>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative mt-1 px-0.5">
      <div className="h-2 w-full rounded-full border border-slate-200/50 bg-slate-100 shadow-inner" />
      <div
        className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute -top-3 flex -translate-x-1/2 flex-col items-center"
        style={{ left: `${progress}%` }}
      >
        <div className="rounded-md border border-white bg-orange-500 p-1 shadow-md">
          <Bus size={11} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function TripRow({
  label,
  min,
  sec,
  arrival,
}: {
  label: string
  min: number
  sec: number
  arrival: string
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-1 px-0.5">
      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </span>
      <span className="text-center font-mono text-xs font-black text-slate-700">
        {min}m {sec}s
      </span>
      <div className="flex items-center justify-end gap-1">
        <Clock size={10} className="text-slate-300" />
        <span className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[9px] font-black text-slate-500">
          {arrival}
        </span>
      </div>
    </div>
  )
}
