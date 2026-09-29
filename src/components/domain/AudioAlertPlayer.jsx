import React, { useEffect, useRef, useCallback } from 'react'

/**
 * AudioAlertPlayer — Headless audio engine for the IT Staff console.
 *
 * Source of Truth:
 *   - docs/uireference/it_service_console_notification_center_drawer/code.html
 *     (Priority Audio Chime Signature Legend)
 *   - Priority → Hz mapping from DESIGN.md / technical-mapping.md:
 *       Low    → 440 Hz  (single soft chime)
 *       Medium → 880 Hz  (dual tone)
 *       High   → 1200 Hz (triple urgent beacon)
 *
 * This component generates tones using the Web Audio API (no audio files needed).
 * It exposes an imperative play() method via a forwarded ref.
 *
 * NOTE: This component renders nothing — it is a pure audio engine.
 * Full integration (auto-trigger on new High-priority ticket notification)
 * is wired in Stage 7.
 *
 * Ref API:
 *   ref.current.play(priority) — plays the correct tone for the given priority.
 *   ref.current.playHz(hz, pattern) — plays a raw Hz + pattern directly.
 *
 * pattern: 'single' | 'double' | 'triple'
 */

// Beep pattern implementations using Web Audio API
function createBeepPattern(audioCtx, hz, pattern) {
  const gainNode = audioCtx.createGain()
  gainNode.connect(audioCtx.destination)

  const beeps = pattern === 'triple' ? 3 : pattern === 'double' ? 2 : 1
  const duration = 0.12 // seconds per beep
  const gap = 0.08      // seconds between beeps

  for (let i = 0; i < beeps; i++) {
    const osc = audioCtx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = hz

    const g = audioCtx.createGain()
    g.gain.setValueAtTime(0, audioCtx.currentTime + i * (duration + gap))
    g.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + i * (duration + gap) + 0.01)
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + i * (duration + gap) + duration)

    osc.connect(g)
    g.connect(audioCtx.destination)
    osc.start(audioCtx.currentTime + i * (duration + gap))
    osc.stop(audioCtx.currentTime + i * (duration + gap) + duration)
  }
}

const PRIORITY_TONE_MAP = {
  High:   { hz: 1200, pattern: 'triple' },
  Medium: { hz: 880,  pattern: 'double' },
  Low:    { hz: 440,  pattern: 'single' },
}

const AudioAlertPlayer = React.forwardRef(function AudioAlertPlayer(_, ref) {
  const audioCtxRef = useRef(null)

  // Lazy-initialize AudioContext on first user gesture (browser security requirement)
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  React.useImperativeHandle(ref, () => ({
    /**
     * Play the correct tone for a given priority string.
     * priority: 'Low' | 'Medium' | 'High'
     */
    play(priority) {
      const tone = PRIORITY_TONE_MAP[priority]
      if (!tone) return
      try {
        const ctx = getAudioCtx()
        createBeepPattern(ctx, tone.hz, tone.pattern)
      } catch (err) {
        console.warn('[AudioAlertPlayer] Playback failed:', err)
      }
    },

    /**
     * Play a specific Hz with a specific pattern.
     * hz:      number  — Frequency in Hz
     * pattern: string  — 'single' | 'double' | 'triple'
     */
    playHz(hz, pattern = 'single') {
      try {
        const ctx = getAudioCtx()
        createBeepPattern(ctx, hz, pattern)
      } catch (err) {
        console.warn('[AudioAlertPlayer] Playback failed:', err)
      }
    },
  }), [getAudioCtx])

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  // Renders nothing — this is a headless audio engine
  return null
})

export { AudioAlertPlayer }
export default AudioAlertPlayer
