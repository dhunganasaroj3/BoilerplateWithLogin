import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import moment from 'moment';
import { updateBasicInfoRequest, basicInfoClearState } from './actions';
import {
  makeSelectResponse,
  makeSelectError,
  makeSelectRequesting,
  makeSelectSuccess,
} from './selectors';
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

const mapDispatchToProps = dispatch => ({
  updateBasicInfoRequest: (user, image) =>
    dispatch(updateBasicInfoRequest(user, image)),
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
      if (!!userObj.birth_date)
        this.setState(state => ({
          date: moment(userObj.birth_date, 'MM-DD-YYYY'),
        }));
      if (!!userObj.image_name)
        this.setState(state => ({
          avatarImage: `${DOCUMENT_URL_UPDATE}${userObj.image_name}`,
        }));
      this.setState(state => ({ data: { ...userObj } }));
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user) {
      const userObj = nextProps.user.toJS();
      if (!!userObj.birth_date)
        this.setState(state => ({
          date: moment(userObj.birth_date, 'MM-DD-YYYY'),
        }));
      if (!!userObj.image_name)
        this.setState(state => ({
          avatarImage: `${DOCUMENT_URL_UPDATE}${userObj.image_name}`,
        }));
      this.setState(state => ({ data: { ...userObj } }));
    }
  }
  componentWillUnmount() {
    this.props.clearState();
  }
  handleCheckBox = e => {
    e.persist();
    this.setState(state => ({
      data: {
        ...state.data,
        [e.target.name]: !this.state.data[e.target.name],
      },
    }));
  };
  handleDateChange = date => {
    this.setState(state => ({
      data: {
        ...state.data,
        birth_date: date,
      },
    }));
  };
  handleChange = e => {
    e.persist();
    this.setState(state => ({
      data: {
        ...state.data,
        [e.target.name]: e.target.value,
      },
    }));
  };

  onDrop = imgFile => {
    imgFile[0].preview = URL.createObjectURL(imgFile[0]);
    this.setState({
      imageFile: imgFile[0],
      avatarImage: imgFile[0].preview,
      newImage: true,
    });
  };

  setEditorRef = editor => (this.editor = editor);

  onCrop = e => {
    e.preventDefault();
    if (this.editor) {
      const canvas = this.editor.getImage().toDataURL();
      fetch(canvas)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'profilepic.jpg');
          this.setState({
            imageFile: file,
            avatarImage: canvas,
          });
        });
    }
  };

  handleNewImage = e => {
    e.preventDefault();

    this.setState({
      avatarImage: e.target.files[0],
    });
  };

  handleRadioChange = (e, { name, value }) =>
    this.setState({ data: { ...this.state.data, [name]: value } });
  handleSubmit = e => {
    e.preventDefault();
    const { data, imageFile } = this.state;
    this.setState({ newImage: false });
    if (!!imageFile) {
      this.props.updateBasicInfoRequest(data, imageFile);
    } else {
      this.props.updateBasicInfoRequest(data);
    }
  };
  onDateChange = date => this.setState({ date });
  onFocusChange = ({ focused }) => this.setState({ focused });
  isOutsideRange = day => !day.isBefore(moment());

  render() {
    const { data, avatarImage, date, focused, newImage } = this.state;
    const { successResponse, errorResponse, requesting } = this.props;
    let message;
    if (successResponse && typeof successResponse === 'string') {
      message = <Toaster message={successResponse} timeout={3000} success />;
    }
    if (errorResponse && typeof errorResponse === 'string') {
      message = <Toaster message={errorResponse} timeout={3000} error />;
    }
    // todo: clean too many parameters in BasicInfoForm
    return (
      <div className="profile_section">
        <React.Fragment>
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
            setEditorRef={this.setEditorRef}
            onCrop={this.onCrop}
            newImage={newImage}
          />
        </React.Fragment>
      </div>
    );
  }
}

const withReducer = injectReducer({ key: 'updateBasicInfo', reducer });
const withSaga = injectSaga({ key: 'updateBasicInfo', saga });
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(BasicInfo);
