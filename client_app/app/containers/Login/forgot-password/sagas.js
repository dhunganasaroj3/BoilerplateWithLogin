import { takeLatest, take, call, fork, cancel } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import Api from 'utils/apiHelper';
import * as types from './constants';
import * as actions from './actions';

function* redirectOnSuccess() {
	yield take(types.FORGOT_PASSWORD_SUCCESS);
}

function* forgotPasswordFlow(action) {
	const successWatcher = yield fork(redirectOnSuccess);
	yield call(
		Api.post(
			'api/user/security-settings/reset-password-link',
			actions.forgotPasswordSuccess,
			actions.forgotPasswordFailure,
			action.data,
		),
	);
	yield take([ LOCATION_CHANGE, types.FORGOT_PASSWORD_FAILURE ]);
	yield cancel(successWatcher);
}

function* resendConfirmFlow(action) {
	yield call(
		Api.post(
			`api/user/resend-confirm-email/${action.userId}`,
			actions.resendConfirmationSuccess,
			actions.resendConfirmationFailure,
			{ userId: action.userId },
			'',
		),
	);
}

export default function* forgotPasswordWatcher() {
	yield takeLatest(types.FORGOT_PASSWORD_REQUEST, forgotPasswordFlow);
	yield takeLatest(types.RESEND_CONFIRMATION_REQUEST, resendConfirmFlow);
}
