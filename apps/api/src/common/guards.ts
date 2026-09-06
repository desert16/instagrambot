import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { IS_PUBLIC_KEY, ROLES_KEY } from './decorators.js';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Kullanıcı doğrulanmadı.');
    }

    const workspaceId =
      request.headers['x-workspace-id'] ||
      request.query?.workspaceId ||
      request.params?.workspaceId ||
      request.body?.workspaceId;

    if (!workspaceId) {
      // If no explicit workspace provided, allow if request will use user.activeWorkspaceId or personal routes
      return true;
    }

    // Check membership in DB (Strict multi-tenant boundary & IDOR prevention)
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: String(workspaceId),
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Bu çalışma alanına erişim yetkiniz bulunmamaktadır.');
    }

    // Attach workspace membership & role to request
    request.workspaceMembership = membership;
    request.currentWorkspaceId = workspaceId;

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership = request.workspaceMembership;

    if (!membership) {
      throw new ForbiddenException('Çalışma alanı rolü belirlenemedi.');
    }

    const roleHierarchy: Record<Role, number> = {
      OWNER: 4,
      ADMIN: 3,
      AGENT: 2,
      VIEWER: 1,
    };

    const userRoleWeight = roleHierarchy[membership.role as Role] || 0;
    const hasRequiredRole = requiredRoles.some((role) => userRoleWeight >= roleHierarchy[role]);

    if (!hasRequiredRole) {
      throw new ForbiddenException('Bu işlemi gerçekleştirmek için yetkiniz yetersizdir.');
    }

    return true;
  }
}
