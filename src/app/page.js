'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import { Presentation, Users, UserCheck, MapPin, Calendar, GraduationCap, CheckSquare } from 'lucide-react';
import Link from 'next/link';

// Demo data for when Supabase is not configured
const demoMetrics = {
  workshopsThisMonth: 12,
  studentsTrained: 847,
  activeTrainers: 18,
  citiesReached: 9,
  upcomingWorkshops: 5,
};

const demoUpcoming = [
  { id: 1, college: 'IIT Bombay', city: 'Mumbai', date: '2026-03-28', type: 'Drone Workshop', status: 'Confirmed', trainer: 'Rahul Sharma' },
  { id: 2, college: 'VIT Vellore', city: 'Vellore', date: '2026-03-30', type: 'IoT Workshop', status: 'Planned', trainer: 'Priya Patel' },
  { id: 3, college: 'BITS Pilani', city: 'Pilani', date: '2026-04-02', type: 'Robotics Workshop', status: 'Confirmed', trainer: 'Arun Kumar' },
  { id: 4, college: 'NIT Trichy', city: 'Trichy', date: '2026-04-05', type: 'IoT Workshop', status: 'Planned', trainer: 'Sneha Reddy' },
];

const demoLeads = [
  { id: 1, name: 'IIIT Hyderabad', city: 'Hyderabad', status: 'Interested', contact: 'Dr. Rao' },
  { id: 2, name: 'SRM Chennai', city: 'Chennai', status: 'New Lead', contact: 'Prof. Kumar' },
  { id: 3, name: 'KIIT Bhubaneswar', city: 'Bhubaneswar', status: 'Contacted', contact: 'Ms. Das' },
];

const demoTasks = [
  { id: 1, title: 'Prepare IoT kit for VIT workshop', priority: 'High', status: 'In Progress', assignee: 'Ankit' },
  { id: 2, title: 'Confirm trainer for BITS Pilani', priority: 'Urgent', status: 'Pending', assignee: 'Meera' },
  { id: 3, title: 'Send follow-up to NIT Trichy', priority: 'Medium', status: 'Pending', assignee: 'Rohan' },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(demoMetrics);
  const [upcoming, setUpcoming] = useState(demoUpcoming);
  const [leads, setLeads] = useState(demoLeads);
  const [tasks, setTasks] = useState(demoTasks);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to fetch from Supabase
      const { data: workshops } = await supabase.from('workshops').select('*');
      if (workshops) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = workshops.filter(w => new Date(w.workshop_date) >= monthStart);
        const totalStudents = workshops.filter(w => w.status === 'Completed').reduce((sum, w) => sum + (w.actual_students || 0), 0);
        const cities = [...new Set(workshops.map(w => w.city))];
        const upcomingWs = workshops.filter(w => new Date(w.workshop_date) >= now && w.status !== 'Cancelled');

        const { data: trainers } = await supabase.from('trainers').select('*');
        const activeTrainers = trainers?.filter(t => t.availability_status === 'Available').length || 0;

        setMetrics({
          workshopsThisMonth: thisMonth.length,
          studentsTrained: totalStudents,
          activeTrainers,
          citiesReached: cities.length,
          upcomingWorkshops: upcomingWs.length,
        });

        if (upcomingWs.length > 0) {
          setUpcoming(upcomingWs.slice(0, 5).map(w => ({
            id: w.id,
            college: w.college_name || 'N/A',
            city: w.city,
            date: w.workshop_date,
            type: w.workshop_type,
            status: w.status,
            trainer: w.trainer_name || 'TBD',
          })));
        }

        const { data: colleges } = await supabase.from('colleges').select('*').order('created_at', { ascending: false }).limit(5);
        if (colleges?.length > 0) {
          setLeads(colleges.map(c => ({
            id: c.id,
            name: c.name,
            city: c.city,
            status: c.lead_status,
            contact: c.contact_person,
          })));
        }

        const { data: taskData } = await supabase.from('tasks').select('*').neq('status', 'Completed').order('created_at', { ascending: false }).limit(5);
        if (taskData?.length > 0) {
          setTasks(taskData.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            assignee: t.assigned_person,
          })));
        }
      }
    } catch (e) {
      // Use demo data
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Workshops This Month" value={metrics.workshopsThisMonth} icon={Presentation} />
        <MetricCard title="Students Trained" value={metrics.studentsTrained} icon={Users} />
        <MetricCard title="Active Trainers" value={metrics.activeTrainers} icon={UserCheck} />
        <MetricCard title="Cities Reached" value={metrics.citiesReached} icon={MapPin} />
        <MetricCard title="Upcoming Workshops" value={metrics.upcomingWorkshops} icon={Calendar} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Workshops */}
        <div className="lg:col-span-2 bg-nuke-card rounded-xl border border-nuke-border">
          <div className="px-5 py-4 border-b border-nuke-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm text-nuke-dark">Upcoming Workshops</h3>
            <Link href="/workshops" className="text-xs text-nuke-orange hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-nuke-border">
            {upcoming.map((ws) => (
              <div key={ws.id} className="px-5 py-3 flex items-center justify-between hover:bg-nuke-bg/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-nuke-dark truncate">{ws.college}</p>
                  <p className="text-xs text-nuke-muted">{ws.type} · {ws.city} · {ws.trainer}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-xs text-nuke-muted">{new Date(ws.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <StatusBadge status={ws.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-nuke-card rounded-xl border border-nuke-border">
          <div className="px-5 py-4 border-b border-nuke-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm text-nuke-dark">Recent College Leads</h3>
            <Link href="/colleges" className="text-xs text-nuke-orange hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-nuke-border">
            {leads.map((lead) => (
              <div key={lead.id} className="px-5 py-3 hover:bg-nuke-bg/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-nuke-dark">{lead.name}</p>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-nuke-muted mt-0.5">{lead.city} · {lead.contact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-nuke-card rounded-xl border border-nuke-border">
        <div className="px-5 py-4 border-b border-nuke-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm text-nuke-dark">Recent Tasks</h3>
          <Link href="/tasks" className="text-xs text-nuke-orange hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-nuke-border">
          {tasks.map((task) => (
            <div key={task.id} className="px-5 py-3 flex items-center justify-between hover:bg-nuke-bg/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <CheckSquare size={14} className="text-nuke-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-nuke-dark truncate">{task.title}</p>
                  <p className="text-xs text-nuke-muted">Assigned to {task.assignee}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <StatusBadge status={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
