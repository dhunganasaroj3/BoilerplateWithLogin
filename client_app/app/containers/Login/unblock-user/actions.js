import * as types from "./constants";
import action from 'utils/action';

export const unblockUserRequest = action(types.UNBLOCK_USER_REQUEST, 'data');
export const unblockUserSuccess = action(types.UNBLOCK_USER_SUCCESS, 'response');
export const unblockUserFailure = action(types.UNBLOCK_USER_FAILURE, 'error');
