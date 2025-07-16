import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in form', () => {
  render(<App />);
  const headerElement = screen.getByText(/Spec Driven Development/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders sign in button', () => {
  render(<App />);
  const signInButton = screen.getByRole('button', { name: /sign in/i });
  expect(signInButton).toBeInTheDocument();
});

test('renders email input field', () => {
  render(<App />);
  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toBeInTheDocument();
});

test('renders password input field', () => {
  render(<App />);
  const passwordInput = screen.getByLabelText(/password/i);
  expect(passwordInput).toBeInTheDocument();
});
