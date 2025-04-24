export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  // Add other fields as needed
}

export type InsertUser = Omit<User, 'id'>;

export const users = {
  // Schema definition if needed
}; 