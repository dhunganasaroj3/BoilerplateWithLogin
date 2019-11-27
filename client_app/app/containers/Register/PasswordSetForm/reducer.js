import { fromJS } from "immutable";
import * as types from "./constants";

const initialState = fromJS({
  requesting: false,
  error: null
});

function passwordSetReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_PASSWORD_REQUEST:
      return state.merge({
        requesting: true,
        error: null
      });
    case types.SET_PASSWORD_FAILURE:
      return state.merge({
        requesting: false,
        error: action.error.message,
      });
    case types.SET_PASSWORD_SUCCESS:
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

export default passwordSetReducer;
