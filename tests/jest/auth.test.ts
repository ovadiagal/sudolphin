import {
  signInAction,
  signUpAction,
  forgotPasswordAction,
  resetPasswordAction,
  signOutAction,
} from '@/app/actions';
import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Mock dependencies
jest.mock('@/utils/supabase/server');
jest.mock('next/headers');
jest.mock('next/navigation');
jest.mock('@/utils/utils');

describe('Authentication Actions', () => {
  // Mock FormData
  const mockFormData = (data: Record<string, string>) => {
    return {
      get: jest.fn((key: string) => data[key]),
    } as unknown as FormData;
  };

  // Setup common mocks
  const mockSupabase = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (headers as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    });
  });

  describe('signUpAction', () => {
    it('should successfully sign up a user', async () => {
      // Arrange
      const formData = mockFormData({
        email: 'test@example.com',
        password: 'password123',
      });
      mockSupabase.auth.signUp.mockResolvedValue({ error: null });

      // Act
      await signUpAction(formData);

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });
      expect(encodedRedirect).toHaveBeenCalledWith(
        'success',
        '/sign-up',
        'Thanks for signing up! Please check your email for a verification link.'
      );
    });

    it('should handle missing email or password', async () => {
      // Arrange
      const formData = mockFormData({});

      // Act
      await signUpAction(formData);

      // Assert
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
      expect(encodedRedirect).toHaveBeenCalledWith(
        'error',
        '/sign-up',
        'Email and password are required'
      );
    });

    it('should handle Supabase error', async () => {
      // Arrange
      const formData = mockFormData({
        email: 'test@example.com',
        password: 'password123',
      });
      const error = { message: 'Email already registered', code: 'auth-001' };
      mockSupabase.auth.signUp.mockResolvedValue({ error });

      // Act
      await signUpAction(formData);

      // Assert
      expect(encodedRedirect).toHaveBeenCalledWith(
        'error',
        '/sign-up',
        error.message
      );
    });
  });

  describe('signInAction', () => {
    it('should successfully sign in a user', async () => {
      // Arrange
      const formData = mockFormData({
        email: 'test@example.com',
        password: 'password123',
      });
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });

      // Act
      await signInAction(formData);

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(redirect).toHaveBeenCalledWith('/protected');
    });

    it('should handle sign in error', async () => {
      // Arrange
      const formData = mockFormData({
        email: 'test@example.com',
        password: 'wrong-password',
      });
      const error = { message: 'Invalid credentials' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error });

      // Act
      await signInAction(formData);

      // Assert
      expect(encodedRedirect).toHaveBeenCalledWith(
        'error',
        '/sign-in',
        error.message
      );
    });
  });

  describe('forgotPasswordAction', () => {
    it('should successfully initiate password reset', async () => {
      // Arrange
      const formData = mockFormData({
        email: 'test@example.com',
      });
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      // Act
      await forgotPasswordAction(formData);

      // Assert
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo:
            'http://localhost:3000/auth/callback?redirect_to=/protected/reset-password',
        }
      );
      expect(encodedRedirect).toHaveBeenCalledWith(
        'success',
        '/forgot-password',
        'Check your email for a link to reset your password.'
      );
    });

    it('should handle missing email', async () => {
      // Arrange
      const formData = mockFormData({});

      // Act
      await forgotPasswordAction(formData);

      // Assert
      expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
      expect(encodedRedirect).toHaveBeenCalledWith(
        'error',
        '/forgot-password',
        'Email is required'
      );
    });
  });

  describe('resetPasswordAction', () => {
    it('should successfully reset password', async () => {
      // Arrange
      const formData = mockFormData({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

      // Act
      await resetPasswordAction(formData);

      // Assert
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
      expect(encodedRedirect).toHaveBeenCalledWith(
        'success',
        '/protected/reset-password',
        'Password updated'
      );
    });

    it('should handle password mismatch', async () => {
      // Arrange
      const formData = mockFormData({
        password: 'newpassword123',
        confirmPassword: 'different-password',
      });

      // Act
      await resetPasswordAction(formData);

      // Assert
      expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
      expect(encodedRedirect).toHaveBeenCalledWith(
        'error',
        '/protected/reset-password',
        'Passwords do not match'
      );
    });
  });

  describe('signOutAction', () => {
    it('should successfully sign out user', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      // Act
      await signOutAction();

      // Assert
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/sign-in');
    });
  });
});
