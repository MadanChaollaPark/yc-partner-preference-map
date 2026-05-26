import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Download, Gamepad2, ListVideo, Play, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_RECORDER_API_URL ?? 'http://127.0.0.1:8000'

type AxisName = 'lx' | 'ly' | 'rx' | 'ry' | 'lt' | 'rt'

type ControllerMeta = {
  id?: string
  index?: number
  instance_id?: number
  xbox_compatible?: boolean
}

type SessionSummary = {
  name: string
  size_bytes: number
  started_at?: string | null
  ended_at?: string | null
  duration_ms: number
  event_count: number
  input_count: number
  controller?: ControllerMeta
}

type RecorderEvent = {
  event?: string
  t_ms?: number
  axes?: Partial<Record<AxisName, number>>
  buttons?: Record<string, boolean>
  hats?: number[][]
}

type SessionDetail = {
  name: string
  summary: SessionSummary
  events: RecorderEvent[]
}

type ApiState = 'checking' | 'online' | 'offline'

export function RecorderDashboard() {
  const [apiState, setApiState] = useState<ApiState>('checking')
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [replayIndex, setReplayIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSummary = useMemo(
    () => sessions.find((session) => session.name === selectedName) ?? null,
    [selectedName, sessions],
  )
  const activeDetail = detail?.name === selectedName ? detail : null
  const inputEvents = useMemo(
    () => activeDetail?.events.filter((event) => event.event === 'input') ?? [],
    [activeDetail],
  )
  const replayMax = Math.max(inputEvents.length - 1, 0)
  const replayEvent = inputEvents[Math.min(replayIndex, replayMax)] ?? null
  const timelineEvents = inputEvents.slice(Math.max(inputEvents.length - 18, 0))

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/sessions`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as { sessions: SessionSummary[] }
      setApiState('online')
      setError(null)
      setSessions(data.sessions)
      setSelectedName((current) => {
        if (current && data.sessions.some((session) => session.name === current)) return current
        return data.sessions[0]?.name ?? null
      })
    } catch (caught) {
      setApiState('offline')
      setError(caught instanceof Error ? caught.message : 'Recorder API is unavailable')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSession = useCallback(async (name: string) => {
    const response = await fetch(`${API_BASE}/sessions/${encodeURIComponent(name)}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as SessionDetail
  }, [])

  useEffect(() => {
    const startId = window.setTimeout(() => {
      void refreshSessions()
    }, 0)
    const intervalId = window.setInterval(() => {
      void refreshSessions()
    }, 5000)
    return () => {
      window.clearTimeout(startId)
      window.clearInterval(intervalId)
    }
  }, [refreshSessions])

  useEffect(() => {
    if (!selectedName) return

    let cancelled = false
    loadSession(selectedName)
      .then((session) => {
        if (cancelled) return
        setDetail(session)
        const lastInputIndex = Math.max(session.events.filter((event) => event.event === 'input').length - 1, 0)
        setReplayIndex(lastInputIndex)
      })
      .catch((caught) => {
        if (cancelled) return
        setError(caught instanceof Error ? caught.message : 'Could not load session')
      })

    return () => {
      cancelled = true
    }
  }, [loadSession, selectedName])

  return (
    <section className="dashboard-section" id="dashboard" aria-labelledby="dashboard-title">
      <div className="section-heading">
        <p className="eyebrow">Recorder Dashboard</p>
        <h2 id="dashboard-title">Replay sessions from the native local recorder.</h2>
        <p>
          The Python recorder is the system of record. This dashboard only reads sessions
          from the local FastAPI server for review, replay, and export.
        </p>
      </div>

      {apiState === 'offline' ? (
        <div className="api-warning" role="status">
          <AlertTriangle size={20} aria-hidden="true" />
          <span>
            Local recorder API is not running. Start it with <code>python recorder/server.py</code>.
            {error ? ` Last error: ${error}.` : ''}
          </span>
        </div>
      ) : null}

      <div className="dashboard-grid">
        <aside className="session-panel" aria-label="Recorded sessions">
          <div className="panel-title">
            <ListVideo size={20} aria-hidden="true" />
            <div>
              <strong>Sessions</strong>
              <span>{sessions.length} JSONL files</span>
            </div>
            <button className="icon-button" type="button" onClick={refreshSessions} aria-label="Refresh sessions">
              <RefreshCw size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="session-list">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <button
                  className={session.name === selectedName ? 'active' : ''}
                  key={session.name}
                  type="button"
                  onClick={() => setSelectedName(session.name)}
                >
                  <strong>{session.controller?.id ?? 'Controller session'}</strong>
                  <span>{session.name}</span>
                  <small>
                    {session.input_count} inputs · {formatDuration(session.duration_ms)}
                  </small>
                </button>
              ))
            ) : (
              <div className="empty-state">
                <Gamepad2 size={24} aria-hidden="true" />
                <span>{loading ? 'Checking recorder sessions...' : 'No session files yet.'}</span>
              </div>
            )}
          </div>
        </aside>

        <div className="replay-panel">
          <div className="session-stats">
            <Stat label="Events" value={String(selectedSummary?.event_count ?? 0)} />
            <Stat label="Inputs" value={String(selectedSummary?.input_count ?? 0)} />
            <Stat label="Duration" value={formatDuration(selectedSummary?.duration_ms ?? 0)} />
            <Stat label="Started" value={formatDate(selectedSummary?.started_at)} />
          </div>

          <div className="replay-toolbar">
            <div>
              <strong>{selectedSummary?.controller?.id ?? 'No session selected'}</strong>
              <span>
                Native recorder file: <code>{selectedName ?? 'none'}</code>
              </span>
            </div>
            {selectedName ? (
              <a className="button compact" href={`${API_BASE}/sessions/${encodeURIComponent(selectedName)}/csv`}>
                <Download size={16} aria-hidden="true" />
                CSV
              </a>
            ) : null}
          </div>

          <div className="stick-replay" aria-label="Stick replay visualization">
            <StickPad title="Left stick" x={axisValue(replayEvent, 'lx')} y={axisValue(replayEvent, 'ly')} />
            <StickPad title="Right stick" x={axisValue(replayEvent, 'rx')} y={axisValue(replayEvent, 'ry')} />
            <div className="trigger-readout">
              <Meter label="LT" value={axisValue(replayEvent, 'lt')} />
              <Meter label="RT" value={axisValue(replayEvent, 'rt')} />
            </div>
          </div>

          <div className="replay-scrubber">
            <Play size={17} aria-hidden="true" />
            <input
              aria-label="Replay position"
              disabled={inputEvents.length === 0}
              max={replayMax}
              min={0}
              type="range"
              value={Math.min(replayIndex, replayMax)}
              onChange={(event) => setReplayIndex(Number(event.target.value))}
            />
            <span>{replayEvent ? `${replayEvent.t_ms ?? 0} ms` : '0 ms'}</span>
          </div>

          <div className="button-timeline">
            <h3>Button timeline</h3>
            <ol>
              {timelineEvents.length > 0 ? (
                timelineEvents.map((event, index) => (
                  <li key={`${event.t_ms ?? index}-${index}`}>
                    <time>{event.t_ms ?? 0} ms</time>
                    <span>{pressedButtons(event.buttons).join(' + ') || 'No buttons pressed'}</span>
                    <small>{formatHats(event.hats)}</small>
                  </li>
                ))
              ) : (
                <li className="empty-timeline">
                  <span>No input events loaded.</span>
                </li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StickPad({ title, x, y }: { title: string; x: number; y: number }) {
  return (
    <div className="stick-pad">
      <strong>{title}</strong>
      <div className="stick-field">
        <span className="stick-cross horizontal" />
        <span className="stick-cross vertical" />
        <span
          className="stick-dot"
          style={{
            left: `${axisToPercent(x)}%`,
            top: `${axisToPercent(y)}%`,
          }}
        />
      </div>
      <small>
        x {x.toFixed(2)} · y {y.toFixed(2)}
      </small>
    </div>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(100, value * 100))
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <strong>{value.toFixed(2)}</strong>
      </div>
      <span className="meter-track">
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  )
}

function axisValue(event: RecorderEvent | null, axis: AxisName) {
  return Number(event?.axes?.[axis] ?? 0)
}

function axisToPercent(value: number) {
  return Math.max(4, Math.min(96, ((value + 1) / 2) * 100))
}

function pressedButtons(buttons: RecorderEvent['buttons']) {
  if (!buttons) return []
  return Object.entries(buttons)
    .filter(([, pressed]) => pressed)
    .map(([name]) => name.toUpperCase())
}

function formatHats(hats: RecorderEvent['hats']) {
  if (!hats || hats.length === 0) return 'hat [0,0]'
  return hats.map((hat) => `[${hat.join(',')}]`).join(' ')
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return '0 ms'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

function formatDate(value?: string | null) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
