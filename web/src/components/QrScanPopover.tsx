import type { ReactNode } from "react"
import { Popover } from "@base-ui/react/popover"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

type QrScanPopoverProps = {
  url: string
  title: string
  description: string
  trigger: ReactNode
  triggerClassName?: string
}

export function QrScanPopover({
  url,
  title,
  description,
  trigger,
  triggerClassName,
}: QrScanPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        className={cn("cursor-pointer", triggerClassName)}
      >
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="center"
          sideOffset={12}
          collisionPadding={16}
          className="z-[200] outline-none"
        >
          <Popover.Popup
            className={cn(
              "relative z-[200] w-[228px] origin-[var(--transform-origin)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10",
              "transition-[transform,scale,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
            )}
          >
            <Popover.Arrow className="flex text-white [&>svg]:drop-shadow-sm">
              <ArrowIcon />
            </Popover.Arrow>

            <Popover.Title className="mb-1 text-center text-sm font-bold text-slate-900">
              {title}
            </Popover.Title>
            <Popover.Description className="mb-3 text-center text-xs leading-relaxed text-slate-500">
              {description}
            </Popover.Description>

            <QrBlock url={url} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function QrBlock({ url }: { url: string }) {
  return (
    <div className="mx-auto flex w-fit rounded-xl border border-slate-100 bg-white p-2.5">
      <QRCodeSVG value={url} size={168} level="M" marginSize={1} />
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="8" viewBox="0 0 16 8" fill="currentColor" aria-hidden>
      <path d="M0 0h16L8 8z" />
    </svg>
  )
}
