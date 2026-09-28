import React, { createContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabaseClient'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch genuine profile row from public.users table based on user.id
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error: profileErr } = await supabase
        .from('users')
        .select('id, full_name, email, role, created_at')
        .eq('id', userId)
        .single()

      if (profileErr) {
        console.error('[AuthContext] Failed to load user profile from public.users:', profileErr.message)
        setProfile(null)
        return null
      }

      setProfile(data)
      return data
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err)
      setProfile(null)
      return null
    }
  }, [])

  // Initial session check and auth state listener
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        if (!isMounted) return

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('[AuthContext] Session initialization error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [fetchUserProfile])

  // Sign in using Supabase Auth with email & password
  const signIn = async (email, password) => {
    setError(null)
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInErr) {
        setError(signInErr.message)
        return { data: null, error: signInErr }
      }

      if (data?.user) {
        const loadedProfile = await fetchUserProfile(data.user.id)
        return { data, profile: loadedProfile, error: null }
      }

      return { data, error: null }
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred during sign in.'
      setError(msg)
      return { data: null, error: err }
    }
  }

  // Sign out and clear local context state
  const signOut = async () => {
    setError(null)
    try {
      const { error: signOutErr } = await supabase.auth.signOut()
      if (signOutErr) {
        console.error('[AuthContext] Sign out error:', signOutErr.message)
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected sign out error:', err)
    } finally {
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signIn,
    signOut,
    refreshProfile: () => (user ? fetchUserProfile(user.id) : Promise.resolve(null)),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
