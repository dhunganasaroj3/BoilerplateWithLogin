import action from 'utils/action';
import * as types from './constants';

export const showDialog = action(types.SHOW_DIALOG, 'payload');
export const setToken = action(types.SET_TOKEN, 'payload');

export const setUser = action(types.SET_USER, 'payload');

export const notUser = action(types.NOT_USER);

export const loginByTokenRequest = action(
  types.LOGIN_BY_TOKEN_REQUEST,
  'payload',
);
export const loginByTokenSuccess = action(
  types.LOGIN_BY_TOKEN_SUCCESS,
  'response',
);
export const loginByTokenFailure = action(
  types.LOGIN_BY_TOKEN_FAILURE,
  'error',
);

// export const logoutRequest = action(loginTypes.LOGOUT_REQUEST);
// export const logoutSuccess = action(loginTypes.LOGOUT_SUCCESS, 'response');
// export const logoutFailure = action(loginTypes.LOGOUT_FAILURE, 'error');

export const loadContentTemplateRequest = action(types.LOAD_CONTENT_TEMPLATE_REQUEST);
export const loadContentTemplateSuccess = action(types.LOAD_CONTENT_TEMPLATE_SUCCESS, 'response');
export const loadContentTemplateFailure = action(types.LOAD_CONTENT_TEMPLATE_FAILURE, 'error');
