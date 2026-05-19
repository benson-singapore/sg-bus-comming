import type { ComponentType } from "react"
import { useLang } from "@/contexts/LangContext"
import {
  SavedStopsPreview,
  SearchHintPreview,
  SearchStopPreview,
  WaitingHallPreview,
} from "./AppScreenPreviews"
import { PhoneFrame } from "./PhoneFrame"

export function ScreenshotCarousel() {
  const { t } = useLang()

  const screenshots: {
    id: string
    label: string
    Preview: ComponentType
  }[] = [
    { id: "waiting-hall", label: t.previewWaitingHall, Preview: WaitingHallPreview },
    { id: "search-stop", label: t.previewSearchStop, Preview: SearchStopPreview },
    { id: "saved-stops", label: t.previewSavedStops, Preview: SavedStopsPreview },
    { id: "search-hint", label: t.previewSearchHint, Preview: SearchHintPreview },
  ]

  return (
    <div
      className="-mx-6 mb-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-12 md:gap-8 lg:mx-0 lg:justify-center lg:px-0 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {screenshots.map(({ id, label, Preview }) => (
        <PhoneFrame key={id} label={label}>
          <Preview />
        </PhoneFrame>
      ))}
    </div>
  )
}
