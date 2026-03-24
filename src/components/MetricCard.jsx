export default function MetricCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-nuke-card rounded-xl border border-nuke-border p-5 hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-nuke-muted uppercase tracking-wider font-body mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-nuke-dark font-heading">{value}</p>
          {subtitle && (
            <p className="text-xs text-nuke-muted mt-1.5 font-body">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-nuke-orange/10 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-nuke-orange" />
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-3 text-xs font-medium ${trend > 0 ? 'text-status-green' : 'text-status-red'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
