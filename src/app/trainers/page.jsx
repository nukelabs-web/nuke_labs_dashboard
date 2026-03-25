'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import FormField, { Input, Select, Textarea } from '@/components/FormField';
import { AVAILABILITY_STATUS, TRAINER_LEVEL_NAMES, TRAINER_LEVELS } from '@/lib/constants';
import { ArrowUp, History } from 'lucide-react';

const demoTrainers = [
  { id: 1, name: 'Rahul Sharma', organization: 'NukeLabs', city: 'Mumbai', skills: 'Drones, IoT', workshops_can_teach: 'Drone Workshop, IoT Workshop', phone: '9876543210', email: 'rahul@nukelabs.in', workshops_conducted: 24, rating: 4.8, availability_status: 'Available', trainer_level: 'Senior Trainer' },
  { id: 2, name: 'Priya Patel', organization: 'NukeLabs', city: 'Delhi', skills: 'IoT, Arduino', workshops_can_teach: 'IoT Workshop', phone: '9876543211', email: 'priya@nukelabs.in', workshops_conducted: 18, rating: 4.6, availability_status: 'Available', trainer_level: 'Trainer' },
  { id: 3, name: 'Arun Kumar', organization: 'Freelance', city: 'Bangalore', skills: 'Robotics, Arduino', workshops_can_teach: 'Robotics Workshop', phone: '9876543212', email: 'arun@email.com', workshops_conducted: 12, rating: 4.5, availability_status: 'Busy', trainer_level: 'Trainer' },
  { id: 4, name: 'Sneha Reddy', organization: 'NukeLabs', city: 'Hyderabad', skills: 'IoT, Python', workshops_can_teach: 'IoT Workshop, Python Workshop', phone: '9876543213', email: 'sneha@nukelabs.in', workshops_conducted: 15, rating: 4.7, availability_status: 'Available', trainer_level: 'Senior Trainer' },
  { id: 5, name: 'Vikram Singh', organization: 'Freelance', city: 'Jaipur', skills: 'Drones', workshops_can_teach: 'Drone Workshop', phone: '9876543214', email: 'vikram@email.com', workshops_conducted: 8, rating: 4.3, availability_status: 'On Leave', trainer_level: 'Associate Trainer' },
];

const demoPromotionHistory = [
  { id: 1, trainer_name: 'Rahul Sharma', old_level: 'Trainer', new_level: 'Senior Trainer', changed_by: 'Ankit Verma', created_at: '2026-01-15' },
  { id: 2, trainer_name: 'Sneha Reddy', old_level: 'Associate Trainer', new_level: 'Trainer', changed_by: 'Meera Joshi', created_at: '2025-09-20' },
  { id: 3, trainer_name: 'Sneha Reddy', old_level: 'Trainer', new_level: 'Senior Trainer', changed_by: 'Ankit Verma', created_at: '2026-02-10' },
];

const emptyForm = {
  name: '', organization: '', city: '', skills: '', workshops_can_teach: '', phone: '', email: '',
  workshops_conducted: '', rating: '', availability_status: 'Available', trainer_level: 'Associate Trainer',
};

export default function TrainersPage() {
  const { user, hasPermission } = useAuth();
  const [trainers, setTrainers] = useState(demoTrainers);
  const [showModal, setShowModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [newLevel, setNewLevel] = useState('');
  const [promotionHistory, setPromotionHistory] = useState(demoPromotionHistory);
  const [trainerHistory, setTrainerHistory] = useState([]);

  useEffect(() => { fetchTrainers(); fetchPromotionHistory(); }, []);

  const fetchTrainers = async () => {
    try {
      const { data } = await supabase.from('trainers').select('*').order('name');
      if (data?.length > 0) setTrainers(data);
    } catch (e) { }
  };

  const fetchPromotionHistory = async () => {
    try {
      const { data } = await supabase.from('trainer_promotion_log').select('*').order('created_at', { ascending: false });
      if (data?.length > 0) setPromotionHistory(data);
    } catch (e) { }
  };

  const handleSave = async () => {
    const payload = { ...form, workshops_conducted: Number(form.workshops_conducted) || 0, rating: parseFloat(form.rating) || 0 };
    try {
      let result;
      if (editingId) {
        result = await supabase.from('trainers').update(payload).eq('id', editingId);
      } else {
        result = await supabase.from('trainers').insert(payload);
      }
      
      if (result.error) {
        alert(`Error: ${result.error.message}`);
        return;
      }
      
      fetchTrainers();
      setShowModal(false); setEditingId(null); setForm(emptyForm);
    } catch (e) {
      // Offline/Mock fallback
      if (editingId) { setTrainers(trainers.map(t => t.id === editingId ? { ...t, ...payload } : t)); }
      else { setTrainers([{ ...payload, id: Date.now() }, ...trainers]); }
      setShowModal(false); setEditingId(null); setForm(emptyForm);
    }
  };

  const handleEdit = (t) => {
    setForm({ ...t, workshops_conducted: String(t.workshops_conducted || ''), rating: String(t.rating || '') });
    setEditingId(t.id); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trainer?')) return;
    try {
      const { error } = await supabase.from('trainers').delete().eq('id', id);
      if (error) {
        alert(`Failed to delete: ${error.message}${error.details ? ` (${error.details})` : ''}`);
        return;
      }
      fetchTrainers();
    } catch (e) {
      setTrainers(trainers.filter(t => t.id !== id));
    }
  };

  const getLevelRank = (level) => TRAINER_LEVELS.find(l => l.name === level)?.rank || 99;

  const openPromote = (trainer) => {
    setSelectedTrainer(trainer);
    setNewLevel(trainer.trainer_level || 'Associate Trainer');
    setShowPromoteModal(true);
  };

  const handlePromote = async () => {
    if (!selectedTrainer || newLevel === selectedTrainer.trainer_level) return;

    const logEntry = {
      trainer_name: selectedTrainer.name,
      trainer_id: selectedTrainer.id,
      old_level: selectedTrainer.trainer_level || 'Associate Trainer',
      new_level: newLevel,
      changed_by: 'Admin',
    };

    try {
      await supabase.from('trainers').update({ trainer_level: newLevel }).eq('id', selectedTrainer.id);
      await supabase.from('trainer_promotion_log').insert(logEntry);
      fetchTrainers(); fetchPromotionHistory();
    } catch (e) {
      setTrainers(trainers.map(t => t.id === selectedTrainer.id ? { ...t, trainer_level: newLevel } : t));
      setPromotionHistory([{ ...logEntry, id: Date.now(), created_at: new Date().toISOString() }, ...promotionHistory]);
    }
    setShowPromoteModal(false);
  };

  const viewTrainerHistory = (trainer) => {
    const history = promotionHistory.filter(h => h.trainer_name === trainer.name);
    setTrainerHistory(history);
    setSelectedTrainer(trainer);
    setShowHistoryModal(true);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-semibold text-nuke-dark">{row.name}</span> },
    { key: 'trainer_level', label: 'Level', render: (row) => <StatusBadge status={row.trainer_level || 'Associate Trainer'} /> },
    { key: 'city', label: 'City' },
    { key: 'skills', label: 'Skills', render: (row) => (
      <div className="flex flex-wrap gap-1">{(row.skills || '').split(',').map((s, i) => <span key={i} className="px-2 py-0.5 bg-nuke-bg text-xs rounded-full">{s.trim()}</span>)}</div>
    )},
    { key: 'workshops_conducted', label: 'Workshops' },
    { key: 'rating', label: 'Rating', render: (row) => <span className="text-nuke-orange font-semibold">★ {row.rating}</span> },
    { key: 'availability_status', label: 'Status', render: (row) => <StatusBadge status={row.availability_status} /> },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (row) => (
        <div className="flex gap-1">
          {hasPermission('promote') && (
            <>
              <button onClick={(e) => { e.stopPropagation(); openPromote(row); }} className="p-1.5 text-status-green hover:bg-status-green/10 rounded transition-colors" title="Promote">
                <ArrowUp size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); viewTrainerHistory(row); }} className="p-1.5 text-status-purple hover:bg-status-purple/10 rounded transition-colors" title="Promotion History">
                <History size={14} />
              </button>
            </>
          )}
          {hasPermission('manageTrainers') && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="px-2 py-1 text-xs text-nuke-orange hover:bg-nuke-orange/10 rounded transition-colors">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="px-2 py-1 text-xs text-status-red hover:bg-status-red/10 rounded transition-colors">Delete</button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'trainer_level', label: 'Level', options: TRAINER_LEVEL_NAMES },
    { key: 'availability_status', label: 'Availability', options: AVAILABILITY_STATUS },
    { key: 'city', label: 'City', options: [...new Set(trainers.map(t => t.city))] },
  ];

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Trainers" 
        subtitle="Manage trainer network and levels" 
        buttonLabel={hasPermission('manageTrainers') ? "Add Trainer" : null} 
        onButtonClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }} 
      />
      <DataTable columns={columns} data={trainers} searchPlaceholder="Search trainers..." searchKey={['name', 'city', 'skills']} filters={filters} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Trainer' : 'Add Trainer'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
          <FormField label="Organization"><Input value={form.organization} onChange={e => set('organization', e.target.value)} /></FormField>
          <FormField label="City" required><Input value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
          <FormField label="Trainer Level"><Select options={TRAINER_LEVEL_NAMES} value={form.trainer_level} onChange={e => set('trainer_level', e.target.value)} /></FormField>
          <FormField label="Skills"><Input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="Comma separated" /></FormField>
          <FormField label="Workshops Can Teach"><Input value={form.workshops_can_teach} onChange={e => set('workshops_can_teach', e.target.value)} placeholder="Comma separated" /></FormField>
          <FormField label="Phone"><Input value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
          <FormField label="Email"><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
          <FormField label="Workshops Conducted"><Input type="number" value={form.workshops_conducted} onChange={e => set('workshops_conducted', e.target.value)} /></FormField>
          <FormField label="Rating"><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} /></FormField>
          <FormField label="Availability"><Select options={AVAILABILITY_STATUS} value={form.availability_status} onChange={e => set('availability_status', e.target.value)} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nuke-border">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold">{editingId ? 'Update' : 'Create'}</button>
        </div>
      </Modal>

      {/* Promote Modal */}
      <Modal isOpen={showPromoteModal} onClose={() => setShowPromoteModal(false)} title={`Promote ${selectedTrainer?.name}`}>
        <div className="space-y-4">
          <div className="bg-nuke-bg rounded-lg p-4">
            <p className="text-xs text-nuke-muted mb-1">Current Level</p>
            <StatusBadge status={selectedTrainer?.trainer_level || 'Associate Trainer'} />
          </div>
          <FormField label="New Level">
            <Select options={TRAINER_LEVEL_NAMES} value={newLevel} onChange={e => setNewLevel(e.target.value)} />
          </FormField>
          {newLevel !== (selectedTrainer?.trainer_level || 'Associate Trainer') && (
            <div className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg ${
              getLevelRank(newLevel) < getLevelRank(selectedTrainer?.trainer_level) ? 'bg-status-green/10 text-status-green' : 'bg-status-yellow/10 text-status-yellow'
            }`}>
              <ArrowUp size={14} />
              {getLevelRank(newLevel) < getLevelRank(selectedTrainer?.trainer_level) ? 'Promotion' : 'Level change'}
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-nuke-border">
            <button onClick={() => setShowPromoteModal(false)} className="px-4 py-2 text-sm border border-nuke-border rounded-lg hover:bg-nuke-bg transition-colors">Cancel</button>
            <button onClick={handlePromote} disabled={newLevel === (selectedTrainer?.trainer_level || 'Associate Trainer')} className="px-4 py-2 text-sm bg-nuke-orange text-white rounded-lg hover:bg-nuke-orange-hover transition-colors font-semibold disabled:opacity-40">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Promotion History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`Promotion History — ${selectedTrainer?.name}`} maxWidth="max-w-xl">
        {trainerHistory.length === 0 ? (
          <p className="text-sm text-nuke-muted py-8 text-center">No promotion history</p>
        ) : (
          <div className="space-y-3">
            {trainerHistory.map((h) => (
              <div key={h.id} className="flex items-start gap-3 p-3 bg-nuke-bg rounded-lg">
                <div className="w-8 h-8 rounded-full bg-status-green/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowUp size={14} className="text-status-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={h.old_level} />
                    <span className="text-xs text-nuke-muted">→</span>
                    <StatusBadge status={h.new_level} />
                  </div>
                  <p className="text-xs text-nuke-muted mt-1.5">
                    By {h.changed_by} · {new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
