import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock axios completely
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })
}));

// Import after mocking axios
const { AuthProvider, useAuth } = require('./AuthContext');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading } = useAuth();
  return (
    <div>
      <div>User: {user ? user.email : 'Not logged in'}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  const renderWithAuth = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders children without crashing', () => {
    renderWithAuth();
    expect(screen.getByText(/User:/)).toBeInTheDocument();
    expect(screen.getByText(/Loading:/)).toBeInTheDocument();
  });

  it('provides initial auth state', () => {
    renderWithAuth();
    expect(screen.getByText('User: Not logged in')).toBeInTheDocument();
    expect(screen.getByText('Loading: No')).toBeInTheDocument();
  });
});