import { Bus, Clock, MapPin, Star, Zap } from "lucide-react"
import { useLang } from "@/contexts/LangContext"

export function FloatingBusGraphic() {
  const { t } = useLang()

  return (
    <div className="relative mt-12 flex aspect-square w-full max-w-md items-center justify-center lg:mt-0">
      <div className="relative z-20 flex h-56 w-56 animate-float-1 flex-col items-center justify-center rounded-[3rem] border-4 border-white/40 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl shadow-emerald-500/40 backdrop-blur-md">
        <Bus size={72} className="mb-2 text-white" />
        <div className="text-3xl font-black tracking-wider text-white">SG BUS</div>
        <div className="absolute -bottom-5 flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-emerald-400 shadow-xl">
          <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {t.live}
        </div>
      </div>

      <div className="absolute top-10 right-0 z-30 flex h-28 w-28 animate-float-2 flex-col items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl lg:-right-6">
        <Clock size={32} className="mb-1 text-orange-500" />
        <CountdownBubble minLabel={t.cardMin} secLabel={t.cardSec} />
      </div>

      <div className="absolute bottom-12 left-0 z-30 flex h-24 w-24 animate-float-3 flex-col items-center justify-center rounded-[2rem] border border-slate-100 bg-white/90 shadow-xl backdrop-blur-sm lg:-left-6">
        <MapPin size={28} className="mb-2 text-emerald-500" />
        <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
          {t.station}
        </span>
      </div>

      <div
        className="absolute top-24 left-8 z-10 flex h-14 w-14 animate-float-2 items-center justify-center rounded-full bg-yellow-100 shadow-lg lg:left-0"
        style={{ animationDelay: "1.5s" }}
      >
        <Zap size={24} className="text-yellow-600" />
      </div>

      <div
        className="absolute right-10 bottom-24 z-10 flex h-16 w-16 rotate-12 animate-float-1 items-center justify-center rounded-2xl bg-emerald-50 shadow-lg"
        style={{ animationDelay: "0.5s" }}
      >
        <Star size={28} className="text-emerald-400" />
      </div>
    </div>
  )
}

function CountdownBubble({
  minLabel,
  secLabel,
}: {
  minLabel: string
  secLabel: string
}) {
  return (
    <div className="text-lg font-bold text-slate-800">
      0<span className="mx-0.5 text-xs text-slate-500">{minLabel}</span>7
      <span className="ml-0.5 text-xs text-slate-500">{secLabel}</span>
    </div>
  )
}
