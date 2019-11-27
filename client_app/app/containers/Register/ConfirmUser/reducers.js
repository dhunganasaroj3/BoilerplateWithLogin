import { fromJS } from 'immutable';
import * as types from './constants';

const initialState = fromJS({
  requesting: false,
  success: true,
  response: null,
  error: null
});

function confirmUserReducer(state = initialState, action) {
  switch (action.type) {
    case types.CONFIRM_USER_REQUEST:
      return state.merge({
        requesting: true,
        success: false
      });
    case types.CONFIRM_USER_SUCCESS:
      return state.merge({
        requesting: false,
        success: true,
        response: action.response.message,
        error: null
      });
    case types.CONFIRM_USER_FAILURE:
      return state.merge({
        requesting: false,
        success: false,
        response: null,
        error: action.error.message || 'Link is dead. Confirmation Token has already been used or it might be invalid token.'
      });
    default:
      return state;
  }
}

export default confirmUserReducer;
