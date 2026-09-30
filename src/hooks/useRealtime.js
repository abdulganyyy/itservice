import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'
import { mockStore } from '@/services/mockDataStore'

/**
 * useRealtime — Subscribes to Supabase postgres_changes for table events.
 * Falls back to mockStore subscription if Supabase live connectivity is not active.
 */
export function useRealtime({ table, events = null, event = '*', filter = null, onPayload }) {
  useEffect(() => {
    if (!onPayload) return

    if (isSupabaseConfigured()) {
      // Use unique channel identifier to prevent channel collision between concurrent components (e.g. Layout + Page)
      const uniqueId = Math.random().toString(36).slice(2, 9)
      const channelName = `realtime:${table}:${filter || 'all'}:${uniqueId}`
      const channel = supabase.channel(channelName)

      // V1 canonical events: tickets table strictly subscribes to INSERT and UPDATE (no DELETE)
      const targetEvents =
        events ||
        (table === 'tickets' && event === '*' ? ['INSERT', 'UPDATE'] : [event])

      targetEvents.forEach((evt) => {
        channel.on(
          'postgres_changes',
          {
            event: evt,
            schema: 'public',
            table,
            ...(filter ? { filter } : {}),
          },
          (payload) => {
            onPayload(payload)
          }
        )
      })

      channel.subscribe()

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
  }, [table, event, events, filter, onPayload])
}
