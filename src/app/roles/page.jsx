'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import FormField, { Input, Select } from '@/components/FormField';
import { POSITIONS, TRAINER_LEVELS, PERMISSIONS } from '@/lib/constants';
import { Shield, GripVertical, Edit2, Trash2, Plus, ChevronRight, Users, UserCheck } from 'lucide-react';

const defaultRoles = POSITIONS.map(p => ({
  id: p.rank,
  role_name: p.name,
  rank_level: p.rank,
  permissions: PERMISSIONS[p.name] || {},
}));

const permissionLabels = {
  fullAccess: 'Full Access',
  promote: 'Promote Users',
  editRoles: 'Edit Roles',
  manageUsers: 'Manage Users',
  assignTasks: 'Assign Tasks',
  assignWorkshops: 'Assign Workshops',
  assignColleges: 'Assign Colleges',
  viewAll: 'View All Data',
};

export default function RoleManagementPage() {
  const [roles, setRoles] = useState(defaultRoles);
  const [trainerLevels] = useState(TRAINER_LEVELS);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ role_name: '', rank_level: '', permissions: {} });
  const [activeTab, setActiveTab] = useState('positions');

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await supabase.from('roles_config').select('*').order('rank_level');
      if (data?.length > 0) setRoles(data);
    } catch (e) { }
  };

  const handleSaveRole = async () => {
    const payload = { ...form, rank_level: Number(form.rank_level) };
    try {
      if (editingRole) {
        await supabase.from('roles_config').update(payload).eq('id', editingRole.id);
      } else {
        await supabase.from('roles_config').insert(payload);
      }
      fetchRoles();
    } catch (e) {
      if (editingRole) {
        setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...payload } : r));
      } else {
        setRoles([...roles, { ...payload, id: Date.now() }].sort((a, b) => a.rank_level - b.rank_level));
      }
    }
    setShowModal(false); setEditingRole(null);
    setForm({ role_name: '', rank_level: '', permissions: {} });
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setForm({ role_name: role.role_name, rank_level: String(role.rank_level), permissions: role.permissions || {} });
    setShowModal(true);
  };

  const handleDeleteRole = async (role) => {
    if (!confirm(`Delete role "${role.role_name}"?`)) return;
    try { await supabase.from('roles_config').delete().eq('id', role.id); fetchRoles(); }
    catch (e) { setRoles(roles.filter(r => r.id !== role.id)); }
  };

  const togglePermission = (key) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Role Management" subtitle="Configure positions, ranks, and permissions" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-nuke-card rounded-xl border border-nuke-border p-1">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'positions' ? 'bg-nuke-orange text-white shadow-sm' : 'text-nuke-muted hover:text-nuke-dark hover:bg-nuke-bg'
          }`}
        >
          <span className="flex items-center justify-center gap-2"><Users size={15} /> Team Positions</span>
        </button>
        <button
          onClick={() => setActiveTab('trainers')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'trainers' ? 'bg-nuke-orange text-white shadow-sm' : 'text-nuke-muted hover:text-nuke-dark hover:bg-nuke-bg'
          }`}
        >
          <span className="flex items-center justify-center gap-2"><UserCheck size={15} /> Trainer Levels</span>
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'permissions' ? 'bg-nuke-orange text-white shadow-sm' : 'text-nuke-muted hover:text-nuke-dark hover:bg-nuke-bg'
          }`}
        >
          <span className="flex items-center justify-center gap-2"><Shield size={15} /> Permissions</span>
        </button>
      </div>

      {/* Team Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingRole(null); setForm({ role_name: '', rank_level: String(roles.length + 1), permissions: {} }); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-nuke-orange text-white rounded-lg text-sm font-semibold hover:bg-nuke-orange-hover transition-colors"
            >
              <Plus size={16} /> Add Position
            </button>
          </div>

          <div className="bg-nuke-card rounded-xl border border-nuke-border overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 bg-nuke-bg/50 text-xs font-semibold text-nuke-muted uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Position Name</div>
              <div className="col-span-5">Permissions Summary</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-nuke-border">
              {roles.map((role) => (
                <div key={role.id} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-nuke-bg/30 transition-colors">
                  <div className="col-span-1">
                    <span className="w-7 h-7 rounded-full bg-nuke-bg flex items-center justify-center text-xs font-bold text-nuke-dark">
                      {role.rank_level}
                    </span>
                  </div>
                  <div className="col-span-4">
                    <StatusBadge status={role.role_name} />
                  </div>
                  <div className="col-span-5 flex flex-wrap gap-1">
                    {Object.entries(role.permissions || {}).filter(([, v]) => v).map(([key]) => (
                      <span key={key} className="px-2 py-0.5 bg-nuke-bg text-[10px] rounded-full text-nuke-muted">
                        {permissionLabels[key] || key}
                      </span>
                    ))}
                    {Object.values(role.permissions || {}).filter(Boolean).length === 0 && (
                      <span className="text-xs text-nuke-muted">Basic access</span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <button onClick={() => handleEditRole(role)} className="p-1.5 text-nuke-orange hover:bg-nuke-orange/10 rounded transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteRole(role)} className="p-1.5 text-status-red hover:bg-status-red/10 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trainer Levels Tab */}
      {activeTab === 'trainers' && (
        <div className="bg-nuke-card rounded-xl border border-nuke-border overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-nuke-bg/50 text-xs font-semibold text-nuke-muted uppercase tracking-wider">
            <div className="col-span-2">Rank</div>
            <div className="col-span-5">Trainer Level</div>
            <div className="col-span-5">Badge</div>
          </div>
          <div className="divide-y divide-nuke-border">
            {trainerLevels.map((level) => (
              <div key={level.rank} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-nuke-bg/30 transition-colors">
                <div className="col-span-2">
                  <span className="w-7 h-7 rounded-full bg-nuke-bg flex items-center justify-center text-xs font-bold text-nuke-dark">
                    {level.rank}
                  </span>
                </div>
                <div className="col-span-5 text-sm font-semibold text-nuke-dark">{level.name}</div>
                <div className="col-span-5">
                  <StatusBadge status={level.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-nuke-card rounded-xl border border-nuke-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-nuke-bg/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-nuke-muted uppercase">Permission</th>
                  {roles.map(r => (
                    <th key={r.id} className="text-center px-3 py-3 text-xs font-semibold text-nuke-muted uppercase whitespace-nowrap">{r.role_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-nuke-border">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <tr key={key} className="hover:bg-nuke-bg/30">
                    <td className="px-4 py-3 font-medium text-nuke-dark">{label}</td>
                    {roles.map(r => (
                      <td key={r.id} className="text-center px-3 py-3">
                        {(r.permissions || {})[key] ? (
                          <span className="inline-flex w-5 h-5 rounded-full bg-status-green/20 items-center justify-center text-status-green text-xs">✓</span>
                        ) : (
                          <span className="inline-flex w-5 h-5 rounded-full bg-gray-100 items-center justify-center text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRole ? 'Edit Position' : 'Add Position'}>
        <div className="space-y-4">
          <FormField label="Position Name" required>
            <Input value={form.role_name} onChange={e => setForm({ ...form, role_name: e.target.value })} />
          </FormField>
          <FormField label="Rank Level" required>
            <Input type="number" min="1" value={form.rank_level} onChange={e => setForm({ ...form, rank_level: e.target.value })} />
          </FormField>
          <div>
            <label className="block text-sm font-medium text-nuke-dark mb-2 font-body">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-nuke-bg cursor-pointer transition-colors text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.permissions[key]}
                    onChange={() => togglePermission(key)}
                    className="w-4 h-4 rounded border-nuke-border text-nuke-orange focus:ring-nuke-orange"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nuke-border">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
          <button onClick={handleSaveRole} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold">{editingRole ? 'Update' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  );
}
