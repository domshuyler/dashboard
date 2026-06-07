import { useState, useEffect } from 'react'
import './Goals.css'
import { supabase } from '../supabase'

function Goals() {
 document.title = 'Goals — Dashboard'
 const [goals, setGoals] = useState(() => {
  const saved = localStorage.getItem('goals')
  return saved ? JSON.parse(saved) : []
})
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: '',
    deadline: '',
    target: '',
    current: 0,
    unit: ''
  })

  const addGoal = async () => {
  if (!newGoal.title.trim()) return
  const goal = {
    id: Date.now(),
    title: newGoal.title,
    category: newGoal.category,
    deadline: newGoal.deadline,
    target: newGoal.target ? Number(newGoal.target) : null,
    current: 0,
    unit: newGoal.unit,
    completed: false
  }
  const { error } = await supabase.from('goals').insert(goal)
  if (!error) {
    setGoals([...goals, goal])
  }
  setNewGoal({ title: '', category: '', deadline: '', target: '', current: 0, unit: '' })
}

const updateProgress = async (id, value) => {
  const goal = goals.find(g => g.id === id)
  const newCurrent = Math.min(Number(value), goal.target)
  const completed = newCurrent >= goal.target

  const { error } = await supabase
    .from('goals')
    .update({ current: newCurrent, completed })
    .eq('id', id)

  if (!error) {
    setGoals(goals.map(g => g.id === id ? { ...g, current: newCurrent, completed } : g))
  }
}

const deleteGoal = async (id) => {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (!error) {
    setGoals(goals.filter(g => g.id !== id))
  }
}

  const getProgress = (goal) => {
    if (!goal.target) return null
    return Math.round((goal.current / goal.target) * 100)
  }

  return (
    <div className="page">
      <h1>Goals</h1>

      <div className="task-form">
        <input
          type="text"
          placeholder="Goal title..."
          value={newGoal.title}
          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category..."
          value={newGoal.category}
          onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
        />
        <input
          type="date"
          value={newGoal.deadline}
          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
        />
        <input
          type="number"
          placeholder="Target (optional)..."
          value={newGoal.target}
          onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
        />
        <input
          type="text"
          placeholder="Unit (miles, pages...)..."
          value={newGoal.unit}
          onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
        />
        <button onClick={addGoal}>Add Goal</button>
      </div>

      <div className="goal-list">
        {goals.map(goal => (
          <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
            <div className="goal-header">
              <div className="task-info">
                <span className="task-title">{goal.title}</span>
                <div className="task-meta">
                  {goal.category && <span className="category">{goal.category}</span>}
                  {goal.deadline && <span className="due-date">Due: {goal.deadline}</span>}
                  {goal.completed && <span className="priority priority-low">Completed</span>}
                </div>
              </div>
              <button onClick={() => deleteGoal(goal.id)}>Delete</button>
            </div>

            {goal.target && (
              <div className="goal-progress">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${getProgress(goal)}%` }}
                  />
                </div>
                <div className="progress-info">
                  <span>{goal.current} / {goal.target} {goal.unit}</span>
                  <span>{getProgress(goal)}%</span>
                </div>
                <input
                  type="number"
                  placeholder="Update progress..."
                  onBlur={(e) => {
                    updateProgress(goal.id, e.target.value)
                    e.target.value = ''
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Goals