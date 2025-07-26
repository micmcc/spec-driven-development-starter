import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollaboratorManagement from '../CollaboratorManagement';
import { projectService } from '../../services/projectService';

// Mock the service
jest.mock('../../services/projectService');

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
    },
    {
      id: 'user2',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'contributor' as const,
      joined_at: '2023-01-02T00:00:00Z'
    }
  ]
};

describe('CollaboratorManagement', () => {
  const mockOnCollaboratorsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders collaborators list', () => {
    render(
      <CollaboratorManagement
        project={mockProject}
        onCollaboratorsChange={mockOnCollaboratorsChange}
        canEdit={true}
      />
    );

    expect(screen.getByText('Project Collaborators')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('shows add collaborator button when user can edit', () => {
    render(
      <CollaboratorManagement
        project={mockProject}
        onCollaboratorsChange={mockOnCollaboratorsChange}
        canEdit={true}
      />
    );

    expect(screen.getByText('+ Add Collaborator')).toBeInTheDocument();
  });

  test('hides add collaborator button when user cannot edit', () => {
    render(
      <CollaboratorManagement
        project={mockProject}
        onCollaboratorsChange={mockOnCollaboratorsChange}
        canEdit={false}
      />
    );

    expect(screen.queryByText('+ Add Collaborator')).not.toBeInTheDocument();
  });

  test('opens add collaborator modal when button is clicked', () => {
    render(
      <CollaboratorManagement
        project={mockProject}
        onCollaboratorsChange={mockOnCollaboratorsChange}
        canEdit={true}
      />
    );

    fireEvent.click(screen.getByText('+ Add Collaborator'));
    expect(screen.getByText('Add Collaborator')).toBeInTheDocument();
  });

  test('calls remove collaborator service when remove button is clicked', async () => {
    const mockRemove = jest.fn().mockResolvedValue(undefined);
    (projectService.removeCollaborator as jest.Mock) = mockRemove;
    
    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    render(
      <CollaboratorManagement
        project={mockProject}
        onCollaboratorsChange={mockOnCollaboratorsChange}
        canEdit={true}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]); // Should be Jane's remove button (owner can't be removed)

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith('1', 'user2');
      expect(mockOnCollaboratorsChange).toHaveBeenCalled();
    });
  });
});