import { takeLatest, take, fork, cancel } from "redux-saga/effects";
import { LOCATION_CHANGE } from "react-router-redux";
import * as types from "./constants";
import {
  passwordResetSuccess,
  passwordResetFailure,
  newPasswordSuccess,
  newPasswordFailure
} from "./actions";
import XcelTrip from "utils/apiHelper";

function* redirectOnSuccess() {
  yield take(types.PASSWORD_RESET_SUCCESS);
}

function* passwordResetFlow(action) {
  const successWatcher = yield fork(redirectOnSuccess);
  yield fork(XcelTrip.get(`api/password-reset/user/${action.data}`, passwordResetSuccess, passwordResetFailure));
  yield take([LOCATION_CHANGE, types.PASSWORD_RESET_FAILURE]);
  yield cancel(successWatcher);
}

function* redirectOnNewPasswordSuccess() {
  yield take(types.NEW_PASSWORD_SUCCESS);
}
function* newPasswordFlow(action) {
  const successWatcher = yield fork(redirectOnNewPasswordSuccess);
  yield fork(XcelTrip.post(`api/user/change-password/confirm/${action.token}`, newPasswordSuccess, newPasswordFailure, action.data));
  yield take([LOCATION_CHANGE, types.NEW_PASSWORD_FAILURE]);
  yield cancel(successWatcher);
}

export default function* passwordResetWatcher() {
  yield takeLatest(types.PASSWORD_RESET_REQUEST, passwordResetFlow);
  yield takeLatest(types.NEW_PASSWORD_REQUEST, newPasswordFlow);
}

