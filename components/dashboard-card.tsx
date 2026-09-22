interface DashboardCardProps {
  title: string
  description: string
  icon: string
}

export default function DashboardCard({ title, description, icon }: DashboardCardProps) {
  return (
    <div className="p-8 bg-surface-secondary border border-border radius-terminal">
      <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-mono text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground-muted">{description}</p>
    </div>
  )
}
