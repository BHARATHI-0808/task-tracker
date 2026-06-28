import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    marginRight: '20px',
    textDecoration: 'none',
    fontWeight: pathname.startsWith(path) ? 'bold' : 'normal',
    color: pathname.startsWith(path) ? '#2563eb' : '#374151',
  });

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '32px' }}>
        📋 Task Tracker
      </span>
      <Link to="/projects" style={linkStyle('/projects')}>Projects</Link>
      <Link to="/tasks"    style={linkStyle('/tasks')}>Tasks</Link>
    </nav>
  );
}