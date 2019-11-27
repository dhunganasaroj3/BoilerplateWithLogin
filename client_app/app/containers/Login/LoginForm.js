import React from 'react';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import reducer from './reducer';
import saga from '../App/saga';
import { compose } from 'redux';
import { Form, Button, Icon, Label } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
// import GoogleLogin from 'react-google-login';
import InputField from 'components/common/Forms/InputField';
import Captcha from 'components/Captcha';
import PasswordInputField from 'components/common/Forms/PasswordInputField';
import { showDialog } from '../App/actions';
import {
	makeSelectRequesting,
	makeSelectError,
	makeSelectResponse,
	makeSelectEmail,
	makeSelectSuccess,
	makeSelectCaptchaEnabled,
	makeSelectUserId,
	makeSelectResendEmailRequesting,
} from './selectors';
import ForgotPassword from './forgot-password/Loadable';
import { GOOGLE_CLIENT_ID } from '../App/constants';
import { makeSelectUser } from '../App/selectors';
import { logoutRequest } from './actions';
import {
	loginRequest,
	checkCaptchaRequest,
	loginClearMessages,
	resendConfirmationRequest,
	linkFacebookRequest,
	linkGoogleRequest,
} from './actions';
import { Link } from 'react-router-dom';

const mapDispatchToProps = (dispatch) => ({
	loginRequest: (values, redirect) => dispatch(loginRequest(values, redirect)),
	showDialog: (dialog) => dispatch(showDialog(dialog)),
	isCaptchaEnabledRequest: () => dispatch(checkCaptchaRequest()),
	clearMessages: () => dispatch(loginClearMessages()),
	redirectToSignup: () => dispatch(push('/signup')),
	resendConfirmationEmail: (userId) => dispatch(resendConfirmationRequest(userId)),
	linkFacebookRequest: (token, isImp) => dispatch(linkFacebookRequest(token, isImp)),
	linkGoogleRequest: (token, isImp) => dispatch(linkGoogleRequest(token, isImp)),
	logout: () => dispatch(logoutRequest()),
});

const mapStateToProps = createStructuredSelector({
	userResponse: makeSelectUser(),
	requesting: makeSelectRequesting(),
	requestingResendEmail: makeSelectResendEmailRequesting(),
	response: makeSelectResponse(),
	error: makeSelectError(),
	success: makeSelectSuccess(),
	isCaptchaEnabled: makeSelectCaptchaEnabled(),
	unverifiedImpUserId: makeSelectUserId(),
	email: makeSelectEmail(),
});

class LoginForm extends React.Component {
	static propTypes = {
		loginRequest: PropTypes.func.isRequired,
		showDialog: PropTypes.func.isRequired,
		isCaptchaEnabledRequest: PropTypes.func.isRequired,
		redirectToSignup: PropTypes.func.isRequired,
		clearMessages: PropTypes.func.isRequired,
		resendConfirmationEmail: PropTypes.func.isRequired,
		unverifiedImpUserId: PropTypes.string.isRequired,
		requestingResendEmail: PropTypes.bool.isRequired,
	};
	state = {
		data: {
			username: this.props.email || '',
		},
		reCaptcha: '',
		show_password: false,
		errors: {},
		loadingFb: false,
		loadingGoogle: false,
		redirectToReferer: false,
	};
	componentDidMount() {
		this.props.isCaptchaEnabledRequest();
	}
	componentWillUnmount() {
		this.props.clearMessages();
	}
	handleChange = (e) => {
		e.persist();
		this.setState((state) => ({
			data: {
				...state.data,
				[e.target.name]: e.target.value,
			},
		}));
	};
	validate = () => {
		const { data, reCaptcha } = this.state;
		const { isCaptchaEnabled } = this.props;
		const errors = {};
		if (!data.username) errors.username = "Can't be blank";
		if (!data.password) errors.password = 'password_error';
		if (isCaptchaEnabled && !reCaptcha) errors.reCaptcha = 'Please check I am not a Robot checkbox';
		return errors;
	};
	handleSubmit = (e) => {
		e.preventDefault();
		const { isCaptchaEnabled, loginRequest } = this.props;
		const { data, reCaptcha } = this.state;
		const errors = this.validate();
		this.setState({ errors });
		if (Object.keys(errors).length === 0) {
			const { from } = this.props.location.state || { from: false };

			if (isCaptchaEnabled) loginRequest({ ...data, reCaptcha }, from);
			else loginRequest(data, from);
		}
	};
	onChange = (e) => {
		this.setState({
			reCaptcha: e,
		});
	};
	showSignUpForm = () => {
		this.props.showDialog(null);
		this.props.redirectToSignup();
	};
	showForgotPasswordForm = () => this.props.showDialog(<ForgotPassword />);
	resendEmail = () => {
		this.props.resendConfirmationEmail(this.props.unverifiedImpUserId);
	};

	render() {
		const { data, errors, loadingFb, loadingGoogle } = this.state;
		const {
			response,
			error,
			requesting,
			isCaptchaEnabled,
			unverifiedImpUserId,
			requestingResendEmail,
			location,
			userResponse,
		} = this.props;
		let userResp = userResponse ? userResponse.toJS() : '{}';
		let url = '';
		if (userResp && Object.keys(userResp).length > 1) {
			url = userResp.user_role[0] == 'enduser' ? '/user/dashboard' : '/admin/dashboard';
		}
		return (
			<div>
				{error && (
					<div className="negative message">
						<p>{error}</p>
						{unverifiedImpUserId && (
							<Button
								secondary
								size="small"
								onClick={this.resendEmail}
								disabled={requestingResendEmail}
								loading={requestingResendEmail}
							>
								Resend Email
							</Button>
						)}
					</div>
				)}
				{response && <div className="positive message">{response}</div>}
				<h3>{userResp && Object.keys(userResp).length > 1 ? 'Already Logged in' : 'Login'}</h3>
				{userResp &&
				Object.keys(userResp).length < 1 && (
					<Form onSubmit={this.handleSubmit} className="ui form">
						<InputField
							type="text"
							label="Email ID"
							name="username"
							className="form-control"
							value={data.username || ''}
							onChange={this.handleChange}
							error={errors.username ? 'username_error' : null}
						/>
						<div className="pos-rel mg-btm-sm">
							<PasswordInputField
								password={data.password || ''}
								onChange={this.handleChange}
								error={errors.password ? 'password_error' : null}
							/>
						</div>
						<div>
							{isCaptchaEnabled && (
								<div className="hasCaptcha field" style={{ height: '76px' }}>
									<Captcha onChange={this.onChange} />
									{errors.reCaptcha && (
										<span data-tooltip={errors.reCaptcha}>
											<i className="icon-exclamation-triangle red" />
										</span>
									)}
								</div>
							)}
						</div>
						<p>
							{window.location.pathname.split('/')[1] != 'guest-detail' && (
								<a tabIndex="" onClick={this.showForgotPasswordForm} className="frg-pw">
									Forgot Password ?
								</a>
							)}
						</p>

						<Button className="button large" type="submit" loading={requesting} disabled={requesting}>
							Login
						</Button>
					</Form>
				)}
				{userResp &&
				Object.keys(userResp).length > 1 && (
					<div>
						<p>
							You are already logged in. Go to{' '}
							<Link className="alt-link" to={url}>
								{' '}
								Dashboard{' '}
							</Link>.
						</p>
						OR
						<Label className="alt-link" onClick={this.props.logout}>
							{' '}
							Logout{' '}
						</Label>{' '}
						and sign in using different account.
					</div>
				)}
			</div>
		);
	}
}

// export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = injectReducer({ key: 'login', reducer });
// const withSaga = injectSaga({ key: 'login', saga });
export default compose(withReducer, withConnect)(LoginForm);
