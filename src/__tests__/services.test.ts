import { checkRateLimit } from '@/lib/api/auth-middleware';
import { sanitizeObject } from '@/lib/api/validation';
import { ApiError, errorResponse, HTTP_STATUS, ERROR_CODES } from '@/lib/api/response';

describe('API Services, Validation & Middleware', () => {
  describe('Rate Limiter', () => {
    it('allows requests within rate limits', () => {
      const id = `test-user-${Date.now()}`;
      expect(checkRateLimit(id, 5, 1000)).toBe(true);
      expect(checkRateLimit(id, 5, 1000)).toBe(true);
      expect(checkRateLimit(id, 5, 1000)).toBe(true);
      expect(checkRateLimit(id, 5, 1000)).toBe(true);
      expect(checkRateLimit(id, 5, 1000)).toBe(true);
    });

    it('blocks requests exceeding maximum allowance', () => {
      const id = `blocked-user-${Date.now()}`;
      for (let i = 0; i < 3; i++) {
        checkRateLimit(id, 3, 5000);
      }
      expect(checkRateLimit(id, 3, 5000)).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('strips dangerous HTML tags from string values', () => {
      const dangerousInput = {
        title: 'Tax Filing <script>alert("xss")</script>',
        description: 'Normal description text',
      };

      const sanitized = sanitizeObject(dangerousInput);
      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.title).toBe('Tax Filing scriptalert("xss")/script');
      expect(sanitized.description).toBe('Normal description text');
    });
  });

  describe('API Error Formatting', () => {
    it('formats structured API error responses consistently', () => {
      const error = new ApiError('Resource not found', {
        code: ERROR_CODES.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });

      const response = errorResponse('Failed to fetch', error, HTTP_STATUS.NOT_FOUND);

      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
      expect(response.message).toBe('Failed to fetch');
      expect(response.error?.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(response.timestamp).toBeDefined();
    });
  });
});
