import { fromJS } from "immutable";
import * as types from "./constants";
import { LOGOUT_SUCCESS } from "containers/Login/constants";

const initialState = fromJS({
  requesting: false,
  success: false,
  response: null,
  error: null
});

function basicInfoReducer(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_BASIC_INFO_REQUEST:
      return state.merge({
        requesting: true,
        error: null,
        response: null,
        success: false
      });
    case types.UPDATE_BASIC_INFO_SUCCESS:
      return state.merge({
        requesting: false,
        error: null,
        response: action.response.message,
        success: true
      });
      // .updateIn(['user'], user => {
      //   const userJS = user.toJS();
      //   return fromJS({...userJS, ...action.response.data });
      // });
    case types.UPDATE_BASIC_INFO_FAILURE:
      return state.merge({
        requesting: false,
        response: null,
        error: action.error.message,
        success: false
      });
    case types.BASIC_INFO_CLEAR_STATE:
    case LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}

export default basicInfoReducer;
