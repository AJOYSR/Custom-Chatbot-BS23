const RoleMap = {
  'super-admin': 'Super Admin',
  customer: 'Customer',
};

// Function to get the friendly name from the role
export function getRoleLabel(role: string) {
  return RoleMap[role];
}
