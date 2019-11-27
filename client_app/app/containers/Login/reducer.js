import { fromJS } from 'immutable';
import * as types from './constants';
// todo: change other action types to local actions to avoid future confusion
import { SIGNUP_SUCCESS } from '../Register/constants'; // for getting success message of sign up
import { MULTI_FACTOR_AUTH_LOGIN_FAILURE } from './multi-factor-login/constants';
import { SET_PASSWORD_FAILURE } from '../Register/PasswordSetForm/constants';
// import {LOGOUT_SUCCESS} from '../App/constants';

// todo: handle user confirmation email resend flow in here
const initialState = fromJS({
	requesting: false,
	success: true,
	response: '',
	error: '',
	captchaCheckRequesting: false,
	isLoggedIn: false,
	isCaptchaEnabled: false,
	userInfo: {},
	hasUserConfirmed: false,
	isConfirmationResent: false,
	userId: '',
	resendEmailRequesting: false,
	email: '',
});

function loginReducer(state = initialState, action) {
	switch (action.type) {
		case types.SET_EMAIL:
			return state.merge({
				email: action.email,
			});
		case types.LOGIN_BY_TOKEN_REQUEST:
		case types.LOGIN_REQUEST:
		case types.LOGOUT_REQUEST:
			return state.merge({
				requesting: true,
				success: false,
				error: null,
				response: null,
				userId: '',
				email: '',
			});
		case types.RESEND_CONFIRMATION_REQUEST:
			return state.merge({
				resendEmailRequesting: true,
			});
		case types.RESEND_CONFIRMATION_SUCCESS:
			return state.merge({
				resendEmailRequesting: false,
				response: action.response.message,
				error: '',
				userId: '',
			});
		case types.RESEND_CONFIRMATION_FAILURE:
			return state.merge({
				resendEmailRequesting: false,
			});
		case types.LOGIN_BY_TOKEN_FAILURE:
			return state.merge({
				requesting: false,
				success: false,
				error: action.error.message,
				response: '',
				isCaptchaEnabled:
					action.error.data && action.error.data.captcha_enable ? action.error.data.captcha_enable : false,
			});
		case types.LOGIN_FAILURE:
			return state.merge({
				requesting: false,
				success: false,
				error: action.error.message,
				response: '',
				userId: action.error.data && action.error.data.user_id ? action.error.data.user_id : '',
				isCaptchaEnabled:
					action.error.data && action.error.data.captcha_enable ? action.error.data.captcha_enable : false,
			});
		case types.CHECK_CAPTCHA_REQUEST:
			return state.merge({ captchaCheckRequesting: true });
		case types.CHECK_CAPTCHA_FAILURE:
			return state.merge({ captchaCheckRequesting: false, error: action.error.message });
		case types.CHECK_CAPTCHA_SUCCESS:
			return state.merge({
				captchaCheckRequesting: false,
				isCaptchaEnabled: !!action.payload.data.captcha_enable,
			});
		case types.LOGIN_BY_TOKEN_SUCCESS:
			return state.merge({
				requesting: false,
				success: true,
				userInfo: fromJS(action.response.data),
				isLoggedIn: true,
				error: '',
				hasUserConfirmed: (action.response.data && action.response.data.confirmed) || false,
			});
		case SIGNUP_SUCCESS:
			return state.merge({
				response: action.response.message,
			});

		case types.LOGIN_SUCCESS:
			// return state.merge({
			//   error:'',
			//   requesting:false
			// })
			localStorage.setItem('token', action.user.data.token); // todo: localStorage changes to be put in sagas
			// localStorage.setItem("userConfirmation", action.user.data.userInfo.confirmed);
			action.user.data.allowed_actions &&
				localStorage.setItem('allowed_actions', action.user.data.allowed_actions);
			return state.merge({
				userInfo: fromJS(action.user.data.userInfo),
				isLoggedIn: true,
				error: null,
				hasUserConfirmed: action.user.data.userInfo.confirmed,
				userId: '',
			});

		case SET_PASSWORD_FAILURE:
		case MULTI_FACTOR_AUTH_LOGIN_FAILURE: // todo this should be triggered from multiFactorAuth sagas as loginClearState
		case types.LOGIN_CLEAR_STATE: // remove one of these
		case types.LOGOUT_SUCCESS:
			return initialState;
		case types.LOGOUT_FAILURE:
			return state.merge({
				requesting: false,
				success: false,
				error: action.error.message,
				response: null,
				isCaptchaEnabled:
					action.error.data && action.error.data.captcha_enable ? action.error.data.captcha_enable : false,
			});
		case types.LOGIN_CLEAR_MESSAGES:
			return state.merge({
				response: '',
				error: '',
			});
		case types.UPDATE_USER_INFO:
			return state.merge({
				userInfo: fromJS(action.newInfo),
			});
		default:
			return state;
	}
}

export default loginReducer;
