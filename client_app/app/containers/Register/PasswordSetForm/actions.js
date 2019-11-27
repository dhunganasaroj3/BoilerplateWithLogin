import * as types from './constants';
import action from 'utils/action';

export const setPasswordRequest = action(types.SET_PASSWORD_REQUEST, 'userId', 'data');
export const setPasswordSuccess = action(types.SET_PASSWORD_SUCCESS, 'response');
export const setPasswordFailure = action(types.SET_PASSWORD_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);
