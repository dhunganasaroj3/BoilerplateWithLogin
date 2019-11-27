import React from 'react';
import { LOCATION_CHANGE } from "react-router-redux";
import { takeLatest, take, put, fork, cancel } from "redux-saga/effects";
import * as types from './constants';
import * as actions from './actions';
import { showDialog } from "containers/App/actions";
import { loginSuccess } from '../actions';
import XcelTrip from 'utils/apiHelper';

function* redirectOnMultiFactorAuthLoginSuccess() {
  const action = yield take(types.MULTI_FACTOR_AUTH_LOGIN_SUCCESS);
  yield put(loginSuccess(action.response));
}

function* multiFactorAuthLoginFlow(action) {
  const successWatcher = yield fork(redirectOnMultiFactorAuthLoginSuccess);
  yield fork(
    XcelTrip.post(`api/multi-factor-auth/totp-validate/${action.userId}`, actions.multiFactorAuthLoginSuccess,
      actions.multiFactorAuthLoginFailure, action.data));
  yield take([LOCATION_CHANGE, types.MULTI_FACTOR_AUTH_LOGIN_FAILURE]);
  yield cancel(successWatcher);
}

export default function* multiFactorAuthSaga() {
  yield takeLatest(types.MULTI_FACTOR_AUTH_LOGIN_REQUEST, multiFactorAuthLoginFlow);
}

