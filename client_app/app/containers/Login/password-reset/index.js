import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Link from 'react-router-dom/Link';
import { Button, Form } from 'semantic-ui-react';
import { passwordResetRequest, newPasswordRequest } from './actions';
import {
  makeSelectRequesting,
  makeSelectSuccess,
  makeSelectResetRequesting,
  makeSelectResetSuccess,
  makeSelectError,
  makeSelectResponse,
  makeSelectToken
} from './selectors';
import Spinner from 'components/common/Spinner';
import PasswordIndicator from 'components/PasswordIndicator';
import PasswordInputField from 'components/common/Forms/PasswordInputField';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import saga from './saga';
import {compose} from "redux";

const mapStateToProps = createStructuredSelector({
  requesting: makeSelectRequesting(),
  success: makeSelectSuccess(),
  resetPasswordRequesting: makeSelectResetRequesting(),
  resetSuccess: makeSelectResetSuccess(),
  errorMessage: makeSelectError(),
  successMessage: makeSelectResponse(),
  token: makeSelectToken()
});

const mapDispatchToProps = dispatch => ({
  passwordReset: userId => dispatch(passwordResetRequest(userId)),
  newPassword: (token, data) => dispatch(newPasswordRequest(token, data))
});

class PasswordReset extends React.Component {
  static propTypes = {
    passwordReset: PropTypes.func.isRequired,
    newPassword: PropTypes.func.isRequired,
    requesting: PropTypes.bool.isRequired,
    success: PropTypes.bool.isRequired,
    resetPasswordRequesting: PropTypes.bool.isRequired,
    resetSuccess: PropTypes.bool.isRequired,
    token: PropTypes.string.isRequired
  };
  state = {
    data: { log_out_all_devices: false },
    errors: {}
  };
  componentDidMount() {
    if (this.props.match.params && this.props.match.params.userid) {
      const userId = this.props.match.params.userid;
      this.props.passwordReset(userId);
    }
  }
  handleChange = e => {
    e.persist();
    let { errors } = this.state;
    if (!!errors[e.target.name] && !!e.target.value) delete errors[e.target.name];
    this.setState(state => ({
      data: { ...state.data, [e.target.name]: e.target.value },
      errors
    }));
  };
  handleChecked = e => {
    e.persist();
    this.setState(state => ({
      data: {
        ...state.data,
        [e.target.name]: !state.data[e.target.name]
      }
    }));
  };
  validate = () => {
    const { data } = this.state;
    const errors = {};
    if (!data.password) errors.password = "password_error";
    if (data.password !== data.confirmPassword) errors.confirmPassword = "password_error";
    return errors;
  };
  handleSubmit = e => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.props.newPassword(this.props.token, this.state.data);
    }
  };

  render() {
    const { data, errors } = this.state;
    const { requesting, success, resetPasswordRequesting, resetSuccess, errorMessage, successMessage, token } = this.props;
    return (
      <section className="ptn-1">
        { requesting && <div className="align-center"> <Spinner /> </div>}
        { !requesting && !success && !resetSuccess &&
        <div className="wrapper">
          <div className="container">
            <div className="card-center card-md mg-btm-md">
              {errorMessage && <p className="negative message">{errorMessage}</p>}
              <Link className="fluid button" to="/">Continue</Link>
            </div>
          </div>
        </div> }
        {!requesting && success && !resetSuccess &&  (
          <div className="wrapper">
            <div className="container">
              <div className="card-center card-md mg-btm-md">
                {!token &&
                <div className="align-center">
                  <div className="segment message negative card-center card-md has-img-floating">
                    <div className="img-floating round bg-black">
                      <i className="icon-users"/>
                    </div>
                    { errorMessage && <p className="negative message">{errorMessage}</p> }
                    <p className="mg-all-md">Link is dead. Token has already been used or it might be invalid token.</p>
                    <Link className="fluid button primary" to="/">Continue</Link>
                  </div>
                </div>}
                {!!token && (
                  <div className="card-center has-img-floating card-md segment">
                    <div className="img-floating round bg-green align-center"><i className="icon-lock" /></div>
                    { errorMessage && <p className="negative message">{errorMessage}</p> }
                    <Form onSubmit={this.handleSubmit}>
                      <p>Now you can access your XcelTrip account simply setting new password</p>
                      <div className="pos-rel field">
                        <PasswordInputField password={data.password || ''} placeholder="Password"
                                            onChange={this.handleChange} error={errors.password}
                        />
                      </div>
                      <PasswordIndicator password={data.password || ''} />
                      <div className="pos-rel field">
                        <PasswordInputField password={data.confirmPassword || ''} label="Confirm Password" placeholder="Confirm Password"
                                            onChange={this.handleChange} error={errors.confirmPassword} name="confirmPassword"
                        />
                      </div>
                      <div className="field">
                        <label className="custom-control custom-checkbox">
                          <input className="custom-control-input" type="checkbox" name="log_out_all_devices"
                                 onChange={this.handleChecked} checked={data.log_out_all_devices}
                          />
                          <span className="custom-control-indicator" />{' '}
                          <span className="custom-control-description">Also Logout from other devices</span>{' '}
                        </label>
                      </div>
                      <div className="field">
                        <Button className="button primary large fluid" type="submit" disabled={resetPasswordRequesting}
                                loading={resetPasswordRequesting}
                        >
                          Submit
                        </Button>
                      </div>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {resetSuccess && (
          <div className="wrapper">
            <div className="container">
              <div className="card-center card-md mg-btm-md">
                <div className="align-center">
                  <div className="segment message positive card-center card-md has-img-floating">
                    <div className="img-floating round bg-black">
                      <i className="icon-users"/>
                    </div>
                    {successMessage && <p className="mg-all-md">{successMessage}</p>}
                    <Link className="fluid button primary" to="/">Continue</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);


const withReducer = injectReducer({ key: 'loginPasswordReset', reducer });
const withSaga = injectSaga({ key: 'loginPasswordReset', saga });
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(PasswordReset);
