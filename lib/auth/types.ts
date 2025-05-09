import { Session, User } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

export type AuthContextType = AuthState & {
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};