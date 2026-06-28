import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function EditTaskPage() {
  const { id }  = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [errors, setErrors]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    status:      'TODO',
    priority:    'MEDIUM',
    dueDate:     '',
    projectId:   '',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/tasks/${id}`),
      api.get('/projects'),
    ]).then(([taskRes, projRes]) => {
      const t = taskRes.data;
      setForm({
        title:       t.title,
        description: t.description || '',
        status:      t.status,
        priority:    t.priority,
        dueDate:     t.dueDate || '',
        projectId:   String(t.projectId),
      });
      setProjects(projRes.data);
    }).catch(() => {
      setErrors(['Failed to load task.']);
    }).finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setErrors([]);
    if (!form.title.trim()) { setErrors(['Title is required.']); return; }
    if (!form.projectId)    { setErrors(['Please select a project.']); return; }

    try {
      setLoading(true);
      await api.put(`/tasks/${id}`, {
        ...form,
        projectId: Number(form.projectId),
        dueDate:   form.dueDate || null,
      });
      navigate('/tasks');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) setErrors(data.errors);
      else setErrors([data?.message || 'Failed to update task.']);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    width: '100%',
    marginBottom: '14px',
    boxSizing: 'border-box',
  };

  if (fetching) return <p style={{ color: '#6b7280' }}>Loading task...</p>;

  return (
    <div style={{ maxWidth: '560px' }}>
      <h2 style={{ marginBottom: '24px' }}>Edit Task</h2>

      {errors.length > 0 && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          {errors.map((e, i) => (
            <div key={i} style={{ color: '#991b1b', fontSize: '14px' }}>{e}</div>
          ))}
        </div>
      )}

      <input
        style={inputStyle}
        name="title"
        placeholder="Title *"
        value={form.title}
        onChange={handleChange}
      />

      <textarea
        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
      />

      <select style={inputStyle} name="status" value={form.status} onChange={handleChange}>
        <option value="TODO">Todo</option>
        <option value="DOING">Doing</option>
        <option value="DONE">Done</option>
      </select>

      <select style={inputStyle} name="priority" value={form.priority} onChange={handleChange}>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <input
        style={inputStyle}
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
      />

      <select style={inputStyle} name="projectId" value={form.projectId} onChange={handleChange}>
        <option value="">Select a project *</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '9px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => navigate('/tasks')}
          style={{ padding: '9px 22px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}