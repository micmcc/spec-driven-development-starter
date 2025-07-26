import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Types
export interface Specification {
  id: string;
  title: string;
  content: string;
  file_path: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  version: number;
  project_id: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateSpecData {
  title: string;
  content?: string;
  file_path: string;
  status?: Specification['status'];
}

export interface UpdateSpecData {
  title?: string;
  content?: string;
  file_path?: string;
  status?: Specification['status'];
}

class SpecService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getSpecsByProject(projectId: string): Promise<{ specifications: Specification[]; count: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/specs`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Get specs failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch specifications');
    }
  }

  async getSpec(id: string): Promise<{ specification: Specification }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/specs/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Get spec failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch specification');
    }
  }

  async createSpec(projectId: string, data: CreateSpecData): Promise<{ specification: Specification }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/specs`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Create spec failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to create specification');
    }
  }

  async updateSpec(id: string, data: UpdateSpecData): Promise<{ specification: Specification }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/specs/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Update spec failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to update specification');
    }
  }

  async deleteSpec(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/specs/${id}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      console.error('Delete spec failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete specification');
    }
  }

  async uploadSpecFile(projectId: string, file: File, title?: string, filePath?: string, folder?: string): Promise<{ specification: Specification }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (filePath) formData.append('file_path', filePath);
      if (folder) formData.append('folder', folder);

      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/specs/upload`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Upload spec file failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload specification file');
    }
  }
}

export const specService = new SpecService();