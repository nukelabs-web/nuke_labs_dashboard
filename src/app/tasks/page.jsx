'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import FormField, { Input, Select, Textarea } from '@/components/FormField';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/lib/constants';

const demoTasks = [
  { id: 1, title: 'Prepare IoT kits for VIT workshop', description: 'Check inventory and prepare 45 IoT kits', assigned_person: 'Ankit Verma', department: 'Operations', priority: 'High', deadline: '2026-03-29', status: 'In Progress' },
  { id: 2, title: 'Confirm trainer for BITS Pilani', description: 'Contact Arun Kumar and confirm availability', assigned_person: 'Meera Joshi', department: 'HR', priority: 'Urgent', deadline: '2026-03-27', status: 'Pending' },
  { id: 3, title: 'Send follow-up to NIT Trichy', description: 'Follow up on workshop proposal', assigned_person: 'Rohan Gupta', department: 'BD', priority: 'Medium', deadline: '2026-03-30', status: 'Pending' },
  { id: 4, title: 'Update workshop content for drones', description: 'Add new drone flight modules', assigned_person: 'Rahul Sharma', department: 'Content', priority: 'Low', deadline: '2026-04-10', status: 'In Progress' },
  { id: 5, title: 'Process trainer payments for March', description: 'Calculate and process payments for completed workshops', assigned_person: 'Sneha Iyer', department: 'Finance', priority: 'High', deadline: '2026-04-01', status: 'Pending' },
];

const emptyForm = {
  title: '', description: '', assigned_person: '', department: '', priority: 'Medium', deadline: '', status: 'Pending',
};

export default function TasksPage() {
  const { user, hasPermission } = useAuth();
  const [tasks, setTasks] = useState(demoTasks);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTasks();
    fetchTeam();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (data?.length > 0) setTasks(data);
    } catch (e) { }
  };

  const fetchTeam = async () => {
    try {
      const { data } = await supabase.from('users').select('name').order('name');
      if (data) setTeamMembers(data.map(m => m.name));
      else setTeamMembers(['Ankit Verma', 'Meera Joshi', 'Rohan Gupta', 'Sneha Iyer', 'Priya Menon']);
    } catch (e) {
      setTeamMembers(['Ankit Verma', 'Meera Joshi', 'Rohan Gupta', 'Sneha Iyer', 'Priya Menon']);
    }
  };

  // Filter based on user rank
  const filteredTasks = user?.position === 'Junior Executive' 
    ? tasks.filter(t => t.assigned_person === user.name)
    : tasks;

  const handleSave = async () => {
    try {
      if (editingId) { await supabase.from('tasks').update(form).eq('id', editingId); }
      else { await supabase.from('tasks').insert(form); }
      fetchTasks();
    } catch (e) {
      if (editingId) { setTasks(tasks.map(t => t.id === editingId ? { ...t, ...form } : t)); }
      else { setTasks([{ ...form, id: Date.now() }, ...tasks]); }
    }
    setShowModal(false); setEditingId(null); setForm(emptyForm);
  };

  const handleEdit = (t) => {
    if (user?.position === 'Junior Executive' && t.assigned_person !== user.name) return;
    setForm(t); setEditingId(t.id); setShowModal(true); 
  };

  const handleStatusChange = async (task, newStatus) => {
    try { await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id); fetchTasks(); }
    catch (e) { setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await supabase.from('tasks').delete().eq('id', id); fetchTasks(); }
    catch (e) { setTasks(tasks.filter(t => t.id !== id)); }
  };

  const columns = [
    { key: 'title', label: 'Task', render: (row) => (
      <div>
        <span className="font-semibold text-nuke-dark">{row.title}</span>
        {row.description && <p className="text-xs text-nuke-muted mt-0.5 truncate max-w-xs">{row.description}</p>}
      </div>
    )},
    { key: 'assigned_person', label: 'Assigned To' },
    { key: 'department', label: 'Dept' },
    { key: 'priority', label: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { key: 'deadline', label: 'Deadline', render: (row) => {
      const dl = new Date(row.deadline);
      const isOverdue = dl < new Date() && row.status !== 'Completed';
      return <span className={isOverdue ? 'text-status-red font-medium' : ''}>{dl.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>;
    }},
    { key: 'status', label: 'Status', render: (row) => (
      <select
        value={row.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => handleStatusChange(row, e.target.value)}
        className="text-xs px-2 py-1 border border-nuke-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-nuke-orange"
      >
        {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    {
      key: 'actions', label: '', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="px-2 py-1 text-xs text-nuke-orange hover:bg-nuke-orange/10 rounded transition-colors">Edit</button>
          {hasPermission('assignTasks') && (
            <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 text-xs text-status-red hover:bg-status-red/10 rounded transition-colors">Delete</button>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'status', label: 'Status', options: TASK_STATUS_OPTIONS },
    { key: 'priority', label: 'Priority', options: TASK_PRIORITY_OPTIONS },
    { key: 'assigned_person', label: 'Assigned To', options: teamMembers },
  ];

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Tasks" 
        subtitle={user?.position === 'Junior Executive' ? "My assigned tasks" : "Internal task management"} 
        buttonLabel={hasPermission('assignTasks') || user?.position === 'Junior Executive' ? "Add Task" : null} 
        onButtonClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }} 
      />
      <DataTable columns={columns} data={filteredTasks} searchPlaceholder="Search tasks..." searchKey={['title', 'assigned_person', 'department']} filters={filters} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Task' : 'Add Task'} maxWidth="max-w-lg">
        <div className="space-y-4">
          <FormField label="Title" required><Input value={form.title} onChange={e => set('title', e.target.value)} /></FormField>
          <FormField label="Description"><Textarea value={form.description} onChange={e => set('description', e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assigned To" required>
              <Select 
                options={teamMembers} 
                value={form.assigned_person} 
                onChange={e => set('assigned_person', e.target.value)} 
                disabled={!hasPermission('assignTasks') && editingId}
              />
            </FormField>
            <FormField label="Department"><Input value={form.department} onChange={e => set('department', e.target.value)} /></FormField>
            <FormField label="Priority"><Select options={TASK_PRIORITY_OPTIONS} value={form.priority} onChange={e => set('priority', e.target.value)} /></FormField>
            <FormField label="Deadline"><Input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></FormField>
          </div>
          <FormField label="Status"><Select options={TASK_STATUS_OPTIONS} value={form.status} onChange={e => set('status', e.target.value)} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nuke-border">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold">{editingId ? 'Update' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  );
}
