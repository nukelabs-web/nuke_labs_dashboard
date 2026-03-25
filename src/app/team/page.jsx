'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import FormField, { Input, Select } from '@/components/FormField';
import { POSITION_NAMES, MEMBER_STATUS, POSITIONS } from '@/lib/constants';
import { ArrowUp, ArrowDown, RefreshCw, UserX, History, X } from 'lucide-react';

const demoTeam = [
  { id: 1, employee_id: 'NL-25-AD-001', name: 'Ankit Verma', position: 'Founder', email: 'ankit@nukelabs.in', department: 'Operations', status: 'Active', assigned_tasks: 3, assigned_colleges: 5 },
  { id: 2, employee_id: 'NL-25-CT-002', name: 'Meera Joshi', position: 'Core Team', email: 'meera@nukelabs.in', department: 'HR', status: 'Active', assigned_tasks: 2, assigned_colleges: 3 },
  { id: 3, employee_id: 'NL-25-BD-003', name: 'Rohan Gupta', position: 'Business Development Executive', email: 'rohan@nukelabs.in', department: 'Business Development', status: 'Active', assigned_tasks: 4, assigned_colleges: 8 },
  { id: 4, employee_id: 'NL-25-JE-004', name: 'Sneha Iyer', position: 'Junior Executive', email: 'sneha@nukelabs.in', department: 'Finance', status: 'Active', assigned_tasks: 2, assigned_colleges: 2 },
  { id: 5, employee_id: 'NL-25-CT-005', name: 'Priya Menon', position: 'Core Team', email: 'priya@nukelabs.in', department: 'Content', status: 'Active', assigned_tasks: 1, assigned_colleges: 4 },
];

const demoRoleHistory = [
  { id: 1, employee_id: 'NL-25-BD-003', employee_name: 'Rohan Gupta', old_role: 'Junior Executive', new_role: 'Business Development Executive', change_type: 'Promotion', changed_by: 'Ankit Verma', created_at: '2026-02-15' },
  { id: 2, employee_id: 'NL-25-CT-002', employee_name: 'Meera Joshi', old_role: 'Senior Executive', new_role: 'Core Team', change_type: 'Promotion', changed_by: 'Ankit Verma', created_at: '2026-01-10' },
];

const emptyForm = { name: '', employee_id: '', position: ['Junior Executive'], email: '', department: [], status: 'Active' };

export default function TeamPage() {
  const { user, hasPermission } = useAuth();
  const [team, setTeam] = useState(demoTeam);
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionType, setActionType] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [roleHistory, setRoleHistory] = useState(demoRoleHistory);
  const [memberHistory, setMemberHistory] = useState([]);

  useEffect(() => { fetchTeam(); fetchRoleHistory(); }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await supabase.from('users').select('*').order('name');
      if (data?.length > 0) setTeam(data);
    } catch (e) { }
  };

  const fetchRoleHistory = async () => {
    try {
      const { data } = await supabase.from('role_change_log').select('*').order('created_at', { ascending: false });
      if (data?.length > 0) setRoleHistory(data);
    } catch (e) { }
  };

  const handleSave = async () => {
    try {
      // Ensure arrays
      const payload = { 
        ...form, 
        position: Array.isArray(form.position) ? form.position : [form.position],
        department: Array.isArray(form.department) ? form.department : (form.department ? [form.department] : [])
      };
      
      let result;
      if (editingId) {
        result = await supabase.from('users').update(payload).eq('id', editingId);
      } else {
        result = await supabase.from('users').insert(payload);
      }

      if (result.error) {
        alert(`Error: ${result.error.message}`);
        return;
      }

      fetchTeam();
      setShowModal(false); setEditingId(null); setForm(emptyForm);
    } catch (e) {
      if (editingId) { setTeam(team.map(t => t.id === editingId ? { ...t, ...form } : t)); }
      else { setTeam([{ ...form, id: Date.now(), assigned_tasks: 0, assigned_colleges: 0 }, ...team]); }
      setShowModal(false); setEditingId(null); setForm(emptyForm);
    }
  };

  const handleEdit = (t) => { setForm(t); setEditingId(t.id); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        alert(`Failed to delete: ${error.message}`);
        return;
      }
      fetchTeam();
    } catch (e) {
      setTeam(team.filter(t => t.id !== id));
    }
  };

  const getPositionRank = (pos) => POSITIONS.find(p => p.name === pos)?.rank || 99;

  const openAction = (member, type) => {
    setSelectedMember(member);
    setActionType(type);
    
    // For promotion/transfer, we deal with the "Primary" (first) role/dept
    const primaryPos = Array.isArray(member.position) ? member.position[0] : member.position;
    const primaryDept = Array.isArray(member.department) ? member.department[0] : member.department;
    
    setNewPosition(primaryPos || 'Junior Executive');
    setNewDepartment(primaryDept || '');
    setShowActionModal(true);
  };

  const handlePromoteDemote = async () => {
    if (!selectedMember || newPosition === selectedMember.position) return;

    const logEntry = {
      employee_id: selectedMember.employee_id || '',
      employee_name: selectedMember.name,
      old_role: selectedMember.position,
      new_role: newPosition,
      change_type: getPositionRank(newPosition) < getPositionRank(selectedMember.position) ? 'Promotion' : 'Demotion',
      changed_by: user?.name || 'Admin',
    };

    try {
      const updateResult = await supabase.from('users').update({ position: newPosition }).eq('id', selectedMember.id);
      if (updateResult.error) {
        alert(`Failed to update role: ${updateResult.error.message}`);
        return;
      }
      
      await supabase.from('role_change_log').insert(logEntry);
      fetchTeam(); fetchRoleHistory();
    } catch (e) {
      setTeam(team.map(t => t.id === selectedMember.id ? { ...t, position: newPosition } : t));
      setRoleHistory([{ ...logEntry, id: Date.now(), created_at: new Date().toISOString() }, ...roleHistory]);
    }
    setShowActionModal(false);
  };

  const handleTransferDepartment = async () => {
    if (!selectedMember) return;
    try {
      const { error } = await supabase.from('users').update({ department: newDepartment }).eq('id', selectedMember.id);
      if (error) {
        alert(`Failed to transfer: ${error.message}`);
        return;
      }
      fetchTeam();
    } catch (e) {
      setTeam(team.map(t => t.id === selectedMember.id ? { ...t, department: newDepartment } : t));
    }
    setShowActionModal(false);
  };

  const handleDeactivate = async () => {
    if (!selectedMember) return;
    const newStatus = selectedMember.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', selectedMember.id);
      if (error) {
        alert(`Failed to ${newStatus === 'Inactive' ? 'deactivate' : 'reactivate'}: ${error.message}`);
        return;
      }
      fetchTeam();
    } catch (e) {
      setTeam(team.map(t => t.id === selectedMember.id ? { ...t, status: newStatus } : t));
    }
    setShowActionModal(false);
  };

  const viewMemberHistory = (member) => {
    const history = roleHistory.filter(h => h.employee_name === member.name || h.employee_id === member.employee_id);
    setMemberHistory(history);
    setSelectedMember(member);
    setShowHistoryModal(true);
  };

  const columns = [
    { key: 'employee_id', label: 'ID', render: (row) => <span className="font-mono text-xs text-nuke-muted">{row.employee_id || '—'}</span> },
    { key: 'name', label: 'Name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-nuke-orange/10 flex items-center justify-center shrink-0">
          <span className="text-nuke-orange font-semibold text-xs">{row.name[0]}</span>
        </div>
        <div>
          <span className="font-semibold text-nuke-dark">{row.name}</span>
          <p className="text-xs text-nuke-muted">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'position', label: 'Positions', render: (row) => (
      <div className="flex flex-wrap gap-1">
        {(Array.isArray(row.position) ? row.position : [row.position]).map((pos, i) => (
          <StatusBadge key={i} status={pos} />
        ))}
      </div>
    )},
    { key: 'department', label: 'Departments', render: (row) => (
      <div className="flex flex-wrap gap-1">
        {(Array.isArray(row.department) ? row.department : [row.department]).map((dept, i) => (
          <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-nuke-bg text-nuke-muted border border-nuke-border">
            {dept}
          </span>
        ))}
        {(!row.department || row.department.length === 0) && <span className="text-nuke-muted italic text-xs">—</span>}
      </div>
    )},
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status || 'Active'} /> },
    { key: 'assigned_tasks', label: 'Tasks', render: (row) => <span className="font-semibold">{row.assigned_tasks || 0}</span> },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {hasPermission('promote') && (
            <>
              <button onClick={(e) => { e.stopPropagation(); openAction(row, 'promote'); }} className="p-1.5 text-status-green hover:bg-status-green/10 rounded transition-colors" title="Promote">
                <ArrowUp size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); openAction(row, 'demote'); }} className="p-1.5 text-status-yellow hover:bg-status-yellow/10 rounded transition-colors" title="Change Role">
                <RefreshCw size={14} />
              </button>
            </>
          )}
          {hasPermission('assignTasks') && (
            <button onClick={(e) => { e.stopPropagation(); openAction(row, 'transfer'); }} className="p-1.5 text-status-blue hover:bg-status-blue/10 rounded transition-colors" title="Transfer Dept">
              <ArrowDown size={14} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); viewMemberHistory(row); }} className="p-1.5 text-status-purple hover:bg-status-purple/10 rounded transition-colors" title="Role History">
            <History size={14} />
          </button>
          {hasPermission('manageUsers') && (
            <>
              <button onClick={(e) => { e.stopPropagation(); openAction(row, 'deactivate'); }} className="p-1.5 text-status-red hover:bg-status-red/10 rounded transition-colors" title="Deactivate">
                <UserX size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="px-2 py-1 text-xs text-nuke-orange hover:bg-nuke-orange/10 rounded transition-colors">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 text-xs text-status-red hover:bg-status-red/10 rounded transition-colors">Remove</button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'position', label: 'Position', options: POSITION_NAMES },
    { key: 'department', label: 'Department', options: [...new Set(team.map(t => t.department).filter(Boolean))] },
    { key: 'status', label: 'Status', options: MEMBER_STATUS },
  ];

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Team" 
        subtitle="Team directory and position management" 
        buttonLabel={hasPermission('manageUsers') ? "Add Member" : null} 
        onButtonClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }} 
      />

      <DataTable columns={columns} data={team} searchPlaceholder="Search team..." searchKey={['name', 'email', 'department', 'employee_id']} filters={filters} />

      {/* Add/Edit Member Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Member' : 'Add Member'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField label="Employee ID"><Input value={form.employee_id} onChange={e => set('employee_id', e.target.value)} placeholder="NL-25-XX-001" /></FormField>
            <FormField label="Name" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
            <FormField label="Email" required><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
            <FormField label="Status"><Select options={MEMBER_STATUS} value={form.status || 'Active'} onChange={e => set('status', e.target.value)} /></FormField>
          </div>
          
          <div className="space-y-4">
            <div className="bg-nuke-bg rounded-xl border border-nuke-border p-4">
              <label className="text-xs font-bold text-nuke-muted uppercase mb-3 block">Positions</label>
              <div className="grid grid-cols-1 gap-2">
                {POSITION_NAMES.map(pos => {
                  const isSelected = form.position?.includes(pos);
                  return (
                    <label key={pos} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-nuke-orange/10 border-nuke-orange/30' : 'bg-white border-nuke-border hover:border-nuke-orange/30'}`}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => {
                          const current = Array.isArray(form.position) ? form.position : [form.position].filter(Boolean);
                          if (e.target.checked) set('position', [...current, pos]);
                          else set('position', current.filter(p => p !== pos));
                        }}
                        className="w-4 h-4 accent-nuke-orange"
                      />
                      <span className="text-sm font-medium">{pos}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-nuke-bg rounded-xl border border-nuke-border p-4">
              <label className="text-xs font-bold text-nuke-muted uppercase mb-3 block">Departments</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add department..." 
                    id="new-dept"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val && !form.department?.includes(val)) {
                          set('department', [...(form.department || []), val]);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-dept');
                      const val = input.value.trim();
                      if (val && !form.department?.includes(val)) {
                        set('department', [...(form.department || []), val]);
                        input.value = '';
                      }
                    }}
                    className="px-3 bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.department || []).map(dept => (
                    <span key={dept} className="flex items-center gap-1 bg-white border border-nuke-border px-2 py-1 rounded-lg text-xs font-medium">
                      {dept}
                      <button onClick={() => set('department', form.department.filter(d => d !== dept))} className="text-nuke-muted hover:text-status-red">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-nuke-border">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold">{editingId ? 'Update Member' : 'Add Member'}</button>
        </div>
      </Modal>

      {/* Action Modal: Promote / Demote / Transfer / Deactivate */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title={
        actionType === 'promote' ? `Promote ${selectedMember?.name}` :
        actionType === 'demote' ? `Change Role — ${selectedMember?.name}` :
        actionType === 'transfer' ? `Transfer Department — ${selectedMember?.name}` :
        `Deactivate ${selectedMember?.name}`
      }>
        {(actionType === 'promote' || actionType === 'demote') && (
          <div className="space-y-4">
            <div className="bg-nuke-bg rounded-lg p-4">
              <p className="text-xs text-nuke-muted mb-1">Current Position</p>
              <StatusBadge status={selectedMember?.position} />
            </div>
            <FormField label="New Position">
              <Select options={POSITION_NAMES} value={newPosition} onChange={e => setNewPosition(e.target.value)} />
            </FormField>
            {newPosition !== selectedMember?.position && (
              <div className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg ${
                getPositionRank(newPosition) < getPositionRank(selectedMember?.position)
                  ? 'bg-status-green/10 text-status-green'
                  : 'bg-status-yellow/10 text-status-yellow'
              }`}>
                {getPositionRank(newPosition) < getPositionRank(selectedMember?.position) ? (
                  <><ArrowUp size={14} /> This is a promotion</>
                ) : (
                  <><ArrowDown size={14} /> This is a demotion</>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-nuke-border">
              <button onClick={() => setShowActionModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
              <button onClick={handlePromoteDemote} disabled={newPosition === selectedMember?.position} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold disabled:opacity-40">Confirm Change</button>
            </div>
          </div>
        )}

        {actionType === 'transfer' && (
          <div className="space-y-4">
            <div className="bg-nuke-bg rounded-lg p-4">
              <p className="text-xs text-nuke-muted mb-1">Current Department</p>
              <p className="font-semibold text-sm">{selectedMember?.department}</p>
            </div>
            <FormField label="New Department">
              <Input value={newDepartment} onChange={e => setNewDepartment(e.target.value)} />
            </FormField>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-nuke-border">
              <button onClick={() => setShowActionModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
              <button onClick={handleTransferDepartment} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold">Transfer</button>
            </div>
          </div>
        )}

        {actionType === 'deactivate' && (
          <div className="space-y-4">
            <p className="text-sm text-nuke-dark">
              {selectedMember?.status === 'Active'
                ? `Are you sure you want to deactivate ${selectedMember?.name}? They will lose access to the dashboard.`
                : `Reactivate ${selectedMember?.name}?`
              }
            </p>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-nuke-border">
              <button onClick={() => setShowActionModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
              <button onClick={handleDeactivate} className={`px-4 py-2 text-sm text-white rounded-lg transition-colors font-semibold ${
                selectedMember?.status === 'Active' ? 'bg-status-red hover:bg-status-red/80' : 'bg-status-green hover:bg-status-green/80'
              }`}>
                {selectedMember?.status === 'Active' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Role History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`Role History — ${selectedMember?.name}`} maxWidth="max-w-xl">
        {memberHistory.length === 0 ? (
          <p className="text-sm text-nuke-muted py-8 text-center">No role changes recorded</p>
        ) : (
          <div className="space-y-3">
            {memberHistory.map((h) => (
              <div key={h.id} className="flex items-start gap-3 p-3 bg-nuke-bg rounded-lg">
                <div className="w-8 h-8 rounded-full bg-nuke-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowUp size={14} className="text-nuke-orange" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={h.old_role} />
                    <span className="text-xs text-nuke-muted">→</span>
                    <StatusBadge status={h.new_role} />
                  </div>
                  <p className="text-xs text-nuke-muted mt-1.5">
                    {h.change_type} by {h.changed_by} · {new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4 pt-4 border-t border-nuke-border">
          <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Close</button>
        </div>
      </Modal>
    </div>
  );
}
