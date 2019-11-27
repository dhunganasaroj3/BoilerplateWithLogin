import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectIsLoggedIn } from '../../containers/Login/selectors';

const UserRoute = ({ isAuthenticated, component: Component, ...rest }) => {
  return(
  //   <Route
  //   {...rest} render={(props) =>
  //   isAuthenticated ? <Component {...props} /> : <Redirect to={{
  //     pathname: '/login',
  //     state: { from: props.location },
  //   }}/>}
  // />
  <Route
    {...rest} render={(props) =>
    isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />}
  />
  )

};

UserRoute.propTypes = {
  component: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  isAuthenticated: makeSelectIsLoggedIn(),
});
// const UserRoute = ({ isAuthenticated, ...rest }) => {
//   if (isAuthenticated) return <Route {...rest} />;
//   delete rest['component'];
//   return <Route {...rest} render={props => <Redirect to="/login" />} />;
// };
//
// UserRoute.propTypes = {
//   isAuthenticated: PropTypes.bool.isRequired,
// };
// const mapStateToProps = createStructuredSelector({
//   isAuthenticated: makeSelectIsAuthenticated(),
// });

export default connect(mapStateToProps)(UserRoute);
