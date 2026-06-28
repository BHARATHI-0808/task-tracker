import { useNavigate } from 'react-router-dom';

const statusColor = {
  TODO:  { background: '#fef9c3', color: '#854d0e' },
  DOING: { background: '#dbeafe', color: '#1e40af' },
  DONE:  { background: '#dcfce7', color: '#166534' },
};

const priorityColor = {
  LOW:    { background: '#f3f4f6', color: '#374151' },
  MEDIUM: { background: '#fed7aa', color: '#9a3412' },
  HIGH:   { background: '#fee2e2', color: '#991b1b' },
};

export default function TaskCard({ task, onDelete, onComplete }) {
  const navigate = useNavigate();

  const badgeStyle = (colorMap, key) => ({
    ...colorMap[key],
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
  });

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      padding: '16px 20px',
      marginBottom: '12px',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{task.title}</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={badgeStyle(statusColor, task.status)}>{task.status}</span>
          <span style={badgeStyle(priorityColor, task.priority)}>{task.priority}</span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ margin: '8px 0 4px', color: '#6b7280', fontSize: '14px' }}>
          {task.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
        📁 {task.projectName}
        {task.dueDate && <span style={{ marginLeft: '14px' }}>📅 {task.dueDate}</span>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        {task.status !== 'DONE' && (
          <button
            onClick={() => onComplete(task.id)}
            style={{ padding: '5px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            ✓ Complete
          </button>
        )}
        <button
          onClick={() => navigate(`/tasks/${task.id}/edit`)}
          style={{ padding: '5px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}