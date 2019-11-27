import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { showDialog } from 'containers/App/actions';
import InputField from 'components/common/Forms/InputField';
import { multiFactorAuthLoginRequest, clearState } from './actions';
import { loginClearState } from '../actions'
import { makeSelectRequesting, makeSelectError } from './selectors';
import {compose} from "redux";
const mapStateToProps = createStructuredSelector({
  isRequesting: makeSelectRequesting(),
  errorResponse: makeSelectError()
});
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import saga from './sagas';

const mapDispatchToProps = (dispatch) => ({
  multiFactorAuthLogin: (userId, data) => dispatch(multiFactorAuthLoginRequest(userId, data)),
  showDialog: (dialog) => dispatch(showDialog(dialog)),
  clearState: () => dispatch(clearState()),
  loginClearState: () => dispatch(loginClearState()),
});

class MultiFactorLogin extends React.Component {
  static propTypes = {
    isRequesting: PropTypes.bool.isRequired,
    user_id: PropTypes.string.isRequired,
    multiFactorAuthLogin: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    clearState: PropTypes.func.isRequired,
    loginClearState: PropTypes.func.isRequired,
  };

  state = {
    data: {},
    errors: {}
  };
  componentWillMount() {
    this.props.loginClearState();
  }
  componentWillUnmount() {
    this.props.clearState();
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      data: {
        [e.target.name]: e.target.value,
      },
    });
  };
  validate = () => {
    const { data } = this.state;
    const errors = {};
    if (!data.totp_token) errors.totp_token = "Token required";
    return errors;
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.props.multiFactorAuthLogin(this.props.user_id, this.state.data);
    }
  };
  render() {
    const { errors, data } = this.state;
    const { isRequesting, errorResponse } = this.props;
    return (
      <Modal open onClose={() => this.props.showDialog(null)} className="mini">
        <Modal.Content>
          {errorResponse &&
            <p className="negative message">
              {errorResponse}
            </p>}
          <i className="icon-lock text-lg"/><br/>
          <h3 className="thin">XCELTRIP Multi Factor Auth Login</h3>
          <p>Enter the token from your authenticator app</p>
          <Form onSubmit={this.handleSubmit}>
            <InputField
              type="text"
              name="totp_token"
              required
              placeholder="Token..."
              className="form-control"
              value={data.totp_token || ''}
              onChange={this.handleChange}
              error={errors.totp_token}
            />
            <div className="field clearfix align-right">
              <div className="inline-block">
                <Button
                  type="submit"
                  className="primary button"
                  loading={isRequesting}
                  disabled={isRequesting}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(MultiFactorLogin);
const withReducer = injectReducer({ key: 'loginMultiFactorLogin', reducer });
const withSaga = injectSaga({ key: 'loginMultiFactorLogin', saga });
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(MultiFactorLogin);
