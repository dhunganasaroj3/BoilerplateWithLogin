import React from "react";
import { Popup, Button } from "semantic-ui-react";

class XcelTripPopup extends React.PureComponent {
  render() {
    return (
      <Popup
        trigger={
          <div
            className="two wide column align-right"
            onClick={() => this.props.openPopup()}
          >
            <a className="negative icon button">
              <i className="icon icon-trash" />{" "}
            </a>
          </div>
        }
        content={
          <div>
            Are you sure you want to delete?
            <Button className="default" onClick={() => this.props.closePopup()}>
              No
            </Button>
            <Button negative className="default">
              Yes
            </Button>
          </div>
        }
        on="click"
        open={this.props.isOpen}
      />
    );
  }
}

export default XcelTripPopup;
