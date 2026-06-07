import { useState } from 'react'
import './JobHunt.css'

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

function JobHunt({ jobs, setJobs, companies, setCompanies }) {
  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [activeJob, setActiveJob] = useState(null)
  const [newJob, setNewJob] = useState(EMPTY_JOB)

  const addJob = () => {
    if (!newJob.role.trim() || !newJob.company.trim()) return
    setJobs([...jobs, { ...newJob, id: Date.now() }])
    setNewJob(EMPTY_JOB)
    setShowForm(false)
  }

  const updateJobStatus = (id, status) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j))
  }

  const deleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id))
    setActiveJob(null)
    setView('kanban')
  }

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
            <input type="date" placeholder="Date Posted" value={newJob.datePosted} onChange={e => setNewJob({ ...newJob, datePosted: e.target.value })} />
            <input type="date" placeholder="Application Deadline" value={newJob.applicationDeadline} onChange={e => setNewJob({ ...newJob, applicationDeadline: e.target.value })} />
            <input type="date" placeholder="Date Applied" value={newJob.dateApplied} onChange={e => setNewJob({ ...newJob, dateApplied: e.target.value })} />
            <input type="date" placeholder="Next Follow-Up" value={newJob.nextFollowUp} onChange={e => setNewJob({ ...newJob, nextFollowUp: e.target.value })} />
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
        </div>
      )}

      {view === 'interviews' && (
        <div className="notes-empty">Interview tracking coming soon.</div>
      )}

      {view === 'correspondence' && (
        <div className="notes-empty">Correspondence tracking coming soon.</div>
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
    </div>
  )
}

export default JobHunt