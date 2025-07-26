import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { projectService, ProjectDetail as ProjectDetailType } from '../services/projectService';
import { specService, Specification } from '../services/specService';
import CollaboratorManagement from './CollaboratorManagement';
import SpecificationManagement from './SpecificationManagement';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectDetailType | null>(null);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  const loadProject = React.useCallback(async () => {
    try {
      if (!id) return;
      setIsLoading(true);
      const response = await projectService.getProject(id);
      setProject(response.project);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadSpecifications = React.useCallback(async () => {
    try {
      if (!id) return;
      const response = await specService.getSpecsByProject(id);
      setSpecifications(response.specifications);
    } catch (err: any) {
      console.error('Failed to load specifications:', err);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    loadSpecifications();
  }, [loadProject, loadSpecifications]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'collaborators', 'specifications', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const canEdit = project && ['owner', 'admin'].includes(project.user_role);
  const canContribute = project && ['owner', 'admin', 'contributor'].includes(project.user_role);

  if (isLoading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-error">
        <h2>Project Not Found</h2>
        <p>{error || 'The project you are looking for does not exist or you do not have access to it.'}</p>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="project-detail">
      <header className="project-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="project-info">
            <h1>{project.name}</h1>
            <p className="project-description">{project.description || 'No description provided'}</p>
            <div className="project-meta">
              <span className="meta-item">Owner: {project.owner_name}</span>
              <span className="meta-item">
                Status: <span className={`status-badge status-${project.status}`}>{project.status}</span>
              </span>
              <span className="meta-item">
                Visibility: {project.is_public ? 'Public' : 'Private'}
              </span>
              <span className="meta-item">
                Your Role: <span className={`role-badge role-${project.user_role}`}>{project.user_role}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <nav className="project-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'specifications' ? 'active' : ''}`}
          onClick={() => handleTabChange('specifications')}
        >
          Specifications ({specifications.length})
        </button>
        <button 
          className={`tab ${activeTab === 'collaborators' ? 'active' : ''}`}
          onClick={() => handleTabChange('collaborators')}
        >
          Collaborators ({project.collaborators.length})
        </button>
        {canEdit && (
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            Settings
          </button>
        )}
      </nav>

      <main className="project-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Project Summary</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-number">{specifications.length}</span>
                    <span className="stat-label">Specifications</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{project.collaborators.length}</span>
                    <span className="stat-label">Collaborators</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">
                      {specifications.filter(s => s.status === 'published').length}
                    </span>
                    <span className="stat-label">Published</span>
                  </div>
                </div>
              </div>
              
              <div className="overview-card">
                <h3>Recent Specifications</h3>
                <div className="recent-specs">
                  {specifications.slice(0, 5).map(spec => (
                    <div key={spec.id} className="recent-spec-item">
                      <span className="spec-title">{spec.title}</span>
                      <span className={`spec-status status-${spec.status}`}>{spec.status}</span>
                    </div>
                  ))}
                  {specifications.length === 0 && (
                    <p className="no-specs">No specifications yet. Click on the Specifications tab to create one.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <SpecificationManagement 
            projectId={project.id}
            specifications={specifications}
            onSpecChange={loadSpecifications}
            canContribute={!!canContribute}
            canEdit={!!canEdit}
          />
        )}

        {activeTab === 'collaborators' && (
          <CollaboratorManagement 
            project={project}
            onCollaboratorsChange={loadProject}
            canEdit={!!canEdit}
          />
        )}

        {activeTab === 'settings' && canEdit && (
          <div className="settings-tab">
            <div className="settings-card">
              <h3>Project Settings</h3>
              <p>Project settings functionality will be implemented here.</p>
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <p>Irreversible and destructive actions.</p>
                <button className="danger-button" disabled>
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;