import React from 'react';
import { createStructuredSelector } from 'reselect';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import intersection from 'lodash/intersection';
import jwtDecode from 'jwt-decode';
import { showDialog } from 'containers/App/actions';
// import Login from 'containers/Login';
import { makeSelectUser } from 'containers/App/selectors'

const mapStateToProps = createStructuredSelector({
  user: makeSelectUser()
});

const mapDispatchToProps = dispatch => ({
  showDialog: dialog => dispatch(showDialog(dialog))
});
// allowedRoles.filter(role => user_role.indexOf(role) > 0).length > 0
const Redirection = allowedRoles => WrappedComponent =>
  class Redirection extends React.PureComponent {
    render() {
      const token = localStorage.getItem('token');

      try {
        const decoded = jwtDecode(token);

        if (
          typeof decoded === 'object' &&
          decoded.hasOwnProperty('user') &&
          decoded.hasOwnProperty('exp') &&
          decoded.exp > Date.now() / 1000
        ) {
          const { user_role, parent_user_role } = decoded.user;
          const userRole = user_role || [];
          const parentUserRole = parent_user_role || [];
          if (intersection(allowedRoles, userRole).length > 0 || intersection(allowedRoles, parentUserRole).length > 0) {
            return <WrappedComponent {...this.props} />;
          }
        }
      } catch(error) {
        return <Redirect to="/" />;
      }
      return <Redirect to="/" />;
    }
  };

export default props => WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(Redirection(props)(WrappedComponent));
