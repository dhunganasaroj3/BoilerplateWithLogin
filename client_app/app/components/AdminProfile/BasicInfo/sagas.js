import { takeLatest, take, fork, cancel, put } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import * as types from './constants';
import { updateBasicInfoSuccess, updateBasicInfoFailure } from './actions';
import { updateUserInfo } from 'containers/Login/actions'
import XcelTrip from 'utils/apiHelper';
import getToken from 'utils/getToken';

function* redirectOnSuccess(user) {
  const action = yield take(types.UPDATE_BASIC_INFO_SUCCESS);
  const updatedUser = { ...user, ...action.response.data };
  yield put(updateUserInfo(updatedUser));
}

function* confirmBasicInfoUpdateFlow(action) {
  const token = getToken();
  const successWatcher = yield fork(redirectOnSuccess, action.user);
  yield fork(
    XcelTrip.multipartPost(`user/data/${action.user._id}`, updateBasicInfoSuccess, updateBasicInfoFailure,
      action.user, action.image, token, 'put'));
  yield take([LOCATION_CHANGE, types.UPDATE_BASIC_INFO_FAILURE]);
  yield cancel(successWatcher);
}

export default function* profileBasicInfoUpdateWatcher() {
  yield takeLatest(types.UPDATE_BASIC_INFO_REQUEST, confirmBasicInfoUpdateFlow);
}

