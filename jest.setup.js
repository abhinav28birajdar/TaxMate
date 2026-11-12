import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder if not present
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock ESM-only 'jose' for Jest CommonJS test runner
jest.mock('jose', () => ({
  jwtVerify: jest.fn().mockImplementation(async (token) => {
    return {
      payload: {
        sub: 'mock-user-uuid',
        email: 'test@taxmate.app',
        role: 'CLIENT',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    };
  }),
}));

// Mock environment variables for testing
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';
process.env.JWT_SECRET = 'taxmate_test_jwt_secret_min_32_characters_long';
process.env.RAZORPAY_KEY_SECRET = 'mock_razorpay_secret_123';
process.env.RAZORPAY_WEBHOOK_SECRET = 'mock_webhook_secret_123';
