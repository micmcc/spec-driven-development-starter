import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SpecificationManagement from '../SpecificationManagement';
import { specService } from '../../services/specService';

// Mock the service
jest.mock('../../services/specService');

const mockSpecifications = [
  {
    id: '1',
    title: 'API Documentation',
    content: '# API Documentation\n\nThis is the API documentation.',
    file_path: 'docs/api.md',
    status: 'published' as const,
    version: 1,
    project_id: 'project1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    author: {
      id: 'user1',
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: '2',
    title: 'Database Schema',
    content: '# Database Schema',
    file_path: 'specs/database.md',
    status: 'draft' as const,
    version: 1,
    project_id: 'project1',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    author: {
      id: 'user2',
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

describe('SpecificationManagement', () => {
  const mockOnSpecChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders specifications list', () => {
    render(
      <SpecificationManagement
        projectId="project1"
        specifications={mockSpecifications}
        onSpecChange={mockOnSpecChange}
        canContribute={true}
        canEdit={true}
      />
    );

    expect(screen.getByText('Specifications')).toBeInTheDocument();
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Database Schema')).toBeInTheDocument();
  });

  test('shows create and upload buttons when user can contribute', () => {
    render(
      <SpecificationManagement
        projectId="project1"
        specifications={mockSpecifications}
        onSpecChange={mockOnSpecChange}
        canContribute={true}
        canEdit={false}
      />
    );

    expect(screen.getByText('+ New Spec')).toBeInTheDocument();
    expect(screen.getByText('📁 Upload File')).toBeInTheDocument();
  });

  test('hides create and upload buttons when user cannot contribute', () => {
    render(
      <SpecificationManagement
        projectId="project1"
        specifications={mockSpecifications}
        onSpecChange={mockOnSpecChange}
        canContribute={false}
        canEdit={false}
      />
    );

    expect(screen.queryByText('+ New Spec')).not.toBeInTheDocument();
    expect(screen.queryByText('📁 Upload File')).not.toBeInTheDocument();
  });

  test('shows empty state when no specifications', () => {
    render(
      <SpecificationManagement
        projectId="project1"
        specifications={[]}
        onSpecChange={mockOnSpecChange}
        canContribute={true}
        canEdit={true}
      />
    );

    expect(screen.getByText('No specifications yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first specification to start documenting your project.')).toBeInTheDocument();
  });

  test('opens create spec modal when button is clicked', () => {
    render(
      <SpecificationManagement
        projectId="project1"
        specifications={mockSpecifications}
        onSpecChange={mockOnSpecChange}
        canContribute={true}
        canEdit={true}
      />
    );

    fireEvent.click(screen.getByText('+ New Spec'));
    expect(screen.getByText('Create New Specification')).toBeInTheDocument();
  });

  test('calls delete spec service when delete button is clicked', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (specService.deleteSpec as jest.Mock) = mockDelete;
    
    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    render(
      <SpecificationManagement
        projectId="project1"
        specifications={mockSpecifications}
        onSpecChange={mockOnSpecChange}
        canContribute={true}
        canEdit={true}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1');
      expect(mockOnSpecChange).toHaveBeenCalled();
    });
  });

  test('groups specifications by folder', () => {
    render(
      <SpecificationManagement
        projectId="project1"
        specifications={mockSpecifications}
        onSpecChange={mockOnSpecChange}
        canContribute={true}
        canEdit={true}
      />
    );

    expect(screen.getByText('📁 docs (1)')).toBeInTheDocument();
    expect(screen.getByText('📁 specs (1)')).toBeInTheDocument();
  });
});