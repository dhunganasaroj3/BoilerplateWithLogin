import * as types from './constants';
import action from 'utils/action';

export const checkCaptchaRequest = action(types.CHECK_CAPTCHA_REQUEST);
export const checkCaptchaSuccess = action(types.CHECK_CAPTCHA_SUCCESS, 'payload');
export const checkCaptchaFailure = action(types.CHECK_CAPTCHA_FAILURE, 'error');

export const loginByTokenRequest = action(types.LOGIN_BY_TOKEN_REQUEST, 'userId');
export const loginByTokenSuccess = action(types.LOGIN_BY_TOKEN_SUCCESS, 'response');
export const loginByTokenFailure = action(types.LOGIN_BY_TOKEN_FAILURE, 'error');

export const loginRequest = action(types.LOGIN_REQUEST, 'data', 'redirect');
export const loginSuccess = action(types.LOGIN_SUCCESS, 'user');
export const loginFailure = action(types.LOGIN_FAILURE, 'error');

export const logoutRequest = action(types.LOGOUT_REQUEST);
export const logoutSuccess = action(types.LOGOUT_SUCCESS, 'response');
export const logoutFailure = action(types.LOGOUT_FAILURE, 'error');

export const loginClearState = action(types.LOGIN_CLEAR_STATE);
export const loginClearMessages = action(types.LOGIN_CLEAR_MESSAGES);

export const updateUserInfo = action(types.UPDATE_USER_INFO, 'newInfo');

export const resendConfirmationRequest = action(types.RESEND_CONFIRMATION_REQUEST, 'userId');
export const resendConfirmationSuccess = action(types.RESEND_CONFIRMATION_SUCCESS, 'response');
export const resendConfirmationFailure = action(types.RESEND_CONFIRMATION_FAILURE, 'error');

export const linkGoogleRequest = action(types.LINK_GOOGLE_REQUEST, 'payload', 'isImp');
export const linkGoogleSuccess = action(types.LINK_GOOGLE_SUCCESS, 'response');
export const linkGoogleFailure = action(types.LINK_GOOGLE_FAILURE, 'error');

export const linkFacebookRequest = action(types.LINK_FACEBOOK_REQUEST, 'payload', 'isImp');
export const linkFacebookSuccess = action(types.LINK_FACEBOOK_SUCCESS, 'response');
export const linkFacebookFailure = action(types.LINK_FACEBOOK_FAILURE, 'error');

export const setEmail = action(types.SET_EMAIL, 'email');
