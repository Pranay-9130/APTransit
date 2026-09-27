import { Module } from "@nestjs/common";
import { RateLimitService } from "../../common/services/rate-limit.service";
import { ScopeService } from "../../common/services/scope.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EMAIL_PROVIDER, ResendEmailProvider } from "./email.provider";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    RateLimitService,
    ScopeService,
    {
      provide: EMAIL_PROVIDER,
      useClass: ResendEmailProvider,
    },
  ],
  exports: [AuthService, ScopeService, RateLimitService],
})
export class AuthModule {}
