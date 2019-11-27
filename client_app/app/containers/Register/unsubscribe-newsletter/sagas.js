import { takeLatest, take, put, fork, cancel, call } from 'redux-saga/effects';
import { LOCATION_CHANGE, push } from 'react-router-redux';
import * as types from './constants';
import { unSubscribeSuccess, unSubscribeFailure } from './actions';
import Api from 'utils/apiHelper';

function* redirectOnSuccess() {
	const action = yield take(types.CONFIRM_UNSUBSCRIBE_SUCCESS);
	// do something on success maybe send a toast
	// yield put(push(`/`));
}

function* confirmUnSubscribeFlow(action) {
	const successWatcher = yield fork(redirectOnSuccess);
	yield call(Api.post(`api/newsletter/unsubscribe/${action.payload}`, unSubscribeSuccess, unSubscribeFailure, {}));
	yield take([ LOCATION_CHANGE, types.CONFIRM_UNSUBSCRIBE_FAILURE ]);
	yield cancel(successWatcher);
}

function* confirmUnSubscribeWatcher() {
	yield takeLatest(types.CONFIRM_UNSUBSCRIBE_REQUEST, confirmUnSubscribeFlow);
}

export default [ confirmUnSubscribeWatcher ];
