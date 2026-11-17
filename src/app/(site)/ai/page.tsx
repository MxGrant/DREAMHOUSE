import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { THEMES } from '@/lib/design'
import { AiStylist } from '@/components/ai-stylist'
import { Icon } from '@/components/icons'

export const metadata = { title: 'AI design assistant — Dreamhouse' }

export default async function AiPage() {
  const user = await getCurrentUser()

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Design assistant
            </span>
            <h1 style={{ marginTop: 14 }}>
              A stylist that does the <em>arithmetic</em>.
            </h1>
            <p>
              Tell it the room, the style and the budget. You get a palette with reasons, a furniture combination that
              fits the money, and the rules that make the room read as designed.
            </p>
          </div>
          {!user ? (
            <Link href="/register" className="btn btn-primary">
              Save your schemes
            </Link>
          ) : (
            <Link href="/dashboard" className="btn btn-ghost">
              My houses
            </Link>
          )}
        </div>
      </div>

      <div className="studio-grid" style={{ paddingBottom: 30 }}>
        <AiStylist budget={9000} />

        <div className="stack" style={{ gap: 18 }}>
          <div className="panel">
            <h3>How it thinks</h3>
            <div className="feature-list" style={{ marginTop: 10 }}>
              <div className="feature-item">
                <span className="tick">
                  <Icon name="check" className="icon icon-sm" />
                </span>
                <div>
                  <strong>Palette first</strong>
                  <span>Six house palettes, each with a wall, a wood tone and one deeper accent.</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="tick">
                  <Icon name="check" className="icon icon-sm" />
                </span>
                <div>
                  <strong>Then the money</strong>
                  <span>Each category gets a share of the budget, then swaps keep the total inside it.</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="tick">
                  <Icon name="check" className="icon icon-sm" />
                </span>
                <div>
                  <strong>Then the rules</strong>
                  <span>Walking distances, three layers of light, repeat your wood tone twice.</span>
                </div>
              </div>
            </div>
            {user ? (
              <p className="tiny" style={{ marginTop: 14 }}>
                Open any room in the <Link href="/dashboard" className="mini-link">planner</Link> to apply a palette or
                drop the picks straight into the plan.
              </p>
            ) : (
              <p className="tiny" style={{ marginTop: 14 }}>
                <Link href="/register" className="mini-link">Create an account</Link> to apply palettes to your own
                rooms.
              </p>
            )}
          </div>

          <div className="panel">
            <h3>House palettes</h3>
            <div className="stack" style={{ gap: 12, marginTop: 12 }}>
              {THEMES.map((t) => (
                <div key={t.id}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.86rem' }}>{t.name}</strong>
                    <span className="tiny">{t.floorType}</span>
                  </div>
                  <div className="hero-swatches" style={{ marginTop: 6 }}>
                    {t.swatches.map((hex) => (
                      <i key={hex} style={{ background: hex, width: 28, height: 18, borderRadius: 5 }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
