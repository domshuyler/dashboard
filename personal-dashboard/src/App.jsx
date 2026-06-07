import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Notes from './pages/Notes'
import JobHunt from './pages/JobHunt'

function App() {
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [notes, setNotes] = useState([])
  const [jobs, setJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [correspondence, setCorrespondence] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [
        { data: tasksData },
        { data: habitsData },
        { data: goalsData },
        { data: notesData },
        { data: jobsData },
        { data: interviewsData },
        { data: correspondenceData }
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('habits').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('jobs').select('*'),
        supabase.from('interviews').select('*'),
        supabase.from('correspondence').select('*')
      ])

      if (tasksData) setTasks(tasksData.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        priority: t.priority,
        dueDate: t.due_date,
        category: t.category
      })))

      if (habitsData) setHabits(habitsData.map(h => ({
        id: h.id,
        name: h.name,
        category: h.category,
        streak: h.streak,
        lastCompleted: h.last_completed,
        completedToday: h.completed_today
      })))

      if (goalsData) setGoals(goalsData.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        deadline: g.deadline,
        target: g.target,
        current: g.current,
        unit: g.unit,
        completed: g.completed
      })))

      if (notesData) setNotes(notesData.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        tags: n.tags || [],
        createdAt: n.created_at
      })))

      if (jobsData) setJobs(jobsData.map(j => ({
        id: j.id,
        role: j.role,
        company: j.company,
        postUrl: j.post_url,
        directApplicationUrl: j.direct_application_url,
        location: j.location,
        workFormat: j.work_format,
        employmentType: j.employment_type,
        datePosted: j.date_posted,
        applicationDeadline: j.application_deadline,
        salary: j.salary,
        status: j.status,
        dateApplied: j.date_applied,
        active: j.active,
        nextFollowUp: j.next_follow_up,
        contactPerson: j.contact_person,
        contactDetails: j.contact_details,
        jobDescription: j.job_description,
        notes: j.notes,
        source: j.source
      })))

      if (interviewsData) setInterviews(interviewsData.map(i => ({
        id: i.id,
        jobId: i.job_id,
        company: i.company,
        role: i.role,
        date: i.date,
        type: i.type,
        prepNotes: i.prep_notes,
        outcome: i.outcome
      })))

      if (correspondenceData) setCorrespondence(correspondenceData.map(c => ({
        id: c.id,
        jobId: c.job_id,
        company: c.company,
        contact: c.contact,
        type: c.type,
        date: c.date,
        notes: c.notes
      })))

      setLoading(false)
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-text-muted)' }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <NavLink to="/" className="sidebar-logo">Dashboard</NavLink>
          <nav className="sidebar-nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/habits">Habits</NavLink>
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/calendar">Calendar</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/notes">Notes</NavLink>
            <NavLink to="/jobs">Job Hunt</NavLink>
          </nav>
        </aside>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App