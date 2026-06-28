import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import Pagination from '../components/Pagination';

const DEFAULT_FILTERS = {
  status:    '',
  priority:  '',
  projectId: '',
  sortDir:   'asc',
  page:       0,
  size:       10,
};

export default function TasksPage() {
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [totalPages, setTotal]    = useState(0);
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate  = useNavigate();
  const [params]  = useSearchParams();

  // If coming from Projects page with ?projectId=x
  useEffect(() => {
    const pid = params.get('projectId');
    if (pid) setFilters((f) => ({ ...f, projectId: pid }));
  }, []);

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { status, priority, projectId, sortDir, page, size } = filters;
      const res = await api.get('/tasks', {
        params: {
          ...(status    && { status }),
          ...(priority  && { priority }),
          ...(projectId && { projectId }),
          sortBy:  'dueDate',
          sortDir,
          page,
          size,
        },
      });
      setTasks(res.data.content);
      setTotal(res.data.totalPages);
      setError('');
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      setError('Failed to delete task.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      fetchTasks();
    } catch {
      setError('Failed to complete task.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Tasks</h2>
        <button
          onClick={() => navigate('/tasks/new')}
          style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          + New Task
        </button>
      </div>

      <TaskFilters
        filters={filters}
        projects={projects}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '14px' }}>{error}</div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No tasks found. Try different filters or create one.</p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
        ))
      )}

      <Pagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />
    </div>
  );
}