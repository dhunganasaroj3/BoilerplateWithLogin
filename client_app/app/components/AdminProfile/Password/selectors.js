import { createSelector } from 'reselect';

const selectUpdatePassword = (state) => state.adminProfilePassword;

const makeSelectSuccess = () => createSelector(selectUpdatePassword, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(selectUpdatePassword, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectUpdatePassword, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectUpdatePassword, (state) => state.get('requesting'));

export { makeSelectSuccess, makeSelectResponse, makeSelectRequesting, makeSelectError };
