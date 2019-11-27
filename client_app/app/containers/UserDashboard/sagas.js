import React from 'react';
import { LOCATION_CHANGE } from 'react-router-redux';
import { takeLatest, take, fork, cancel, call } from 'redux-saga/effects';
import XcelTrip from 'utils/apiHelper';
import getToken from 'utils/getToken';
import * as types from './constants';
import * as actions from './actions';

function* redirectOnResendConfirmationSuccess() {
  yield take(types.RESEND_CONFIRMATION_SUCCESS);
}

function* resendConfirmationFlow() {
  const successWatcher = yield fork(redirectOnResendConfirmationSuccess);
  yield fork(
    XcelTrip.post(
      'api/user/resend-confirm-email',
      actions.resendConfirmationSuccess,
      actions.resendConfirmationFailure,
      { 'confirm-resend': '' },
      getToken()
    )
  );
  yield take([LOCATION_CHANGE, types.RESEND_CONFIRMATION_FAILURE]);
  yield cancel(successWatcher);
}

export default function* userDashboardSaga() {
  yield takeLatest(types.RESEND_CONFIRMATION_REQUEST, resendConfirmationFlow);
}
