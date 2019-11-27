import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import jwtDecode from 'jwt-decode';
import { makeSelectUser, makeSelectLocation } from '../App/selectors';
import { logoutRequest } from '../Login/actions';
import SideNavigation from './components/SideNavigation';
import { Button } from 'semantic-ui-react';
import Routes from './Routes';
import { DOCUMENT_URL_UPDATE } from 'containers/App/constants';
import ProfilePic from 'assets/img/avatar.png';

const mapStateToProps = createStructuredSelector({
	location: makeSelectLocation(),
	user: makeSelectUser(),
});

const mapDispatchToProps = (dispatch) => ({
	logout: () => dispatch(logoutRequest()),
	navigateToProfilePage: () => dispatch(push('/admin/dashboard/profile')),
});

class AdminDashboard extends React.Component {
	state = {
		username: '',
		menuVisible: false,
		ProfilePic,
		moduleList: [],
	};

	componentWillMount() {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decoded = jwtDecode(token);
				this.setState({
					userRole: decoded.user.user_role[0],
				});
				if (decoded.user.user_role[0] !== 'superadmin') {
					const allowed_actions = localStorage.getItem('allowed_actions');
					const module_list = [];
					if (allowed_actions) {
						try {
							const decoded = jwtDecode(allowed_actions);
							decoded.allowed_actions.map((group_list) => module_list.push(group_list.group_title));
						} catch (error) {
							localStorage.clear();
						}
						this.setState({
							moduleList: module_list,
						});
					}
					const action_list = [];
					if (allowed_actions) {
						try {
							const decoded = jwtDecode(allowed_actions);
							decoded.allowed_actions.map((group_list) =>
								group_list.allowed_actions.map((action_group) =>
									action_list.push(action_group.action_title),
								),
							);
						} catch (error) {
							localStorage.clear();
							sessionStorage.removeItem('token');
						}
						this.setState({
							actionList: action_list,
						});
					}
				}
			} catch (error) {
				localStorage.clear();
				sessionStorage.removeItem('token');
			}
		}
	}

	componentDidMount() {
		let username;
		const { user } = this.props;
		const userInfo = user && user;
		if (userInfo && userInfo.size > 0) {
			const first_name = userInfo.get('first_name');
			const last_name = userInfo.get('last_name');
			username = first_name + ' ' + last_name;
			this.setState({ username });
			if (userInfo.get('image_name')) {
				this.setState({
					ProfilePic: `${DOCUMENT_URL_UPDATE}${userInfo.get('image_name')}`,
				});
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.user !== nextProps.user) {
			const userInfo = nextProps.user;
			const first_name = userInfo.get('first_name');
			const last_name = userInfo.get('last_name');
			const username = first_name + ' ' + last_name;
			if (userInfo.get('image_name')) {
				this.setState({
					ProfilePic: `${DOCUMENT_URL_UPDATE}${userInfo.get('image_name')}`,
				});
			}
			this.setState({ username });
		}
	}

	handleLogout = () => {
		this.props.logout();
	};

	render() {
		return (
			<div>
				Admin Dashboard
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminDashboard));
