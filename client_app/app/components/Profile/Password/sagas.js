import { takeLatest, take, select, fork, cancel } from "redux-saga/effects";
import { LOCATION_CHANGE } from "react-router-redux";
import * as type from "./constants";
import { updatePasswordSuccess, updatePasswordFailure } from "./actions";
import { logoutRequest } from 'containers/Login/actions';
import XcelTrip from 'utils/apiHelper';
import { makeSelectUser } from 'containers/App/selectors';
import getToken from 'utils/getToken';

function* redirectOnSuccess() {
  yield take(type.UPDATE_PASSWORD_SUCCESS);
}

function* confirmPasswordUpdateFlow(action) {
  let userInfo = yield select(makeSelectUser());
  const token = getToken();
  const successWatcher = yield fork(redirectOnSuccess);
  yield fork(XcelTrip.put(`user/security-settings/change-password/${userInfo.get('_id')}`, updatePasswordSuccess,
      updatePasswordFailure, { ...action.password, _id: userInfo.get('_id') }, token));
  yield take([LOCATION_CHANGE, type.UPDATE_PASSWORD_FAILURE]);
  yield cancel(successWatcher);
}

export default function* profilePasswordWatcher() {
  yield takeLatest(type.UPDATE_PASSWORD_REQUEST, confirmPasswordUpdateFlow);
}