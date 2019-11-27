import { createSelector } from 'reselect';

const selectLoginPasswordReset = (state) => state.loginPasswordReset;

const makeSelectRequesting = () => createSelector(selectLoginPasswordReset, (state) => state.get('requesting'));
const makeSelectSuccess = () => createSelector(selectLoginPasswordReset, (state) => state.get('success'));
const makeSelectResetRequesting = () =>
	createSelector(selectLoginPasswordReset, (state) => state.get('resetPasswordRequesting'));
const makeSelectResetSuccess = () => createSelector(selectLoginPasswordReset, (state) => state.get('resetSuccess'));
const makeSelectResponse = () => createSelector(selectLoginPasswordReset, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectLoginPasswordReset, (state) => state.get('error'));
const makeSelectToken = () => createSelector(selectLoginPasswordReset, (state) => state.get('token'));

export {
	makeSelectRequesting,
	makeSelectSuccess,
	makeSelectResetRequesting,
	makeSelectResetSuccess,
	makeSelectError,
	makeSelectResponse,
	makeSelectToken,
};
