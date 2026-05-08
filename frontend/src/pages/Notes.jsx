import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Check, X, Briefcase, Calendar as CalendarIcon,
  Search, Trash2, ClipboardList, Edit2, Save
} from 'lucide-react';
import { taskService } from '../services/api';
import './Notes.css';

export default function Notes() {
  const { state, dispatch, addToast } = useApp();
  const { jobs, jobTasks } = state;
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedJobId) return;

    try {
      const newTask = await taskService.createTask({
        jobId: selectedJobId,
        text: newTaskText.trim()
      });
      dispatch({ type: 'ADD_TASK', payload: newTask });
      setNewTaskText('');
      addToast('Task added successfully', 'success');
    } catch (err) {
      addToast('Failed to add task', 'error');
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = async () => {
    if (!editingText.trim()) return;
    try {
      const updated = await taskService.updateTask(editingTaskId, { text: editingText.trim() });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      setEditingTaskId(null);
      setEditingText('');
      addToast('Task updated', 'success');
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const toggleTask = async (task) => {
    try {
      const updated = await taskService.updateTask(task.id, { completed: !task.completed });
      dispatch({ type: 'SET_TASKS', payload: state.jobTasks.map(t => t.id === task.id ? updated : t) });
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  const deleteTask = async (taskId) => {
    if (confirm('Delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        dispatch({ type: 'DELETE_TASK', payload: taskId });
        addToast('Task removed', 'info');
      } catch (err) {
        addToast('Failed to delete task', 'error');
      }
    }
  };

  const filteredTasks = jobTasks.filter(task => {
    const job = jobs.find(j => j.id === task.jobId);
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const tasksByJob = filteredTasks.reduce((acc, task) => {
    if (!acc[task.jobId]) acc[task.jobId] = [];
    acc[task.jobId].push(task);
    return acc;
  }, {});

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <h1 className="page-title">Job Notes & Tasks</h1>
          <p className="page-subtitle">Stay organized with per-job checklists</p>
        </div>
        <div className="notes-search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search tasks or jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="notes-grid">
        <aside className="notes-sidebar">
          <div className="card card-padding">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Add New Task</h3>
            <form onSubmit={handleAddTask} className="task-form">
              <div className="input-group">
                <label className="input-label">Select Job</label>
                <select
                  className="input-field"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">What needs to be done?</label>
                <textarea
                  className="input-field"
                  placeholder="e.g. Charge batteries, Pack drone..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>
                <Plus size={18} /> Add Task
              </button>
            </form>
          </div>
        </aside>

        <main className="notes-content">
          {Object.keys(tasksByJob).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ClipboardList size={32} /></div>
              <h3 className="empty-state-title">No tasks found</h3>
              <p className="empty-state-desc">Select a job on the left to add your first task.</p>
            </div>
          ) : (
            Object.keys(tasksByJob).sort((a, b) => {
              const jobA = jobs.find(j => j.id === a);
              const jobB = jobs.find(j => j.id === b);
              return new Date(jobA?.date) - new Date(jobB?.date);
            }).map(jobId => {
              const job = jobs.find(j => j.id === jobId);
              const tasks = tasksByJob[jobId];
              const completedCount = tasks.filter(t => t.completed).length;

              return (
                <div key={jobId} className="job-task-group card">
                  <div className="job-task-header">
                    <div className="job-info">
                      <div className="job-title-row">
                        <Briefcase size={16} />
                        <h3 className="job-title">{job?.title}</h3>
                      </div>
                      <div className="job-meta">
                        <span className="job-date"><CalendarIcon size={12} /> {job?.date}</span>
                        <span className="job-client">Client: {job?.client}</span>
                      </div>
                    </div>
                    <div className="job-progress">
                      <div className="progress-text">{completedCount} / {tasks.length} Done</div>
                      <div className="progress-bar-mini">
                        <div
                          className="progress-fill"
                          style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="task-list">
                    {tasks.map(task => (
                      <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''} ${editingTaskId === task.id ? 'editing' : ''}`}>
                        {editingTaskId === task.id ? (
                          <div className="task-edit-row">
                            <input
                              type="text"
                              className="input-field input-sm"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            />
                            <button className="btn-icon-ghost" onClick={saveEdit}><Save size={16} /></button>
                            <button className="btn-icon-ghost" onClick={cancelEdit}><X size={16} /></button>
                          </div>
                        ) : (
                          <>
                            <button
                              className="task-checkbox"
                              onClick={() => toggleTask(task)}
                            >
                              {task.completed && <Check size={14} />}
                            </button>
                            <span className="task-text">{task.text}</span>
                            <div className="task-actions">
                              <button
                                className="task-action-btn edit"
                                onClick={() => startEditing(task)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="task-action-btn delete"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
