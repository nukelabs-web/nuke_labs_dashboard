'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#F26A00', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

const demoWorkshopsPerMonth = [
  { month: 'Oct', count: 8 }, { month: 'Nov', count: 12 }, { month: 'Dec', count: 6 },
  { month: 'Jan', count: 14 }, { month: 'Feb', count: 10 }, { month: 'Mar', count: 12 },
];

const demoStudentsPerMonth = [
  { month: 'Oct', students: 320 }, { month: 'Nov', students: 480 }, { month: 'Dec', students: 240 },
  { month: 'Jan', students: 560 }, { month: 'Feb', students: 400 }, { month: 'Mar', students: 480 },
];

const demoTopCities = [
  { city: 'Mumbai', workshops: 15 }, { city: 'Delhi', workshops: 12 }, { city: 'Bangalore', workshops: 10 },
  { city: 'Hyderabad', workshops: 8 }, { city: 'Chennai', workshops: 7 }, { city: 'Pune', workshops: 6 },
];

const demoActiveTrainers = [
  { name: 'Rahul S.', workshops: 24 }, { name: 'Priya P.', workshops: 18 },
  { name: 'Sneha R.', workshops: 15 }, { name: 'Arun K.', workshops: 12 }, { name: 'Vikram S.', workshops: 8 },
];

const demoLeadConversion = [
  { name: 'New Lead', value: 30 }, { name: 'Contacted', value: 25 }, { name: 'Interested', value: 18 },
  { name: 'Negotiation', value: 12 }, { name: 'Confirmed', value: 10 }, { name: 'Completed', value: 8 },
];

export default function ReportsPage() {
  const [workshopsPerMonth, setWorkshopsPerMonth] = useState(demoWorkshopsPerMonth);
  const [studentsPerMonth, setStudentsPerMonth] = useState(demoStudentsPerMonth);
  const [topCities, setTopCities] = useState(demoTopCities);
  const [activeTrainers, setActiveTrainers] = useState(demoActiveTrainers);
  const [leadConversion, setLeadConversion] = useState(demoLeadConversion);

  useEffect(() => { fetchReportData(); }, []);

  const fetchReportData = async () => {
    try {
      const { data: workshops } = await supabase.from('workshops').select('*');
      if (!workshops?.length) return;

      // Workshops per month
      const monthMap = {};
      workshops.forEach(w => {
        const d = new Date(w.workshop_date);
        const key = d.toLocaleString('en', { month: 'short' });
        monthMap[key] = (monthMap[key] || 0) + 1;
      });
      if (Object.keys(monthMap).length > 0) {
        setWorkshopsPerMonth(Object.entries(monthMap).map(([month, count]) => ({ month, count })));
      }

      // Students per month
      const studentMap = {};
      workshops.filter(w => w.status === 'Completed').forEach(w => {
        const d = new Date(w.workshop_date);
        const key = d.toLocaleString('en', { month: 'short' });
        studentMap[key] = (studentMap[key] || 0) + (w.actual_students || 0);
      });
      if (Object.keys(studentMap).length > 0) {
        setStudentsPerMonth(Object.entries(studentMap).map(([month, students]) => ({ month, students })));
      }

      // Top cities
      const cityMap = {};
      workshops.forEach(w => { cityMap[w.city] = (cityMap[w.city] || 0) + 1; });
      setTopCities(Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([city, wk]) => ({ city, workshops: wk })));

      // Active trainers
      const trainerMap = {};
      workshops.forEach(w => { if (w.trainer_name) trainerMap[w.trainer_name] = (trainerMap[w.trainer_name] || 0) + 1; });
      setActiveTrainers(Object.entries(trainerMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, wk]) => ({ name, workshops: wk })));

      // Lead conversion
      const { data: colleges } = await supabase.from('colleges').select('lead_status');
      if (colleges?.length > 0) {
        const statusMap = {};
        colleges.forEach(c => { statusMap[c.lead_status] = (statusMap[c.lead_status] || 0) + 1; });
        setLeadConversion(Object.entries(statusMap).map(([name, value]) => ({ name, value })));
      }
    } catch (e) { /* demo data */ }
  };

  const ChartCard = ({ title, children }) => (
    <div className="bg-nuke-card rounded-xl border border-nuke-border p-5">
      <h3 className="font-heading font-semibold text-sm text-nuke-dark mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" subtitle="Operational analytics overview" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workshops per month */}
        <ChartCard title="Workshops Per Month">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workshopsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <Tooltip contentStyle={{ fontFamily: 'Montserrat', fontSize: 12, borderRadius: 8, border: '1px solid #E5E5E5' }} />
                <Bar dataKey="count" fill="#F26A00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Students per month */}
        <ChartCard title="Students Trained Per Month">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <Tooltip contentStyle={{ fontFamily: 'Montserrat', fontSize: 12, borderRadius: 8, border: '1px solid #E5E5E5' }} />
                <Line type="monotone" dataKey="students" stroke="#F26A00" strokeWidth={2} dot={{ fill: '#F26A00', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Cities */}
        <ChartCard title="Top Cities">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis type="number" tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <YAxis dataKey="city" type="category" width={80} tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <Tooltip contentStyle={{ fontFamily: 'Montserrat', fontSize: 12, borderRadius: 8, border: '1px solid #E5E5E5' }} />
                <Bar dataKey="workshops" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Most Active Trainers */}
        <ChartCard title="Most Active Trainers">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeTrainers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Montserrat' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Montserrat' }} />
                <Tooltip contentStyle={{ fontFamily: 'Montserrat', fontSize: 12, borderRadius: 8, border: '1px solid #E5E5E5' }} />
                <Bar dataKey="workshops" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Lead Conversion */}
        <ChartCard title="Lead Conversion Funnel">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadConversion} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={10} fontFamily="Montserrat">
                  {leadConversion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Montserrat', fontSize: 12, borderRadius: 8, border: '1px solid #E5E5E5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
