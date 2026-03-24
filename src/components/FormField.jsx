export default function FormField({ label, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-nuke-dark font-body">
        {label}
        {required && <span className="text-nuke-orange ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm bg-white border border-nuke-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nuke-orange/30 focus:border-nuke-orange transition-colors ${className}`}
      {...props}
    />
  );
}

export function Select({ options, className = '', placeholder, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm bg-white border border-nuke-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nuke-orange/30 focus:border-nuke-orange transition-colors ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm bg-white border border-nuke-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nuke-orange/30 focus:border-nuke-orange transition-colors resize-none ${className}`}
      rows={3}
      {...props}
    />
  );
}
