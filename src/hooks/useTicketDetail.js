import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtime } from '@/hooks/useRealtime'
import {
  fetchTicketById,
  assessTicket as apiAssessTicket,
  assignTicket as apiAssignTicket,
  takeOverTicket as apiTakeOverTicket,
  addWorkNote as apiAddWorkNote,
  resolveTicket as apiResolveTicket,
  verifyTicket as apiVerifyTicket,
  disputeTicket as apiDisputeTicket,
} from '@/services/ticketService'
import { fetchTicketHistory } from '@/services/historyService'

export function useTicketDetail(ticketId) {
  const { user, profile } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState(null)

  const userId = user?.id

  const loadTicket = useCallback(async () => {
    if (!ticketId) return
    try {
      setError(null)
      const [ticketData, historyData] = await Promise.all([
        fetchTicketById(ticketId),
        fetchTicketHistory(ticketId),
      ])

      if (!ticketData) {
        setError('Ticket not found.')
      } else {
        setTicket(ticketData)
        setHistory(historyData)
      }
    } catch (err) {
      console.error('[useTicketDetail] Error loading ticket detail:', err)
      setError(err.message || 'Failed to load ticket details.')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  // Listen for realtime changes on tickets and ticket_history
  useRealtime({
    table: 'tickets',
    filter: ticketId ? `id=eq.${ticketId}` : null,
    onPayload: () => {
      loadTicket()
    },
  })

  useRealtime({
    table: 'ticket_history',
    filter: ticketId ? `ticket_id=eq.${ticketId}` : null,
    onPayload: () => {
      loadTicket()
    },
  })

  // Action methods
  const assess = async ({ priority, impactMetadata, notes }) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiAssessTicket({
        ticketId,
        priority,
        impactMetadata,
        notes,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const assign = async ({ assigneeId, assigneeName, handoverNote }) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiAssignTicket({
        ticketId,
        assigneeId,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
        assigneeName,
        handoverNote,
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const takeOver = async (handoverNote = '') => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiTakeOverTicket({
        ticketId,
        newAssigneeId: userId,
        actorName: profile?.full_name || 'IT Staff',
        handoverNote,
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addNote = async (noteText) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiAddWorkNote({
        ticketId,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
        note: noteText,
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resolve = async ({ resolutionNotes, rootCause }) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiResolveTicket({
        ticketId,
        resolutionNotes,
        rootCause,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
        reporterId: ticket?.reporter_id,
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyAccept = async ({ satisfactionRating, notes } = {}) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiVerifyTicket({
        ticketId,
        actorId: userId,
        actorName: profile?.full_name || 'Employee',
        satisfactionRating,
        notes,
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyDispute = async (disputeReason) => {
    setIsSubmitting(true)
    setActionError(null)
    try {
      const res = await apiDisputeTicket({
        ticketId,
        actorId: userId,
        actorName: profile?.full_name || 'Employee',
        disputeReason,
        assigneeId: ticket?.assignee_id,
      })
      await loadTicket()
      return { data: res, error: null }
    } catch (err) {
      setActionError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    ticket,
    history,
    loading,
    error,
    isSubmitting,
    actionError,
    refetch: loadTicket,
    assess,
    assign,
    takeOver,
    addNote,
    resolve,
    verifyAccept,
    verifyDispute,
  }
}
