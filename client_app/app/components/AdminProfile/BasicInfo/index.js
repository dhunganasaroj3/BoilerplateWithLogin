import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import moment from 'moment';
import { updateBasicInfoRequest, basicInfoClearState } from './actions';
import { makeSelectResponse, makeSelectError, makeSelectRequesting, makeSelectSuccess } from './selectors';
import { DOCUMENT_URL_UPDATE } from 'containers/App/constants';
import { makeSelectUser } from 'containers/App/selectors';
import BasicInfoForm from './BasicInfoForm';
import Toaster from 'components/Toaster';
import saga from './sagas';
import reducer from './reducer';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { compose } from 'redux';

const mapStateToProps = createStructuredSelector({
	user: makeSelectUser(),
	successResponse: makeSelectResponse(),
	errorResponse: makeSelectError(),
	requesting: makeSelectRequesting(),
	success: makeSelectSuccess(),
});

const mapDispatchToProps = (dispatch) => ({
	updateBasicInfoRequest: (user, image) => dispatch(updateBasicInfoRequest(user, image)),
	clearState: () => dispatch(basicInfoClearState()),
});

class BasicInfo extends React.Component {
	static propTypes = {
		updateBasicInfoRequest: PropTypes.func.isRequired,
		clearState: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
	};
	state = {
		data: {},
		avatarImage: this.props.user.get('image_name')
			? `${DOCUMENT_URL_UPDATE}${this.props.user.get('image_name')}`
			: null,
		imageFile: null,
		date: null,
		focused: false,
	};
	componentDidMount() {
		if (this.props.user.size > 0) {
			const userObj = this.props.user.toJS();

			// if (!!userObj.birth_date) this.setState({ date: moment(new Date(userObj.birth_date), "MM-DD-YYYY").format('MM-DD-YYYY') },()=>{ userObj.birth_date=this.state.date });
			if (!!userObj.image_name)
				this.setState((state) => ({ avatarImage: `${DOCUMENT_URL_UPDATE}${userObj.image_name}` }));

			this.setState({ data: userObj });
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.user !== this.props.user) {
			const userObj = nextProps.user.toJS();
			// if (!!userObj.birth_date) this.setState({ date: moment(new Date(userObj.birth_date), "MM-DD-YYYY").format('MM-DD-YYYY') },()=>{ userObj.birth_date=this.state.date.toString() });;
			if (!!userObj.image_name)
				this.setState((state) => ({ avatarImage: `${DOCUMENT_URL_UPDATE}${userObj.image_name}` }));
			this.setState({ data: userObj });
		}
	}
	componentWillUnmount() {
		this.props.clearState();
	}
	handleCheckBox = (e) => {
		e.persist();
		this.setState((state) => ({
			data: {
				...state.data,
				[e.target.name]: !this.state.data[e.target.name],
			},
		}));
	};
	handleDateChange = (date) => {
		this.setState({
			data: {
				...this.state.data,
				birth_date: date,
			},
		});
	};
	handleChange = (e) => {
		e.persist();
		this.setState((state) => ({
			data: {
				...state.data,
				[e.target.name]: e.target.value,
			},
		}));
	};
	parseDate = (date) => {
		const momentDate = moment(date, 'MM-DD-YYYY');
		return momentDate.format('MM-DD-YYYY');
	};
	handlePublishDateChange = (e) => {
		this.setState({
			data: {
				...this.state.data,
				birth_date: this.parseDate(e),
			},
		});
	};

	onDrop = (imgFile) => {
		let imgFiles = imgFile[0];
		imgFiles.preview = URL.createObjectURL(imgFiles);
		this.setState({ avatarImage: imgFiles.preview, imageFile: imgFiles, newImage: true });
	};

	setEditorRef = (editor) => (this.editor = editor);

	onCrop = (e) => {
		e.preventDefault();
		if (this.editor) {
			const canvas = this.editor.getImage().toDataURL();
			fetch(canvas).then((res) => res.blob()).then((blob) => {
				const file = new File([ blob ], 'profilepic.jpg');
				this.setState({
					imageFile: file,
					avatarImage: canvas,
				});
			});
		}
	};

	handleNewImage = (e) => {
		e.preventDefault();

		this.setState({
			avatarImage: e.target.files[0],
		});
	};

	handleRadioChange = (e, { name, value }) => this.setState({ data: { ...this.state.data, [name]: value } });
	handleSubmit = (e) => {
		e.preventDefault();
		const { data, imageFile } = this.state;
		if (!!imageFile) {
			this.props.updateBasicInfoRequest(data, imageFile);
		} else {
			this.props.updateBasicInfoRequest(data);
		}
	};
	onDateChange = (date) => this.setState({ date });
	onFocusChange = ({ focused }) => this.setState({ focused });
	isOutsideRange = (day) => !day.isBefore(moment());

	render() {
		const { data, avatarImage, date, focused } = this.state;
		const { successResponse, errorResponse, requesting } = this.props;
		let message;
		if (successResponse && typeof successResponse === 'string') {
			message = <Toaster message={successResponse} timeout={5000} success />;
		}
		if (errorResponse && typeof errorResponse === 'string') {
			message = <Toaster message={errorResponse} timeout={5000} error />;
		}
		// todo: clean too many parameters in BasicInfoForm
		return (
			<div className="segment">
				{message && message}
				<BasicInfoForm
					date={date}
					focused={focused}
					onDateChange={this.onDateChange}
					onFocusChange={this.onFocusChange}
					isOutsideRange={this.isOutsideRange}
					user={data}
					avatarImage={avatarImage}
					onDrop={this.onDrop}
					handleChange={this.handleChange}
					handleSubmit={this.handleSubmit}
					isLoading={requesting}
					datechange={this.handleDateChange}
					handleCheckBox={this.handleCheckBox}
					handleGenderChange={this.handleRadioChange}
					parseDate={this.parseDate}
					handlePublishDateChange={this.handlePublishDateChange}
					newImage={this.state.newImage}
					setEditorRef={this.setEditorRef}
					onCrop={this.onCrop}
					handleNewImage={this.handleNewImage}
				/>
			</div>
		);
	}
}

const withReducer = injectReducer({ key: 'adminProfileBasicInfo', reducer });
const withSaga = injectSaga({ key: 'adminProfileBasicInfo', saga });
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withReducer, withSaga, withConnect)(BasicInfo);
