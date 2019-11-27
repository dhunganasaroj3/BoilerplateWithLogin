import * as types from './constants';

// this action is handled in login reducer
export function updateUserInfo(user) {
  return {
    type: types.UPDATE_USER_INFO,
    user
  };
}
