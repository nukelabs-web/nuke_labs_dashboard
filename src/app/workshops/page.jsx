'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import FormField, { Input, Select, Textarea } from '@/components/FormField';
import { WORKSHOP_STATUS_OPTIONS } from '@/lib/constants';

const demoWorkshops = [
  { id: 1, workshop_id: 'WS-2026-001', college_name: 'IIT Bombay', city: 'Mumbai', workshop_type: 'Drone Workshop', workshop_date: '2026-03-28', trainer_name: 'Rahul Sharma', expected_students: 60, actual_students: null, status: 'Confirmed', responsible: 'Ankit', notes: '' },
  { id: 2, workshop_id: 'WS-2026-002', college_name: 'VIT Vellore', city: 'Vellore', workshop_type: 'IoT Workshop', workshop_date: '2026-03-30', trainer_name: 'Priya Patel', expected_students: 45, actual_students: null, status: 'Planned', responsible: 'Meera', notes: '' },
  { id: 3, workshop_id: 'WS-2026-003', college_name: 'BITS Pilani', city: 'Pilani', workshop_type: 'Robotics Workshop', workshop_date: '2026-04-02', trainer_name: 'Arun Kumar', expected_students: 50, actual_students: null, status: 'Confirmed', responsible: 'Rohan', notes: '' },
  { id: 4, workshop_id: 'WS-2026-004', college_name: 'NIT Trichy', city: 'Trichy', workshop_type: 'IoT Workshop', workshop_date: '2026-04-05', trainer_name: 'Sneha Reddy', expected_students: 40, actual_students: null, status: 'Planned', responsible: 'Sneha', notes: '' },
  { id: 5, workshop_id: 'WS-2026-005', college_name: 'IIIT Hyderabad', city: 'Hyderabad', workshop_type: 'Drone Workshop', workshop_date: '2026-03-15', trainer_name: 'Rahul Sharma', expected_students: 55, actual_students: 52, status: 'Completed', responsible: 'Ankit', notes: 'Great feedback' },
];

const emptyForm = {
  college_name: '', city: '', workshop_type: '', workshop_date: '', trainer_name: '',
  expected_students: '', actual_students: '', status: 'Planned', responsible: '', notes: '',
};

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState(demoWorkshops);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchWorkshops(); }, []);

  const fetchWorkshops = async () => {
    try {
      const { data } = await supabase.from('workshops').select('*').order('workshop_date', { ascending: false });
      if (data?.length > 0) setWorkshops(data);
    } catch (e) { }
  };

  const handleSave = async () => {
    const payload = { ...form, expected_students: Number(form.expected_students) || 0, actual_students: form.actual_students ? Number(form.actual_students) : null };
    try {
      if (editingId) {
        await supabase.from('workshops').update(payload).eq('id', editingId);
      } else {
        const wid = `WS-${new Date().getFullYear()}-${String(workshops.length + 1).padStart(3, '0')}`;
        await supabase.from('workshops').insert({ ...payload, workshop_id: wid });
      }
      fetchWorkshops();
    } catch (e) {
      if (editingId) {
        setWorkshops(workshops.map(w => w.id === editingId ? { ...w, ...payload } : w));
      } else {
        const wid = `WS-${new Date().getFullYear()}-${String(workshops.length + 1).padStart(3, '0')}`;
        setWorkshops([{ ...payload, id: Date.now(), workshop_id: wid }, ...workshops]);
      }
    }
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (ws) => {
    setForm({ ...ws, expected_students: String(ws.expected_students || ''), actual_students: String(ws.actual_students || '') });
    setEditingId(ws.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workshop?')) return;
    try { await supabase.from('workshops').delete().eq('id', id); fetchWorkshops(); }
    catch (e) { setWorkshops(workshops.filter(w => w.id !== id)); }
  };

  const columns = [
    { key: 'workshop_id', label: 'ID', render: (row) => <span className="font-mono text-xs text-nuke-muted">{row.workshop_id}</span> },
    { key: 'college_name', label: 'College', render: (row) => <span className="font-semibold text-nuke-dark">{row.college_name}</span> },
    { key: 'city', label: 'City' },
    { key: 'workshop_type', label: 'Type' },
    { key: 'workshop_date', label: 'Date', render: (row) => new Date(row.workshop_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'trainer_name', label: 'Trainer' },
    { key: 'expected_students', label: 'Students', render: (row) => row.actual_students ? `${row.actual_students}/${row.expected_students}` : row.expected_students },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions', label: '', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="px-2 py-1 text-xs text-nuke-orange hover:bg-nuke-orange/10 rounded transition-colors">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 text-xs text-status-red hover:bg-status-red/10 rounded transition-colors">Delete</button>
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'status', label: 'Status', options: WORKSHOP_STATUS_OPTIONS },
    { key: 'city', label: 'City', options: [...new Set(workshops.map(w => w.city))] },
  ];

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Workshops" subtitle="Schedule and manage workshops" buttonLabel="Add Workshop" onButtonClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }} />
      <DataTable columns={columns} data={workshops} searchPlaceholder="Search workshops..." searchKey={['college_name', 'city', 'trainer_name', 'workshop_type']} filters={filters} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Workshop' : 'Add Workshop'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="College" required><Input value={form.college_name} onChange={e => set('college_name', e.target.value)} /></FormField>
          <FormField label="City" required><Input value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
          <FormField label="Workshop Type" required><Input value={form.workshop_type} onChange={e => set('workshop_type', e.target.value)} placeholder="Drone, IoT, Robotics..." /></FormField>
          <FormField label="Date" required><Input type="date" value={form.workshop_date} onChange={e => set('workshop_date', e.target.value)} /></FormField>
          <FormField label="Trainer"><Input value={form.trainer_name} onChange={e => set('trainer_name', e.target.value)} /></FormField>
          <FormField label="Status"><Select options={WORKSHOP_STATUS_OPTIONS} value={form.status} onChange={e => set('status', e.target.value)} /></FormField>
          <FormField label="Expected Students"><Input type="number" value={form.expected_students} onChange={e => set('expected_students', e.target.value)} /></FormField>
          <FormField label="Actual Students"><Input type="number" value={form.actual_students} onChange={e => set('actual_students', e.target.value)} /></FormField>
          <FormField label="Responsible"><Input value={form.responsible} onChange={e => set('responsible', e.target.value)} /></FormField>
          <div></div>
          <div className="col-span-2">
            <FormField label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nuke-border">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold">{editingId ? 'Update' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  );
}
