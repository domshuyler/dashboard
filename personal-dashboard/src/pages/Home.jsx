import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home({ tasks, habits, goals, calendarEvents, jobs, interviews }) {
  document.title = 'Dashboard'
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .slice(0, 4)

  const todayHabits = habits.slice(0, 4)

  const activeGoals = goals
    .filter(g => !g.completed && g.target)
    .slice(0, 3)

  const upcomingEvents = calendarEvents
    .slice(0, 3)

  const habitsCompletedToday = habits.filter(h => h.completedToday).length
  const tasksDueToday = tasks.filter(t => !t.completed && t.dueDate === today).length

  const activeApplications = jobs.filter(j => j.active && !['offer', 'rejected', 'ghosted'].includes(j.status)).length

const upcomingInterviews = interviews.filter(i => {
  if (!i.date) return false
  return new Date(i.date) >= new Date()
}).length

const followUpsDue = jobs.filter(j => {
  if (!j.nextFollowUp) return false
  return new Date(j.nextFollowUp) <= new Date()
}).length

  return (
    <div className="page">
      <div className="home-greeting">
        <div className="home-date">{formattedDate}</div>
        <div className="home-title">{greeting()}</div>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-label">Tasks</div>
          <div className="stat-value">{tasksDueToday}</div>
          <div className="stat-sub">due today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Habits</div>
          <div className="stat-value">{habitsCompletedToday}/{habits.length}</div>
          <div className="stat-sub">completed today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Goals</div>
          <div className="stat-value">{goals.filter(g => !g.completed).length}</div>
          <div className="stat-sub">active</div>
        </div>
      </div>

      <div className="home-grid">
        <div className="home-card">
          <div className="home-card-title">
            Upcoming tasks
            <span onClick={() => navigate('/tasks')}>View all</span>
          </div>
          {upcomingTasks.length === 0 && <div className="home-empty">No pending tasks</div>}
          {upcomingTasks.map(task => (
            <div key={task.id} className="home-task-row">
              <div className="home-check" />
              <div className="home-task-text">{task.title}</div>
              {task.priority && (
                <div className={`task-badge priority-${task.priority}`}>{task.priority}</div>
              )}
            </div>
          ))}
        </div>

        <div className="home-card">
          <div className="home-card-title">
            Today's habits
            <span onClick={() => navigate('/habits')}>View all</span>
          </div>
          {todayHabits.length === 0 && <div className="home-empty">No habits added yet</div>}
          {todayHabits.map(habit => (
            <div key={habit.id} className="home-habit-row">
              <div className={`home-habit-check ${habit.completedToday ? 'done' : ''}`} />
              <div className="home-task-text">{habit.name}</div>
              <div className="home-streak">🔥 {habit.streak} days</div>
            </div>
          ))}
        </div>

        <div className="home-card">
          <div className="home-card-title">
            Active goals
            <span onClick={() => navigate('/goals')}>View all</span>
          </div>
          {activeGoals.length === 0 && <div className="home-empty">No active goals</div>}
          {activeGoals.map(goal => (
            <div key={goal.id} className="home-goal-row">
              <div className="home-goal-top">
                <span className="home-task-text">{goal.title}</span>
                <span className="home-goal-pct">{Math.round((goal.current / goal.target) * 100)}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.round((goal.current / goal.target) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="home-card">
          <div className="home-card-title">
            Upcoming events
            <span onClick={() => navigate('/calendar')}>View all</span>
          </div>
          {upcomingEvents.length === 0 && <div className="home-empty">No upcoming events</div>}
          {upcomingEvents.map(event => (
            <div key={event.id} className="home-event-row">
              <div className="home-event-dot" style={{ background: event.color || '#09bfbd' }} />
              <div className="home-event-info">
                <div className="home-task-text">{event.title}</div>
                <div className="home-event-time">
                  {event.start.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          
        </div>
        <div className="home-stats" style={{ marginBottom: '1rem' }}>
  <div className="stat-card">
    <div className="stat-label">Applications</div>
    <div className="stat-value">{activeApplications}</div>
    <div className="stat-sub">active</div>
  </div>
  <div className="stat-card">
    <div className="stat-label">Interviews</div>
    <div className="stat-value">{upcomingInterviews}</div>
    <div className="stat-sub">upcoming</div>
  </div>
  <div className="stat-card">
    <div className="stat-label">Follow-ups</div>
    <div className="stat-value">{followUpsDue}</div>
    <div className="stat-sub">due</div>
  </div>
</div>
      </div>
    </div>
  )
}

export default Home