import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFurniture, getRoomBundle } from '@/lib/data'
import { Planner } from '@/components/planner'
import type { HouseRow } from '@/lib/types'
import { one } from '@/db'

export const metadata = { title: 'Planner — Dreamhouse' }

export default async function PlannerPage({
  params,
}: {
  params: Promise<{ houseId: string; roomId: string }>
}) {
  const { houseId, roomId } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=/studio/${houseId}/${roomId}`)

  const bundle = await getRoomBundle(roomId)
  if (!bundle || bundle.room.house_id !== houseId) notFound()
  if (bundle.house?.user_id !== user.id) notFound()

  const house = await one<HouseRow>('SELECT * FROM houses WHERE id = $1', [houseId])
  if (!house) notFound()

  const catalog = await getFurniture()

  return (
    <div className="planner-shell">
      <Planner
        houseId={house.id}
        houseName={house.name}
        houseBudget={house.budget}
        houseStyle={house.style}
        room={bundle.room}
        layouts={bundle.layouts.map((l) => ({ ...l, active: l.id === bundle.active?.id }))}
        items={bundle.active?.items ?? []}
        catalog={catalog}
        activeLayoutId={bundle.active?.id ?? null}
      />
    </div>
  )
}
