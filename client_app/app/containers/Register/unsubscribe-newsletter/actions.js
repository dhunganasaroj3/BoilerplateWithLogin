import * as types from "./constants";
import action from "utils/action";

export const unSubscribeRequest = action(types.CONFIRM_UNSUBSCRIBE_REQUEST, 'payload');
export const unSubscribeSuccess = action(types.CONFIRM_UNSUBSCRIBE_SUCCESS, 'response');
export const unSubscribeFailure = action(types.CONFIRM_UNSUBSCRIBE_FAILURE, 'error');
