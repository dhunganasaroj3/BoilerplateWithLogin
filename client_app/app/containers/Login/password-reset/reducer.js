import { fromJS } from 'immutable';
import * as types from './constants';

const initialState = fromJS({
  requesting: false,
  success: false,
  resetPasswordRequesting: false,
  resetSuccess: false,
  error: null,
  response: null,
  token: ''
});

const passwordResetReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case types.PASSWORD_RESET_REQUEST:
      return state.merge({
        requesting: true,
        success: false,
      });
    case types.PASSWORD_RESET_SUCCESS:
      return state.merge({
        requesting: false,
        success: true,
        token: action.response.data.token || '' // if no token, used will be there meaning token is used
      });
    case types.PASSWORD_RESET_FAILURE:
      return state.merge({
        requesting: false,
        success: false,
        error: action.error.message
      });
    case types.NEW_PASSWORD_REQUEST:
      return state.merge({
        resetPasswordRequesting: true,
        resetSuccess: false,
        error: null
      });
    case types.NEW_PASSWORD_SUCCESS:
      return state.merge({
        resetPasswordRequesting: false,
        resetSuccess: true,
        response: action.response.message
      });
    case types.NEW_PASSWORD_FAILURE:
      return state.merge({
        resetPasswordRequesting: false,
        resetSuccess: false,
        error: action.error.message
      });
    default:
      return state;
  }
};

export default passwordResetReducer;
