'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Loader2,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

interface PipelineLog {
  id: string
  run_id: string
  pipeline: string
  entity_id: string | null
  entity_type: string | null
  user_id: string | null
  user_display_name: string | null
  route: string | null
  method: string | null
  status: string
  level: string
  current_step: string | null
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  step_timings: Record<string, { start: number; end?: number; duration_ms?: number }>
  input_context: Record<string, any>
  output_context: Record<string, any>
  metadata: Record<string, any>
  logs: string[] | null
  error_message: string | null
  error_stack: string | null
  created_at: string
}

interface Summary {
  total: number
  completed: number
  failed: number
  running: number
  avgDurationMs: number
  byPipeline: Record<string, { total: number; failed: number }>
}

function formatDuration(ms: number | null) {
  if (ms === null || ms === undefined) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}m`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
  )
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed')
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        done
      </Badge>
    )
  if (status === 'failed')
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
        <XCircle className="h-3 w-3" />
        failed
      </Badge>
    )
  if (status === 'running' || status === 'started')
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        {status}
      </Badge>
    )
  return <Badge variant="outline">{status}</Badge>
}

function LevelDot({ level }: { level: string }) {
  const color =
    level === 'error'
      ? 'bg-red-500'
      : level === 'warn'
        ? 'bg-yellow-500'
        : level === 'debug'
          ? 'bg-gray-400'
          : 'bg-green-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
}

export function ObservabilityViewer() {
  const [logs, setLogs] = useState<PipelineLog[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [pipelines, setPipelines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [filterPipeline, setFilterPipeline] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (filterPipeline !== 'all') params.set('pipeline', filterPipeline)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterLevel !== 'all') params.set('level', filterLevel)
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/pipeline-logs?${params}`)
      const json = await res.json()
      if (res.ok) {
        setLogs(json.logs || [])
        setSummary(json.summary || null)
        setPipelines(json.pipelines || [])
      }
    } catch (e) {
      console.error('Failed to load pipeline logs', e)
    } finally {
      setLoading(false)
    }
  }, [filterPipeline, filterStatus, filterLevel, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [autoRefresh, fetchData])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Observability</h1>
          <p className="text-sm text-muted-foreground">
            Pipeline runs, request traces, and errors across the app.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh((v) => !v)}
          >
            {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <SummaryCard label="Total runs" value={summary.total} />
          <SummaryCard label="Completed" value={summary.completed} tone="green" />
          <SummaryCard label="Failed" value={summary.failed} tone="red" />
          <SummaryCard label="Running" value={summary.running} tone="blue" />
          <SummaryCard label="Avg duration" value={formatDuration(summary.avgDurationMs)} />
        </div>
      )}

      <Card className="mb-4">
        <CardContent className="pt-4 flex flex-wrap gap-3 items-center">
          <Select value={filterPipeline} onValueChange={setFilterPipeline}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pipelines</SelectItem>
              {pipelines.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search pipeline or error message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px]"
          />
          {summary && summary.failed > 0 && filterStatus !== 'failed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterStatus('failed')}
              className="gap-1 text-red-600"
            >
              <AlertTriangle className="w-4 h-4" />
              {summary.failed} failed
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No pipeline runs match the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6"></TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    expanded={expandedId === log.id}
                    onToggle={() => setExpandedId((id) => (id === log.id ? null : log.id))}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: 'green' | 'red' | 'blue'
}) {
  const color =
    tone === 'green'
      ? 'text-green-600'
      : tone === 'red'
        ? 'text-red-600'
        : tone === 'blue'
          ? 'text-blue-600'
          : ''
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function LogRow({
  log,
  expanded,
  onToggle,
}: {
  log: PipelineLog
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={onToggle}
        data-state={expanded ? 'selected' : undefined}
      >
        <TableCell className="px-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <LevelDot level={log.level} />
            <span className="font-mono text-sm">{log.pipeline}</span>
          </div>
          {log.error_message && (
            <div className="text-xs text-red-600 mt-1 truncate max-w-md">{log.error_message}</div>
          )}
        </TableCell>
        <TableCell>
          <StatusBadge status={log.status} />
        </TableCell>
        <TableCell className="font-mono text-sm">{formatDuration(log.duration_ms)}</TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {log.entity_type ? (
            <div>
              <span>{log.entity_type}</span>
              {log.entity_id && (
                <div className="font-mono">{log.entity_id.slice(0, 8)}…</div>
              )}
            </div>
          ) : (
            '—'
          )}
        </TableCell>
        <TableCell className="text-xs">
          {log.user_display_name || (log.user_id ? log.user_id.slice(0, 8) + '…' : '—')}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground" title={formatDate(log.created_at)}>
          {timeAgo(log.created_at)}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="p-4">
            <LogDetail log={log} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function LogDetail({ log }: { log: PipelineLog }) {
  const stepEntries = Object.entries(log.step_timings || {})
  const totalStepMs = stepEntries.reduce((sum, [, v]) => sum + (v.duration_ms || 0), 0)
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <KV k="Run ID" v={log.run_id} mono />
        <KV k="Log ID" v={log.id} mono />
        <KV k="Started" v={formatDate(log.started_at)} />
        <KV k="Completed" v={log.completed_at ? formatDate(log.completed_at) : '—'} />
        {log.route && <KV k="Route" v={`${log.method || ''} ${log.route}`} mono />}
        {log.current_step && <KV k="Current step" v={log.current_step} />}
      </div>

      {log.error_message && (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <div className="font-semibold text-red-700 text-xs mb-1">Error</div>
          <div className="text-sm text-red-900">{log.error_message}</div>
          {log.error_stack && (
            <pre className="mt-2 text-xs text-red-800 whitespace-pre-wrap font-mono max-h-60 overflow-auto">
              {log.error_stack}
            </pre>
          )}
        </div>
      )}

      {stepEntries.length > 0 && (
        <div>
          <div className="font-semibold text-xs mb-2 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Step timings
          </div>
          <div className="space-y-1">
            {stepEntries.map(([name, t]) => {
              const pct = totalStepMs > 0 && t.duration_ms ? (t.duration_ms / totalStepMs) * 100 : 0
              return (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <div className="w-40 font-mono truncate">{name}</div>
                  <div className="flex-1 bg-muted rounded h-4 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-16 text-right font-mono">{formatDuration(t.duration_ms ?? null)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {log.logs && log.logs.length > 0 && (
        <Collapsible title={`Log messages (${log.logs.length})`} defaultOpen>
          <pre className="text-xs bg-background border rounded p-2 max-h-80 overflow-auto whitespace-pre-wrap font-mono">
            {log.logs.join('\n')}
          </pre>
        </Collapsible>
      )}

      {Object.keys(log.input_context || {}).length > 0 && (
        <Collapsible title="Input context">
          <JsonBlock value={log.input_context} />
        </Collapsible>
      )}
      {Object.keys(log.output_context || {}).length > 0 && (
        <Collapsible title="Output context">
          <JsonBlock value={log.output_context} />
        </Collapsible>
      )}
      {Object.keys(log.metadata || {}).length > 0 && (
        <Collapsible title="Metadata">
          <JsonBlock value={log.metadata} />
        </Collapsible>
      )}
    </div>
  )
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={`text-xs ${mono ? 'font-mono' : ''}`}>{v}</div>
    </div>
  )
}

function JsonBlock({ value }: { value: any }) {
  return (
    <pre className="text-xs bg-background border rounded p-2 max-h-80 overflow-auto whitespace-pre-wrap font-mono">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

function Collapsible({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold hover:underline mb-1"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {open && children}
    </div>
  )
}
