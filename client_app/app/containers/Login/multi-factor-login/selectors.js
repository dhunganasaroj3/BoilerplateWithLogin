import { createSelector } from 'reselect';

const selectMultiFactorLogin = (state) => state.loginMultiFactorLogin;

const makeSelectError = () => createSelector(selectMultiFactorLogin, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectMultiFactorLogin, (state) => state.get('requesting'));

export { makeSelectError, makeSelectRequesting };
