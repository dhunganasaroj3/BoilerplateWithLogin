import { createSelector } from 'reselect';

const selectUnblockUser = (state) => state.loginUnblockUser;

const makeSelectSuccess = () => createSelector(selectUnblockUser, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(selectUnblockUser, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectUnblockUser, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectUnblockUser, (state) => state.get('requesting'));

export { makeSelectSuccess, makeSelectResponse, makeSelectError, makeSelectRequesting };
