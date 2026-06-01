import { useState } from 'react'
function Tasks() {
    const [tasks, setTasks] = useState([])
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
          <span>{task.title}</span>
        </div>
      ))}
    </div>
  </div>
  )
}

export default Tasks