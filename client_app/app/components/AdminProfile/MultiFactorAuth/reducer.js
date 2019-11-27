import { fromJS } from "immutable";
import * as types from "./constants";
import { LOGOUT_SUCCESS } from "containers/Login/constants";

const initialState = fromJS({
  requesting: false,
  isLoading: false,
  response: null,
  error: null,
  qrPath: '',
  recoveryCodes: [],
  recovery_code_generated_on: '',
  message: '',
  secret: '',
  user: {}
});

function multiFactorAuthReducer(state = initialState, action) {
  switch (action.type) {
    case types.LOAD_BASIC_INFO_REQUEST:
    case types.GET_MULTI_FACTOR_AUTH_REQUEST:
    case types.DISABLE_MULTI_FACTOR_AUTH_REQUEST:
    case types.VERIFY_MULTI_FACTOR_AUTH_REQUEST:
    case types.GET_RECOVERY_CODES_REQUEST:
    case types.SEND_EMAIL_WITH_MFA_RECOVERY_REQUEST:
    case types.GENERATE_RECOVERY_CODE_REQUEST:
      return state.merge({
        requesting: true,
        response: null,
        error: null,
        message: '',
        isLoading: true
      });
    case types.LOAD_BASIC_INFO_SUCCESS:
      return state.merge({
        requesting: false,
        error: null,
        response: null,
        success: true,
        user: fromJS(action.response.data)
      });
    case types.GET_MULTI_FACTOR_AUTH_FAILURE:
    case types.DISABLE_MULTI_FACTOR_AUTH_FAILURE:
    case types.VERIFY_MULTI_FACTOR_AUTH_FAILURE:
    case types.GET_RECOVERY_CODES_FAILURE:
    case types.SEND_EMAIL_WITH_MFA_RECOVERY_FAILURE:
    case types.GENERATE_RECOVERY_CODE_FAILURE:
      return state.merge({
        response: null,
        error: action.error.message,
        isLoading: false
      });
    case types.GET_MULTI_FACTOR_AUTH_SUCCESS:
      return state.merge({
        isLoading: false,
        error: null,
        response: null,
        qrPath: action.response.data.qrcode.path,
        secret: action.response.data.secret
      });
    case types.GET_RECOVERY_CODES_SUCCESS:
      return state.merge({
        isLoading: false,
        recoveryCodes: action.response.data.recovery_codes,
        recovery_code_generated_on: action.response.data.generated_on
      });
    case types.GENERATE_RECOVERY_CODE_SUCCESS:
      return state.merge({
        isLoading: false,
        recoveryCodes: action.response.data.backup_recovery_codes,
        response: action.response.message,
        recovery_code_generated_on: action.response.data.generated_on
      });
    case types.SEND_EMAIL_WITH_MFA_RECOVERY_SUCCESS:
      return state.merge({
        isLoading: false,
        response: action.response.message
      });
    case types.DISABLE_MULTI_FACTOR_AUTH_SUCCESS:
      return state.merge({
        isLoading: false,
        error: null,
        response: action.response.message
      }).updateIn(['user'], user => {
        const userJS = user.toJS();
        return fromJS({...userJS, multi_factor_auth_enable: false });
      });
    case types.VERIFY_MULTI_FACTOR_AUTH_SUCCESS:
      return state.merge({
        isLoading: false,
        error: null,
        response: action.response.message,
        recoveryCodes: action.response.data.backup_recovery_codes,
        recovery_code_generated_on: action.response.data.generated_on
      }).updateIn(['user'], user => {
        const userJS = user.toJS();
        return fromJS({...userJS, multi_factor_auth_enable: true });
      });
    case LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}

export default multiFactorAuthReducer;
