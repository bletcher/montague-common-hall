'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type Task = { id: number; title: string; done?: boolean; owner?: string | null; due?: string | null }

const api = (path: string, init?: RequestInit) =>
  fetch(`/api/tasks${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

const formatDue = (due: string) =>
  new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })

type List = { docs: Task[]; totalDocs: number }
const fetchTasks = () =>
  Promise.all([
    api('?where[done][not_equals]=true&sort=due,createdAt&limit=200&depth=0').then((r) => r.json()),
    api('?where[done][equals]=true&limit=1&depth=0').then((r) => r.json()),
  ]) as Promise<[List, List]>

/** The board's open to-dos, at the top of the admin dashboard. Ticking one marks it done. */
export function TodoDashboard() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [doneCount, setDoneCount] = useState(0)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(
    () =>
      fetchTasks().then(
        ([open, done]) => {
          setTasks(open.docs)
          setDoneCount(done.totalDocs)
        },
        () => setError('Could not load the to-do list. Reload the page to try again.'),
      ),
    [],
  )

  useEffect(() => {
    let active = true
    fetchTasks().then(
      ([open, done]) => {
        if (!active) return
        setTasks(open.docs)
        setDoneCount(done.totalDocs)
      },
      () => active && setError('Could not load the to-do list. Reload the page to try again.'),
    )
    return () => {
      active = false
    }
  }, [])

  async function complete(task: Task) {
    setTasks((ts) => ts?.filter((t) => t.id !== task.id) ?? null)
    const res = await api(`/${task.id}`, { method: 'PATCH', body: JSON.stringify({ done: true }) })
    if (!res.ok) setError(`Could not mark “${task.title}” done. Reload the page to try again.`)
    load()
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const res = await api('', { method: 'POST', body: JSON.stringify({ title: title.trim() }) })
    if (!res.ok) setError('Could not add the task. Reload the page to try again.')
    setTitle('')
    load()
  }

  return (
    <section style={{ marginBottom: 'calc(var(--base) * 2)' }}>
      <h2 style={{ marginBottom: 'calc(var(--base) / 2)' }}>To-do</h2>
      {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}
      {tasks === null ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p>Nothing left to do.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tasks.map((t) => (
            <li
              key={t.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '1px solid var(--theme-elevation-100)',
              }}
            >
              <input
                type="checkbox"
                aria-label={`Mark “${t.title}” done`}
                onChange={() => complete(t)}
                style={{ width: 20, height: 20, marginTop: 2, flex: 'none' }}
              />
              <span style={{ flex: 1 }}>
                <Link href={`/admin/collections/tasks/${t.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {t.title}
                </Link>
                {(t.owner || t.due) && (
                  <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--theme-elevation-500)' }}>
                    {[t.owner, t.due && `due ${formatDue(t.due)}`].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          aria-label="New task"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
          }}
        />
        <button type="submit" className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }}>
          Add
        </button>
      </form>
      <p style={{ marginTop: 8, fontSize: '0.85em' }}>
        <Link href="/admin/collections/tasks">See the full list</Link>
        {doneCount > 0 && ` (${doneCount} done)`}
        {' · '}Open a task to add who, when, and notes.
      </p>
    </section>
  )
}
