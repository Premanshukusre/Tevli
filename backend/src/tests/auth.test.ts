import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  describe('login', () => {
    it('should reject invalid email', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(AuthService.login({ email: 'wrong@test.com', password: 'password123' }))
        .rejects.toEqual({ statusCode: 401, message: 'Invalid credentials' });
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        password_hash: 'hashed',
        token_version: 1,
        created_at: new Date(),
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      
      // Mock bcrypt
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(AuthService.login({ email: 'test@test.com', password: 'wrongpassword' }))
        .rejects.toEqual({ statusCode: 401, message: 'Invalid credentials' });
    });

    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        password_hash: 'hashed',
        token_version: 1,
        created_at: new Date(),
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await AuthService.login({ email: 'test@test.com', password: 'correctpassword' });

      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('updateProfile', () => {
    it('should update name', async () => {
      const mockUser = { id: '1', name: 'New Name', email: 'test@test.com', created_at: new Date() };
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await AuthService.updateProfile('1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'New Name' },
        select: expect.any(Object),
      });
    });
  });

  describe('changePassword', () => {
    it('should reject incorrect current password', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password_hash: 'oldhash', created_at: new Date() };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(AuthService.changePassword('1', { currentPassword: 'wrong', newPassword: 'newpassword' }))
        .rejects.toEqual({ statusCode: 400, message: 'Incorrect current password' });
    });

    it('should change password successfully', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password_hash: 'oldhash', created_at: new Date(), token_version: 1 };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      vi.spyOn(bcrypt, 'hash').mockImplementation(async () => 'newhash');
      const updatedUser = { ...mockUser, password_hash: 'newhash', token_version: 2 };
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

      const result = await AuthService.changePassword('1', { currentPassword: 'correct', newPassword: 'newpassword' });
      
      expect(result).toHaveProperty('token');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { 
          password_hash: 'newhash',
          token_version: { increment: 1 } 
        },
      });
    });
  });
});
