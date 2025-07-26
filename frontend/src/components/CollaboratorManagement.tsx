import React, { useState } from 'react';
import { ProjectDetail, projectService, Collaborator, AddCollaboratorData } from '../services/projectService';
import AddCollaboratorModal from './AddCollaboratorModal';
import './CollaboratorManagement.css';

interface CollaboratorManagementProps {
  project: ProjectDetail;
  onCollaboratorsChange: () => void;
  canEdit: boolean;
}

const CollaboratorManagement: React.FC<CollaboratorManagementProps> = ({
  project,
  onCollaboratorsChange,
  canEdit
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCollaborator = async (data: AddCollaboratorData) => {
    try {
      setIsLoading(true);
      await projectService.addCollaborator(project.id, data);
      setShowAddModal(false);
      onCollaboratorsChange();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      setIsLoading(true);
      await projectService.removeCollaborator(project.id, collaboratorId);
      onCollaboratorsChange();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: Collaborator['role']) => {
    try {
      setIsLoading(true);
      await projectService.updateCollaboratorRole(project.id, collaboratorId, newRole);
      onCollaboratorsChange();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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

  const canRemoveCollaborator = (collaborator: Collaborator) => {
    return canEdit && collaborator.role !== 'owner';
  };

  const canChangeRole = (collaborator: Collaborator) => {
    return canEdit && collaborator.role !== 'owner';
  };

  return (
    <div className="collaborator-management">
      <div className="collaborators-header">
        <h3>Project Collaborators</h3>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="add-collaborator-button"
            disabled={isLoading}
          >
            + Add Collaborator
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="collaborators-list">
        {project.collaborators.map((collaborator) => (
          <div key={collaborator.id} className="collaborator-item">
            <div className="collaborator-info">
              <div className="collaborator-avatar">
                {collaborator.first_name[0]}{collaborator.last_name[0]}
              </div>
              <div className="collaborator-details">
                <h4>{collaborator.first_name} {collaborator.last_name}</h4>
                <p>{collaborator.email}</p>
                <span className="joined-date">
                  Joined {new Date(collaborator.joined_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="collaborator-actions">
              {canChangeRole(collaborator) ? (
                <select
                  value={collaborator.role}
                  onChange={(e) => handleRoleChange(collaborator.id, e.target.value as Collaborator['role'])}
                  className="role-select"
                  disabled={isLoading}
                >
                  <option value="viewer">Viewer</option>
                  <option value="contributor">Contributor</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span className={getRoleBadgeClass(collaborator.role)}>
                  {collaborator.role}
                </span>
              )}
              
              {canRemoveCollaborator(collaborator) && (
                <button
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                  className="remove-button"
                  disabled={isLoading}
                  title="Remove collaborator"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {project.collaborators.length === 0 && (
        <div className="no-collaborators">
          <p>No collaborators yet.</p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="add-collaborator-button"
            >
              Add Your First Collaborator
            </button>
          )}
        </div>
      )}

      {showAddModal && (
        <AddCollaboratorModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCollaborator}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default CollaboratorManagement;