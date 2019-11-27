import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectIsLoggedIn } from '../../containers/Login/selectors';

const GuestRoute = ({ isAuthenticated, component: Component, ...rest }) => {

  return(
    <Route
    {...rest} render={(props) =>
    !isAuthenticated ? <Component {...props} /> : <Redirect to="/"/>}
  />)

};

GuestRoute.propTypes = {
  component: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  isAuthenticated: makeSelectIsLoggedIn(),
});

export default connect(mapStateToProps)(GuestRoute);