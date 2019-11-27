import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocation } from 'containers/App/selectors';
import Profile from 'components/AdminProfile';

function AdminRoutes({ location }) {
	return (
		<Switch location={location}>
			{/* <Route exact path="/dashboard" component={AdminDashboard} /> */}
			{/* <Redirect from="*" to="/admin/dashboard" /> */}
			<Route
				path="/admin/dashboard/profile"
				render={(props) => (
					<Profile
						tabs={[
							{
								to: '/admin/dashboard/profile/basic-info',
								label: 'Basic Info',
								action_title: 'profile_basic_info',
							},
							{
								to: '/admin/dashboard/profile/password',
								label: 'Password',
								action_title: 'profile_password',
							},
							{
								to: '/admin/dashboard/profile/multi-factor-auth',
								label: 'Two Factor Auth',
								action_title: 'profile_two_factor_auth',
							},
						]}
						{...props}
					/>
				)}
			/>
		</Switch>
	);
}

const mapStateToProps = createStructuredSelector({
	location: makeSelectLocation(),
});

export default connect(mapStateToProps)(AdminRoutes);
