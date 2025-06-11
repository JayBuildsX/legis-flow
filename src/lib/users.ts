// User data store that can be shared between API routes

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  organization: string;
  permissions: string[];
}

// Initialize with default users
const users: User[] = [
  {
    id: 'user-001',
    name: 'Martin Dupont',
    email: 'martin.dupont@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'admin',
    organization: 'Ministère de l\'Économie et des Finances',
    permissions: ['documents.create', 'documents.edit', 'documents.delete', 'admin.access']
  },
  {
    id: 'user-002',
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'editor',
    organization: 'Ministère de la Santé',
    permissions: ['documents.create', 'documents.edit']
  },
  {
    id: 'user-003',
    name: 'Jean Legrand',
    email: 'jean.legrand@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'viewer',
    organization: 'Ministère de la Transition Écologique',
    permissions: ['documents.view']
  }
];

// Function to get all users
export function getUsers(): User[] {
  return users;
}

// Function to find a user by ID
export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

// Function to find a user by email
export function getUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

// Function to add a new user
export function addUser(user: User): User {
  // Check if user with this email already exists
  if (getUserByEmail(user.email)) {
    throw new Error('User with this email already exists');
  }
  
  // Generate ID if not provided
  if (!user.id) {
    user.id = `user-${users.length + 1}`;
  }
  
  // Add permissions if not provided
  if (!user.permissions || user.permissions.length === 0) {
    user.permissions = ['documents.view']; // Default permissions
  }
  
  // Add the user to the array
  users.push(user);
  
  return user;
}

// Export default for convenience
export default {
  getUsers,
  getUserById,
  getUserByEmail,
  addUser
}; 