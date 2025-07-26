import React, { useState } from 'react';
import './UploadSpecModal.css';

interface UploadSpecModalProps {
  onClose: () => void;
  onSubmit: (file: File, title?: string, filePath?: string, folder?: string) => Promise<void>;
  isLoading: boolean;
}

const UploadSpecModal: React.FC<UploadSpecModalProps> = ({
  onClose,
  onSubmit,
  isLoading
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [filePath, setFilePath] = useState('');
  const [folder, setFolder] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const allowedTypes = [
    'text/plain',
    'text/markdown',
    'application/json',
    'text/yaml',
    'application/yaml',
    'text/x-yaml'
  ];

  const allowedExtensions = ['.md', '.txt', '.json', '.yaml', '.yml'];

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Only text, markdown, JSON, and YAML files are allowed');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    
    // Auto-populate title and file path if not set
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setTitle(nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    }
    
    if (!filePath) {
      setFilePath(selectedFile.name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      await onSubmit(file, title || undefined, filePath || undefined, folder || undefined);
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
      <div className="modal-content upload-spec-modal">
        <div className="modal-header">
          <h2>Upload Specification File</h2>
          <button onClick={onClose} className="close-button" disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>File Upload *</label>
            <div 
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="file-selected">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="remove-file"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="file-drop-content">
                  <div className="drop-icon">📁</div>
                  <p>Drop your file here or click to browse</p>
                  <small>Supports: .md, .txt, .json, .yaml, .yml (max 10MB)</small>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                accept=".md,.txt,.json,.yaml,.yml"
                className="file-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="Auto-generated from filename if empty"
            />
          </div>

          <div className="form-group">
            <label htmlFor="filePath">File Path</label>
            <input
              type="text"
              id="filePath"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              disabled={isLoading}
              placeholder="Auto-generated from filename if empty"
            />
            <small className="field-hint">
              Override the file path if you want to organize it differently
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="folder">Folder (Optional)</label>
            <input
              type="text"
              id="folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., docs, specs, requirements"
            />
            <small className="field-hint">
              Organize your specification into folders
            </small>
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
              disabled={isLoading || !file}
            >
              {isLoading ? 'Uploading...' : 'Upload Specification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSpecModal;