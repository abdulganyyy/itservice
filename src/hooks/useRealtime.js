import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'
import { mockStore } from '@/services/mockDataStore'

/**
 * useRealtime — Subscribes to Supabase postgres_changes for table events.
 * Falls back to mockStore subscription if Supabase live connectivity is not active.
 */
export function useRealtime({ table, event = '*', filter = null, onPayload }) {
  useEffect(() => {
    if (!onPayload) return

    if (isSupabaseConfigured()) {
      const channelName = `realtime:${table}:${filter || 'all'}`
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            ...(filter ? { filter } : {}),
          },
          (payload) => {
            onPayload(payload)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // console.log(`[useRealtime] Subscribed to ${table}`)
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    }

    // Mock store subscription fallback
    const unsubscribe = mockStore.subscribe((key) => {
      if (key === table || (table === 'ticket_history' && key === 'history')) {
        onPayload({ eventType: 'MOCK_UPDATE', table })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [table, event, filter, onPayload])
}
