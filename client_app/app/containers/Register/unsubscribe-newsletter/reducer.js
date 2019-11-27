import { fromJS } from 'immutable';
import * as types from './constants';

const initialState = fromJS({
  response: null,
  error: null,
  requesting: false,
  success: false
});

export function unSubscribeReducer(state = initialState, action) {
  switch (action.type) {
    case types.CONFIRM_UNSUBSCRIBE_REQUEST:
      return state.merge({
        requesting: true,
        error: null,
        response: null,
        success: false
      });
    case types.CONFIRM_UNSUBSCRIBE_SUCCESS:
      return state
      .merge({
        requesting: false,
        response: action.response.message,
        error: null,
        success: true
      });
    case types.CONFIRM_UNSUBSCRIBE_FAILURE:
      return state
      .merge({
        requesting: false,
        response: null,
        error: action.error.message,
        success: false
      });
    default:
      return state;
  }
}

export default unSubscribeReducer;
