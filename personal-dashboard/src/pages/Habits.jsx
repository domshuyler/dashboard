import { useState, useEffect } from 'react'
import './Habits.css'

function Habits() {
const [habits, setHabits] = useState(() => {
  const saved = localStorage.getItem('habits')
  return saved ? JSON.parse(saved) : []
})
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: ''
  })
useEffect(() => {
  localStorage.setItem('habits', JSON.stringify(habits))
}, [habits])
  const today = new Date().toISOString().split('T')[0]

  const addHabit = () => {
    if (!newHabit.name.trim()) return
    setHabits([...habits, {
      ...newHabit,
      id: Date.now(),
      streak: 0,
      lastCompleted: null,
      completedToday: false
    }])
    setNewHabit({ name: '', category: '' })
  }

  const toggleHabit = (id) => {
    setHabits(habits.map(habit => {
      if (habit.id !== id) return habit

      if (habit.completedToday) {
        return {
          ...habit,
          completedToday: false,
          streak: habit.streak > 0 ? habit.streak - 1 : 0,
          lastCompleted: null
        }
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const newStreak = habit.lastCompleted === yesterdayStr ? habit.streak + 1 : 1

      return {
        ...habit,
        completedToday: true,
        streak: newStreak,
        lastCompleted: today
      }
    }))
  }

  const deleteHabit = (id) => {
    setHabits(habits.filter(habit => habit.id !== id))
  }

  const grouped = habits.reduce((acc, habit) => {
    const key = habit.category || 'Uncategorized'
    if (!acc[key]) acc[key] = []
    acc[key].push(habit)
    return acc
  }, {})

  return (
    <div className="page">
      <h1>Habits</h1>

      <div className="task-form">
        <input
          type="text"
          placeholder="Habit name..."
          value={newHabit.name}
          onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category..."
          value={newHabit.category}
          onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
        />
        <button onClick={addHabit}>Add Habit</button>
      </div>

      {Object.entries(grouped).map(([category, habits]) => (
        <div key={category} className="habit-group">
          <h2 className="habit-category">{category}</h2>
          <div className="task-list">
            {habits.map(habit => (
              <div key={habit.id} className={`task-item ${habit.completedToday ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={habit.completedToday}
                  onChange={() => toggleHabit(habit.id)}
                />
                <div className="task-info">
                  <span className="task-title">{habit.name}</span>
                  <div className="task-meta">
                    <span className="streak">🔥 {habit.streak} day streak</span>
                  </div>
                </div>
                <button onClick={() => deleteHabit(habit.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Habits