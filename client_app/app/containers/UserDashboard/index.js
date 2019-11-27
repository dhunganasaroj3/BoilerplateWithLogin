import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import Helmet from 'react-helmet/lib/Helmet';
import { Button, Message, Icon } from 'semantic-ui-react';
import ProfilePic from 'assets/img/noProfile.svg';
import { makeSelectUserConfirmation } from 'containers/Login/selectors';
// import TopNavigation from './components/TopNavigation';
import SideNavigation from './components/SideNavigation';
import { makeSelectLocation, makeSelectUser } from '../App/selectors';
import { logoutRequest } from '../Login/actions';
import { resendConfirmationRequest } from './actions';
import { DOCUMENT_URL_UPDATE } from '../App/constants';
import Routes from './Routes';

import {
	makeSelectError,
	makeSelectResponse,
	makeSelectRequesting,
	makeSelectSuccess,
	makeSelectStatus,
} from './selectors';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import saga from './sagas';
import { compose } from 'redux';

const mapStateToProps = createStructuredSelector({
	location: makeSelectLocation(),
	user: makeSelectUser(),
	userConfirmation: makeSelectUserConfirmation(),
	successResponse: makeSelectResponse(),
	errorResponse: makeSelectError(),
	isRequesting: makeSelectRequesting(),
	resendEmailSuccess: makeSelectSuccess(),
	responseStatus: makeSelectStatus(),
});

const mapDispatchToProps = (dispatch) => ({
	logout: () => dispatch(logoutRequest()),
	resendConfirmation: () => dispatch(resendConfirmationRequest()),
	navigateToProfilePage: () => dispatch(push('/user/dashboard/profile/basic-info')),
});

class UserDashboard extends React.Component {
	static propTypes = {
		logout: PropTypes.func.isRequired,
		resendConfirmation: PropTypes.func.isRequired,
		navigateToProfilePage: PropTypes.func.isRequired,
		user: PropTypes.object,
	};
	state = {
		username: '',
		isConfirmed: false,
		ProfilePic,
		roles: [],
		messageVisible: true,
	};

	componentWillMount() {}

	componentDidMount() {
		let username;
		const { user } = this.props;
		const userInfo = user && user;
		if (userInfo && userInfo.size !== 0) {
			const firstName = userInfo.get('first_name');
			const lastName = userInfo.get('last_name');
			username = `${firstName} ${lastName}`;
			this.setState({
				username,
				isConfirmed: userInfo.get('confirmed'),
			});
			if (userInfo.get('image_name')) {
				this.setState({
					ProfilePic: `${DOCUMENT_URL_UPDATE}${userInfo.get('image_name')}`,
				});
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.user !== nextProps.user) {
			if (nextProps.user.get('confirmed')) {
				this.setState({ isConfirmed: true });
			}
			const userInfo = nextProps.user;
			const firstName = userInfo.get('first_name');
			const lastName = userInfo.get('last_name');
			const username = `${firstName} ${lastName}`;
			if (userInfo.get('image_name')) {
				this.setState({
					ProfilePic: `${DOCUMENT_URL_UPDATE}${userInfo.get('image_name')}`,
				});
			}
			this.setState({
				username,
				isConfirmed: userInfo.get('confirmed'),
			});
		}
	}

	resendConfirmation = () => this.props.resendConfirmation();
	handleLogout = () => this.props.logout();
	handleMessageDismiss = () => {
		this.setState({ messageVisible: false });
	};

	render() {
		return (
			<div>
				<Button className="right floated" onClick={this.handleLogout}>
					Logout{' '}
				</Button>
				<SideNavigation />
				<div style={{ marginLeft: '200px' }}>
					<Routes location={this.props.location} />
				</div>
			</div>
		);
	}
}

const withReducer = injectReducer({ key: 'userDashboard', reducer });
const withSaga = injectSaga({ key: 'userDashboard', saga });
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withReducer, withSaga, withConnect)(UserDashboard);
