import type {
  SecurityChangePasswordInput,
  SecurityConfigResponse,
  SecurityDisableLockInput,
  SecurityMutationResponse,
  SecuritySetPasswordInput,
  SecurityStateResponse,
  SecurityUnlockInput,
  SecurityUnlockResponse,
} from '../../shared/ipc'

export const securityApi = {
  getState: (): Promise<SecurityStateResponse> => window.api.security.getState(),
  getConfig: (): Promise<SecurityConfigResponse> => window.api.security.getConfig(),
  unlock: (input: SecurityUnlockInput): Promise<SecurityUnlockResponse> =>
    window.api.security.unlock(input),
  setPassword: (input: SecuritySetPasswordInput): Promise<SecurityMutationResponse> =>
    window.api.security.setPassword(input),
  changePassword: (input: SecurityChangePasswordInput): Promise<SecurityMutationResponse> =>
    window.api.security.changePassword(input),
  disableLock: (input: SecurityDisableLockInput): Promise<SecurityMutationResponse> =>
    window.api.security.disableLock(input),
}
