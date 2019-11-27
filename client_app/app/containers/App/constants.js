const isProdEnv = process.env.NODE_ENV === 'production';

export const API_BASE = isProdEnv ? 'https://xcelpay.xceltrip.com/api/' : 'http://localhost:4000/api/';
// 'http://46.51.223.10:4000/api/';

export const GOOGLE_CLIENT_ID = '632673995527-997dv6bet048loapcqgtfpfbqubslr2l.apps.googleusercontent.com';
export const RECAPTCHA_SITE_KEY = '6Le2JDIUAAAAAHDQrwjHmm2YgMXULV4tShO0dytY';

export const prefixes = [
	{
		text: 'Mr',
		value: 'mr',
	},
	{
		text: 'Mrs',
		value: 'mrs',
	},
	{
		text: 'Miss',
		value: 'miss',
	},
];
export const LOGIN_BY_TOKEN_REQUEST = 'app/App/LOGIN_BY_TOKEN_REQUEST';
export const LOGIN_BY_TOKEN_SUCCESS = 'app/App/LOGIN_BY_TOKEN_SUCCESS';
export const LOGIN_BY_TOKEN_FAILURE = 'app/App/LOGIN_BY_TOKEN_FAILURE';

// export const LOGOUT_REQUEST = 'app/App/LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'app/App/LOGOUT_SUCCESS';
// export const LOGOUT_FAILURE = 'app/App/LOGOUT_FAILURE';

export const SHOW_DIALOG = 'app/App/SHOW_DIALOG';
export const SET_TOKEN = 'app/App/SET_TOKEN';
export const SET_USER = 'app/App/SET_USER';

export const NOT_USER = 'app/App/NOT_USER';

export const LOAD_CONTENT_TEMPLATE_REQUEST = 'app/App/LOAD_CONTENT_TEMPLATE_REQUEST';
export const LOAD_CONTENT_TEMPLATE_SUCCESS = 'app/App/LOAD_CONTENT_TEMPLATE_SUCCESS';
export const LOAD_CONTENT_TEMPLATE_FAILURE = 'app/App/LOAD_CONTENT_TEMPLATE_FAILURE';

export const DOCUMENT_URL_UPDATE =
	process.env.NODE_ENV === 'production'
		? 'https://dev-bitsbeat-s3.s3.amazonaws.com/'
		: 'https://dev-bitsbeat-s3.s3.amazonaws.com/';
