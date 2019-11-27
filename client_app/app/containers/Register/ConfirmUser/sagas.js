import { takeLatest, take, put, fork, cancel, call } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { confirmUserSuccess, confirmUserFailure } from './actions';
import { logoutSuccess } from 'containers/Login/actions';
import Api from 'utils/apiHelper';
import * as types from './constants';

function* redirectOnSuccess() {
	const action = yield take(types.CONFIRM_USER_SUCCESS);
	localStorage.removeItem('token');
	sessionStorage.removeItem('token');
	yield put(logoutSuccess());
	// yield put(loginSuccess(action.response));
}

function* confirmUserFlow(action) {
	const successWatcher = yield fork(redirectOnSuccess);
	// since confirm use is going to give updated token by invalidating current token,
	// it makes sense to log out user after server responds success if user is logged in
	yield fork(Api.get(`api/confirm/user/${action.data}`, confirmUserSuccess, confirmUserFailure));
	yield take([ LOCATION_CHANGE, types.CONFIRM_USER_FAILURE ]);
	// localStorage.clear();
	// sessionStorage.removeItem('token');
	// yield put(logoutSuccess());
	yield cancel(successWatcher);
}

function* confirmUserWatcher() {
	yield takeLatest(types.CONFIRM_USER_REQUEST, confirmUserFlow);
}

export default [ confirmUserWatcher ];
