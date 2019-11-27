import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { Form, Button, Checkbox } from 'semantic-ui-react';
import { connect } from 'react-redux';
import getUserObject from 'utils/getUserInfo';
import FormField from 'components/common/Forms/FormField';
import saga from './sagas';
import reducer from './reducer';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { compose } from 'redux';

import {
  makeSelectMultiFactorAuth,
  makeSelectSuccessResponse,
  makeSelectErrorResponse,
  makeSelectRequesting,
  makeSelectRecoveryCodes,
  makeSelectMessage,
  makeSelectRecoveryCodeGeneratedOn,
  makeSelectUser,
} from './selectors';
import {
  getMultiFactorAuthRequest,
  verifyMultiFactorAuthRequest,
  disableMultiFactorAuthRequest,
  getRecoveryCodesRequest,
  generateRecoveryCodeRequest,
  sendMultiFactorRecoveryCodesEmailRequest,
  loadBasicInfoRequest,
} from './actions';
import Toaster from 'components/Toaster';

const mapDispatchToProps = dispatch => ({
  getMultiFactorAuthRequest: () => dispatch(getMultiFactorAuthRequest()),
  getRecoveryCodesRequest: () => dispatch(getRecoveryCodesRequest()),
  generateRecoveryCodeRequest: userId =>
    dispatch(generateRecoveryCodeRequest(userId)),
  sendMultiFactorRecoveryCodesEmailRequest: userId =>
    dispatch(sendMultiFactorRecoveryCodesEmailRequest(userId)),
  verifyMultiFactorAuthRequest: token =>
    dispatch(verifyMultiFactorAuthRequest(token)),
  disableMultiFactorAuthRequest: userId =>
    dispatch(disableMultiFactorAuthRequest(userId)),
  loadBasicInfoRequest: userId => dispatch(loadBasicInfoRequest(userId)),
});

const mapStateToProps = createStructuredSelector({
  user: makeSelectUser(),
  confirmUpdateMultiFactorAuth: makeSelectMultiFactorAuth(),
  successResponse: makeSelectSuccessResponse(),
  errorResponse: makeSelectErrorResponse(),
  isRequesting: makeSelectRequesting(),
  recoveryCodes: makeSelectRecoveryCodes(),
  message: makeSelectMessage(),
  recovery_code_generated_on: makeSelectRecoveryCodeGeneratedOn(),
});

class MultiFactorAuth extends React.Component {
  static propTypes = {
    getMultiFactorAuthRequest: PropTypes.func.isRequired,
    verifyMultiFactorAuthRequest: PropTypes.func.isRequired,
    disableMultiFactorAuthRequest: PropTypes.func.isRequired,
    generateRecoveryCodeRequest: PropTypes.func.isRequired,
  };
  state = {
    data: {
      totp_token: '',
    },
    multiFactorAuth: this.props.user.get('multi_factor_auth_enable'),
    showMultiFactorAuthDisable: false,
    errors: {},
    recoveryCodes: [],
    message: {},
    user: {},
  };

  componentDidMount() {
    const userObj = getUserObject();
    if (userObj._id) {
      this.props.loadBasicInfoRequest(userObj._id);
      this.props.getRecoveryCodesRequest();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.user.get('multi_factor_auth_enable') !==
      nextProps.user.get('multi_factor_auth_enable')
    ) {
      this.setState({
        multiFactorAuth: nextProps.user.get('multi_factor_auth_enable'),
        showMultiFactorAuthDisable: false,
      });
    }
    if (nextProps.user !== this.props.user) {
      const user = nextProps.user.toJS();
      this.setState({
        user,
        multiFactorAuth: nextProps.user.get('multi_factor_auth_enable'),
      });
    }
  }

  handleCheckBox = () => {
    this.setState(
      {
        multiFactorAuth: !this.state.multiFactorAuth,
      },
      function() {
        if (this.state.multiFactorAuth) {
          this.props.getMultiFactorAuthRequest();
        }
      },
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    const { data } = this.state;
    const secret = this.props.confirmUpdateMultiFactorAuth.get('secret');
    const errors = this.validate();
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.props.verifyMultiFactorAuthRequest(
        Object.assign({}, { data, secret }),
      );
      this.setState({
        isLoading: true,
        data: {
          totp_token: '',
        },
        errors: {},
      });
    }
  };

  validate = () => {
    const errors = {};
    const { data } = this.state;
    if (!data.totp_token) errors.totp_token = "Can't be blank";
    return errors;
  };

  handleChange = e => {
    let errors = this.state.errors;
    if (!!errors[e.target.name] && !!e.target.value)
      delete errors[e.target.name];
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value },
      errors,
    });
  };

  changeMultiFactorAuthStatus = () => {
    this.setState({
      showMultiFactorAuthDisable: !this.state.showMultiFactorAuthDisable,
    });
  };

  disableMultiFactorAuthRequest = () => {
    this.props.disableMultiFactorAuthRequest(this.props.user.get('_id'));
  };

  generateRecoveryCodeRequest = () => {
    this.props.generateRecoveryCodeRequest(this.props.user.get('_id'));
  };

  sendMultiFactorRecoveryCodesEmailRequest = () => {
    this.props.sendMultiFactorRecoveryCodesEmailRequest(
      this.props.user.get('_id'),
    );
  };

  render() {
    const {
      multiFactorAuth,
      showMultiFactorAuthDisable,
      data,
      errors,
    } = this.state;
    const {
      successResponse,
      errorResponse,
      isRequesting,
      recoveryCodes,
      user,
    } = this.props;
    let message;
    if (successResponse && typeof successResponse === 'string') {
      message = <Toaster message={successResponse} timeout={1000} success />;
    }
    if (errorResponse && typeof errorResponse === 'string') {
      message = <Toaster message={errorResponse} timeout={1000} error />;
    }
    return (
      <div>
        <div className="section">
          {message && message}
          <div className="segment">
            {this.props.user.get('multi_factor_auth_enable') && (
              <div>
                {!showMultiFactorAuthDisable && (
                  <div>
                    <div className="field mg-btm-sm">
                      <label className="custom-control custom-checkbox">
                        <input
                          name="multiFactorAuth"
                          className="custom-control-input"
                          type="checkbox"
                          checked={
                            this.props.user.get('multi_factor_auth_enable') ||
                            false
                          }
                          disabled
                        />
                        <span className="custom-control-indicator" />{' '}
                        <span className="custom-control-description">
                          Two Factor Auth Enabled
                        </span>{' '}
                      </label>
                    </div>
                    <Button negative onClick={this.changeMultiFactorAuthStatus}>
                      Disable Two Factor Auth
                    </Button>
                  </div>
                )}
                {showMultiFactorAuthDisable && (
                  <div>
                    <p>Do you want to disable two factor auth?</p>
                    <Button
                      className="button positive"
                      onClick={this.disableMultiFactorAuthRequest}
                      loading={isRequesting}
                      disabled={isRequesting}
                    >
                      Yes, Disable
                    </Button>
                    <Button
                      className="button basic"
                      onClick={this.changeMultiFactorAuthStatus}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!this.props.user.get('multi_factor_auth_enable') && (
              <div className="field">
                <Checkbox
                  label="Enable Two Factor Auth"
                  name="multiFactorAuth"
                  onClick={this.handleCheckBox}
                  checked={multiFactorAuth}
                  toggle
                />
                {multiFactorAuth && (
                  <div className="mg-top-sm">
                    <div className="message info">
                      Scan the following QR code with any authenticator App.
                      <a
                        className="mg-right-sm"
                        target="_blank"
                        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                      >
                        <img src="" />
                      </a>
                      <a
                        target="_blank"
                        href="https://itunes.apple.com/us/app/google-authenticator/id388497605"
                      >
                        <img src="" />
                      </a>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 51 51"
                      width="250"
                      height="250"
                    >
                      <path
                        d={this.props.confirmUpdateMultiFactorAuth.get(
                          'qrPath',
                        )}
                        className="qr-code"
                      />
                    </svg>
                    <div>
                      <Form onSubmit={this.handleSubmit}>
                        <FormField
                          type="text"
                          name="totp_token"
                          value={data.totp_token}
                          onChange={this.handleChange}
                          placeholder="Enter the token from authenticator app"
                          error={errors.totp_token && errors.totp_token}
                        />
                        <Button
                          primary
                          type="submit"
                          loading={isRequesting}
                          disabled={isRequesting}
                        >
                          Verify
                        </Button>
                      </Form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {this.props.user.get('multi_factor_auth_enable') && (
          <div className="segment">
            <h2>Manage Codes</h2>
            <div className="message info">
              These codes can be used to sign into your account if you have
              problems in receiving the code during sign-in. Each code can be
              used only once.
            </div>
            <br />
            <p>Backup verification codes</p>
            <ul className="ui tag labels">
              {recoveryCodes
                .entrySeq()
                .map(([key, value]) => (
                  <li className="label" key={`${key}_${value}`}>
                    {value}
                  </li>
                ))
                .toArray()}
            </ul>
            <p className="muted mg-btm-md">
              Generated Time : {this.props.recovery_code_generated_on}
            </p>
            <div className="print_save mg-top-sm inline-block">
              <Button
                secondary
                data-tooltip={user.get('email')}
                className="button"
                onClick={this.sendMultiFactorRecoveryCodesEmailRequest}
                disabled={isRequesting}
              >
                Send codes to email
              </Button>
            </div>
            <div className="button_wrapper inline-block">
              <Button
                className="button primary"
                onClick={this.generateRecoveryCodeRequest}
                disabled={isRequesting}
              >
                Generate new Codes
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const withReducer = injectReducer({
  key: 'adminProfileMultiFactorAuth',
  reducer,
});
const withSaga = injectSaga({ key: 'adminProfileMultiFactorAuth', saga });
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(MultiFactorAuth);
