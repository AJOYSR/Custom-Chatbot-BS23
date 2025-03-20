import mongoose from 'mongoose';
const RoleMap = {
  'super-admin': 'Super Admin',
  customer: 'Customer',
};

// Function to get the friendly name from the role
export function getRoleLabel(role: string) {
  return RoleMap[role];
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId format');
  }
  return new mongoose.Types.ObjectId(id);
}
