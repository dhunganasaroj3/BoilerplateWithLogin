import { createSelector } from 'reselect';

const selectPasswordSet = (state) => state.registerPasswordSetForm;

const makeSelectError = () => createSelector(selectPasswordSet, (state) => state.get('error'));
const makeSelectRequesting = () => createSelector(selectPasswordSet, (state) => state.get('requesting'));

export { makeSelectError, makeSelectRequesting };
