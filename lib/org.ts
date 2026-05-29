export interface StaffRoleConfig {
  value: string
  title: string
  department: string
  pillarRole: string | null
  route: string
}

export const STAFF_ROLE_CONFIGS: StaffRoleConfig[] = [
  { value: 'campus_saarthi_head', title: 'Campus Saarthi Head', department: 'campus', pillarRole: 'campus', route: '/admin/pillars/campus' },
  { value: 'government_saarthi_head', title: 'Government Saarthi Head', department: 'government', pillarRole: 'government', route: '/admin/pillars/government' },
  { value: 'digital_saarthi_head', title: 'Digital Saarthi Head', department: 'digital', pillarRole: 'digital', route: '/admin/digital' },
  { value: 'calling_saarthi_head', title: 'Calling Saarthi Head', department: 'calling', pillarRole: 'calling', route: '/admin/pillars/calling' },
  { value: 'marketing_saarthi_head', title: 'Marketing Saarthi Head', department: 'marketing', pillarRole: null, route: '/admin/marketing' },
  { value: 'management_head', title: 'Management Head', department: 'management', pillarRole: null, route: '/admin/board' },
  { value: 'finance_department_head', title: 'Finance Department Head', department: 'finance', pillarRole: null, route: '/admin/finance' },
  { value: 'legal_head', title: 'Legal Head', department: 'legal', pillarRole: null, route: '/admin/board/legal' },
  { value: 'data_analytics_head', title: 'Data Analytics Head', department: 'analytics', pillarRole: null, route: '/admin/analytics' },
  { value: 'tech_department_head', title: 'Tech Department Head', department: 'tech', pillarRole: null, route: '/admin/workspace' },
  { value: 'customer_service_head', title: 'Customer Service Head', department: 'customer_service', pillarRole: null, route: '/admin/crm' },
  { value: 'rnd_head', title: 'Research & Development (R&D) Head', department: 'rnd', pillarRole: null, route: '/admin/workspace' },
  { value: 'digital_marketing_head', title: 'Digital Marketing Head', department: 'digital', pillarRole: null, route: '/admin/digital' },
  { value: 'marketing_head', title: 'Marketing Head', department: 'marketing', pillarRole: null, route: '/admin/marketing' },
  { value: 'operation_head', title: 'Operation Head', department: 'operations', pillarRole: null, route: '/admin/operations' },
  { value: 'project_manager', title: 'Project Manager', department: 'operations', pillarRole: 'project_manager', route: '/admin/projects' },
]

export const STAFF_ROLE_MAP = Object.fromEntries(
  STAFF_ROLE_CONFIGS.map(role => [
    role.value,
    {
      role: 'admin',
      department: role.department,
      pillar_role: role.pillarRole,
      title: role.title,
      route: role.route,
    },
  ]),
)

export const DEPARTMENT_HUBS = [
  { key: 'campus', name: 'Campus Saarthi Head', route: '/admin/pillars/campus', meetingRoute: '/admin/board/meetings' },
  { key: 'government', name: 'Government Saarthi Head', route: '/admin/pillars/government', meetingRoute: '/admin/board/meetings' },
  { key: 'digital', name: 'Digital Saarthi Head', route: '/admin/digital', meetingRoute: '/admin/board/meetings' },
  { key: 'calling', name: 'Calling Saarthi Head', route: '/admin/pillars/calling', meetingRoute: '/admin/board/meetings' },
  { key: 'marketing', name: 'Marketing Saarthi Head', route: '/admin/marketing', meetingRoute: '/admin/board/meetings' },
  { key: 'management', name: 'Management Head', route: '/admin/board', meetingRoute: '/admin/board/meetings' },
  { key: 'finance', name: 'Finance Department', route: '/admin/finance', meetingRoute: '/admin/board/meetings' },
  { key: 'legal', name: 'Legal', route: '/admin/board/legal', meetingRoute: '/admin/board/meetings' },
  { key: 'analytics', name: 'Data Analytics', route: '/admin/analytics', meetingRoute: '/admin/board/meetings' },
  { key: 'tech', name: 'Tech Department', route: '/admin/workspace', meetingRoute: '/admin/board/meetings' },
  { key: 'customer_service', name: 'Customer Service', route: '/admin/crm', meetingRoute: '/admin/board/meetings' },
  { key: 'rnd', name: 'Research & Development (R&D)', route: '/admin/workspace', meetingRoute: '/admin/board/meetings' },
]

export function getDepartmentRoute(department: string | null, pillarRole?: string | null) {
  if (pillarRole && ['campus', 'digital', 'calling', 'government', 'market'].includes(pillarRole)) {
    return pillarRole === 'digital' ? '/admin/digital' : `/admin/pillars/${pillarRole}`
  }

  switch (department) {
    case 'campus':
      return '/admin/pillars/campus'
    case 'government':
      return '/admin/pillars/government'
    case 'digital':
      return '/admin/digital'
    case 'calling':
      return '/admin/pillars/calling'
    case 'marketing':
      return '/admin/marketing'
    case 'management':
      return '/admin/board'
    case 'finance':
      return '/admin/finance'
    case 'legal':
      return '/admin/board/legal'
    case 'analytics':
      return '/admin/analytics'
    case 'tech':
      return '/admin/workspace'
    case 'customer_service':
      return '/admin/crm'
    case 'rnd':
      return '/admin/workspace'
    case 'operations':
      return pillarRole === 'project_manager' ? '/admin/projects' : '/admin/operations'
    default:
      return '/admin'
  }
}

export function formatDepartmentLabel(value: string | null) {
  if (!value) return 'General'
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}
