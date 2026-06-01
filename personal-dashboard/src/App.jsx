import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App