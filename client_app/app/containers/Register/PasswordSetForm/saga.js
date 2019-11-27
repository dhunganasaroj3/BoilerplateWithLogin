import React from 'react';
import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest, take, put, fork, cancel } from 'redux-saga/effects';
import * as types from './constants';
import * as actions from './actions';
import { loginSuccess } from '../../Login/actions';
import { showDialog } from 'containers/App/actions';
import Api from 'utils/apiHelper';

function* redirectOnPasswordSetSuccess() {
	const action = yield take(types.SET_PASSWORD_SUCCESS);
	yield put(showDialog(null));
	yield put(loginSuccess(action.response));
}

function* passwordSetFlow(action) {
	const successWatcher = yield fork(redirectOnPasswordSetSuccess);
	yield fork(
		Api.put(
			`api/social-account/accept-terms-conditions/${action.userId}`,
			actions.setPasswordSuccess,
			actions.setPasswordFailure,
			action.data,
			null,
			'put',
		),
	);
	yield take([ LOCATION_CHANGE, types.SET_PASSWORD_FAILURE ]);
	yield cancel(successWatcher);
}

export default function* passwordSetSaga() {
	yield takeLatest(types.SET_PASSWORD_REQUEST, passwordSetFlow);
}
