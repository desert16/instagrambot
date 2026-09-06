import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { config } from '@instagrambot/config';
import { PrismaService } from '../common/prisma.service.js';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `pbkdf2$100000$${salt}$${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 4) return false;
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const hash = parts[3];
      const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
    } catch {
      return false;
    }
  }

  async register(dto: { email: string; password: string; name: string; workspaceName?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new BadRequestException('Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.');
    }

    const passwordHash = this.hashPassword(dto.password);

    // Create user and initial workspace in a transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          name: dto.name.trim(),
        },
      });

      const slug = `${dto.workspaceName || dto.name}-workspace`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 30) + '-' + crypto.randomBytes(3).toString('hex');

      const workspace = await tx.workspace.create({
        data: {
          name: dto.workspaceName || `${dto.name} Çalışma Alanı`,
          slug,
          ownerId: user.id,
          subscription: {
            create: {
              plan: 'STARTER',
              status: 'ACTIVE',
            },
          },
          members: {
            create: {
              userId: user.id,
              role: Role.OWNER,
            },
          },
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);
      return {
        user: { id: user.id, email: user.email, name: user.name },
        workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
        ...tokens,
      };
    });
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    const defaultWorkspace = user.memberships[0]?.workspace;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      workspaces: user.memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
      })),
      activeWorkspaceId: defaultWorkspace?.id,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: config.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Geçersiz yenileme tokenı.');
      }

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Oturum süresi doldu, lütfen tekrar giriş yapın.');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: config.JWT_SECRET,
      expiresIn: config.JWT_EXPIRES_IN as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }
}
