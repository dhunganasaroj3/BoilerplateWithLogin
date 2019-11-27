import * as types from './constants';
import action from 'utils/action';

export const resendConfirmationRequest = action(types.RESEND_CONFIRMATION_REQUEST);
export const resendConfirmationSuccess = action(types.RESEND_CONFIRMATION_SUCCESS, 'response');
export const resendConfirmationFailure = action(types.RESEND_CONFIRMATION_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);