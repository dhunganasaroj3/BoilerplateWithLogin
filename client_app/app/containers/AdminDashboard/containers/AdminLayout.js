import React from 'react';
import Redirection from 'components/Actions/Redirection/admin';

class AdminLayout extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export default Redirection(['superadmin'])(AdminLayout);
