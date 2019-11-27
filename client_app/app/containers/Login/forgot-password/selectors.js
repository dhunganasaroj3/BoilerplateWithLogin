import { createSelector } from 'reselect';

const select = (state) => state.loginForgotPassword;

const makeSelectSuccess = () => createSelector(select, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(select, (state) => state.get('response'));
const makeSelectError = () => createSelector(select, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(select, (state) => state.get('requesting'));
const makeSelectUserId = () => createSelector(select, (state) => state.get('userId'));
const makeSelectResendEmailRequesting = () => createSelector(select, (state) => state.get('resendEmailRequesting'));

export {
	makeSelectSuccess,
	makeSelectResponse,
	makeSelectError,
	makeSelectRequesting,
	makeSelectUserId,
	makeSelectResendEmailRequesting,
};
