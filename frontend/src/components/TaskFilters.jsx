export default function TaskFilters({ filters, projects, onChange, onReset }) {
  const inputStyle = {
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>

      <select
        style={inputStyle}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value, page: 0 })}
      >
        <option value="">All Statuses</option>
        <option value="TODO">Todo</option>
        <option value="DOING">Doing</option>
        <option value="DONE">Done</option>
      </select>

      <select
        style={inputStyle}
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value, page: 0 })}
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select
        style={inputStyle}
        value={filters.projectId}
        onChange={(e) => onChange({ ...filters, projectId: e.target.value, page: 0 })}
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        style={inputStyle}
        value={filters.sortDir}
        onChange={(e) => onChange({ ...filters, sortDir: e.target.value, page: 0 })}
      >
        <option value="asc">Due Date ↑</option>
        <option value="desc">Due Date ↓</option>
      </select>

      <button
        onClick={onReset}
        style={{ ...inputStyle, background: '#f3f4f6', cursor: 'pointer' }}
      >
        Reset
      </button>
    </div>
  );
}