import { useState } from 'react'
import { supabase } from '../supabase'
import './Projects.css'

const STATUSES = ['active', 'on hold', 'completed']

function Projects({ projects, setProjects, tasks }) {
  const [view, setView] = useState('list')
  const [activeProject, setActiveProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active',
    deadline: '',
    notes: ''
  })

  const addProject = async () => {
    if (!newProject.name.trim()) return
    const project = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      deadline: newProject.deadline,
      notes: newProject.notes
    }
    const { error } = await supabase.from('projects').insert(project)
    if (!error) setProjects([...projects, project])
    setNewProject({ name: '', description: '', status: 'active', deadline: '', notes: '' })
    setShowForm(false)
  }

  const saveEdit = async () => {
    const { error } = await supabase
      .from('projects')
      .update({
        name: editProject.name,
        description: editProject.description,
        status: editProject.status,
        deadline: editProject.deadline,
        notes: editProject.notes
      })
      .eq('id', editProject.id)
    if (!error) {
      setProjects(projects.map(p => p.id === editProject.id ? editProject : p))
      setActiveProject(editProject)
      setEditMode(false)
    }
  }

  const deleteProject = async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      setProjects(projects.filter(p => p.id !== id))
      setActiveProject(null)
      setView('list')
    }
  }

  const projectTasks = activeProject
    ? tasks.filter(t => t.category === activeProject.name)
    : []

  const completedTasks = projectTasks.filter(t => t.completed)
  const pendingTasks = projectTasks.filter(t => !t.completed)

  return (
    <div className="page">
      <div className="jh-header">
        <h1>Projects</h1>
        <button className="notes-btn-accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showForm && (
        <div className="jh-form" style={{ marginBottom: '1.5rem' }}>
          <div className="jh-form-grid">
            <input
              placeholder="Project name *"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
            />
            <select
              value={newProject.status}
              onChange={e => setNewProject({ ...newProject, status: e.target.value })}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <div className="jh-date-field">
              <label>Deadline</label>
              <input
                type="date"
                value={newProject.deadline}
                onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </div>
          </div>
          <textarea
            placeholder="Description..."
            value={newProject.description}
            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
            rows={2}
          />
          <textarea
            placeholder="Notes..."
            value={newProject.notes}
            onChange={e => setNewProject({ ...newProject, notes: e.target.value })}
            rows={2}
          />
          <button className="notes-btn-accent" onClick={addProject}>Save Project</button>
        </div>
      )}

      {view === 'list' && (
        <div className="projects-grid">
          {projects.length === 0 && <div className="notes-empty">No projects yet. Create your first one!</div>}
          {projects.map(project => {
            const ptasks = tasks.filter(t => t.category === project.name)
            const pending = ptasks.filter(t => !t.completed).length
            return (
              <div
                key={project.id}
                className="project-card"
                onClick={() => { setActiveProject(project); setView('detail') }}
              >
                <div className="project-card-header">
                  <div className="project-card-name">{project.name}</div>
                  <div className={`project-status project-status-${project.status.replace(' ', '-')}`}>
                    {project.status}
                  </div>
                </div>
                {project.description && (
                  <div className="project-card-desc">{project.description}</div>
                )}
                <div className="project-card-footer">
                  {project.deadline && <span className="due-date">Due: {project.deadline}</span>}
                  <span className="project-task-count">{pending} task{pending !== 1 ? 's' : ''} pending</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'detail' && activeProject && (
        <div className="project-detail">
          <div className="jh-detail-header">
            <div>
              <div className="jh-detail-role">{activeProject.name}</div>
              <div className={`project-status project-status-${activeProject.status.replace(' ', '-')}`} style={{ marginTop: '0.35rem' }}>
                {activeProject.status}
              </div>
            </div>
            <div className="jh-detail-actions">
              <button className="notes-btn" onClick={() => { setEditProject({ ...activeProject }); setEditMode(true) }}>Edit</button>
              <button className="notes-btn-danger" onClick={() => deleteProject(activeProject.id)}>Delete</button>
              <button className="notes-btn" onClick={() => setView('list')}>Back</button>
            </div>
          </div>

          {editMode && editProject && (
            <div className="jh-form" style={{ marginBottom: '1.5rem' }}>
              <div className="jh-form-grid">
                <input
                  placeholder="Project name *"
                  value={editProject.name}
                  onChange={e => setEditProject({ ...editProject, name: e.target.value })}
                />
                <select
                  value={editProject.status}
                  onChange={e => setEditProject({ ...editProject, status: e.target.value })}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <div className="jh-date-field">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={editProject.deadline || ''}
                    onChange={e => setEditProject({ ...editProject, deadline: e.target.value })}
                  />
                </div>
              </div>
              <textarea
                placeholder="Description..."
                value={editProject.description || ''}
                onChange={e => setEditProject({ ...editProject, description: e.target.value })}
                rows={2}
              />
              <textarea
                placeholder="Notes..."
                value={editProject.notes || ''}
                onChange={e => setEditProject({ ...editProject, notes: e.target.value })}
                rows={2}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="notes-btn-accent" onClick={saveEdit}>Save Changes</button>
                <button className="notes-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>
          )}

          {activeProject.description && (
            <div className="jh-detail-section">
              <div className="jh-detail-section-title">Description</div>
              <div className="jh-detail-text">{activeProject.description}</div>
            </div>
          )}

          {activeProject.notes && (
            <div className="jh-detail-section">
              <div className="jh-detail-section-title">Notes</div>
              <div className="jh-detail-text">{activeProject.notes}</div>
            </div>
          )}

          {activeProject.deadline && (
            <div className="jh-detail-section">
              <div className="jh-detail-section-title">Deadline</div>
              <div className="jh-detail-text">{activeProject.deadline}</div>
            </div>
          )}

          <div className="jh-detail-section">
            <div className="jh-detail-section-title">
              Pending Tasks ({pendingTasks.length})
            </div>
            {pendingTasks.length === 0 && (
              <div className="jh-card-meta">No pending tasks — add tasks in the Tasks module with category "{activeProject.name}"</div>
            )}
            {pendingTasks.map(task => (
              <div key={task.id} className="project-task-row">
                <div className="home-check" />
                <div className="project-task-title">{task.title}</div>
                {task.priority && <span className={`priority priority-${task.priority}`}>{task.priority}</span>}
                {task.dueDate && <span className="due-date">Due: {task.dueDate}</span>}
              </div>
            ))}
          </div>

          {completedTasks.length > 0 && (
            <div className="jh-detail-section">
              <div className="jh-detail-section-title">
                Completed Tasks ({completedTasks.length})
              </div>
              {completedTasks.map(task => (
                <div key={task.id} className="project-task-row completed">
                  <div className="home-check" style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent)' }} />
                  <div className="project-task-title">{task.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Projects