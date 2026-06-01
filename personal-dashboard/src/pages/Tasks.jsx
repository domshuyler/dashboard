import { useState } from 'react'
import './Tasks.css'

function Tasks({ tasks, setTasks }) {
  const [newTask, setNewTask] = useState({
    title: '',
    priority: '',
    dueDate: '',
    category: ''
  })

  const addTask = () => {
    if (!newTask.title.trim()) return
    setTasks([...tasks, {
      ...newTask,
      id: Date.now(),
      completed: false
    }])
    setNewTask({
      title: '',
      priority: '',
      dueDate: '',
      category: ''
    })
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  return (
    <div className="page">
      <h1>Tasks</h1>

      <div className="task-form">
        <input
          type="text"
          placeholder="Task title..."
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        >
          <option value="">No priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category..."
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <div className="task-info">
              <span className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.title}
              </span>
              <div className="task-meta">
                {task.priority && <span className={`priority priority-${task.priority}`}>{task.priority}</span>}
                {task.dueDate && <span className="due-date">Due: {task.dueDate}</span>}
                {task.category && <span className="category">{task.category}</span>}
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks