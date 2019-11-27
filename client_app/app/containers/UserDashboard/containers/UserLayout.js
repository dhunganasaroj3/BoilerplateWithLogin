import React from 'react';
import Redirection from 'components/Actions/Redirection';

class UserLayout extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export default Redirection(['enduser'])(UserLayout);
