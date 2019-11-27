import { fromJS } from 'immutable';
import * as types from './constants';
import { LOGOUT_SUCCESS } from '../Login/constants';

const initialState = fromJS({
  response: null,
  error: null,
  requesting: false,
  success: false,
  status: null,
});

function userDashboardReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.RESEND_CONFIRMATION_REQUEST:
      return state.merge({
        requesting: true,
        error: null,
        response: null,
        success: false,
      });
    case types.RESEND_CONFIRMATION_SUCCESS:
      return state.merge({
        requesting: false,
        response: action.response.message,
        error: null,
        success: true,
      });
    
    case types.RESEND_CONFIRMATION_FAILURE:
      return state.merge({
        requesting: false,
        response: null,
        error: action.error.message,
        success: false,
      });
    
    case LOGOUT_SUCCESS:
    case types.CLEAR_STATE:
      return initialState;
    default:
      return state;
  }
}

export default userDashboardReducer;
