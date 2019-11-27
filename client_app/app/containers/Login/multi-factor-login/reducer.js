import { fromJS } from "immutable";
import * as types from "./constants";

const initialState = fromJS({
  requesting: false,
  error: null
});

function multiFactorAuthReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.MULTI_FACTOR_AUTH_LOGIN_REQUEST:
      return state.merge({
        requesting: true,
        error: null
      });
    case types.MULTI_FACTOR_AUTH_LOGIN_FAILURE:
      return state.merge({
        requesting: false,
        error: action.error.message,
      });
    case types.MULTI_FACTOR_AUTH_LOGIN_SUCCESS:
      return state.merge({
        requesting: false,
        error: null
      });
    case types.CLEAR_STATE:
      return initialState;
    default:
      return state;
  }
}

export default multiFactorAuthReducer;
