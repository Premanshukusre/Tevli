import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { generateToken } from '../utils/jwt';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'Email already in use' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    const token = generateToken(user.id);
    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Use a generic error message to prevent account enumeration
    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const token = generateToken(user.id);
    
    // Omit password hash from response
    const { password_hash, ...safeUser } = user;
    
    return { user: safeUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  static async updateProfile(userId: string, data: { name: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return user;
  }

  static async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw { statusCode: 400, message: 'Incorrect current password' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });

    const token = generateToken(userId);
    return { token };
  }
}
