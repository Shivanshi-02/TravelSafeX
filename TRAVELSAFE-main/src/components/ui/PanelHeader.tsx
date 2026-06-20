interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PanelHeader({ title, subtitle, icon, badge }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="text-emerald-400/80">{icon}</div>
        )}
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-white/90 font-[family-name:var(--font-display)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-white/40 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {badge}
    </div>
  );
}
