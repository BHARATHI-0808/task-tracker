import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <Routes>
          <Route path="/"               element={<Navigate to="/projects" replace />} />
          <Route path="/projects"       element={<ProjectsPage />} />
          <Route path="/tasks"          element={<TasksPage />} />
          <Route path="/tasks/new"      element={<CreateTaskPage />} />
          <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


