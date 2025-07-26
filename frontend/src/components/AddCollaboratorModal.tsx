import React, { useState } from 'react';
import { AddCollaboratorData } from '../services/projectService';
import './AddCollaboratorModal.css';

interface AddCollaboratorModalProps {
  onClose: () => void;
  onSubmit: (data: AddCollaboratorData) => Promise<void>;
  isLoading: boolean;
}

const AddCollaboratorModal: React.FC<AddCollaboratorModalProps> = ({
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<AddCollaboratorData>({
    email: '',
    role: 'contributor'
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Collaborator</h2>
          <button onClick={onClose} className="close-button" disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Enter collaborator's email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={isLoading}
              className="role-select"
            >
              <option value="viewer">Viewer - Can view project and specifications</option>
              <option value="contributor">Contributor - Can create and edit specifications</option>
              <option value="admin">Admin - Can manage collaborators and project settings</option>
            </select>
          </div>

          <div className="role-descriptions">
            <h4>Role Permissions:</h4>
            <ul>
              <li><strong>Viewer:</strong> Can view the project and all specifications</li>
              <li><strong>Contributor:</strong> Can create, edit, and delete specifications</li>
              <li><strong>Admin:</strong> Can manage collaborators and modify project settings</li>
            </ul>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !formData.email.trim()}
            >
              {isLoading ? 'Adding...' : 'Add Collaborator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollaboratorModal;