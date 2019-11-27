import React from 'react';
import PropTypes from 'prop-types';
import InputField from './InputField';

class PasswordInputField extends React.Component {
  state = {
    showPassword: false
  };

  handlePasswordChecked = () => this.setState({ showPassword: !this.state.showPassword });

  render() {
    const { showPassword } = this.state;
    return (
      <div className="has-indicator">
        <InputField
          type={!showPassword ? 'password' : 'text'}
          label={this.props.label}
          name={this.props.name}
          className="form-control"
          value={this.props.password}
          onChange={this.props.onChange}
          {...this.props}
        />
        <span className="showPass" onClick={this.handlePasswordChecked}>
          <i className={!showPassword ? 'icon-eye' : 'icon-eye-off'} />
        </span>
      </div>
    );
  }
}

PasswordInputField.propTypes = {
  password: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
PasswordInputField.defaultProps = {
  name: "password",
  label: "Password"
};

export default PasswordInputField;
