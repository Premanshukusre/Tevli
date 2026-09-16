import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import { vi, beforeEach } from 'vitest';

// Set required environment variables for tests
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';

// Mock Prisma
vi.mock('../utils/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prisma);
});
