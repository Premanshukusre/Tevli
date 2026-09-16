import { describe, it, expect, vi } from 'vitest';
import { socketAuthMiddleware } from '../sockets/socket.auth';
import prisma from '../utils/prisma';
import * as jwt from '../utils/jwt';

describe('Socket Auth Middleware', () => {
  it('should reject if no cookies are found', async () => {
    const mockSocket = {
      handshake: { headers: {} }
    } as any;
    const next = vi.fn();

    await socketAuthMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith(new Error('Authentication error: No cookies found'));
  });

  it('should reject if tevli_session cookie is missing', async () => {
    const mockSocket = {
      handshake: { headers: { cookie: 'other_cookie=123' } }
    } as any;
    const next = vi.fn();

    await socketAuthMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith(new Error('Authentication error: Token missing'));
  });

  it('should reject if token is invalid', async () => {
    const mockSocket = {
      handshake: { headers: { cookie: 'tevli_session=invalid_token' } }
    } as any;
    const next = vi.fn();
    
    vi.spyOn(jwt, 'verifyToken').mockReturnValue(null);

    await socketAuthMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith(new Error('Authentication error: Invalid token'));
  });

  it('should successfully authenticate and attach user', async () => {
    const mockSocket = {
      handshake: { headers: { cookie: 'tevli_session=valid_token' } }
    } as any;
    const next = vi.fn();
    
    const mockDecoded = { id: 'user-1' };
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@test.com' };
    
    vi.spyOn(jwt, 'verifyToken').mockReturnValue(mockDecoded as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    await socketAuthMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith(); // Called with no arguments on success
    expect(mockSocket.user).toEqual(mockUser);
  });
});
