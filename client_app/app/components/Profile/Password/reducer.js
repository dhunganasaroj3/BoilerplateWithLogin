import { fromJS } from "immutable";
import * as type from "./constants";
import { LOGOUT_SUCCESS } from "containers/Login/constants";

const initialState = fromJS({
  requesting: false,
  success: false,
  response: null,
  error: null
});

function passwordReducer(state = initialState, action) {
  switch (action.type) {
    case type.UPDATE_PASSWORD_REQUEST:
      return state.merge({
        requesting: true,
        error: null,
        response: null,
        success: false
      });
    case type.UPDATE_PASSWORD_SUCCESS:
      return state.merge({
        requesting: false,
        response: action.response.message,
        error: null,
        success: true
      });
    case type.UPDATE_PASSWORD_FAILURE:
      return state.merge({
        requesting: false,
        response: null,
        error: action.error.message,
        success: false
      });
    case type.CLEAR_STATE:
    case LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}

export default passwordReducer;
