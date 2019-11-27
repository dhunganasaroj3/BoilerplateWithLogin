import * as types from "./constants";
import action from 'utils/action';

export const forgotPasswordRequest = action(types.FORGOT_PASSWORD_REQUEST, 'data');
export const forgotPasswordSuccess = action(types.FORGOT_PASSWORD_SUCCESS, 'response');
export const forgotPasswordFailure = action(types.FORGOT_PASSWORD_FAILURE, 'error');

export const resendConfirmationRequest = action(types.RESEND_CONFIRMATION_REQUEST, 'userId');
export const resendConfirmationSuccess = action(types.RESEND_CONFIRMATION_SUCCESS, 'response');
export const resendConfirmationFailure = action(types.RESEND_CONFIRMATION_FAILURE, 'error');

export const resetForgotPassword = action(types.RESET_FORGOT_PASSWORD);

