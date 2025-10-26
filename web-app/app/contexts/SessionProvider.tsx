// src/contexts/SessionProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

type SessionContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  loading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function useUser() {
  const { user } = useContext(SessionContext);
  return user;
}
