import * as types from "./constants";
import action from 'utils/action';

export const passwordResetRequest = action(types.PASSWORD_RESET_REQUEST, 'data');
export const passwordResetSuccess = action(types.PASSWORD_RESET_SUCCESS, 'response');
export const passwordResetFailure = action(types.PASSWORD_RESET_FAILURE, 'error');

export const newPasswordRequest = action(types.NEW_PASSWORD_REQUEST, 'token', 'data');
export const newPasswordSuccess = action(types.NEW_PASSWORD_SUCCESS, 'response');
export const newPasswordFailure = action(types.NEW_PASSWORD_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);

// export function newPasswordRequest(data) {
//   return {
//     type: types.NEW_PASSWORD_REQUEST,
//     data: data.password,
//     token: data.token,
//     log_out_all_devices: data.log_out_all_devices
//   };
// }

