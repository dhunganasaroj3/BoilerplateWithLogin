import React from 'react';
import { Modal } from 'semantic-ui-react';

const ModalWrapper = ({ header, onClose, children, classNames, ...props }) => (
  <Modal className={classNames} open onClose={onClose} closeIcon closeOnDimmerClick={false} {...props}>
    <Modal.Header>{header}</Modal.Header>
    <Modal.Content>
      <Modal.Description>
        {children}
      </Modal.Description>
    </Modal.Content>
  </Modal>
);

export default ModalWrapper;
