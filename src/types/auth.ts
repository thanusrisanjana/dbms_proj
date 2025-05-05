// src/types/auth.ts

import type { UserRole } from './user';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string; // Optional avatar URL
}
