import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Notes from './pages/Notes'
import JobHunt from './pages/JobHunt'
import Finance from './pages/Finance'
import Projects from './pages/Projects'

function App() {
  const [session, setSession] = useState(undefined)
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [notes, setNotes] = useState([])
  const [jobs, setJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [correspondence, setCorrespondence] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [accounts, setAccounts] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    const fetchAll = async () => {
      const [
        { data: tasksData },
        { data: habitsData },
        { data: goalsData },
        { data: notesData },
        { data: jobsData },
        { data: interviewsData },
        { data: correspondenceData },
        { data: transactionsData },
        { data: budgetsData },
        { data: accountsData },
        { data: savingsGoalsData },
        { data: projectsData },
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('habits').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('jobs').select('*'),
        supabase.from('interviews').select('*'),
        supabase.from('correspondence').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('accounts').select('*'),
        supabase.from('savings_goals').select('*'),
        supabase.from('projects').select('*'),
      ])

      if (tasksData) setTasks(tasksData.map(t => ({
        id: t.id, title: t.title, completed: t.completed,
        priority: t.priority, dueDate: t.due_date, category: t.category
      })))

      if (habitsData) setHabits(habitsData.map(h => ({
        id: h.id, name: h.name, category: h.category,
        streak: h.streak, lastCompleted: h.last_completed, completedToday: h.completed_today
      })))

      if (goalsData) setGoals(goalsData.map(g => ({
        id: g.id, title: g.title, category: g.category,
        deadline: g.deadline, target: g.target, current: g.current,
        unit: g.unit, completed: g.completed
      })))

      if (notesData) setNotes(notesData.map(n => ({
        id: n.id, title: n.title, content: n.content,
        category: n.category, tags: n.tags || [], createdAt: n.created_at
      })))

      if (jobsData) setJobs(jobsData.map(j => ({
        id: j.id, role: j.role, company: j.company,
        postUrl: j.post_url, directApplicationUrl: j.direct_application_url,
        location: j.location, workFormat: j.work_format, employmentType: j.employment_type,
        datePosted: j.date_posted, applicationDeadline: j.application_deadline,
        salary: j.salary, status: j.status, dateApplied: j.date_applied,
        active: j.active, nextFollowUp: j.next_follow_up, contactPerson: j.contact_person,
        contactDetails: j.contact_details, jobDescription: j.job_description,
        notes: j.notes, source: j.source
      })))

      if (interviewsData) setInterviews(interviewsData.map(i => ({
        id: i.id, jobId: i.job_id, company: i.company, role: i.role,
        date: i.date, type: i.type, prepNotes: i.prep_notes, outcome: i.outcome
      })))

      if (correspondenceData) setCorrespondence(correspondenceData.map(c => ({
        id: c.id, jobId: c.job_id, company: c.company, contact: c.contact,
        type: c.type, date: c.date, notes: c.notes
      })))

      if (transactionsData) setTransactions(transactionsData.map(t => ({
        id: t.id, type: t.type, amount: t.amount, category: t.category,
        description: t.description, date: t.date, account: t.account
      })))

      if (budgetsData) setBudgets(budgetsData.map(b => ({
        id: b.id, category: b.category, limit: b.limit_amount, month: b.month
      })))

      if (accountsData) setAccounts(accountsData.map(a => ({
        id: a.id, name: a.name, type: a.type, balance: a.balance
      })))

      if (savingsGoalsData) setSavingsGoals(savingsGoalsData.map(s => ({
        id: s.id, title: s.title, target: s.target, current: s.current, deadline: s.deadline
      })))
      if (projectsData) setProjects(projectsData.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        deadline: p.deadline,
        notes: p.notes
      })))

      setLoading(false)
    }

    fetchAll()
  }, [session])

  if (session === undefined) {
    return (
      <div className="app-loading">
        <div className="app-loading-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48">
            <rect width="32" height="32" rx="6" fill="#0f0f0f"/>
            <rect x="5" y="5" width="9" height="9" rx="2" fill="#09bfbd"/>
            <rect x="18" y="5" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.6"/>
            <rect x="5" y="18" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.6"/>
            <rect x="18" y="18" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.3"/>
          </svg>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48">
            <rect width="32" height="32" rx="6" fill="#0f0f0f"/>
            <rect x="5" y="5" width="9" height="9" rx="2" fill="#09bfbd"/>
            <rect x="18" y="5" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.6"/>
            <rect x="5" y="18" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.6"/>
            <rect x="18" y="18" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.3"/>
          </svg>
        </div>
        <div className="app-loading-text">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app">
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <NavLink to="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>Dashboard</NavLink>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end onClick={() => setSidebarOpen(false)}>Home</NavLink>
            <NavLink to="/tasks" onClick={() => setSidebarOpen(false)}>Tasks</NavLink>
            <NavLink to="/habits" onClick={() => setSidebarOpen(false)}>Habits</NavLink>
            <NavLink to="/goals" onClick={() => setSidebarOpen(false)}>Goals</NavLink>
            <NavLink to="/projects" onClick={() => setSidebarOpen(false)}>Projects</NavLink>
            <NavLink to="/calendar" onClick={() => setSidebarOpen(false)}>Calendar</NavLink>
            <NavLink to="/notes" onClick={() => setSidebarOpen(false)}>Notes</NavLink>
            <NavLink to="/chat" onClick={() => setSidebarOpen(false)}>Chat</NavLink>
            <NavLink to="/jobs" onClick={() => setSidebarOpen(false)}>Job Hunt</NavLink>
            <NavLink to="/finance" onClick={() => setSidebarOpen(false)}>Finance</NavLink>
          </nav>
          <button
            className="sidebar-signout"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </aside>
        <div className="main-wrapper">
          <div className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          </div>
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <Home
                  tasks={tasks}
                  habits={habits}
                  goals={goals}
                  calendarEvents={calendarEvents}
                  jobs={jobs}
                  interviews={interviews}
                />}
              />
              <Route path="/tasks" element={
                <Tasks tasks={tasks} setTasks={setTasks} />}
              />
              <Route path="/habits" element={
                <Habits habits={habits} setHabits={setHabits} />}
              />
              <Route path="/goals" element={
                <Goals goals={goals} setGoals={setGoals} />}
              />
              <Route path="/calendar" element={
                <Calendar calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} />}
              />
              <Route path="/chat" element={<Chat />} />
              <Route path="/notes" element={
                <Notes notes={notes} setNotes={setNotes} />}
              />
              <Route path="/jobs" element={
                <JobHunt
                  jobs={jobs}
                  setJobs={setJobs}
                  companies={[]}
                  setCompanies={() => {}}
                  interviews={interviews}
                  setInterviews={setInterviews}
                  correspondence={correspondence}
                  setCorrespondence={setCorrespondence}
                />}
              />
              <Route path="/finance" element={
                <Finance
                  transactions={transactions}
                  setTransactions={setTransactions}
                  budgets={budgets}
                  setBudgets={setBudgets}
                  accounts={accounts}
                  setAccounts={setAccounts}
                  savingsGoals={savingsGoals}
                  setSavingsGoals={setSavingsGoals}
                />}
              />
              <Route path="/projects" element={
  <Projects
    projects={projects}
    setProjects={setProjects}
    tasks={tasks}
  />}
/>
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App