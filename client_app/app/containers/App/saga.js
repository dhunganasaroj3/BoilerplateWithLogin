import { take, takeLatest, fork, put, cancel, select, call } from 'redux-saga/effects';
// import { LOCATION_CHANGE } from 'react-router-redux';

import Api from 'utils/apiHelper';
import * as types from './constants';
import * as actions from './actions';
import * as loginTypes from '../Login/constants';
import React from 'react';
import { push, LOCATION_CHANGE } from 'react-router-redux';
import { makeSelectLocation, makeSelectUser } from './selectors';
import {
	checkCaptchaSuccess,
	checkCaptchaFailure,
	loginSuccess,
	loginFailure,
	logoutSuccess,
	logoutFailure,
	loginClearState,
	loginByTokenSuccess,
	loginByTokenFailure,
	resendConfirmationSuccess,
	resendConfirmationFailure,
	linkFacebookSuccess,
	linkFacebookFailure,
	linkGoogleSuccess,
	linkGoogleFailure,
} from '../Login/actions';
import MultiFactorAuth from '../Login/multi-factor-login';
import PasswordSetForm from '../Register/PasswordSetForm';
// import getRedirectUrl from 'utils/getDashboardUrl';
import { delay } from 'redux-saga';
import getToken from 'utils/getToken';

function* redirectOnLoginByTokenSuccess() {
	yield take(loginTypes.LOGIN_BY_TOKEN_SUCCESS);
}

function* loginByTokenFlow(action) {
	const successWatcher = yield fork(redirectOnLoginByTokenSuccess);
	const { userId } = action;
	const token = localStorage.getItem('token');
	yield fork(Api.get(`user/data/${userId}`, loginByTokenSuccess, loginByTokenFailure, token));
	yield take(loginTypes.LOGIN_BY_TOKEN_FAILURE);
	yield cancel(successWatcher);
}

const checkIfMultiFactor = (response) => {
	if (response.data && response.data.multi_factor_auth_enable_mobile) {
		return actions.showDialog(<MultiFactorAuth user_id={response.data.user_id} />);
	}
	if (response.data && response.data.multi_factor_auth_enable) {
		return actions.showDialog(<MultiFactorAuth user_id={response.data.user_id} />);
	}
	if (response.data && response.data.password_set === false) {
		return actions.showDialog(<PasswordSetForm user_id={response.data.user_id} email={response.data.user_email} />);
	}
	return loginSuccess(response);
};

const checkIfPasswordNotSet = (error) => {
	if (error.data && error.data.password_set === false) {
		return actions.showDialog(<PasswordSetForm user_id={error.data.user_id} email={error.data.user_email} />);
	}
	return loginFailure(error);
};

function* redirectOnLoginSuccess(redirect) {
	const action = yield take(loginTypes.LOGIN_SUCCESS);
	const { user: { data: { token, userInfo } } } = action;
	localStorage.setItem('token', token);
	yield put(actions.setToken(token));
	yield put(actions.setUser(userInfo));
	if (userInfo.user_role[0] == 'enduser') {
		yield put(push('/user/dashboard'));
	} else {
		yield put(push('/admin/dashboard'));
	}
	// const user_role = action.user.data.userInfo.user_role;
	// const parent_user_role = action.user.data.userInfo.parent_user_role;
	// // yield put(actions.showDialog(null));
	// const currentLocation = yield select(makeSelectLocation());
	// const { pathname } = currentLocation;
	// const pathSplit = pathname.split('/');
	// // redirect to same url in case of blog and forum view only
	// // rest urls login should redirect to user's dashboard
	// yield put(actions.showDialog(null));
	// const redirectionUrl = (pathSplit[1] === 'blog' || pathSplit[1] === 'forum' || pathSplit[1] === 'guest-detail' || pathSplit[1] === 'find-itinerary')? pathname : getRedirectUrl(user_role, parent_user_role);
	// if (pathSplit[1] === 'find-itinerary')
	//   yield put(push('/bookings'));
	// else
	//   yield put(push(redirectionUrl));
}

function* checkCaptchaFlow() {
	const successWatcher = yield fork(redirectOnCheckCaptchaSuccess);
	yield fork(Api.get('user/check/captcha', checkCaptchaSuccess, checkCaptchaFailure));
	yield take([ LOCATION_CHANGE, loginTypes.CHECK_CAPTCHA_FAILURE ]);
	yield cancel(successWatcher);
}

function* redirectOnCheckCaptchaSuccess() {
	yield take(loginTypes.CHECK_CAPTCHA_SUCCESS);
}

function* loginFlow(action) {
	const successWatcher = yield fork(redirectOnLoginSuccess, action.redirect);
	yield fork(Api.post('login', checkIfMultiFactor, checkIfPasswordNotSet, action.data));
	yield take([ LOCATION_CHANGE, loginTypes.LOGIN_FAILURE ]);
	yield cancel(successWatcher);
}

function* redirectOnLogoutSuccess() {
	yield take(loginTypes.LOGOUT_SUCCESS);
	localStorage.removeItem('token');
	// localStorage.clear();
	sessionStorage.removeItem('token');
	yield put(push('/'));
	// yield call(delay, 5000);
	yield put(loginClearState());
}

function* logoutUser() {
	const user = yield select(makeSelectUser());

	const userRoles = user.get('user_role') ? user.get('user_role').toJS() : [ 'enduser' ];

	const token = userRoles.includes('superadmin') ? localStorage.getItem('token') : getToken();

	if (token === localStorage.getItem('token')) {
		const successWatcher = yield fork(redirectOnLogoutSuccess);
		yield fork(Api.delete('user/logout', logoutSuccess, logoutFailure, token));
		yield take([ LOCATION_CHANGE, loginTypes.LOGOUT_FAILURE ]);
		yield cancel(successWatcher);
	} else {
		sessionStorage.removeItem('token');
		yield put(logoutSuccess());
		yield put(push('/'));
	}
}

function* loadContentTemplateRequest() {
	yield call(
		Api.get(
			'content-template?page=1&perpage=20',
			actions.loadContentTemplateSuccess,
			actions.loadContentTemplateFailure,
		),
	);
}

// Individual exports for testing
export default function* defaultSaga() {
	yield takeLatest(loginTypes.LOGIN_REQUEST, loginFlow);
	yield takeLatest(loginTypes.CHECK_CAPTCHA_REQUEST, checkCaptchaFlow);
	yield takeLatest(loginTypes.LOGOUT_REQUEST, logoutUser);
	yield takeLatest(loginTypes.LOGIN_BY_TOKEN_REQUEST, loginByTokenFlow);
	yield takeLatest(types.LOAD_CONTENT_TEMPLATE_REQUEST, loadContentTemplateRequest);
}
