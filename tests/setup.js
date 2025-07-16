// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test_db';

// Mock console warnings for cleaner test output
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings that are not relevant for tests
  const message = args.join(' ');
  if (message.includes('deprecated') || message.includes('warning')) {
    return;
  }
  originalWarn.apply(console, args);
};