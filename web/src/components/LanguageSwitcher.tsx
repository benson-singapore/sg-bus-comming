import { Languages } from "lucide-react"
import { useLang } from "@/contexts/LangContext"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, toggleLang } = useLang()

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t.langAria}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-white hover:text-emerald-700",
        className
      )}
    >
      <Languages size={16} className="text-emerald-600" />
      <span>{t.langSwitch}</span>
    </button>
  )
}
