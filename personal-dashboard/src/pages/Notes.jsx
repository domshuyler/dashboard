import { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import ReactMarkdown from 'react-markdown'
import './Notes.css'

function Notes({ notes, setNotes }) {
  const [view, setView] = useState('list')
  const [activeNote, setActiveNote] = useState(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  })

  const allTags = [...new Set(notes.flatMap(n => n.tags))]
  const allCategories = [...new Set(notes.map(n => n.category).filter(Boolean))]

  const filteredNotes = notes.filter(note => {
    const matchesSearch = search === '' ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
    const matchesTag = filterTag === '' || note.tags.includes(filterTag)
    const matchesCategory = filterCategory === '' || note.category === filterCategory
    return matchesSearch && matchesTag && matchesCategory
  })

  const saveNote = () => {
    if (!newNote.title.trim()) return
    const tags = newNote.tags
      ? newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []
    setNotes([...notes, {
      ...newNote,
      tags,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }])
    setNewNote({ title: '', content: '', category: '', tags: '' })
    setView('list')
  }
  // eslint-disable-next-line no-unused-vars
  const updateNote = (id, updates) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n))
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id))
    setActiveNote(null)
    setView('list')
  }

  const askAI = async (prompt) => {
    setAiLoading(true)
    setAiResponse('')
    const notesContext = notes.map(n =>
      `Title: ${n.title}\nCategory: ${n.category}\nTags: ${n.tags.join(', ')}\nContent: ${n.content}`
    ).join('\n\n---\n\n')

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: `You are a helpful assistant with access to the user's personal notes. Here are all their notes:\n\n${notesContext}\n\nAnswer questions about their notes, find connections, summarize content, or help them think through ideas.`,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      setAiResponse(data.content[0].text)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const summarizeNote = (note) => {
    askAI(`Please summarize this note in 3-5 bullet points:\n\nTitle: ${note.title}\n\n${note.content}`)
    setView('ai')
  }

  const expandNote = (note) => {
    askAI(`Please expand on this note with additional insights, related ideas, and suggestions:\n\nTitle: ${note.title}\n\n${note.content}`)
    setView('ai')
  }

  const findConnections = (note) => {
    askAI(`Looking at all my notes, what connections, themes, or relationships do you see between this note and my other notes?\n\nFocused note:\nTitle: ${note.title}\n\n${note.content}`)
    setView('ai')
  }

  return (
    <div className="page">
      <div className="notes-header">
        <h1>Notes</h1>
        <div className="notes-header-actions">
          <button className="notes-btn-accent" onClick={() => { setView('new'); setActiveNote(null) }}>New Note</button>
          <button className="notes-btn" onClick={() => setView('ai')}>Ask AI</button>
        </div>
      </div>

      {view === 'list' && (
        <>
          <div className="notes-filters">
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
              <option value="">All tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="notes-grid">
            {filteredNotes.length === 0 && (
              <div className="notes-empty">No notes found. Create your first note!</div>
            )}
            {filteredNotes.map(note => (
              <div key={note.id} className="note-card" onClick={() => { setActiveNote(note); setView('detail') }}>
                <div className="note-card-title">{note.title}</div>
                {note.category && <div className="note-card-category">{note.category}</div>}
                <div className="note-card-preview">
                  {note.content.replace(/[#*`]/g, '').slice(0, 100)}...
                </div>
                <div className="note-card-tags">
                  {note.tags.map(tag => (
                    <span key={tag} className="note-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'new' && (
        <div className="note-editor">
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="note-title-input"
          />
          <div className="note-meta-inputs">
            <input
              type="text"
              placeholder="Category..."
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)..."
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
            />
          </div>
          <div data-color-mode="dark">
            <MDEditor
              value={newNote.content}
              onChange={(val) => setNewNote({ ...newNote, content: val || '' })}
              height={400}
            />
          </div>
          <div className="note-editor-actions">
            <button className="notes-btn-accent" onClick={saveNote}>Save Note</button>
            <button className="notes-btn" onClick={() => setView('list')}>Cancel</button>
          </div>
        </div>
      )}

      {view === 'detail' && activeNote && (
        <div className="note-detail">
          <div className="note-detail-header">
            <div>
              <div className="note-detail-title">{activeNote.title}</div>
              {activeNote.category && <div className="note-card-category">{activeNote.category}</div>}
              <div className="note-card-tags" style={{ marginTop: '0.5rem' }}>
                {activeNote.tags.map(tag => (
                  <span key={tag} className="note-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="note-detail-actions">
              <button className="notes-btn" onClick={() => summarizeNote(activeNote)}>Summarize</button>
              <button className="notes-btn" onClick={() => expandNote(activeNote)}>Expand</button>
              <button className="notes-btn" onClick={() => findConnections(activeNote)}>Connections</button>
              <button className="notes-btn-danger" onClick={() => deleteNote(activeNote.id)}>Delete</button>
              <button className="notes-btn" onClick={() => setView('list')}>Back</button>
            </div>
          </div>
          <div className="note-content">
            <ReactMarkdown>{activeNote.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {view === 'ai' && (
        <div className="notes-ai">
          <div className="notes-ai-header">
            <h2>Ask AI about your notes</h2>
            <button className="notes-btn" onClick={() => setView('list')}>Back</button>
          </div>
          <div className="notes-ai-input">
            <input
              type="text"
              placeholder="Ask anything about your notes..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiPrompt.trim()) {
                  askAI(aiPrompt)
                  setAiPrompt('')
                }
              }}
            />
            <button
              className="notes-btn-accent"
              onClick={() => { askAI(aiPrompt); setAiPrompt('') }}
              disabled={aiLoading}
            >
              Ask
            </button>
          </div>
          {aiLoading && <div className="notes-ai-loading">Thinking...</div>}
          {aiResponse && (
            <div className="notes-ai-response">
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Notes