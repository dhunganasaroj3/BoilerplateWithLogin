import React from "react";
import Redirection from "components/Redirection/admin";

class ProfileLayout extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default Redirection(["profile"])(ProfileLayout);
