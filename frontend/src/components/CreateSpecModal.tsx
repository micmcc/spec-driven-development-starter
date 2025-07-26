import React, { useState } from 'react';
import { CreateSpecData } from '../services/specService';
import './CreateSpecModal.css';

interface CreateSpecModalProps {
  onClose: () => void;
  onSubmit: (data: CreateSpecData) => Promise<void>;
  isLoading: boolean;
}

const CreateSpecModal: React.FC<CreateSpecModalProps> = ({
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateSpecData>({
    title: '',
    content: '',
    file_path: '',
    status: 'draft'
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.file_path.trim()) {
      setError('File path is required');
      return;
    }

    // Ensure file path has proper extension
    let filePath = formData.file_path.trim();
    if (!filePath.includes('.')) {
      filePath += '.md';
    }

    try {
      await onSubmit({
        ...formData,
        file_path: filePath
      });
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
      <div className="modal-content create-spec-modal">
        <div className="modal-header">
          <h2>Create New Specification</h2>
          <button onClick={onClose} className="close-button" disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="e.g., API Documentation, Database Schema"
            />
          </div>

          <div className="form-group">
            <label htmlFor="file_path">File Path *</label>
            <input
              type="text"
              id="file_path"
              name="file_path"
              value={formData.file_path}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="e.g., docs/api.md, specs/database-schema.md"
            />
            <small className="field-hint">
              Use forward slashes for folders. File extension will be added automatically if not specified.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Start writing your specification here..."
              rows={10}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="draft">Draft - Work in progress</option>
              <option value="review">Review - Ready for review</option>
              <option value="approved">Approved - Reviewed and approved</option>
              <option value="published">Published - Final and published</option>
            </select>
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
              disabled={isLoading || !formData.title.trim() || !formData.file_path.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Specification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpecModal;