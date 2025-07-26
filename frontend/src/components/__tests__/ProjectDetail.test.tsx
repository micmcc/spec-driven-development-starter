import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetail from '../ProjectDetail';

// Mock the services
jest.mock('../../services/projectService');
jest.mock('../../services/specService');

const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'A test project',
  owner_id: 'user1',
  owner_name: 'John Doe',
  is_public: false,
  status: 'active',
  user_role: 'owner',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  collaborators: [
    {
      id: 'user1',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'owner' as const,
      joined_at: '2023-01-01T00:00:00Z'
    }
  ]
};

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useNavigate: () => jest.fn()
}));

describe('ProjectDetail', () => {
  beforeEach(() => {
    const { projectService } = require('../../services/projectService');
    const { specService } = require('../../services/specService');
    
    projectService.getProject = jest.fn().mockResolvedValue({ project: mockProject });
    specService.getSpecsByProject = jest.fn().mockResolvedValue({ specifications: [], count: 0 });
  });

  test('renders project loading state', () => {
    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  test('renders project name when loaded', async () => {
    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );
    
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
  });

  test('shows all tab options for owner', async () => {
    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );
    
    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText(/Specifications/)).toBeInTheDocument();
    expect(screen.getByText(/Collaborators/)).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});