import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtime } from '@/hooks/useRealtime'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification as apiClearNotification,
} from '@/services/notificationService'

export function useNotifications({ onAudioChime = null } = {}) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userId = user?.id

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      setError(null)
      const data = await fetchNotifications(userId)
      setNotifications(data)
    } catch (err) {
      console.error('[useNotifications] Error loading notifications:', err)
      setError(err.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Realtime subscription for user notifications
  useRealtime({
    table: 'notifications',
    filter: userId ? `target_user_id=eq.${userId}` : null,
    onPayload: (payload) => {
      loadNotifications()

      // If new notification was inserted, play audio alert tone
      if (payload?.eventType === 'INSERT' || payload?.eventType === 'MOCK_UPDATE') {
        const priority =
          payload?.new?.audio_priority_context || payload?.new?.priority || 'Low'
        if (onAudioChime) {
          onAudioChime(priority)
        }
      }
    },
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    await markNotificationAsRead(id)
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    if (userId) {
      await markAllNotificationsAsRead(userId)
    }
  }

  const clearNotification = async (id) => {
    // Optimistic removal from UI state
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      setError(null)
      await apiClearNotification(id)
    } catch (err) {
      console.error('[useNotifications] Error clearing notification:', err)
      setError(err.message || 'Failed to clear notification.')
      await loadNotifications()
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: loadNotifications,
    markRead,
    markAllRead,
    clearNotification,
    clear: clearNotification,
  }
}
