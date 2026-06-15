import { Module } from '@nestjs/common'
import { FirebaseAdminModule } from './firebase-admin.module'
import { UserProvisioningService } from './services/user-provisioning.service'
import { FirebaseAuthGuard } from './guards/firebase-auth.guard'
import { AuthController } from './auth.controller'
import { PrismaModule } from '../../common/prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,
    FirebaseAdminModule,
  ],
  providers: [
    UserProvisioningService,
    FirebaseAuthGuard,
  ],
  controllers: [AuthController],
  exports: [
    FirebaseAdminModule,
    UserProvisioningService,
    FirebaseAuthGuard,
  ],
})
export class AuthModule {}
