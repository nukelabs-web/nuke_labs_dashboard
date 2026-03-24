const statusColors = {
  'New Lead': 'bg-status-blue/10 text-status-blue',
  'Contacted': 'bg-status-purple/10 text-status-purple',
  'Interested': 'bg-status-yellow/10 text-status-yellow',
  'Negotiation': 'bg-nuke-orange/10 text-nuke-orange',
  'Workshop Confirmed': 'bg-status-green/10 text-status-green',
  'Completed': 'bg-status-green/10 text-status-green',
  'Planned': 'bg-status-blue/10 text-status-blue',
  'Confirmed': 'bg-status-green/10 text-status-green',
  'Cancelled': 'bg-status-red/10 text-status-red',
  'Pending': 'bg-status-yellow/10 text-status-yellow',
  'In Progress': 'bg-status-blue/10 text-status-blue',
  'Available': 'bg-status-green/10 text-status-green',
  'Busy': 'bg-status-red/10 text-status-red',
  'On Leave': 'bg-status-yellow/10 text-status-yellow',
  'Low': 'bg-gray-100 text-gray-600',
  'Medium': 'bg-status-yellow/10 text-status-yellow',
  'High': 'bg-nuke-orange/10 text-nuke-orange',
  'Urgent': 'bg-status-red/10 text-status-red',
  'Active': 'bg-status-green/10 text-status-green',
  'Inactive': 'bg-gray-100 text-gray-500',
  // Positions
  'Founder': 'bg-nuke-orange text-white',
  'Core Team': 'bg-nuke-orange/10 text-nuke-orange',
  'Senior Executive': 'bg-status-purple/10 text-status-purple',
  'Business Development Executive': 'bg-status-green/10 text-status-green',
  'Operations Executive': 'bg-status-blue/10 text-status-blue',
  'Marketing Executive': 'bg-status-yellow/10 text-status-yellow',
  'Junior Executive': 'bg-gray-100 text-gray-600',
  'BD Executive': 'bg-status-green/10 text-status-green',
  'Admin': 'bg-nuke-orange/10 text-nuke-orange',
  // Trainer levels
  'Master Trainer': 'bg-nuke-orange text-white',
  'Lead Trainer': 'bg-status-purple/10 text-status-purple',
  'Senior Trainer': 'bg-status-green/10 text-status-green',
  'Trainer': 'bg-status-blue/10 text-status-blue',
  'Associate Trainer': 'bg-gray-100 text-gray-600',
};

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
