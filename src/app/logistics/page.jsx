'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const demoKits = [
  { id: 1, name: 'Drone Kit', total_quantity: 30, available_quantity: 22, in_use_quantity: 6, damaged_units: 2 },
  { id: 2, name: 'IoT Kit', total_quantity: 50, available_quantity: 38, in_use_quantity: 10, damaged_units: 2 },
  { id: 3, name: 'Robotics Kit', total_quantity: 25, available_quantity: 18, in_use_quantity: 5, damaged_units: 2 },
  { id: 4, name: 'Arduino Starter Kit', total_quantity: 40, available_quantity: 35, in_use_quantity: 4, damaged_units: 1 },
  { id: 5, name: 'Raspberry Pi Kit', total_quantity: 20, available_quantity: 15, in_use_quantity: 4, damaged_units: 1 },
];

export default function LogisticsPage() {
  const [kits, setKits] = useState(demoKits);
  const [editingKit, setEditingKit] = useState(null);

  useEffect(() => { fetchKits(); }, []);

  const fetchKits = async () => {
    try {
      const { data } = await supabase.from('kits').select('*').order('name');
      if (data?.length > 0) setKits(data);
    } catch (e) { }
  };

  const handleUpdate = async (kit, field, value) => {
    const numValue = Math.max(0, Number(value));
    const updated = { ...kit, [field]: numValue };
    try {
      const { error } = await supabase.from('kits').update({ [field]: numValue }).eq('id', kit.id);
      if (error) {
        alert(`Failed to update inventory: ${error.message}`);
        return;
      }
      fetchKits();
    } catch (e) {
      setKits(kits.map(k => k.id === kit.id ? updated : k));
    }
  };

  const getUtilization = (kit) => {
    const used = kit.total_quantity - kit.available_quantity;
    return Math.round((used / kit.total_quantity) * 100);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Logistics" subtitle="Track hardware kit inventory" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-nuke-card rounded-xl border border-nuke-border p-4">
          <div className="flex items-center gap-2 text-nuke-muted text-xs font-medium mb-1">
            <Package size={14} /> TOTAL KITS
          </div>
          <p className="text-2xl font-bold font-heading text-nuke-dark">{kits.reduce((s, k) => s + k.total_quantity, 0)}</p>
        </div>
        <div className="bg-nuke-card rounded-xl border border-nuke-border p-4">
          <div className="flex items-center gap-2 text-status-green text-xs font-medium mb-1">
            <CheckCircle size={14} /> AVAILABLE
          </div>
          <p className="text-2xl font-bold font-heading text-status-green">{kits.reduce((s, k) => s + k.available_quantity, 0)}</p>
        </div>
        <div className="bg-nuke-card rounded-xl border border-nuke-border p-4">
          <div className="flex items-center gap-2 text-status-blue text-xs font-medium mb-1">
            <Package size={14} /> IN USE
          </div>
          <p className="text-2xl font-bold font-heading text-status-blue">{kits.reduce((s, k) => s + k.in_use_quantity, 0)}</p>
        </div>
        <div className="bg-nuke-card rounded-xl border border-nuke-border p-4">
          <div className="flex items-center gap-2 text-status-red text-xs font-medium mb-1">
            <XCircle size={14} /> DAMAGED
          </div>
          <p className="text-2xl font-bold font-heading text-status-red">{kits.reduce((s, k) => s + k.damaged_units, 0)}</p>
        </div>
      </div>

      {/* Kit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kits.map((kit) => {
          const util = getUtilization(kit);
          return (
            <div key={kit.id} className="bg-nuke-card rounded-xl border border-nuke-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-sm text-nuke-dark">{kit.name}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  util > 80 ? 'bg-status-red/10 text-status-red' :
                  util > 50 ? 'bg-status-yellow/10 text-status-yellow' :
                  'bg-status-green/10 text-status-green'
                }`}>
                  {util}% used
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-nuke-bg rounded-full mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    util > 80 ? 'bg-status-red' : util > 50 ? 'bg-status-yellow' : 'bg-status-green'
                  }`}
                  style={{ width: `${util}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-nuke-muted">Total</span>
                  <span className="font-semibold text-nuke-dark">{kit.total_quantity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-nuke-muted">Available</span>
                  <span className="font-semibold text-status-green">{kit.available_quantity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-nuke-muted">In Use</span>
                  <span className="font-semibold text-status-blue">{kit.in_use_quantity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-nuke-muted">Damaged</span>
                  <span className="font-semibold text-status-red">{kit.damaged_units}</span>
                </div>
              </div>

              <button
                onClick={() => setEditingKit(editingKit === kit.id ? null : kit.id)}
                className="mt-4 w-full text-center text-xs text-nuke-orange hover:bg-nuke-orange/5 py-2 rounded-lg transition-colors font-medium"
              >
                {editingKit === kit.id ? 'Close' : 'Update Inventory'}
              </button>

              {editingKit === kit.id && (
                <div className="mt-3 pt-3 border-t border-nuke-border grid grid-cols-2 gap-2 animate-fade-in">
                  {['total_quantity', 'available_quantity', 'in_use_quantity', 'damaged_units'].map(field => (
                    <div key={field}>
                      <label className="text-[10px] text-nuke-muted uppercase">{field.replace(/_/g, ' ')}</label>
                      <input
                        type="number"
                        min="0"
                        value={kit[field]}
                        onChange={(e) => handleUpdate(kit, field, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-nuke-border rounded-lg focus:outline-none focus:ring-1 focus:ring-nuke-orange"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
