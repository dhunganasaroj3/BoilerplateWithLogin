import * as types from './constants';
import action from 'utils/action';

export const confirmUserRequest = action(types.CONFIRM_USER_REQUEST, 'data');
export const confirmUserSuccess = action(types.CONFIRM_USER_SUCCESS, 'response');
export const confirmUserFailure = action(types.CONFIRM_USER_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);
