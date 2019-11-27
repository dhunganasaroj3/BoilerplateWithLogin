import { fromJS } from 'immutable';
import * as types from './constants';
import { normalize } from 'normalizr';
import { contentTemplateSchema } from './schemas';

const initialState = fromJS({
	requesting: false,
	ownDashboard: true,
	dialog: {},
	token: '',
	user: {},
	contentTemplateNormalized: {},
});

function reducer(state = initialState, action = {}) {
	switch (action.type) {
		case types.NOT_USER:
			return state.merge({
				ownDashboard: false,
			});
		case types.SHOW_DIALOG:
			return state.merge({
				dialog: fromJS(action.payload),
			});
		case types.SET_TOKEN:
			return state.merge({
				token: action.payload,
			});
		case types.SET_USER:
			return state.merge({
				user: fromJS(action.payload),
			});
		case types.LOAD_CONTENT_TEMPLATE_SUCCESS:
			return state.merge({
				// contentTemplate: fromJS(action.response.data.dataList),
				contentTemplateNormalized: fromJS(
					normalize(action.response.data.dataList, [ contentTemplateSchema ]).entities.contentTemplate || {},
				),
			});
		case types.LOAD_CONTENT_TEMPLATE_FAILURE:
			return state.merge({
				requesting: false,
			});
		case types.LOAD_CONTENT_TEMPLATE_REQUEST:
			return state.merge({});
		default:
			return state;
	}
}

export default reducer;
