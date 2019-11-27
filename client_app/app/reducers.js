/**
 * Combine all reducers in this file and export the combined reducers.
 */
import { fromJS } from 'immutable';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from 'utils/history';
import globalReducer from 'containers/App/reducer';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import loginReducer from 'containers/Login/reducer';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export default function createReducer(injectedReducers = {}) {
	const rootReducer = combineReducers({
		language: languageProviderReducer,
		router: connectRouter(history),
		global: globalReducer,
		login: loginReducer,
		...injectedReducers,
	});

	return rootReducer;
}
