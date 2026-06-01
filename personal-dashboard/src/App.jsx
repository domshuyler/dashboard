import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Tasks from './pages/Tasks'
import Home from './pages/Home'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <NavLink to="/" className="sidebar-logo">Dashboard</NavLink>
          <nav className="sidebar-nav">
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/habits">Habits</NavLink>
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/calendar">Calendar</NavLink>
            <NavLink to="/chat">Chat</NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App