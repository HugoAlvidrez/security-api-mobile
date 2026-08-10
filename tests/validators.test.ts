import { loginValidator, registerValidator } from '../src/utils/validators';

describe('Auth Validators', () => {
  describe('registerValidator', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        fullName: 'John Doe',
      };

      const result = registerValidator.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        fullName: 'John Doe',
      };

      const result = registerValidator.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        fullName: 'John Doe',
      };

      const result = registerValidator.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        email: 'user@example.com',
        password: 'Short1!',
        confirmPassword: 'Short1!',
        fullName: 'John Doe',
      };

      const result = registerValidator.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginValidator', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      const result = loginValidator.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'not-an-email',
        password: 'SecurePass123!',
      };

      const result = loginValidator.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        email: 'user@example.com',
        password: 'short',
      };

      const result = loginValidator.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
