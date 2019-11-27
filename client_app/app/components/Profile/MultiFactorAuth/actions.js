import * as types from './constants';
import action from "utils/action";

export const loadBasicInfoRequest = action(types.LOAD_BASIC_INFO_REQUEST, 'userId');
export const loadBasicInfoSuccess = action(types.LOAD_BASIC_INFO_SUCCESS, 'response');
export const loadBasicInfoFailure = action(types.LOAD_BASIC_INFO_FAILURE, 'error');

export function verifyMultiFactorAuthRequest(data) {
  return {
    type: types.VERIFY_MULTI_FACTOR_AUTH_REQUEST,
    payload: data.data,
    secret: data.secret
  };
}

export const verifyMultiFactorAuthSuccess = action(types.VERIFY_MULTI_FACTOR_AUTH_SUCCESS, 'response');
export const verifyMultiFactorAuthFailure = action(types.VERIFY_MULTI_FACTOR_AUTH_FAILURE, 'error');

export const getRecoveryCodesRequest = action(types.GET_RECOVERY_CODES_REQUEST);
export const getRecoveryCodesSuccess = action(types.GET_RECOVERY_CODES_SUCCESS, 'response');
export const getRecoveryCodesFailure = action(types.GET_RECOVERY_CODES_FAILURE, 'error');

export const generateRecoveryCodeRequest = action(types.GENERATE_RECOVERY_CODE_REQUEST, 'userId');
export const generateRecoveryCodeSuccess = action(types.GENERATE_RECOVERY_CODE_SUCCESS, 'response');
export const generateRecoveryCodeFailure = action(types.GENERATE_RECOVERY_CODE_FAILURE, 'error');

export const sendMultiFactorRecoveryCodesEmailRequest = action(types.SEND_EMAIL_WITH_MFA_RECOVERY_REQUEST, 'userId');
export const sendMultiFactorRecoveryCodesEmailSuccess = action(types.SEND_EMAIL_WITH_MFA_RECOVERY_SUCCESS, 'response');
export const sendMultiFactorRecoveryCodesEmailFailure = action(types.SEND_EMAIL_WITH_MFA_RECOVERY_FAILURE, 'error');

export const getMultiFactorAuthRequest = action(types.GET_MULTI_FACTOR_AUTH_REQUEST);
export const getMultiFactorAuthSuccess = action(types.GET_MULTI_FACTOR_AUTH_SUCCESS, 'response');
export const getMultiFactorAuthFailure = action(types.GET_MULTI_FACTOR_AUTH_FAILURE, 'error');

export const disableMultiFactorAuthRequest = action(types.DISABLE_MULTI_FACTOR_AUTH_REQUEST, 'payload');
export const disableMultiFactorAuthSuccess = action(types.DISABLE_MULTI_FACTOR_AUTH_SUCCESS, 'response');
export const disableMultiFactorAuthFailure = action(types.DISABLE_MULTI_FACTOR_AUTH_FAILURE, 'error');
