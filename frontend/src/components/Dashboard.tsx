import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService, Project } from '../services/projectService';
import CreateProjectModal from './CreateProjectModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getProjects();
      setProjects(response.projects);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: { name: string; description: string; is_public: boolean }) => {
    try {
      await projectService.createProject(projectData);
      setShowCreateModal(false);
      await loadProjects(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner': return 'role-badge role-owner';
      case 'admin': return 'role-badge role-admin';
      case 'contributor': return 'role-badge role-contributor';
      case 'viewer': return 'role-badge role-viewer';
      default: return 'role-badge';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.first_name} {user?.last_name}</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowCreateModal(true)}
              className="create-button"
            >
              + New Project
            </button>
            <button onClick={logout} className="logout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <div className="projects-section">
          <div className="section-header">
            <h2>Your Projects</h2>
            <span className="project-count">{projects.length} projects</span>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started with collaborative specification development.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="create-button"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={getRoleBadgeClass(project.user_role)}>
                      {project.user_role}
                    </span>
                  </div>
                  
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>
                  
                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Owner:</span>
                      <span className="meta-value">{project.owner_name}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Status:</span>
                      <span className={`status-badge status-${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Visibility:</span>
                      <span className="meta-value">
                        {project.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="project-footer">
                    <span className="project-date">
                      Updated {formatDate(project.updated_at)}
                    </span>
                    <div className="project-actions">
                      <button 
                        className="action-button primary"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        Open
                      </button>
                      {['owner', 'admin'].includes(project.user_role) && (
                        <button 
                          className="action-button secondary"
                          onClick={() => navigate(`/projects/${project.id}?tab=settings`)}
                        >
                          Settings
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};

export default Dashboard;
