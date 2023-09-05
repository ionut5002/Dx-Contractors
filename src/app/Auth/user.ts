export interface User {
    uid: string;
    email: string | null;
    displayName: string;
    photoURL?: string;
    role: string; // Added role
  }