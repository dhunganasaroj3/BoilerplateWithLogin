import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { showDialog } from 'containers/App/actions';
import PasswordInputField from 'components/common/Forms/PasswordInputField';
import FormField from 'components/common/Forms/FormField';
import PasswordIndicator from 'components/PasswordIndicator';
import ModalWrapper from 'components/common/ModalWrapper';
import { makeSelectRequesting, makeSelectError } from './selectors';
import { setPasswordRequest, clearState } from './actions';

import { compose } from 'redux';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import saga from './saga';
const mapStateToProps = createStructuredSelector({
  isRequesting: makeSelectRequesting(),
  errorResponse: makeSelectError()
});

const mapDispatchToProps = (dispatch) => ({
  setPassword: (userId, data) => dispatch(setPasswordRequest(userId, data)),
  showDialog: (dialog) => dispatch(showDialog(dialog)),
  clearState: () => dispatch(clearState()),
});

class PasswordSetForm extends React.Component {
  static propTypes = {
    isRequesting: PropTypes.bool.isRequired,
    user_id: PropTypes.string.isRequired,
    setPassword: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    clearState: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    if (props.isImp) {
      this.state = {
        data: {
          email_offer_subscription: false,
          imp_terms_conditions: true,
          imp_user: true,
          agree_terms_condition: true,
        },
        errors: {}
      };
    } else {
      this.state = {
        data: {
          email_offer_subscription: false,
          agree_terms_condition: true,
        },
        errors: {}
      };
    }

  }
  componentWillUnmount() {
    this.props.clearState();
  }
  handleChange = (e) => {
    e.persist();
    this.setState((state) => ({
      data: {
        ...state.data,
        [e.target.name]: e.target.value,
      },
    }));
  };
  handleCheckbox = e => {
    e.persist();
    this.setState(state => ({
      data: {
        ...state.data,
        [e.target.name]: !this.state.data[e.target.name]
      }
    }));
  };
  validate = () => {
    const { data } = this.state;
    const errors = {};
    if (!data.password) errors.password = "password_error";
    return errors;
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.props.setPassword(this.props.user_id, this.state.data);
    }
  };
  render() {
    const { errors, data } = this.state;
    const { isRequesting, errorResponse, email, isImp } = this.props;
    return (
      <ModalWrapper classNames="mini" onClose={() => this.props.showDialog(null)} header="Set your keys">
        { errorResponse && <p className="negative message">{errorResponse}</p> }
        <i className="icon-lock text-lg"/><br/>
        <p>Seems that you haven't set a password yet {email ? `for ${email}` : null}</p>
        <Form onSubmit={this.handleSubmit}>
          {isImp && <div>
            <FormField label="If you have Refer Code, Enter below" name="refer_code" value={data.refer_code || ''}
                       onChange={this.handleChange} placeholder="Refer Code (optional)" error={errors.refer_code}
            />
          </div>}
          <div className="pos-rel">
            <PasswordInputField password={data.password || ''} placeholder="Password"
                                onChange={this.handleChange} error={errors.password}
            />
          </div>
          <PasswordIndicator password={data.password || ''}/>
          <div className="inline field">
            <label className="custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="email_offer_subscription"
                     onChange={this.handleCheckbox} checked={data.email_offer_subscription}
              />
              <div className="custom-control-indicator"/>
              <div className="custom-control-description">
                Subscribe for newsletter
              </div>
            </label>
          </div>
          <div className="field">
            {!isImp ? <p>By signing up, you agree to the <a href="/terms-and-conditions" target="_blank">terms and conditions</a> as User.</p>
            : <p>By signing up, you agree to the <a href="/terms-and-conditions" target="_blank">terms and conditions</a> as User and <a href="/imp-term-of-use" target="_blank">Terms </a> as IMP.</p>}
          </div>
          <div className="field clearfix align-right">
            <div className="inline-block">
              <Button type="submit" className="primary button" loading={isRequesting} disabled={isRequesting}>
                Submit
              </Button>
            </div>
          </div>
        </Form>
      </ModalWrapper>
    );
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(PasswordSetForm);
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'registerPasswordSetForm', reducer });
const withSaga = injectSaga({ key: 'registerPasswordSetForm', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(PasswordSetForm);
