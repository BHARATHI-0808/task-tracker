import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProjectsPage() {
  const [projects, setProjects]   = useState([]);
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch {
      setError('Failed to load projects.');
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { setError('Project name is required.'); return; }
    try {
      setLoading(true);
      await api.post('/projects', { name, description });
      setName('');
      setDesc('');
      setError('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch {
      setError('Failed to delete project.');
    }
  };

  const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '12px',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    width: '100%',
    marginBottom: '10px',
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Projects</h2>

      {/* Create form */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '32px',
      }}>
        <h3 style={{ marginTop: 0 }}>New Project</h3>

        {error && (
          <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <input
          style={inputStyle}
          placeholder="Project name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            padding: '8px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {loading ? 'Creating...' : '+ Create Project'}
        </button>
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No projects yet. Create one above.</p>
      ) : (
        projects.map((p) => (
          <div key={p.id} style={cardStyle}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>{p.name}</div>
              {p.description && (
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  {p.description}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate(`/tasks?projectId=${p.id}`)}
                style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
              >
                View Tasks
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}