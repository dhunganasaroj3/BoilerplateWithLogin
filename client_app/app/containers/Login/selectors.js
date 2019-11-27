import { createSelector } from 'reselect';

const selectLogin = (state) => state.login;

const makeSelectSuccess = () => createSelector(selectLogin, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(selectLogin, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectLogin, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectLogin, (state) => state.get('requesting'));
const makeSelectCaptchaEnabled = () => createSelector(selectLogin, (state) => state.get('isCaptchaEnabled'));
const makeSelectUserConfirmation = () => createSelector(selectLogin, (state) => state.get('user_confirmation'));
const makeSelectIsLoggedIn = () => createSelector(selectLogin, (state) => state.get('isLoggedIn'));
const makeSelectUserId = () => createSelector(selectLogin, (state) => state.get('userId'));
const makeSelectResendEmailRequesting = () =>
	createSelector(selectLogin, (state) => state.get('resendEmailRequesting'));
const makeSelectEmail = () => createSelector(selectLogin, (state) => state.get('email'));

export {
	makeSelectSuccess,
	makeSelectResponse,
	makeSelectError,
	makeSelectRequesting,
	makeSelectCaptchaEnabled,
	makeSelectUserConfirmation,
	makeSelectIsLoggedIn,
	makeSelectUserId,
	makeSelectResendEmailRequesting,
	makeSelectEmail,
};
