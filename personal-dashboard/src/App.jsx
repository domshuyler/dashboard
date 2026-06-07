import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Notes from './pages/Notes'
import JobHunt from './pages/JobHunt'

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [habits, setHabits] = useState(() => {
  const saved = localStorage.getItem('habits')
  return saved ? JSON.parse(saved) : []
})

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals')
    return saved ? JSON.parse(saved) : []
  })

  const [jobs, setJobs] = useState(() => {
  const saved = localStorage.getItem('jobs')
  return saved ? JSON.parse(saved) : []
})

const [interviews, setInterviews] = useState(() => {
  const saved = localStorage.getItem('interviews')
  return saved ? JSON.parse(saved) : []
})

const [correspondence, setCorrespondence] = useState(() => {
  const saved = localStorage.getItem('correspondence')
  return saved ? JSON.parse(saved) : []
})

const [companies, setCompanies] = useState(() => {
  const saved = localStorage.getItem('companies')
  return saved ? JSON.parse(saved) : []
})

  const [notes, setNotes] = useState(() => {
  const saved = localStorage.getItem('notes')
  return saved ? JSON.parse(saved) : []
})

  const [calendarEvents, setCalendarEvents] = useState([])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
  localStorage.setItem('notes', JSON.stringify(notes))
}, [notes])


useEffect(() => {
  const hash = window.location.hash
  if (hash.includes('access_token')) {
    const match = hash.match(/access_token=([^&]+)/)
    if (match) {
      localStorage.setItem('google_token', match[1])
      window.history.replaceState(null, null, window.location.pathname)
    }
  }
}, [])

useEffect(() => {
  localStorage.setItem('jobs', JSON.stringify(jobs))
}, [jobs])

useEffect(() => {
  localStorage.setItem('companies', JSON.stringify(companies))
}, [companies])

useEffect(() => {
  localStorage.setItem('interviews', JSON.stringify(interviews))
}, [interviews])

useEffect(() => {
  localStorage.setItem('correspondence', JSON.stringify(correspondence))
}, [correspondence])


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

            <Route path="/notes" element={<Notes notes={notes} setNotes={setNotes} />} />
            <Route path="/jobs" element={
             <JobHunt
               jobs={jobs}
               setJobs={setJobs}
               companies={companies}
               setCompanies={setCompanies}
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