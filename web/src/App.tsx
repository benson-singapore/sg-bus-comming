import { useEffect, useState, type ReactNode } from "react"
import {
  Apple,
  Bus,
  Clock,
  ExternalLink,
  MapPin,
  QrCode,
  Share,
  Smartphone,
  Star,
  Zap,
} from "lucide-react"
import { FloatingBusGraphic } from "@/components/FloatingBusGraphic"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { QrScanPopover } from "@/components/QrScanPopover"
import { ScreenshotCarousel } from "@/components/screenshots/ScreenshotCarousel"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLang } from "@/contexts/LangContext"
import { APP_URL } from "@/lib/constants"
import { FEATURE_KEYS } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const featureIcons = {
  clock: Clock,
  zap: Zap,
  "map-pin": MapPin,
} as const

export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar scrolled={scrolled} />
      <HeroSection />
      <FeaturesSection />
      <DownloadSection />
      <SiteFooter />
    </div>
  )
}

function Navbar({ scrolled }: { scrolled: boolean }) {
  const { t } = useLang()

  return (
    <nav
      className={cn(
        "fixed z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 py-3 shadow-sm backdrop-blur-md"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-emerald-500 p-2 text-white shadow-sm">
            <Bus size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            {t.appName}
          </span>
        </div>
        <div className="hidden items-center space-x-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition-colors hover:text-emerald-600">
            {t.navFeatures}
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-emerald-600">
            {t.navGuide}
          </a>
          <a href="#download" className="transition-colors hover:text-emerald-600">
            {t.navInstall}
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <a
            href={APP_URL}
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-emerald-600 px-4 text-sm shadow-md shadow-emerald-500/20 hover:bg-emerald-700 sm:px-5 sm:text-base"
            )}
          >
            {t.tryNow} <ExternalLink size={16} className="ml-1" />
          </a>
        </div>
      </div>
      <div className="mx-auto flex justify-end px-6 pt-2 sm:hidden">
        <LanguageSwitcher />
      </div>
    </nav>
  )
}

function HeroSection() {
  const { t } = useLang()

  return (
    <section className="relative overflow-x-clip pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="absolute top-0 left-1/2 -z-10 h-[800px] w-full -translate-x-1/2 rounded-b-[100%] bg-gradient-to-b from-emerald-100/50 to-transparent opacity-60 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 lg:flex-row lg:px-8">
        <div className="mb-16 w-full text-center lg:mb-0 lg:w-1/2 lg:text-left">
          <Badge className="mb-6 rounded-full border-0 bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
            <Star size={14} className="mr-1.5 fill-emerald-700" />
            {t.heroBadge}
          </Badge>
          <h1 className="relative z-0 mb-6 text-5xl leading-[1.1] font-extrabold tracking-tight text-slate-900 lg:text-7xl">
            {t.heroTitle1} <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h1>
          <p className="relative z-0 mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
            {t.heroDesc}
          </p>
          <div className="relative z-30">
            <HeroCtas />
          </div>
        </div>

        <div className="relative z-10 flex w-full justify-center lg:w-1/2 lg:justify-end">
          <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
          <FloatingBusGraphic />
        </div>
      </div>
    </section>
  )
}

function HeroCtas() {
  const { t } = useLang()

  return (
    <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 lg:justify-start">
      <a
        href={APP_URL}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-auto w-full rounded-full bg-emerald-600 px-8 py-3.5 text-base font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 sm:w-auto"
        )}
      >
        <ExternalLink size={20} className="mr-2" />
        {t.openWebApp}
      </a>
      <QrScanPopover
        url={APP_URL}
        title={t.scanQrTitle}
        description={t.scanQrDesc}
        triggerClassName={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "h-auto w-full rounded-full border-slate-200 bg-white px-8 py-3.5 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md sm:w-auto"
        )}
        trigger={
          <>
            <QrCode size={20} className="mr-2 text-emerald-600" />
            {t.scanQr}
          </>
        }
      />
    </div>
  )
}

function FeaturesSection() {
  const { t } = useLang()

  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">{t.featuresTitle}</h2>
          <p className="text-slate-600">{t.featuresDesc}</p>
        </div>

        <ScreenshotCarousel />

        <FeaturesGrid />
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const { t } = useLang()

  return (
    <div className="grid gap-10 md:grid-cols-3">
      {FEATURE_KEYS.map((feature) => {
        const Icon = featureIcons[feature.icon]
        return (
          <Card
            key={feature.titleKey}
            className={cn(
              "group rounded-3xl border-slate-100 bg-slate-50 py-8 shadow-none transition-colors hover:border-emerald-200",
              "highlight" in feature &&
                feature.highlight &&
                "hover:shadow-xl hover:shadow-emerald-100/50"
            )}
          >
            <CardHeader className="px-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                <Icon size={28} />
              </div>
              <CardTitle className="text-xl text-slate-900">
                {t[feature.titleKey]}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pt-0">
              <CardDescription className="text-base leading-relaxed text-slate-600">
                {t[feature.descKey]}
              </CardDescription>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function DownloadSection() {
  const { t } = useLang()

  return (
    <section id="download" className="relative overflow-hidden bg-white py-24">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-gradient-to-b from-white to-emerald-50/80" />
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-emerald-100 p-3 text-emerald-600 shadow-inner">
          <Zap size={32} />
        </div>
        <h2 className="mb-6 text-3xl font-bold text-slate-900 lg:text-4xl">
          {t.downloadTitle}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600">{t.downloadDesc}</p>

        <div
          id="how-it-works"
          className="mx-auto grid max-w-3xl gap-8 text-left md:grid-cols-2"
        >
          <InstallGuideCard
            title={
              <>
                <Apple size={24} className="mr-2 text-slate-700" /> {t.iosTitle}
              </>
            }
            steps={[
              <>
                {t.iosStep1}{" "}
                <span className="font-semibold text-slate-900">{t.appName}</span>
              </>,
              <>
                {t.iosStep2Before}{" "}
                <Share size={18} className="mx-1 inline text-blue-500" />{" "}
                <strong>{t.share}</strong> {t.iosStep2After}
              </>,
              <>{t.iosStep3}</>,
            ]}
          />
          <InstallGuideCard
            title={
              <>
                <Smartphone size={24} className="mr-2 text-emerald-600" /> {t.androidTitle}
              </>
            }
            steps={[
              <>
                {t.androidStep1}{" "}
                <span className="font-semibold text-slate-900">{t.appName}</span>
              </>,
              <>
                {t.androidStep2} <strong>{t.androidMenu}</strong> {t.androidStep2After}
              </>,
              <>{t.androidStep3}</>,
            ]}
          />
        </div>

        <DownloadCta />
      </div>
    </section>
  )
}

function DownloadCta() {
  const { t } = useLang()

  return (
    <div className="mt-14">
      <a
        href={APP_URL}
        className={cn(
          buttonVariants({ size: "lg" }),
          "inline-flex h-auto rounded-full bg-slate-900 px-10 py-4 text-base font-bold hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/30"
        )}
      >
        <ExternalLink size={20} className="mr-2" />
        {t.openInBrowser}
      </a>
    </div>
  )
}

function InstallGuideCard({
  title,
  steps,
}: {
  title: ReactNode
  steps: ReactNode[]
}) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border-slate-100 py-8 shadow-xl shadow-slate-200/50 transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-emerald-50 blur-3xl transition-colors group-hover:bg-emerald-100" />
      <CardHeader className="px-8">
        <CardTitle className="flex items-center text-xl text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pt-0">
        <ol className="space-y-5 text-slate-600">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                {i + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function SiteFooter() {
  const { t } = useLang()

  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-12 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 md:flex-row lg:px-8">
        <div className="mb-4 flex items-center space-x-2 md:mb-0">
          <Bus size={24} className="text-emerald-500" />
          <span className="text-xl font-bold text-white">{t.appName}</span>
        </div>
        <div className="flex space-x-6 text-sm">
          <a href="#" className="transition-colors hover:text-emerald-400">
            {t.privacy}
          </a>
          <a href="#" className="transition-colors hover:text-emerald-400">
            {t.terms}
          </a>
          <a href="#" className="transition-colors hover:text-emerald-400">
            {t.contact}
          </a>
        </div>
      </div>
      <FooterCopyright />
    </footer>
  )
}

function FooterCopyright() {
  const { t } = useLang()

  return (
    <div className="mx-auto mt-8 max-w-7xl px-6 text-center text-sm opacity-60 lg:px-8">
      &copy; {new Date().getFullYear()} {t.appName}. All rights reserved. {t.copyright}
    </div>
  )
}
