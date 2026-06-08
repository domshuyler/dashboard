import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import ReactMarkdown from 'react-markdown'
import './JobHunt.css'

const STAR_POINTS = (() => {
  const pts = []
  for (let i = 0; i < 5; i++) {
    const outer = (Math.PI * 2 * i / 5) - Math.PI / 2
    const inner = outer + Math.PI / 5
    pts.push(`${(50 + 38 * Math.cos(outer)).toFixed(2)},${(50 + 38 * Math.sin(outer)).toFixed(2)}`)
    pts.push(`${(50 + 16 * Math.cos(inner)).toFixed(2)},${(50 + 16 * Math.sin(inner)).toFixed(2)}`)
  }
  return pts.join(' ')
})()

function Star({ state }) {
  if (state === 'filled') return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="punch-star">
      <polygon points={STAR_POINTS} fill="#09bfbd" />
    </svg>
  )
  if (state === 'last') return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="punch-star">
      <polygon points={STAR_POINTS} fill="#09bfbd" stroke="#07a5a3" strokeWidth="2" />
    </svg>
  )
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="punch-star">
      <polygon points={STAR_POINTS} fill="transparent" stroke="var(--color-border)" strokeWidth="3" strokeDasharray="6,3" />
    </svg>
  )
}

function PunchCard({ filled }) {
  const total = 10
  const count = Math.min(filled, total)
  return (
    <div className="punch-card">
      <div className="punch-card-header">
        <div className="punch-card-title">Job Applications</div>
        <div className="punch-card-goal">Apply to {total} jobs for a prize!</div>
      </div>
      <div className="punch-stars-grid">
        {Array.from({ length: total }, (_, i) => {
          const state = i < count ? (i === count - 1 ? 'last' : 'filled') : 'empty'
          return <Star key={i} state={state} />
        })}
      </div>
      <div className="punch-progress">
        {count === total ? '🎉 All 10 applications submitted!' : `${count} of ${total} applications submitted`}
      </div>
      {count === total && (
        <div className="punch-prize">🎉 Prize unlocked! Time to collect your reward.</div>
      )}
    </div>
  )
}

const STAGES = ['saved', 'applied', 'interview', 'final round', 'offer', 'rejected', 'ghosted']

const EMPTY_JOB = {
  role: '',
  company: '',
  postUrl: '',
  directApplicationUrl: '',
  location: '',
  workFormat: '',
  employmentType: '',
  datePosted: '',
  applicationDeadline: '',
  salary: '',
  status: 'saved',
  dateApplied: '',
  active: true,
  nextFollowUp: '',
  contactPerson: '',
  contactDetails: '',
  jobDescription: '',
  notes: '',
  source: ''
}

function JobHunt({ jobs, setJobs, companies, setCompanies, interviews, setInterviews, correspondence, setCorrespondence }) {
  useEffect(() => { document.title = 'Job Hunt — Dashboard' }, [])
  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [activeJob, setActiveJob] = useState(null)
  const [newJob, setNewJob] = useState(EMPTY_JOB)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [showCorrespondenceForm, setShowCorrespondenceForm] = useState(false)
  const [newInterview, setNewInterview] = useState({
    jobId: null,
    company: '',
    role: '',
    date: '',
    type: '',
    prepNotes: '',
    outcome: ''
  })
  const [newCorrespondence, setNewCorrespondence] = useState({
    jobId: null,
    company: '',
    contact: '',
    type: '',
    date: '',
    notes: ''
  })
  const [prepJob, setPrepJob] = useState('')
  const [prepResult, setPrepResult] = useState('')
  const [prepLoading, setPrepLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editJob, setEditJob] = useState(null)

  const addJob = async () => {
    if (!newJob.role.trim() || !newJob.company.trim()) return
    const job = {
      id: Date.now(),
      role: newJob.role,
      company: newJob.company,
      post_url: newJob.postUrl,
      direct_application_url: newJob.directApplicationUrl,
      location: newJob.location,
      work_format: newJob.workFormat,
      employment_type: newJob.employmentType,
      date_posted: newJob.datePosted,
      application_deadline: newJob.applicationDeadline,
      salary: newJob.salary,
      status: newJob.status,
      date_applied: newJob.dateApplied,
      active: newJob.active,
      next_follow_up: newJob.nextFollowUp,
      contact_person: newJob.contactPerson,
      contact_details: newJob.contactDetails,
      job_description: newJob.jobDescription,
      notes: newJob.notes,
      source: newJob.source
    }
    const { error } = await supabase.from('jobs').insert(job)
    if (!error) {
      setJobs([...jobs, { ...newJob, id: job.id }])
    }
    setNewJob(EMPTY_JOB)
    setShowForm(false)
  }

  const updateJobStatus = async (id, status) => {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id)
    if (!error) {
      setJobs(jobs.map(j => j.id === id ? { ...j, status } : j))
    }
  }

  const deleteJob = async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (!error) {
      setJobs(jobs.filter(j => j.id !== id))
      setActiveJob(null)
      setView('kanban')
    }
  }

  const saveJobEdit = async () => {
  const updated = {
    role: editJob.role,
    company: editJob.company,
    post_url: editJob.postUrl,
    direct_application_url: editJob.directApplicationUrl,
    location: editJob.location,
    work_format: editJob.workFormat,
    employment_type: editJob.employmentType,
    date_posted: editJob.datePosted,
    application_deadline: editJob.applicationDeadline,
    salary: editJob.salary,
    status: editJob.status,
    date_applied: editJob.dateApplied,
    active: editJob.active,
    next_follow_up: editJob.nextFollowUp,
    contact_person: editJob.contactPerson,
    contact_details: editJob.contactDetails,
    job_description: editJob.jobDescription,
    notes: editJob.notes,
    source: editJob.source
  }
  const { error } = await supabase.from('jobs').update(updated).eq('id', editJob.id)
  if (!error) {
    setJobs(jobs.map(j => j.id === editJob.id ? editJob : j))
    setActiveJob(editJob)
    setEditMode(false)
  }
}
  const addInterview = async () => {
    if (!newInterview.company.trim()) return
    const interview = {
      id: Date.now(),
      job_id: newInterview.jobId,
      company: newInterview.company,
      role: newInterview.role,
      date: newInterview.date,
      type: newInterview.type,
      prep_notes: newInterview.prepNotes,
      outcome: newInterview.outcome
    }
    const { error } = await supabase.from('interviews').insert(interview)
    if (!error) {
      setInterviews([...interviews, {
        id: interview.id,
        jobId: interview.job_id,
        company: interview.company,
        role: interview.role,
        date: interview.date,
        type: interview.type,
        prepNotes: interview.prep_notes,
        outcome: interview.outcome
      }])
    }
    setNewInterview({ jobId: null, company: '', role: '', date: '', type: '', prepNotes: '', outcome: '' })
    setShowInterviewForm(false)
  }

  const addCorrespondence = async () => {
    if (!newCorrespondence.company.trim()) return
    const entry = {
      id: Date.now(),
      job_id: newCorrespondence.jobId,
      company: newCorrespondence.company,
      contact: newCorrespondence.contact,
      type: newCorrespondence.type,
      date: newCorrespondence.date,
      notes: newCorrespondence.notes
    }
    const { error } = await supabase.from('correspondence').insert(entry)
    if (!error) {
      setCorrespondence([...correspondence, {
        id: entry.id,
        jobId: entry.job_id,
        company: entry.company,
        contact: entry.contact,
        type: entry.type,
        date: entry.date,
        notes: entry.notes
      }])
    }
    setNewCorrespondence({ jobId: null, company: '', contact: '', type: '', date: '', notes: '' })
    setShowCorrespondenceForm(false)
  }

  const generatePrep = async () => {
    if (!prepJob) return
    const job = jobs.find(j => j.id === Number(prepJob))
    if (!job) return

    setPrepLoading(true)
    setPrepResult('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: 'You are an expert career coach helping someone prepare for a job interview. Be specific, practical, and encouraging.',
          messages: [{
            role: 'user',
            content: `Please help me prepare for this interview:

Role: ${job.role}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Work Format: ${job.workFormat || 'Not specified'}
Salary: ${job.salary || 'Not specified'}

Job Description:
${job.jobDescription || 'Not provided'}

My Notes:
${job.notes || 'None'}

Please provide:
1. 8-10 likely interview questions for this role
2. Key talking points and how to position myself
3. Questions I should ask the interviewer
4. A brief company research checklist
5. A follow-up email template`
          }]
        })
      })
      const data = await response.json()
      setPrepResult(data.content[0].text)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setPrepLoading(false)
    }
  }

  const appliedCount = jobs.filter(j => j.status !== 'saved').length

  return (
    <div className="page">
      <div className="jh-header">
        <h1>Job Hunt</h1>
        <button className="notes-btn-accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Application'}
        </button>
      </div>

      <div className="jh-tabs">
        <button className={view === 'kanban' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('kanban')}>Pipeline</button>
        <button className={view === 'list' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('list')}>All Applications</button>
        <button className={view === 'interviews' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('interviews')}>Interviews</button>
        <button className={view === 'correspondence' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('correspondence')}>Correspondence</button>
        <button className={view === 'resources' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('resources')}>Resources</button>
        <button className={view === 'prep' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('prep')}>Interview Prep</button>
      </div>

      {showForm && (
        <div className="jh-form">
          <div className="jh-form-grid">
            <input placeholder="Role / Opportunity *" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
            <input placeholder="Company *" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
            <input placeholder="Post URL" value={newJob.postUrl} onChange={e => setNewJob({ ...newJob, postUrl: e.target.value })} />
            <input placeholder="Direct Application URL" value={newJob.directApplicationUrl} onChange={e => setNewJob({ ...newJob, directApplicationUrl: e.target.value })} />
            <input placeholder="Location" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
            <select value={newJob.workFormat} onChange={e => setNewJob({ ...newJob, workFormat: e.target.value })}>
              <option value="">Work Format</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>Onsite</option>
            </select>
            <select value={newJob.employmentType} onChange={e => setNewJob({ ...newJob, employmentType: e.target.value })}>
              <option value="">Employment Type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
            <input placeholder="Salary / Comp" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
            <input placeholder="Source (LinkedIn, Indeed...)" value={newJob.source} onChange={e => setNewJob({ ...newJob, source: e.target.value })} />
            <div className="jh-date-field">
              <label>Date Posted</label>
              <input type="date" value={newJob.datePosted} onChange={e => setNewJob({ ...newJob, datePosted: e.target.value })} />
            </div>
            <div className="jh-date-field">
              <label>Application Deadline</label>
              <input type="date" value={newJob.applicationDeadline} onChange={e => setNewJob({ ...newJob, applicationDeadline: e.target.value })} />
            </div>
            <div className="jh-date-field">
              <label>Date Applied</label>
              <input type="date" value={newJob.dateApplied} onChange={e => setNewJob({ ...newJob, dateApplied: e.target.value })} />
            </div>
            <div className="jh-date-field">
              <label>Next Follow-Up</label>
              <input type="date" value={newJob.nextFollowUp} onChange={e => setNewJob({ ...newJob, nextFollowUp: e.target.value })} />
            </div>
            <input placeholder="Contact Person / Recruiter" value={newJob.contactPerson} onChange={e => setNewJob({ ...newJob, contactPerson: e.target.value })} />
            <input placeholder="Contact Details" value={newJob.contactDetails} onChange={e => setNewJob({ ...newJob, contactDetails: e.target.value })} />
            <select value={newJob.status} onChange={e => setNewJob({ ...newJob, status: e.target.value })}>
              {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <textarea placeholder="Job Description" value={newJob.jobDescription} onChange={e => setNewJob({ ...newJob, jobDescription: e.target.value })} rows={4} />
          <textarea placeholder="Notes" value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} rows={3} />
          <button className="notes-btn-accent" onClick={addJob}>Save Application</button>
        </div>
      )}

      {view === 'kanban' && (
        <>
        <PunchCard filled={appliedCount} />
        <div className="jh-kanban">
          {STAGES.map(stage => (
            <div key={stage} className="jh-column">
              <div className="jh-column-header">
                <span className="jh-column-title">{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
                <span className="jh-column-count">{jobs.filter(j => j.status === stage).length}</span>
              </div>
              <div className="jh-column-cards">
                {jobs.filter(j => j.status === stage).map(job => (
                  <div key={job.id} className="jh-card" onClick={() => { setActiveJob(job); setView('detail') }}>
                    <div className="jh-card-role">{job.role}</div>
                    <div className="jh-card-company">{job.company}</div>
                    {job.location && <div className="jh-card-meta">{job.location}</div>}
                    {job.salary && <div className="jh-card-meta">{job.salary}</div>}
                    {job.nextFollowUp && <div className="jh-card-followup">Follow-up: {job.nextFollowUp}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {view === 'list' && (
        <div className="jh-list">
          {jobs.length === 0 && <div className="notes-empty">No applications yet.</div>}
          {jobs.map(job => (
            <div key={job.id} className="jh-list-row" onClick={() => { setActiveJob(job); setView('detail') }}>
              <div className="jh-list-main">
                <div className="jh-card-role">{job.role}</div>
                <div className="jh-card-company">{job.company}</div>
              </div>
              <div className="jh-list-meta">
                {job.location && <span>{job.location}</span>}
                {job.workFormat && <span>{job.workFormat}</span>}
                {job.salary && <span>{job.salary}</span>}
              </div>
              <div className={`jh-status jh-status-${job.status.replace(' ', '-')}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'detail' && activeJob && (
        <div className="jh-detail">
          <div className="jh-detail-header">
            <div>
              <div className="jh-detail-role">{activeJob.role}</div>
              <div className="jh-detail-company">{activeJob.company}</div>
            </div>
            <div className="jh-detail-actions">
  <button className="notes-btn" onClick={() => { setEditJob({ ...activeJob }); setEditMode(true) }}>Edit</button>
  <select
    value={activeJob.status}
    onChange={e => {
      const updated = { ...activeJob, status: e.target.value }
      setActiveJob(updated)
      updateJobStatus(activeJob.id, e.target.value)
    }}
  >
    {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
  </select>
  <button className="notes-btn-danger" onClick={() => deleteJob(activeJob.id)}>Delete</button>
  <button className="notes-btn" onClick={() => setView('kanban')}>Back</button>
</div>
          </div>
{editMode && editJob && (
  <div className="jh-form" style={{ marginBottom: '1.5rem' }}>
    <div className="jh-form-grid">
      <input placeholder="Role / Opportunity *" value={editJob.role} onChange={e => setEditJob({ ...editJob, role: e.target.value })} />
      <input placeholder="Company *" value={editJob.company} onChange={e => setEditJob({ ...editJob, company: e.target.value })} />
      <input placeholder="Post URL" value={editJob.postUrl || ''} onChange={e => setEditJob({ ...editJob, postUrl: e.target.value })} />
      <input placeholder="Direct Application URL" value={editJob.directApplicationUrl || ''} onChange={e => setEditJob({ ...editJob, directApplicationUrl: e.target.value })} />
      <input placeholder="Location" value={editJob.location || ''} onChange={e => setEditJob({ ...editJob, location: e.target.value })} />
      <select value={editJob.workFormat || ''} onChange={e => setEditJob({ ...editJob, workFormat: e.target.value })}>
        <option value="">Work Format</option>
        <option>Remote</option>
        <option>Hybrid</option>
        <option>Onsite</option>
      </select>
      <select value={editJob.employmentType || ''} onChange={e => setEditJob({ ...editJob, employmentType: e.target.value })}>
        <option value="">Employment Type</option>
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Contract</option>
      </select>
      <input placeholder="Salary / Comp" value={editJob.salary || ''} onChange={e => setEditJob({ ...editJob, salary: e.target.value })} />
      <input placeholder="Source" value={editJob.source || ''} onChange={e => setEditJob({ ...editJob, source: e.target.value })} />
      <div className="jh-date-field">
        <label>Date Posted</label>
        <input type="date" value={editJob.datePosted || ''} onChange={e => setEditJob({ ...editJob, datePosted: e.target.value })} />
      </div>
      <div className="jh-date-field">
        <label>Application Deadline</label>
        <input type="date" value={editJob.applicationDeadline || ''} onChange={e => setEditJob({ ...editJob, applicationDeadline: e.target.value })} />
      </div>
      <div className="jh-date-field">
        <label>Date Applied</label>
        <input type="date" value={editJob.dateApplied || ''} onChange={e => setEditJob({ ...editJob, dateApplied: e.target.value })} />
      </div>
      <div className="jh-date-field">
        <label>Next Follow-Up</label>
        <input type="date" value={editJob.nextFollowUp || ''} onChange={e => setEditJob({ ...editJob, nextFollowUp: e.target.value })} />
      </div>
      <input placeholder="Contact Person / Recruiter" value={editJob.contactPerson || ''} onChange={e => setEditJob({ ...editJob, contactPerson: e.target.value })} />
      <input placeholder="Contact Details" value={editJob.contactDetails || ''} onChange={e => setEditJob({ ...editJob, contactDetails: e.target.value })} />
    </div>
    <textarea placeholder="Job Description" value={editJob.jobDescription || ''} onChange={e => setEditJob({ ...editJob, jobDescription: e.target.value })} rows={4} />
    <textarea placeholder="Notes" value={editJob.notes || ''} onChange={e => setEditJob({ ...editJob, notes: e.target.value })} rows={3} />
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button className="notes-btn-accent" onClick={saveJobEdit}>Save Changes</button>
      <button className="notes-btn" onClick={() => setEditMode(false)}>Cancel</button>
    </div>
  </div>
)}
          <div className="jh-detail-grid">
            {activeJob.location && <div className="jh-detail-field"><span>Location</span><p>{activeJob.location}</p></div>}
            {activeJob.workFormat && <div className="jh-detail-field"><span>Work Format</span><p>{activeJob.workFormat}</p></div>}
            {activeJob.employmentType && <div className="jh-detail-field"><span>Employment Type</span><p>{activeJob.employmentType}</p></div>}
            {activeJob.salary && <div className="jh-detail-field"><span>Salary</span><p>{activeJob.salary}</p></div>}
            {activeJob.source && <div className="jh-detail-field"><span>Source</span><p>{activeJob.source}</p></div>}
            {activeJob.datePosted && <div className="jh-detail-field"><span>Date Posted</span><p>{activeJob.datePosted}</p></div>}
            {activeJob.applicationDeadline && <div className="jh-detail-field"><span>Deadline</span><p>{activeJob.applicationDeadline}</p></div>}
            {activeJob.dateApplied && <div className="jh-detail-field"><span>Date Applied</span><p>{activeJob.dateApplied}</p></div>}
            {activeJob.nextFollowUp && <div className="jh-detail-field"><span>Next Follow-Up</span><p>{activeJob.nextFollowUp}</p></div>}
            {activeJob.contactPerson && <div className="jh-detail-field"><span>Contact</span><p>{activeJob.contactPerson}</p></div>}
            {activeJob.contactDetails && <div className="jh-detail-field"><span>Contact Details</span><p>{activeJob.contactDetails}</p></div>}
            {activeJob.postUrl && <div className="jh-detail-field"><span>Post URL</span><p><a href={activeJob.postUrl} target="_blank" rel="noreferrer">{activeJob.postUrl}</a></p></div>}
            {activeJob.directApplicationUrl && <div className="jh-detail-field"><span>Application URL</span><p><a href={activeJob.directApplicationUrl} target="_blank" rel="noreferrer">{activeJob.directApplicationUrl}</a></p></div>}
          </div>

          {activeJob.jobDescription && (
            <div className="jh-detail-section">
              <div className="jh-detail-section-title">Job Description</div>
              <div className="jh-detail-text">{activeJob.jobDescription}</div>
            </div>
          )}

          {activeJob.notes && (
            <div className="jh-detail-section">
              <div className="jh-detail-section-title">Notes</div>
              <div className="jh-detail-text">{activeJob.notes}</div>
            </div>
          )}

          <div className="jh-detail-section">
            <div className="jh-detail-section-title">Interviews</div>
            {interviews.filter(i => i.jobId === activeJob.id).length === 0 && (
              <div className="jh-card-meta">No interviews logged for this application.</div>
            )}
            {interviews.filter(i => i.jobId === activeJob.id).map(interview => (
              <div key={interview.id} className="jh-interview-card" style={{ marginBottom: '0.5rem' }}>
                <div className="jh-interview-header">
                  <div>
                    <div className="jh-card-role">{interview.type || 'Interview'}</div>
                    <div className="jh-card-meta">{interview.date}</div>
                  </div>
                  <div className="jh-interview-meta">
                    {interview.outcome && (
                      <span className={`jh-status ${interview.outcome === 'Passed' ? 'jh-status-offer' : interview.outcome === 'Rejected' ? 'jh-status-rejected' : 'jh-status-saved'}`}>
                        {interview.outcome}
                      </span>
                    )}
                  </div>
                </div>
                {interview.prepNotes && (
                  <div className="jh-detail-text" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    {interview.prepNotes}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="jh-detail-section">
            <div className="jh-detail-section-title">Correspondence</div>
            {correspondence.filter(c => c.jobId === activeJob.id).length === 0 && (
              <div className="jh-card-meta">No correspondence logged for this application.</div>
            )}
            {correspondence.filter(c => c.jobId === activeJob.id).map(c => (
              <div key={c.id} className="jh-interview-card" style={{ marginBottom: '0.5rem' }}>
                <div className="jh-interview-header">
                  <div>
                    <div className="jh-card-role">{c.contact || 'Unknown contact'}</div>
                    <div className="jh-card-meta">{c.type} · {c.date}</div>
                  </div>
                </div>
                {c.notes && (
                  <div className="jh-detail-text" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    {c.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'interviews' && (
        <div className="jh-interviews">
          <div className="jh-section-header">
            <button className="notes-btn-accent" onClick={() => setShowInterviewForm(!showInterviewForm)}>
              {showInterviewForm ? 'Cancel' : '+ Add Interview'}
            </button>
          </div>

          {showInterviewForm && (
            <div className="jh-form">
              <div className="jh-form-grid">
                <select value={newInterview.jobId || ''} onChange={e => {
                  const job = jobs.find(j => j.id === Number(e.target.value))
                  setNewInterview({ ...newInterview, jobId: Number(e.target.value), company: job?.company || '', role: job?.role || '' })
                }}>
                  <option value="">Link to application...</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
                </select>
                <input placeholder="Company" value={newInterview.company} onChange={e => setNewInterview({ ...newInterview, company: e.target.value })} />
                <input placeholder="Role" value={newInterview.role} onChange={e => setNewInterview({ ...newInterview, role: e.target.value })} />
                <div className="jh-date-field">
                  <label>Interview Date</label>
                  <input type="date" value={newInterview.date} onChange={e => setNewInterview({ ...newInterview, date: e.target.value })} />
                </div>
                <select value={newInterview.type} onChange={e => setNewInterview({ ...newInterview, type: e.target.value })}>
                  <option value="">Interview Type</option>
                  <option>Phone Screen</option>
                  <option>Video</option>
                  <option>Onsite</option>
                  <option>Technical</option>
                  <option>Panel</option>
                </select>
                <select value={newInterview.outcome} onChange={e => setNewInterview({ ...newInterview, outcome: e.target.value })}>
                  <option value="">Outcome</option>
                  <option>Pending</option>
                  <option>Passed</option>
                  <option>Rejected</option>
                </select>
              </div>
              <textarea placeholder="Prep notes..." value={newInterview.prepNotes} onChange={e => setNewInterview({ ...newInterview, prepNotes: e.target.value })} rows={4} />
              <button className="notes-btn-accent" onClick={addInterview}>Save Interview</button>
            </div>
          )}

          <div className="jh-list">
            {interviews.length === 0 && <div className="notes-empty">No interviews logged yet.</div>}
            {interviews.map(interview => (
              <div key={interview.id} className="jh-interview-card">
                <div className="jh-interview-header">
                  <div>
                    <div className="jh-card-role">{interview.role}</div>
                    <div className="jh-card-company">{interview.company}</div>
                  </div>
                  <div className="jh-interview-meta">
                    {interview.type && <span className="jh-status jh-status-applied">{interview.type}</span>}
                    {interview.outcome && (
                      <span className={`jh-status ${interview.outcome === 'Passed' ? 'jh-status-offer' : interview.outcome === 'Rejected' ? 'jh-status-rejected' : 'jh-status-saved'}`}>
                        {interview.outcome}
                      </span>
                    )}
                    {interview.date && <span className="jh-card-meta">{interview.date}</span>}
                  </div>
                </div>
                {interview.prepNotes && (
                  <div className="jh-detail-text" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    {interview.prepNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'correspondence' && (
        <div className="jh-correspondence">
          <div className="jh-section-header">
            <button className="notes-btn-accent" onClick={() => setShowCorrespondenceForm(!showCorrespondenceForm)}>
              {showCorrespondenceForm ? 'Cancel' : '+ Add Correspondence'}
            </button>
          </div>

          {showCorrespondenceForm && (
            <div className="jh-form">
              <div className="jh-form-grid">
                <select value={newCorrespondence.jobId || ''} onChange={e => {
                  const job = jobs.find(j => j.id === Number(e.target.value))
                  setNewCorrespondence({ ...newCorrespondence, jobId: Number(e.target.value), company: job?.company || '' })
                }}>
                  <option value="">Link to application...</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
                </select>
                <input placeholder="Company" value={newCorrespondence.company} onChange={e => setNewCorrespondence({ ...newCorrespondence, company: e.target.value })} />
                <input placeholder="Contact person" value={newCorrespondence.contact} onChange={e => setNewCorrespondence({ ...newCorrespondence, contact: e.target.value })} />
                <select value={newCorrespondence.type} onChange={e => setNewCorrespondence({ ...newCorrespondence, type: e.target.value })}>
                  <option value="">Type</option>
                  <option>Email</option>
                  <option>LinkedIn</option>
                  <option>Phone</option>
                  <option>In Person</option>
                </select>
                <div className="jh-date-field">
                  <label>Date</label>
                  <input type="date" value={newCorrespondence.date} onChange={e => setNewCorrespondence({ ...newCorrespondence, date: e.target.value })} />
                </div>
              </div>
              <textarea placeholder="Notes..." value={newCorrespondence.notes} onChange={e => setNewCorrespondence({ ...newCorrespondence, notes: e.target.value })} rows={3} />
              <button className="notes-btn-accent" onClick={addCorrespondence}>Save</button>
            </div>
          )}

          <div className="jh-list">
            {correspondence.length === 0 && <div className="notes-empty">No correspondence logged yet.</div>}
            {correspondence.map(c => (
              <div key={c.id} className="jh-interview-card">
                <div className="jh-interview-header">
                  <div>
                    <div className="jh-card-role">{c.contact || 'Unknown contact'}</div>
                    <div className="jh-card-company">{c.company}</div>
                  </div>
                  <div className="jh-interview-meta">
                    {c.type && <span className="jh-status jh-status-applied">{c.type}</span>}
                    {c.date && <span className="jh-card-meta">{c.date}</span>}
                  </div>
                </div>
                {c.notes && (
                  <div className="jh-detail-text" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    {c.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'resources' && (
        <div className="jh-resources">
          <div className="jh-resources-list">
            {[
              { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/' },
              { name: 'Indeed', url: 'https://www.indeed.com/' },
              { name: 'Handshake', url: 'https://joinhandshake.com/' },
              { name: 'ZipRecruiter', url: 'https://www.ziprecruiter.com/' },
              { name: 'Glassdoor', url: 'https://www.glassdoor.com/' },
              { name: 'Built In Colorado', url: 'https://www.builtincolorado.com/' },
              { name: 'Colorado Nonprofit Association', url: 'https://coloradononprofits.org/careers/' },
              { name: 'Connecting Colorado', url: 'https://jobs.connectingcolorado.gov/' },
              { name: 'HiringCafe', url: 'https://hiring.cafe/' },
            ].map(resource => (
              <a key={resource.name} href={resource.url} target="_blank" rel="noreferrer" className="jh-resource-link">
                {resource.name} →
              </a>
            ))}
          </div>
        </div>
      )}

      {view === 'prep' && (
        <div className="jh-prep">
          <div className="jh-section-header">
            <div className="jh-prep-controls">
              <select value={prepJob} onChange={e => { setPrepJob(e.target.value); setPrepResult('') }}>
                <option value="">Select an application to prep for...</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
              </select>
              <button className="notes-btn-accent" onClick={generatePrep} disabled={!prepJob || prepLoading}>
                {prepLoading ? 'Generating...' : 'Generate Prep Guide'}
              </button>
            </div>
          </div>

          {prepLoading && (
            <div className="notes-empty">Generating your interview prep guide...</div>
          )}

          {prepResult && (
            <div className="jh-prep-result">
              <ReactMarkdown>{prepResult}</ReactMarkdown>
            </div>
          )}

          {!prepJob && !prepResult && (
            <div className="notes-empty">Select a job application above to generate a personalized interview prep guide.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobHunt