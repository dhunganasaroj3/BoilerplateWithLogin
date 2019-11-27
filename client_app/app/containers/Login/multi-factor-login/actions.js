import * as types from './constants';
import action from 'utils/action';

export const multiFactorAuthLoginRequest = action(types.MULTI_FACTOR_AUTH_LOGIN_REQUEST, 'userId', 'data');
export const multiFactorAuthLoginSuccess = action(types.MULTI_FACTOR_AUTH_LOGIN_SUCCESS, 'response');
export const multiFactorAuthLoginFailure = action(types.MULTI_FACTOR_AUTH_LOGIN_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);
