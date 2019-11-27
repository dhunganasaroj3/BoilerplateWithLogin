import React from 'react';
import {capitalize} from 'utils/helper';
import {Button, Modal} from 'semantic-ui-react';

class DeleteConfirmation extends React.PureComponent {
  handleDelete(key, deleteExtraParam) {
    if (key === undefined) {
      this.props.onDelete();
    } else if (deleteExtraParam) {
      this.props.onDelete(deleteExtraParam, key);
    } else {
      this.props.onDelete(key);
    }
    this.props.hideDialog();
  }

  render() {
    const {deleteKey, deleteExtraParam, hideDialog, text} = this.props;
    return (
      <Modal dimmer="blurring" className="tiny" open onClose={() => hideDialog()}>
        <Modal.Header>
          Delete {text && capitalize(text)}
        </Modal.Header>
        <Modal.Content>
          <p>
            Are you sure you want to delete {text && text}?
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button className="default" onClick={() => hideDialog()}>
            Cancel
          </Button>
          <Button
            negative
            content="Delete"
            onClick={() => {
              return this.handleDelete(deleteKey && deleteKey, deleteExtraParam && deleteExtraParam)
            }}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default DeleteConfirmation;
