import { takeLatest, take, select, put, fork, cancel, call } from "redux-saga/effects";
import { LOCATION_CHANGE, push } from "react-router-redux";
import * as types from "./constants";
import { updatePasswordSuccess, updatePasswordFailure } from "./actions";
import { logoutRequest } from 'containers/Login/actions';
import XcelTrip from "utils/apiHelper";
import { makeSelectUser } from 'containers/App/selectors';

function* redirectOnSuccess() {
  yield take(types.UPDATE_PASSWORD_SUCCESS);
}


function* confirmPasswordUpdateFlow(action) {
  let userInfo = yield select(makeSelectUser());
  const token = localStorage.getItem('token');
  const successWatcher = yield fork(redirectOnSuccess);
  yield fork(XcelTrip.put(`user/security-settings/change-password/${userInfo.get('_id')}`, updatePasswordSuccess,
      updatePasswordFailure, {...action.password, _id: userInfo.get('_id')}, token));
  yield take([LOCATION_CHANGE, types.UPDATE_PASSWORD_FAILURE]);
  yield cancel(successWatcher);
}

export default function* confirmPasswordUpdateWatcher() {
  yield takeLatest(types.UPDATE_PASSWORD_REQUEST, confirmPasswordUpdateFlow);
}

