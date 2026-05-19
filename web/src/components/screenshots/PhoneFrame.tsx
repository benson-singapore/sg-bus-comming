import type { ReactNode } from "react"

export function PhoneFrame({
  children,
  label,
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <div className="group relative flex h-[540px] w-[260px] shrink-0 snap-center flex-col overflow-hidden rounded-[2.5rem] border-8 border-white bg-slate-100 shadow-2xl shadow-emerald-900/10">
      {label ? <span className="sr-only">{label}</span> : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 pt-4 [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 rounded-[2rem] ring-1 ring-black/5 ring-inset" />
    </div>
  )
}
