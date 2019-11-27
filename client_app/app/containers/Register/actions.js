import action from 'utils/action';
import * as types from './constants';

export const signupRequest = action(types.SIGNUP_REQUEST, 'data');
export const signupSuccess = action(types.SIGNUP_SUCCESS, 'response');
export const signupFailure = action(types.SIGNUP_FAILURE, 'error');

export const linkGoogleRequest = action(types.LINK_GOOGLE_REQUEST, 'payload', 'isImp');
export const linkGoogleSuccess = action(types.LINK_GOOGLE_SUCCESS, 'response');
export const linkGoogleFailure = action(types.LINK_GOOGLE_FAILURE, 'error');

export const linkFacebookRequest = action(types.LINK_FACEBOOK_REQUEST, 'payload', 'isImp');
export const linkFacebookSuccess = action(types.LINK_FACEBOOK_SUCCESS, 'response');
export const linkFacebookFailure = action(types.LINK_FACEBOOK_FAILURE, 'error');

export const clearState = action(types.CLEAR_STATE);
export const clearMessage = action(types.CLEAR_MESSAGE);
