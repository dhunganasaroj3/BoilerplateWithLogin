import { fromJS } from 'immutable';
import * as types from './constants';

const initialState = fromJS({
  response: null,
  error: null,
  requesting: false,
  success: true
});

export function unblockUserReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.UNBLOCK_USER_REQUEST:
      return state.merge({
        requesting: true,
        success: false
      });
    case types.UNBLOCK_USER_SUCCESS:
      return Object.assign({}, ...state, {
        requesting: false,
        success: true,
        response: action.response.message
      });
    case types.UNBLOCK_USER_FAILURE:
      return state.merge({
        requesting: false,
        success: false,
        error: action.error.message
      });
    default:
      return state;
  }
}

export default unblockUserReducer;
