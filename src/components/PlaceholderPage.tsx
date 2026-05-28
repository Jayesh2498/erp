import { type LucideIcon } from 'lucide-react'

export default function PlaceholderPage({ title, description, icon: Icon, phase }: {
  title: string; description: string; icon: LucideIcon; phase: string
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="w-20 h-20 rounded-lg flex items-center justify-center mb-6"
        style={{
          background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)',
        }}
      >
        <Icon size={30} style={{ color: 'rgb(var(--text-3))' }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-1))' }}>{title}</h2>
      <p className="text-sm max-w-xs mb-5" style={{ color: 'rgb(var(--text-3))' }}>{description}</p>
      <span
        className="px-4 py-1.5 text-xs font-semibold rounded-pill"
        style={{
          background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ background: 'var(--gradient-sunset)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {phase}
        </span>
      </span>
    </div>
  )
}
