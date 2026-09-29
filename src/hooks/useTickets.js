import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtime } from '@/hooks/useRealtime'
import {
  fetchTickets,
  createTicket as apiCreateTicket,
  createQuickTicket as apiCreateQuickTicket,
  assessTicket as apiAssessTicket,
  assignTicket as apiAssignTicket,
  takeOverTicket as apiTakeOverTicket,
  resolveTicket as apiResolveTicket,
  verifyTicket as apiVerifyTicket,
  disputeTicket as apiDisputeTicket,
} from '@/services/ticketService'

export function useTickets({ status = null, assigneeId = null, search = '' } = {}) {
  const { user, profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mutationError, setMutationError] = useState(null)

  const role = profile?.role || (user ? 'Employee' : null)
  const userId = user?.id

  // Load tickets function
  const loadTickets = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTickets({
        role,
        userId,
        status,
        assigneeId,
        search,
      })
      setTickets(data)
    } catch (err) {
      console.error('[useTickets] Error fetching tickets:', err)
      setError(err.message || 'Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }, [role, userId, status, assigneeId, search])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // Realtime subscription to tickets table
  useRealtime({
    table: 'tickets',
    onPayload: () => {
      loadTickets()
    },
  })

  // Computed metrics from loaded/active tickets
  const metrics = useMemo(() => {
    const totalActive = tickets.filter((t) => t.status !== 'Closed').length
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length
    const awaitingVerification = tickets.filter((t) => t.status === 'Verification').length
    const awaitingAssessment = tickets.filter(
      (t) => t.status === 'Operational Queue' || t.status === 'Initial Assessment' || t.status === 'Report'
    ).length
    const myAssigned = tickets.filter(
      (t) => t.assignee_id === userId && t.status !== 'Closed'
    ).length
    const resolvedCount = tickets.filter((t) => t.status === 'Closed').length

    return {
      totalActive,
      inProgress,
      awaitingVerification,
      awaitingAssessment,
      myAssigned,
      resolvedCount,
    }
  }, [tickets, userId])

  // Mutation wrappers
  const createTicket = async ({ summary, description, impactMetadata }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiCreateTicket({
        reporterId: userId,
        summary,
        description,
        impactMetadata,
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const createQuickTicket = async ({
    reporterId,
    summary,
    description,
    priority,
    impactMetadata,
    assignToMe,
  }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiCreateQuickTicket({
        reporterId,
        summary,
        description,
        priority,
        impactMetadata,
        assignToMe,
        currentUserId: userId,
        currentUserName: profile?.full_name || 'IT Staff',
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const assessTicket = async ({ ticketId, priority, impactMetadata, notes }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiAssessTicket({
        ticketId,
        priority,
        impactMetadata,
        notes,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const assignTicket = async ({ ticketId, assigneeId: targetAssigneeId, assigneeName, handoverNote }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiAssignTicket({
        ticketId,
        assigneeId: targetAssigneeId,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
        assigneeName,
        handoverNote,
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const takeOverTicket = async ({ ticketId, handoverNote }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiTakeOverTicket({
        ticketId,
        newAssigneeId: userId,
        actorName: profile?.full_name || 'IT Staff',
        handoverNote,
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resolveTicket = async ({ ticketId, resolutionNotes, rootCause, reporterId }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiResolveTicket({
        ticketId,
        resolutionNotes,
        rootCause,
        actorId: userId,
        actorName: profile?.full_name || 'IT Staff',
        reporterId,
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyTicket = async ({ ticketId, satisfactionRating, notes }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiVerifyTicket({
        ticketId,
        actorId: userId,
        actorName: profile?.full_name || 'Employee',
        satisfactionRating,
        notes,
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  const disputeTicket = async ({ ticketId, disputeReason, assigneeId: currentAssigneeId }) => {
    setIsSubmitting(true)
    setMutationError(null)
    try {
      const res = await apiDisputeTicket({
        ticketId,
        actorId: userId,
        actorName: profile?.full_name || 'Employee',
        disputeReason,
        assigneeId: currentAssigneeId,
      })
      await loadTickets()
      return { data: res, error: null }
    } catch (err) {
      setMutationError(err.message)
      return { data: null, error: err }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    tickets,
    loading,
    error,
    metrics,
    isSubmitting,
    mutationError,
    refetch: loadTickets,
    createTicket,
    createQuickTicket,
    assessTicket,
    assignTicket,
    takeOverTicket,
    resolveTicket,
    verifyTicket,
    disputeTicket,
  }
}
