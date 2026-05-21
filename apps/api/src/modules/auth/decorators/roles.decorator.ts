import { SetMetadata } from '@nestjs/common'

type AuthRole = 'USER' | 'MODERATOR' | 'ADMIN'

export const ROLES_KEY = 'roles'

export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles)
