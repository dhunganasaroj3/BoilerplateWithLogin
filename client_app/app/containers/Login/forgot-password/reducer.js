import { fromJS } from 'immutable';
import * as types from './constants';

const initialState = fromJS({
  response: null,
  error: null,
  requesting: false,
  success: false,
  userId: '',
  resendEmailRequesting: false,
});

function forgotPasswordReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.FORGOT_PASSWORD_REQUEST:
      return state.merge({
        requesting: true,
        error: null,
        response: null,
        success: false
      });
    case types.FORGOT_PASSWORD_SUCCESS:
      return state.merge({
        requesting: false,
        response: action.response.message,
        error: null,
        success: true
      });
    case types.FORGOT_PASSWORD_FAILURE:
      return state.merge({
        requesting: false,
        response: null,
        error: action.error.message,
        success: false,
        userId: action.error.data && action.error.data.user_id ? action.error.data.user_id : '',
      });
    case types.RESEND_CONFIRMATION_REQUEST:
      return state.merge({
        resendEmailRequesting: true,
      });
    case types.RESEND_CONFIRMATION_SUCCESS:
      return state.merge({
        resendEmailRequesting: false,
        response: action.response.message,
        error: null,
        userId: '',
      });
    case types.RESEND_CONFIRMATION_FAILURE:
      return state.merge({
        resendEmailRequesting: false,
      });
    case types.RESET_FORGOT_PASSWORD:
      return initialState;
    default:
      return state;
  }
}

export default forgotPasswordReducer;
