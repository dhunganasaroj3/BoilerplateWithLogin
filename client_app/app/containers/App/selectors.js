import { createSelector } from 'reselect';

const selectGlobal = (state) => state.global;
const selectRouter = (state) => state.router;
const selectLogin = (state) => state.login;

const selectInitialize = () => createSelector(selectGlobal, (state) => state.get('initialized'));
const makeSelectIntroTool = () => createSelector(selectGlobal, (state) => state.get('loadIntroTool'));
const makeSelectError = () => createSelector(selectGlobal, (state) => state.get('error'));
const makeSelectUserId = () => createSelector(makeSelectUser(), (state) => state.get('_id'));
const makeSelectDialog = () => createSelector(selectGlobal, (state) => state.get('dialog'));
const makeSelectMessage = () => createSelector(selectGlobal, (state) => state.get('message'));
const makeSelectLoading = () => createSelector(selectGlobal, (state) => state.get('loading'));
const makeSelectToast = () => createSelector(selectGlobal, (state) => state.get('toast'));
const makeSelectFirstLoad = () => createSelector(selectGlobal, (state) => state.get('firstLoad'));

const makeSelectLocation = () => createSelector(selectRouter, (routerState) => routerState.location);
const makeSelectUser = () => createSelector(selectLogin, (state) => state.get('userInfo'));

export {
	makeSelectLocation,
	makeSelectUser,
	makeSelectDialog,
	makeSelectError,
	makeSelectFirstLoad,
	makeSelectIntroTool,
	makeSelectLoading,
	makeSelectToast,
	makeSelectUserId,
	makeSelectMessage,
	selectInitialize,
};
