import { CanActivate, mixin } from '@nestjs/common';

export const EnvironmentGuard = (disabledInEnvironment: string) => {
  class RoleGuardMixin implements CanActivate {
    canActivate() {
      return process.env.NODE_ENV !== disabledInEnvironment;
    }
  }

  return mixin(RoleGuardMixin);
};
