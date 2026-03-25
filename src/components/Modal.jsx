'use client';

import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto pt-8 md:pt-16 pb-8 bg-black/40 backdrop-blur-sm px-4">
      {/* Backdrop Click-to-Close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative bg-white rounded-xl shadow-2xl ${maxWidth} w-full flex flex-col animate-fade-in mb-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nuke-border shrink-0">
          <h3 className="font-heading font-semibold text-base text-nuke-dark">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-nuke-muted hover:text-nuke-dark hover:bg-nuke-bg rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
