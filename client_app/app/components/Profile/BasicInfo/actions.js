import * as types from './constants';
import action from "utils/action";

export const updateBasicInfoRequest = action(types.UPDATE_BASIC_INFO_REQUEST, 'user', 'image');
export const updateBasicInfoSuccess = action(types.UPDATE_BASIC_INFO_SUCCESS, 'response');
export const updateBasicInfoFailure = action(types.UPDATE_BASIC_INFO_FAILURE, 'error');

export const basicInfoClearState = action(types.BASIC_INFO_CLEAR_STATE);
