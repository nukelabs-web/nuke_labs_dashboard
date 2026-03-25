export const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Interested',
  'Negotiation',
  'Workshop Confirmed',
  'Completed',
];

export const WORKSHOP_STATUS_OPTIONS = [
  'Planned',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export const TASK_STATUS_OPTIONS = [
  'Pending',
  'In Progress',
  'Completed',
];

export const TASK_PRIORITY_OPTIONS = [
  'Low',
  'Medium',
  'High',
  'Urgent',
];

export const TEAM_ROLES = [
  'Admin',
  'Core Team',
  'Junior Executive',
  'BD Executive',
];

export const AVAILABILITY_STATUS = [
  'Available',
  'Busy',
  'On Leave',
];

// Position hierarchy (ordered by rank, highest first)
export const POSITIONS = [
  { name: 'Founder', rank: 1, color: 'bg-nuke-orange text-white' },
  { name: 'Core Team', rank: 2, color: 'bg-nuke-orange/10 text-nuke-orange' },
  { name: 'Senior Executive', rank: 3, color: 'bg-status-purple/10 text-status-purple' },
  { name: 'Business Development Executive', rank: 4, color: 'bg-status-green/10 text-status-green' },
  { name: 'Operations Executive', rank: 5, color: 'bg-status-blue/10 text-status-blue' },
  { name: 'Marketing Executive', rank: 6, color: 'bg-status-yellow/10 text-status-yellow' },
  { name: 'Junior Executive', rank: 7, color: 'bg-gray-100 text-gray-600' },
];

export const POSITION_NAMES = POSITIONS.map(p => p.name);

// Trainer levels (ordered by rank, highest first)
export const TRAINER_LEVELS = [
  { name: 'Master Trainer', rank: 1, color: 'bg-nuke-orange text-white' },
  { name: 'Lead Trainer', rank: 2, color: 'bg-status-purple/10 text-status-purple' },
  { name: 'Senior Trainer', rank: 3, color: 'bg-status-green/10 text-status-green' },
  { name: 'Trainer', rank: 4, color: 'bg-status-blue/10 text-status-blue' },
  { name: 'Associate Trainer', rank: 5, color: 'bg-gray-100 text-gray-600' },
];

export const TRAINER_LEVEL_NAMES = TRAINER_LEVELS.map(l => l.name);

// Member status
export const MEMBER_STATUS = [
  'Active',
  'Inactive',
  'On Leave',
];

// Permissions by position
export const PERMISSIONS = {
  'Founder': { fullAccess: true, promote: true, editRoles: true, manageUsers: true, assignTasks: true, assignWorkshops: true, assignColleges: true, manageTrainers: true, viewAll: true },
  'Core Team': { fullAccess: false, promote: false, editRoles: false, manageUsers: false, assignTasks: true, assignWorkshops: true, assignColleges: true, manageTrainers: true, viewAll: true },
  'Senior Executive': { fullAccess: false, promote: false, editRoles: false, manageUsers: false, assignTasks: true, assignWorkshops: true, assignColleges: true, manageTrainers: true, viewAll: true },
  'Business Development Executive': { fullAccess: false, promote: false, editRoles: false, manageUsers: false, assignTasks: false, assignWorkshops: false, assignColleges: false, manageTrainers: false, viewAll: false },
  'Operations Executive': { fullAccess: false, promote: false, editRoles: false, manageUsers: false, assignTasks: false, assignWorkshops: false, assignColleges: false, manageTrainers: false, viewAll: false },
  'Marketing Executive': { fullAccess: false, promote: false, editRoles: false, manageUsers: false, assignTasks: false, assignWorkshops: false, assignColleges: false, manageTrainers: false, viewAll: false },
  'Junior Executive': { fullAccess: false, promote: false, editRoles: false, manageUsers: false, assignTasks: false, assignWorkshops: false, assignColleges: false, manageTrainers: false, viewAll: false },
};

export const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { name: 'Colleges', href: '/colleges', icon: 'GraduationCap' },
  { name: 'Workshops', href: '/workshops', icon: 'Presentation' },
  { name: 'Trainers', href: '/trainers', icon: 'Users' },
  { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
  { name: 'Logistics', href: '/logistics', icon: 'Package' },
  { name: 'Reports', href: '/reports', icon: 'BarChart3' },
  { name: 'Team', href: '/team', icon: 'UserCog' },
  { name: 'Role Management', href: '/roles', icon: 'Shield' },
];
