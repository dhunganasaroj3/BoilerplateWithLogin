import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocation } from 'containers/App/selectors';
import BasicInfo from '../BasicInfo/Loadable';
import Password from '../Password/Loadable';
import MultiFactorAuth from '../MultiFactorAuth/Loadable';

const mapStateToProps = createStructuredSelector({
	location: makeSelectLocation(),
});

function ProfileRoutes({ location }) {
	return (
		<Switch location={location}>
			<Route exact path="/*/dashboard/profile" render={(props) => <BasicInfo {...props} />} />
			<Route path="/*/dashboard/profile/basic-info" render={(props) => <BasicInfo {...props} />} />
			<Route path="/*/dashboard/profile/password" render={(props) => <Password {...props} />} />
			<Route path="/*/dashboard/profile/multi-factor-auth" render={(props) => <MultiFactorAuth {...props} />} />
		</Switch>
	);
}

export default connect(mapStateToProps)(ProfileRoutes);
