import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  owner_name: string;
  is_public: boolean;
  status: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  collaborators: Collaborator[];
}

export interface CreateProjectData {
  name: string;
  description: string;
  is_public: boolean;
}

export interface Collaborator {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
  joined_at: string;
}

export interface AddCollaboratorData {
  email: string;
  role: 'admin' | 'contributor' | 'viewer';
}

class ProjectService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getProjects(): Promise<{ projects: Project[]; count: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Get projects failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch projects');
    }
  }

  async getProject(id: string): Promise<{ project: ProjectDetail }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Get project failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch project');
    }
  }

  async createProject(data: CreateProjectData): Promise<{ project: Project }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Create project failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to create project');
    }
  }

  async updateProject(id: string, data: Partial<CreateProjectData>): Promise<{ project: Project }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Update project failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to update project');
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${id}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      console.error('Delete project failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete project');
    }
  }

  // Collaborator management methods
  async addCollaborator(projectId: string, data: AddCollaboratorData): Promise<{ collaborator: Collaborator }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/collaborators`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Add collaborator failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to add collaborator');
    }
  }

  async removeCollaborator(projectId: string, collaboratorId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}/collaborators/${collaboratorId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      console.error('Remove collaborator failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove collaborator');
    }
  }

  async updateCollaboratorRole(projectId: string, collaboratorId: string, role: Collaborator['role']): Promise<{ role: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${projectId}/collaborators/${collaboratorId}`, 
        { role }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update collaborator role failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to update collaborator role');
    }
  }
}

export const projectService = new ProjectService();
