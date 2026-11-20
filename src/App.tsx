
import { useEffect, useState } from "react";
import "./App.css";

type Task = {
  id: number;
  name: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("smartTasks") || "[]");
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    category: "",
    date: "",
    time: "",
    duration: "1",
    priority: "Medium" as Task["priority"],
  });

  useEffect(() => {
    localStorage.setItem("smartTasks", JSON.stringify(tasks));
  }, [tasks]);

  const getEnd = (task: Task) =>
    new Date(`${task.date}T${task.time}`).getTime();

  const getStart = (task: Task) =>
    getEnd(task) - task.duration * 60 * 60 * 1000;

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const clashes: [Task, Task][] = [];

  for (let i = 0; i < pendingTasks.length; i++) {
    for (let j = i + 1; j < pendingTasks.length; j++) {
      const a = pendingTasks[i];
      const b = pendingTasks[j];

      if (getStart(a) < getEnd(b) &&
          getStart(b) < getEnd(a)) {
        clashes.push([a, b]);
      }
    }
  }

  const addTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.date || !form.time) {
      return;
    }

    const duration = Number(form.duration);

    if (!Number.isFinite(duration) || duration <= 0) {
      alert("Enter a valid task duration.");
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category.trim() || "General",
      date: form.date,
      time: form.time,
      duration,
      priority: form.priority,
      completed: false,
    };

    setTasks(prev => [...prev, newTask]);

    setForm({
      name: "",
      category: "",
      date: "",
      time: "",
      duration: "1",
      priority: "Medium",
    });
  };

  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id: number) => {
    if (window.confirm("Delete this task?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const visibleTasks = tasks
    .filter(t => {
      if (filter === "Pending") return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .sort((a, b) => getEnd(a) - getEnd(b));

  const nextTask = [...pendingTasks].sort(
    (a, b) => getEnd(a) - getEnd(b)
  )[0];

  const highPriority = pendingTasks.filter(
    t => t.priority === "High"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>⏳ TaskFlow</h2>
        <p className="side-label">SMART TASK PLANNER</p>

        <nav>
          <a href="#dashboard">▦ Dashboard</a>
          <a href="#add-task">＋ Add Task</a>
          <a href="#my-tasks">☷ My Tasks</a>
          <a href="#clashes">⚠ Deadline Clashes</a>
        </nav>

        <div className="side-bottom">
          <h3>Plan Smart.</h3>
          <p>Finish On Time.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Deadline Clash Detector</h1>
            <p>Manage your deadlines. Stay organized. Work smarter.</p>
          </div>
          <div className="profile">👤 Student</div>
        </header>

        <section id="dashboard">
          <div className="section-title">
            <h2>Dashboard Overview</h2>
            <span>YOUR PRODUCTIVITY AT A GLANCE</span>
          </div>

          <div className="stats">
            <div className="stat-card purple">
              <span>Total Tasks</span>
              <h2>{tasks.length}</h2>
              <small>All your activities</small>
            </div>

            <div className="stat-card green">
              <span>Completed</span>
              <h2>{completedTasks.length}</h2>
              <small>Successfully finished</small>
            </div>

            <div className="stat-card orange">
              <span>Pending</span>
              <h2>{pendingTasks.length}</h2>
              <small>Waiting for completion</small>
            </div>

            <div className="stat-card red">
              <span>Deadline Clashes</span>
              <h2>{clashes.length}</h2>
              <small>Schedule conflicts</small>
            </div>
          </div>
        </section>

        <section id="add-task" className="panel">
          <div className="panel-heading">
            <div>
              <h2>＋ Add New Task</h2>
              <p>Enter your task details below</p>
            </div>
          </div>

          <form onSubmit={addTask}>
            <div className="form-grid">
              <div className="field">
                <label>Task Name</label>
                <input
                  placeholder="e.g. DBMS Assignment"
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Subject / Category</label>
                <input
                  placeholder="e.g. Database Management"
                  value={form.category}
                  onChange={e =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Deadline Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e =>
                    setForm({ ...form, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Deadline Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e =>
                    setForm({ ...form, time: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Estimated Duration (Hours)</label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={form.duration}
                  onChange={e =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Priority</label>
                <select
                  value={form.priority}
                  onChange={e =>
                    setForm({
                      ...form,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <button className="primary-btn" type="submit">
              + Add Task
            </button>
          </form>
        </section>

        <section id="clashes" className="panel">
          <div className="panel-heading">
            <div>
              <h2>⚠ Deadline Clash Detector</h2>
              <p>Automatically identify overlapping work schedules</p>
            </div>
            <span className="clash-badge">{clashes.length} Conflicts</span>
          </div>

          {clashes.length === 0 ? (
            <div className="success-message">
              ✓ No overlapping work schedules detected. Your schedule
              looks good!
            </div>
          ) : (
            clashes.map(([a, b]) => (
              <div className="alert" key={`${a.id}-${b.id}`}>
                <strong>⚠ Schedule Conflict Detected</strong>
                <p>
                  <b>{a.name}</b> overlaps with <b>{b.name}</b>.
                </p>
                <small>
                  Review their estimated work periods and reschedule
                  one task.
                </small>
              </div>
            ))
          )}
        </section>

        <section id="my-tasks" className="panel">
          <div className="panel-heading task-heading">
            <div>
              <h2>☷ My Tasks</h2>
              <p>View and manage your activities</p>
            </div>

            <select
              className="filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>

          {visibleTasks.length === 0 ? (
            <div className="empty">
              No tasks found. Add your first task!
            </div>
          ) : (
            visibleTasks.map(task => (
              <div
                className={`task-card ${task.completed ? "is-done" : ""}`}
                key={task.id}
              >
                <div className="task-info">
                  <div className="task-title">
                    <h3>{task.name}</h3>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>

                  <p>📚 {task.category}</p>
                  <p>📅 {task.date} &nbsp; | &nbsp; ⏰ {task.time}</p>
                  <p>⌛ Estimated duration: {task.duration} hours</p>
                  <p>Status: {task.completed ? "Completed" : "Pending"}</p>
                </div>

                <div className="task-actions">
                  <button
                    className="complete-btn"
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? "Undo" : "✓ Complete"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="panel">
          <h2>💡 Smart Planning Suggestions</h2>

          {pendingTasks.length === 0 ? (
            <div className="suggestion">
              Add a task to receive smart planning suggestions.
            </div>
          ) : (
            <div className="suggestion-list">
              {nextTask && (
                <div className="suggestion">
                  📌 Your next deadline is <b>{nextTask.name}</b> on{" "}
                  {nextTask.date} at {nextTask.time}.
                </div>
              )}

              {highPriority > 0 && (
                <div className="suggestion">
                  🔥 You have {highPriority} high-priority task(s).
                  Give them attention first.
                </div>
              )}

              {clashes.length > 0 && (
                <div className="suggestion warning">
                  ⚠ Reschedule your overlapping tasks to reduce workload
                  conflicts.
                </div>
              )}

              {clashes.length === 0 && (
                <div className="suggestion">
                  ✓ No schedule conflicts detected. Keep following your plan!
                </div>
              )}

              {pendingTasks.some(t => getEnd(t) < Date.now()) && (
                <div className="suggestion warning">
                  ⏰ You have overdue tasks. Review and update their deadlines.
                </div>
              )}
            </div>
          )}
        </section>

        <footer>
          <h3>TaskFlow</h3>
          <p>Deadline Clash Detector & Smart Task Planner</p>
          <small>College Project • 2026</small>
        </footer>
      </main>
    </div>
  );
}

export default App;
