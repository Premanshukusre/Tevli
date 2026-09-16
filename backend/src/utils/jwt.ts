import jwt from 'jsonwebtoken';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return secret;
};

export const generateToken = (userId: string, tokenVersion: number = 1): string => {
  return jwt.sign({ id: userId, version: tokenVersion }, getSecret(), {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): { id: string, version: number } | null => {
  try {
    const decoded = jwt.verify(token, getSecret()) as { id: string, version: number };
    return decoded;
  } catch (error) {
    return null;
  }
};
