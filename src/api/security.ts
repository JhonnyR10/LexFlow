import type {
  SecurityChangePasswordInput,
  SecurityConfigResponse,
  SecurityDisableEncryptionInput,
  SecurityDisableLockInput,
  SecurityEnableEncryptionInput,
  SecurityEncryptionResponse,
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
  enableEncryption: (
    input: SecurityEnableEncryptionInput
  ): Promise<SecurityEncryptionResponse> => window.api.security.enableEncryption(input),
  disableEncryption: (
    input: SecurityDisableEncryptionInput
  ): Promise<SecurityEncryptionResponse> => window.api.security.disableEncryption(input),
}
