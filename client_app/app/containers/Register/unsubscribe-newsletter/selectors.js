import { createSelector } from 'reselect';

const selectUnSubscribe = (state) => state.unSubscribe;

const makeSelectSuccess = () => createSelector(selectUnSubscribe, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(selectUnSubscribe, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectUnSubscribe, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectUnSubscribe, (state) => state.get('requesting'));

const selectUnSubscribeRequest = () => (state) => {
	return state.get('unSubscribe');
};

export { selectUnSubscribeRequest, makeSelectSuccess, makeSelectResponse, makeSelectError, makeSelectRequesting };
