import { useState } from 'react'
import './Habits.css'
import { supabase } from '../supabase'

function Habits({ habits, setHabits }) {
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: ''
  })

  const today = new Date().toISOString().split('T')[0]

 const addHabit = async () => {
  if (!newHabit.name.trim()) return
  const habit = {
    id: Date.now(),
    name: newHabit.name,
    category: newHabit.category,
    streak: 0,
    last_completed: null,
    completed_today: false
  }
  const { error } = await supabase.from('habits').insert(habit)
  if (!error) {
    setHabits([...habits, {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      streak: habit.streak,
      lastCompleted: habit.last_completed,
      completedToday: habit.completed_today
    }])
  }
  setNewHabit({ name: '', category: '' })
}

const toggleHabit = async (id) => {
  const habit = habits.find(h => h.id === id)
  let updatedHabit

  if (habit.completedToday) {
    updatedHabit = {
      ...habit,
      completedToday: false,
      streak: habit.streak > 0 ? habit.streak - 1 : 0,
      lastCompleted: null
    }
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const newStreak = habit.lastCompleted === yesterdayStr ? habit.streak + 1 : 1
    updatedHabit = {
      ...habit,
      completedToday: true,
      streak: newStreak,
      lastCompleted: today
    }
  }

  const { error } = await supabase
    .from('habits')
    .update({
      completed_today: updatedHabit.completedToday,
      streak: updatedHabit.streak,
      last_completed: updatedHabit.lastCompleted
    })
    .eq('id', id)

  if (!error) {
    setHabits(habits.map(h => h.id === id ? updatedHabit : h))
  }
}

const deleteHabit = async (id) => {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (!error) {
    setHabits(habits.filter(h => h.id !== id))
  }
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