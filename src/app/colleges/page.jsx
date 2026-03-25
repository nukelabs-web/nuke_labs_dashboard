'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import FormField, { Input, Select, Textarea } from '@/components/FormField';
import { LEAD_STATUS_OPTIONS } from '@/lib/constants';

const demoColleges = [
  { id: 1, name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra', contact_person: 'Dr. Suresh Patel', contact_email: 'suresh@iitb.ac.in', contact_phone: '9876543210', department: 'IEEE', lead_source: 'Referral', lead_status: 'Workshop Confirmed', assigned_to: 'Ankit Verma', notes: '' },
  { id: 2, name: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu', contact_person: 'Prof. Lakshmi', contact_email: 'lakshmi@vit.ac.in', contact_phone: '9876543211', department: 'Robotics Club', lead_source: 'LinkedIn', lead_status: 'Interested', assigned_to: 'Meera Joshi', notes: '' },
  { id: 3, name: 'BITS Pilani', city: 'Pilani', state: 'Rajasthan', contact_person: 'Dr. Sharma', contact_email: 'sharma@bits.ac.in', contact_phone: '9876543212', department: 'ECE', lead_source: 'Cold Call', lead_status: 'Negotiation', assigned_to: 'Rohan Gupta', notes: '' },
  { id: 4, name: 'NIT Trichy', city: 'Trichy', state: 'Tamil Nadu', contact_person: 'Dr. Raman', contact_email: 'raman@nitt.edu', contact_phone: '9876543213', department: 'IEEE', lead_source: 'Event', lead_status: 'Contacted', assigned_to: 'Sneha Iyer', notes: '' },
  { id: 5, name: 'IIIT Hyderabad', city: 'Hyderabad', state: 'Telangana', contact_person: 'Dr. Rao', contact_email: 'rao@iiith.ac.in', contact_phone: '9876543214', department: 'IT Club', lead_source: 'Website', lead_status: 'New Lead', assigned_to: 'Ankit Verma', notes: '' },
];

const emptyForm = {
  name: '', city: '', state: '', contact_person: '', contact_email: '', contact_phone: '',
  department: '', lead_source: '', lead_status: 'New Lead', assigned_to: '', notes: '',
};

export default function CollegesPage() {
  const { user, hasPermission } = useAuth();
  const [colleges, setColleges] = useState(demoColleges);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchColleges();
    fetchTeam();
  }, []);

  const fetchColleges = async () => {
    try {
      const { data } = await supabase.from('colleges').select('*').order('created_at', { ascending: false });
      if (data?.length > 0) setColleges(data);
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
  const isJuniorOnly = (user?.position?.includes('Junior Executive') || false) && !hasPermission('viewAll');
  const filteredColleges = isJuniorOnly 
    ? colleges.filter(c => c.assigned_to === user.name)
    : colleges;

  const handleSave = async () => {
    try {
      let result;
      if (editingId) {
        result = await supabase.from('colleges').update(form).eq('id', editingId);
      } else {
        result = await supabase.from('colleges').insert(form);
      }

      if (result.error) {
        alert(`Error: ${result.error.message}`);
        return;
      }

      fetchColleges();
      setShowModal(false); setEditingId(null); setForm(emptyForm);
    } catch (e) {
      if (editingId) {
        setColleges(colleges.map(c => c.id === editingId ? { ...c, ...form } : c));
      } else {
        setColleges([{ ...form, id: Date.now() }, ...colleges]);
      }
      setShowModal(false); setEditingId(null); setForm(emptyForm);
    }
  };

  const handleEdit = (college) => {
    setForm(college);
    setEditingId(college.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this college?')) return;
    try {
      const { error } = await supabase.from('colleges').delete().eq('id', id);
      if (error) {
        alert(`Failed to delete: ${error.message}${error.details ? ` (${error.details})` : ''}`);
        return;
      }
      fetchColleges();
    } catch (e) {
      setColleges(colleges.filter(c => c.id !== id));
    }
  };

  const columns = [
    { key: 'name', label: 'College Name', render: (row) => <span className="font-semibold text-nuke-dark">{row.name}</span> },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'department', label: 'Dept / Club' },
    { key: 'lead_status', label: 'Status', render: (row) => <StatusBadge status={row.lead_status} /> },
    { key: 'assigned_to', label: 'Assigned To', render: (row) => row.assigned_to || 'Unassigned' },
    {
      key: 'actions', label: '', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="px-2 py-1 text-xs text-nuke-orange hover:bg-nuke-orange/10 rounded transition-colors">Edit</button>
          {hasPermission('viewAll') && (
            <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 text-xs text-status-red hover:bg-status-red/10 rounded transition-colors">Delete</button>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'lead_status', label: 'Status', options: LEAD_STATUS_OPTIONS },
    { key: 'city', label: 'City', options: [...new Set(colleges.map(c => c.city))] },
  ];

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Colleges" 
        subtitle={isJuniorOnly ? "My assigned college leads" : "Manage college outreach and leads"} 
        buttonLabel={hasPermission('assignColleges') || isJuniorOnly ? "Add College" : null} 
        onButtonClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }} 
      />

      <DataTable columns={columns} data={filteredColleges} searchPlaceholder="Search colleges..." searchKey={['name', 'city', 'contact_person']} filters={filters} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit College' : 'Add College'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="College Name" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
          <FormField label="City" required><Input value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
          <FormField label="State"><Input value={form.state} onChange={e => set('state', e.target.value)} /></FormField>
          <FormField label="Contact Person"><Input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} /></FormField>
          <FormField label="Contact Email"><Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} /></FormField>
          <FormField label="Contact Phone"><Input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} /></FormField>
          <FormField label="Dept / Club"><Input value={form.department} onChange={e => set('department', e.target.value)} placeholder="IEEE, Robotics Club..." /></FormField>
          <FormField label="Lead Source"><Input value={form.lead_source} onChange={e => set('lead_source', e.target.value)} /></FormField>
          <FormField label="Lead Status"><Select options={LEAD_STATUS_OPTIONS} value={form.lead_status} onChange={e => set('lead_status', e.target.value)} /></FormField>
          <FormField label="Assigned To">
            <Select 
              options={teamMembers} 
              value={form.assigned_to} 
              onChange={e => set('assigned_to', e.target.value)} 
              disabled={!hasPermission('assignColleges') && editingId}
            />
          </FormField>
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
