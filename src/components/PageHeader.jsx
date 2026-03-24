import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, buttonLabel, onButtonClick }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-heading font-bold text-xl text-nuke-dark tracking-wide">{title}</h1>
        {subtitle && (
          <p className="text-sm text-nuke-muted mt-1 font-body">{subtitle}</p>
        )}
      </div>
      {buttonLabel && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-nuke-orange text-white rounded-lg text-sm font-semibold hover:bg-nuke-orange-hover transition-colors shadow-sm shadow-nuke-orange/20"
        >
          <Plus size={16} />
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
