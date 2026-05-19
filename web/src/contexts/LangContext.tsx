import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  dictionary,
  getInitialLang,
  saveLang,
  type I18nText,
  type Lang,
} from "@/lib/i18n"

type LangContextValue = {
  lang: Lang
  t: I18nText
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getInitialLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    saveLang(next)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === "zh" ? "en" : "zh")
  }, [lang, setLang])

  const t = dictionary[lang]

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"
    document.title = t.metaTitle
  }, [lang, t.metaTitle])

  const value = useMemo(
    () => ({ lang, t, setLang, toggleLang }),
    [lang, t, setLang, toggleLang]
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) {
    throw new Error("useLang must be used within LangProvider")
  }
  return ctx
}
