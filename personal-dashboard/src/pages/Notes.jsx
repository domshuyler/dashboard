import { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import ReactMarkdown from 'react-markdown'
import './Notes.css'
import { supabase } from '../supabase'

function Notes({ notes, setNotes }) {
  useEffect(() => { document.title = 'Notes — Dashboard' }, [])

  const [view, setView] = useState('list')
  const [activeNote, setActiveNote] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editNote, setEditNote] = useState(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: '', tags: '' })

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

  const saveNote = async () => {
    if (!newNote.title.trim()) return
    const tags = newNote.tags
      ? newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []
    const note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags,
      created_at: new Date().toISOString()
    }
    const { error } = await supabase.from('notes').insert(note)
    if (!error) {
      setNotes([...notes, {
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        createdAt: note.created_at
      }])
    }
    setNewNote({ title: '', content: '', category: '', tags: '' })
    setView('list')
  }

  const updateNote = async () => {
    if (!editNote.title.trim()) return
    const tags = typeof editNote.tags === 'string'
      ? editNote.tags.split(',').map(t => t.trim()).filter(Boolean)
      : editNote.tags
    const updates = { title: editNote.title, content: editNote.content, category: editNote.category, tags }
    const { error } = await supabase
      .from('notes')
      .update({ title: updates.title, content: updates.content, category: updates.category, tags: updates.tags })
      .eq('id', editNote.id)
    if (!error) {
      setNotes(notes.map(n => n.id === editNote.id ? { ...n, ...updates } : n))
      setActiveNote({ ...activeNote, ...updates })
      setEditMode(false)
    }
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) {
      setNotes(notes.filter(n => n.id !== id))
      setActiveNote(null)
      setView('list')
    }
  }

  const askAI = async (prompt) => {
    setAiLoading(true)
    setAiResponse('')
    const notesContext = notes.map(n =>
      `Title: ${n.title}\nCategory: ${n.category}\nTags: ${n.tags.join(', ')}\nContent: ${n.content}`
    ).join('\n\n---\n\n')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: `You are a helpful assistant with access to the user's personal notes. Use the notes as context to answer questions, find connections, and provide insights.\n\nUser's notes:\n\n${notesContext}`,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      setAiResponse(data.content[0].text)
    } catch (err) {
      console.error('Error:', err)
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
              <div key={note.id} className="note-card" onClick={() => { setActiveNote(note); setEditMode(false); setView('detail') }}>
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
              <button className="notes-btn" onClick={() => { setEditNote({ ...activeNote, tags: activeNote.tags.join(', ') }); setEditMode(true) }}>Edit</button>
              <button className="notes-btn-danger" onClick={() => deleteNote(activeNote.id)}>Delete</button>
              <button className="notes-btn" onClick={() => setView('list')}>Back</button>
            </div>
          </div>

          {editMode && editNote && (
            <div className="note-editor" style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Note title..."
                value={editNote.title}
                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                className="note-title-input"
              />
              <div className="note-meta-inputs">
                <input
                  type="text"
                  placeholder="Category..."
                  value={editNote.category}
                  onChange={(e) => setEditNote({ ...editNote, category: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)..."
                  value={editNote.tags}
                  onChange={(e) => setEditNote({ ...editNote, tags: e.target.value })}
                />
              </div>
              <div data-color-mode="dark">
                <MDEditor
                  value={editNote.content}
                  onChange={(val) => setEditNote({ ...editNote, content: val || '' })}
                  height={400}
                />
              </div>
              <div className="note-editor-actions">
                <button className="notes-btn-accent" onClick={updateNote}>Save Changes</button>
                <button className="notes-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>
          )}

          {!editMode && (
            <div className="note-content">
              <ReactMarkdown>{activeNote.content}</ReactMarkdown>
            </div>
          )}
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
              disabled={aiLoading || !aiPrompt.trim()}
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
