'use client';

import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative bg-white rounded-xl shadow-2xl ${maxWidth} w-full mx-4 max-h-[85vh] flex flex-col animate-fade-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nuke-border">
          <h3 className="font-heading font-semibold text-base text-nuke-dark">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-nuke-muted hover:text-nuke-dark hover:bg-nuke-bg rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
