import * as types from './constants';
import action from 'utils/action';

export const updatePasswordRequest = action(types.UPDATE_PASSWORD_REQUEST, 'password');
export const updatePasswordSuccess = action(types.UPDATE_PASSWORD_SUCCESS, 'response');
export const updatePasswordFailure = action(types.UPDATE_PASSWORD_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);
