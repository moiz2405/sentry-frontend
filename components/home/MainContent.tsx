import { SectionCards } from "@/components/dashboard/section-cards"

export function MainContent({
}) {
  return (
    <div className="flex flex-col flex-1">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h2 className="px-4 text-2xl font-bold text-zinc-100 lg:px-6">Your Apps</h2>
          <SectionCards/>
        </div>
      </div>
    </div>
  )
}
