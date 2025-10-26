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
    let mounted = true;

    const init = async () => {
      // ✅ Fetch existing session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    init();

    // ✅ Listen to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SessionContext.Provider value={{ session, user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

/* --- Hooks --- */
export function useSession() {
  return useContext(SessionContext);
}

export function useUser() {
  const { user } = useContext(SessionContext);
  return user;
}
