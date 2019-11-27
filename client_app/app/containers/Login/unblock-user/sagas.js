import { takeLatest, take, fork, cancel } from "redux-saga/effects";
import { LOCATION_CHANGE } from "react-router-redux";
import * as types from "./constants";
import * as actions from "./actions";
import XcelTrip from "utils/apiHelper";

function* redirectOnSuccess() {
  yield take(types.UNBLOCK_USER_SUCCESS);
}

function* unblockUserFlow(action) {
  const successWatcher = yield fork(redirectOnSuccess);
  yield fork(XcelTrip.get(`api/unblock/user/${action.data}`, actions.unblockUserSuccess, actions.unblockUserFailure, action.data));
  yield take([LOCATION_CHANGE, types.UNBLOCK_USER_FAILURE]);
  yield cancel(successWatcher);
}

function* unblockUserWatcher() {
  yield takeLatest(types.UNBLOCK_USER_REQUEST, unblockUserFlow);
}

export default [unblockUserWatcher];
