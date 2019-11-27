import { createSelector } from 'reselect';

const selectRegisterConfirmUser = (state) => state.registerConfirmUser;

const makeSelectSuccess = () => createSelector(selectRegisterConfirmUser, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(selectRegisterConfirmUser, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectRegisterConfirmUser, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectRegisterConfirmUser, (state) => state.get('requesting'));

export { makeSelectSuccess, makeSelectResponse, makeSelectError, makeSelectRequesting };
