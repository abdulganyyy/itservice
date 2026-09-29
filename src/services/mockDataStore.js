/**
 * Mock Data Store — Fallback repository when Supabase live backend is not configured.
 * Strictly maintains exact 1-to-1 parity with database-schema.md, state-model.md,
 * and permissions.md constraints.
 */

const STORAGE_KEY_PREFIX = 'it_service_v1_'

const INITIAL_USERS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    full_name: 'Budi Santoso',
    email: 'budi.santoso@corp.internal',
    role: 'Employee',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    full_name: 'Ahmad Pratama',
    email: 'ahmad.pratama@corp.internal',
    role: 'IT Staff',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    full_name: 'Siti Rahma',
    email: 'siti.rahma@corp.internal',
    role: 'IT Staff',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

const INITIAL_TICKETS = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    reporter_id: '11111111-1111-4111-8111-111111111111',
    assignee_id: null,
    summary: 'Cannot connect to corporate VPN after AD password reset',
    description:
      'I updated my Active Directory password this morning via self-service identity manager. Immediately after rebooting, GlobalProtect prompts Authentication failed: Code SEC-401.',
    priority: null,
    status: 'Operational Queue',
    impact_metadata: null,
    resolution_notes: null,
    verification_feedback: null,
    verification_started_at: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    closed_at: null,
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    reporter_id: '11111111-1111-4111-8111-111111111111',
    assignee_id: '22222222-2222-4222-8222-222222222222',
    summary: 'Finance Month-End Reconciliation Spreadsheet Upload Blocked',
    description:
      'Attempted to restart the network adapter twice without success. Finance month-end reconciliation spreadsheet uploads to ERP are blocked.',
    priority: 'High',
    status: 'In Progress',
    impact_metadata: 'Departmental',
    resolution_notes: null,
    verification_feedback: null,
    verification_started_at: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    closed_at: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    reporter_id: '11111111-1111-4111-8111-111111111111',
    assignee_id: '33333333-3333-4333-8333-333333333333',
    summary: 'Local Outlook client fails to sync shared mailbox archives',
    description:
      'Shared finance mailbox archives stopped updating with error code 0x8004010F.',
    priority: 'Medium',
    status: 'Verification',
    impact_metadata: 'Individual',
    resolution_notes:
      'Rebuilt local Outlook .ost profile and re-established Kerberos token handshake. Verified sync with Exchange server.',
    verification_feedback: null,
    verification_started_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    closed_at: null,
  },
  {
    id: 'dddddddd-dddd-4ddd-dddd-dddddddddddd',
    reporter_id: '11111111-1111-4111-8111-111111111111',
    assignee_id: '22222222-2222-4222-8222-222222222222',
    summary: 'Workstation Monitor Display Flickering intermittently on HDMI',
    description:
      'Second display monitor goes black every 15 minutes during CAD usage.',
    priority: 'Low',
    status: 'Closed',
    impact_metadata: 'Individual',
    resolution_notes:
      'Replaced damaged HDMI 2.1 cable with certified braided cable. Ran 30-min stress test without signal loss.',
    verification_feedback:
      'Confirmed working smoothly now. Thank you for the quick cable replacement!',
    verification_started_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

const INITIAL_HISTORY = [
  {
    id: 'h1',
    ticket_id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    actor_id: '11111111-1111-4111-8111-111111111111',
    event_type: 'TICKET_CREATED',
    change_payload: { channel: 'SELF_SERVICE', initial_status: 'Report' },
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'h2',
    ticket_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    actor_id: '11111111-1111-4111-8111-111111111111',
    event_type: 'TICKET_CREATED',
    change_payload: { channel: 'SELF_SERVICE' },
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'h3',
    ticket_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    actor_id: '22222222-2222-4222-8222-222222222222',
    event_type: 'PRIORITY_ASSESSED',
    change_payload: { old_priority: null, new_priority: 'High', impact: 'Departmental' },
    created_at: new Date(Date.now() - 4.75 * 3600000).toISOString(),
  },
  {
    id: 'h4',
    ticket_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    actor_id: '22222222-2222-4222-8222-222222222222',
    event_type: 'TICKET_ASSIGNED',
    change_payload: { assignee_id: '22222222-2222-4222-8222-222222222222', assignee_name: 'Ahmad Pratama' },
    created_at: new Date(Date.now() - 4.5 * 3600000).toISOString(),
  },
  {
    id: 'h5',
    ticket_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    actor_id: '22222222-2222-4222-8222-222222222222',
    event_type: 'WORK_NOTE_ADDED',
    change_payload: { note: 'Inspected network adapter routing table. Testing firewall exception for ERP subnet.' },
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'h6',
    ticket_id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    actor_id: '33333333-3333-4333-8333-333333333333',
    event_type: 'RESOLUTION_SUBMITTED',
    change_payload: {
      resolution_notes: 'Rebuilt local Outlook .ost profile and re-established Kerberos token handshake.',
    },
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
]

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    target_user_id: '22222222-2222-4222-8222-222222222222',
    source_ticket_id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    event_type: 'EVENT_TICKET_ASSIGNED',
    visual_badge_active: true,
    audio_priority_context: 'High',
    persistent_unread_state: 'unread',
    created_at: new Date(Date.now() - 4.5 * 3600000).toISOString(),
  },
  {
    id: 'n2',
    target_user_id: '11111111-1111-4111-8111-111111111111',
    source_ticket_id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    event_type: 'EVENT_RESOLUTION_SUBMITTED',
    visual_badge_active: true,
    audio_priority_context: 'Medium',
    persistent_unread_state: 'unread',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'n3',
    target_user_id: '11111111-1111-4111-8111-111111111111',
    source_ticket_id: 'dddddddd-dddd-4ddd-dddd-dddddddddddd',
    event_type: 'EVENT_TICKET_CLOSED',
    visual_badge_active: false,
    audio_priority_context: 'Low',
    persistent_unread_state: 'read',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

// Simple local storage or memory container
class MockStore {
  constructor() {
    this.listeners = new Set()
  }

  _getItem(key, defaultVal) {
    try {
      const val = localStorage.getItem(STORAGE_KEY_PREFIX + key)
      return val ? JSON.parse(val) : defaultVal
    } catch {
      return defaultVal
    }
  }

  _setItem(key, val) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val))
    } catch {
      // ignore
    }
    this._notify(key, val)
  }

  _notify(key, val) {
    this.listeners.forEach((listener) => listener(key, val))
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getUsers() {
    return this._getItem('users', INITIAL_USERS)
  }

  getTickets() {
    return this._getItem('tickets', INITIAL_TICKETS)
  }

  saveTickets(tickets) {
    this._setItem('tickets', tickets)
  }

  getHistory() {
    return this._getItem('history', INITIAL_HISTORY)
  }

  saveHistory(history) {
    this._setItem('history', history)
  }

  getNotifications() {
    return this._getItem('notifications', INITIAL_NOTIFICATIONS)
  }

  saveNotifications(notifications) {
    this._setItem('notifications', notifications)
  }

  reset() {
    this.saveTickets(INITIAL_TICKETS)
    this.saveHistory(INITIAL_HISTORY)
    this.saveNotifications(INITIAL_NOTIFICATIONS)
  }
}

export const mockStore = new MockStore()
