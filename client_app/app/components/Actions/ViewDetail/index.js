import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { DOCUMENT_URL_UPDATE } from '../../../containers/App/constants';

class ViewDetail extends React.PureComponent {
	render() {
		const { hideDialog, data } = this.props;
		return (
			<Modal
				dimmer="blurring"
				className="tiny"
				style={{ marginTop: '150px', marginLeft: '400px' }}
				open
				onClose={() => hideDialog()}
			>
				<Modal.Header>Questionnaire Detail</Modal.Header>
				<Modal.Content>
					{data.question && <h4>Question: {data.question}</h4>}
					{data.title && <h4>Title: {data.title}</h4>}
					<h4>Description: {data.description}</h4>
					{data.file && (
						<div className="card card-md">
							<img
								src={`${DOCUMENT_URL_UPDATE}${data.file.document_name}`}
								style={{
									border: '1px solid #ddd',
									borderRadius: '4px',
									padding: '5px',
									width: '150px',
								}}
								height="100"
								width="100"
							/>
						</div>
					)}
				</Modal.Content>
				<Modal.Actions>
					<Button className="default" onClick={() => hideDialog()}>
						Close
					</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

export default ViewDetail;
