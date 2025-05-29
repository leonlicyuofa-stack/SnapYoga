
import { useContext } from 'react';
// Corrected import path if AuthContext.tsx is in src/contexts/
import { AuthProvider, useAuth as useAuthFromContext } from '@/contexts/AuthContext'; 

// This file might be redundant if useAuth is directly exported from AuthContext.tsx
// However, keeping it separate can be a pattern preference.
// For now, let's ensure it re-exports correctly.

export { AuthProvider, useAuthFromContext as useAuth };
