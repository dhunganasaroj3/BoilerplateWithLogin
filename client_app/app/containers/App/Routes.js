import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocation } from './selectors';
import HomePage from 'containers/HomePage/Loadable';
import Login from 'containers/Login';
import Register from 'containers/Register';
import NotFoundPage from 'containers/NotFoundPage';
import AdminDashboard from 'containers/AdminDashboard/Loadable';
import AdminDashboardLayout from 'containers/AdminDashboard/containers/AdminLayout';
import UserDashboard from 'containers/UserDashboard/Loadable';
import UserDashboardLayout from 'containers/UserDashboard/containers/UserLayout';
import GuestRoute from '../../components/Routes/GuestRoute';
import UserRoute from '../../components/Routes/UserRoute';

const mapStateToProps = createStructuredSelector({
	location: makeSelectLocation(),
});

class Routes extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
			search: PropTypes.string,
			hash: PropTypes.string,
			key: PropTypes.string,
		}).isRequired,
	};

	render() {
		return (
			<Switch location={this.props.location}>
				<Route exact path="/" render={(props) => <HomePage {...props} />} />
				<Route exact path="/login" component={Login} />
				<Route exact path="/register" component={Register} />
				<Route
					path="/admin/dashboard"
					render={(props) => (
						<AdminDashboardLayout>
							<AdminDashboard {...props} />
						</AdminDashboardLayout>
					)}
				/>
				<Route
					path="/user/dashboard"
					render={(props) => (
						<UserDashboardLayout>
							<UserDashboard {...props} />
						</UserDashboardLayout>
					)}
				/>
				<Route component={NotFoundPage} />
			</Switch>
		);
	}
}

export default connect(mapStateToProps)(Routes);
