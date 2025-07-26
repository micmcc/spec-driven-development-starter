import React, { useState } from 'react';
import { Specification, specService, CreateSpecData } from '../services/specService';
import CreateSpecModal from './CreateSpecModal';
import UploadSpecModal from './UploadSpecModal';
import './SpecificationManagement.css';

interface SpecificationManagementProps {
  projectId: string;
  specifications: Specification[];
  onSpecChange: () => void;
  canContribute: boolean;
  canEdit: boolean;
}

const SpecificationManagement: React.FC<SpecificationManagementProps> = ({
  projectId,
  specifications,
  onSpecChange,
  canContribute,
  canEdit
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSpec = async (data: CreateSpecData) => {
    try {
      setIsLoading(true);
      await specService.createSpec(projectId, data);
      setShowCreateModal(false);
      onSpecChange();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSpec = async (file: File, title?: string, filePath?: string, folder?: string) => {
    try {
      setIsLoading(true);
      await specService.uploadSpecFile(projectId, file, title, filePath, folder);
      setShowUploadModal(false);
      onSpecChange();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    if (!window.confirm('Are you sure you want to delete this specification? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      await specService.deleteSpec(specId);
      onSpecChange();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

  const getStatusBadgeClass = (status: string) => {
    return `status-badge status-${status}`;
  };

  const groupedSpecs = specifications.reduce((groups, spec) => {
    const folder = spec.file_path.includes('/') 
      ? spec.file_path.substring(0, spec.file_path.lastIndexOf('/'))
      : 'Root';
    
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(spec);
    return groups;
  }, {} as Record<string, Specification[]>);

  return (
    <div className="specification-management">
      <div className="specs-header">
        <h3>Specifications</h3>
        {canContribute && (
          <div className="spec-actions">
            <button
              onClick={() => setShowCreateModal(true)}
              className="create-spec-button"
              disabled={isLoading}
            >
              + New Spec
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="upload-spec-button"
              disabled={isLoading}
            >
              📁 Upload File
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {specifications.length === 0 ? (
        <div className="no-specs">
          <div className="no-specs-icon">📄</div>
          <h4>No specifications yet</h4>
          <p>Create your first specification to start documenting your project.</p>
          {canContribute && (
            <div className="no-specs-actions">
              <button
                onClick={() => setShowCreateModal(true)}
                className="create-spec-button"
              >
                Create Specification
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="upload-spec-button"
              >
                Upload File
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="specs-content">
          {Object.entries(groupedSpecs).map(([folder, folderSpecs]) => (
            <div key={folder} className="spec-folder">
              <h4 className="folder-title">
                📁 {folder} ({folderSpecs.length})
              </h4>
              <div className="specs-list">
                {folderSpecs.map((spec) => (
                  <div key={spec.id} className="spec-item">
                    <div className="spec-info">
                      <div className="spec-header">
                        <h5 className="spec-title">{spec.title}</h5>
                        <span className={getStatusBadgeClass(spec.status)}>
                          {spec.status}
                        </span>
                      </div>
                      <p className="spec-path">{spec.file_path}</p>
                      <div className="spec-meta">
                        <span>By {spec.author.first_name} {spec.author.last_name}</span>
                        <span>•</span>
                        <span>Updated {formatDate(spec.updated_at)}</span>
                        <span>•</span>
                        <span>v{spec.version}</span>
                      </div>
                    </div>
                    
                    <div className="spec-actions-menu">
                      <button className="action-button view">View</button>
                      {canContribute && (
                        <button className="action-button edit">Edit</button>
                      )}
                      {canEdit && (
                        <button 
                          className="action-button delete"
                          onClick={() => handleDeleteSpec(spec.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateSpecModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSpec}
          isLoading={isLoading}
        />
      )}

      {showUploadModal && (
        <UploadSpecModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUploadSpec}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default SpecificationManagement;