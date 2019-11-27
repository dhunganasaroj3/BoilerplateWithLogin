import { createSelector } from 'reselect';

const selectUpdateBasicInfo = (state) => state.updateBasicInfo;

const makeSelectSuccess = () => createSelector(selectUpdateBasicInfo, (state) => state.get('success'));
const makeSelectResponse = () => createSelector(selectUpdateBasicInfo, (state) => state.get('response'));
const makeSelectError = () => createSelector(selectUpdateBasicInfo, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectUpdateBasicInfo, (state) => state.get('requesting'));
const makeSelectUser = () => createSelector(selectUpdateBasicInfo, (state) => state.get('user'));

export { makeSelectSuccess, makeSelectResponse, makeSelectRequesting, makeSelectError, makeSelectUser };
