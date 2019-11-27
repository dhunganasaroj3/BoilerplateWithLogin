import React from "react";
import PropTypes from 'prop-types';
import { Progress } from 'semantic-ui-react';
import passwordHelper from 'utils/passwordHelper';

const passwordStrengthTest = (value = 5) => {
  switch (value) {
    case 5:
      return 'strong';
    case 4:
    case 3:
      return 'good';
    case 2:
      return 'weak';
    default:
      return 'very weak';
  }
};

const PasswordIndicator = (
  { password }
) => {
  const errors = passwordHelper(password) || {};
  const passwordStrength = 5 - Object.keys(errors).length;

  return (
    <div className="indicator_password_container clearfix">
      { passwordStrength !== 0 && <div>
        <Progress
          percent={passwordStrength * 20}
          color={passwordStrength <=2 ? 'red' : passwordStrength <=4 ? 'olive' : 'green'}
          size="tiny"
        >{passwordStrength <=2 ? 'Weak' : passwordStrength <=4 ? 'Good' : 'Strong'}</Progress>
        {/*<label><span><i className="icon icon-check" />Your password Quality is { passwordStrengthTest(passwordStrength) }</span></label>*/}
      </div>}
      {/*<div>
        <label>{ errors && errors.numberError ? <span><i className="icon icon-dot" /></span> : <span><i className="icon icon-check" /></span> } One number </label>
      </div>
      <div>
        <label>{ errors && errors.lowercaseError ? <i className="icon icon-dot" /> : <i className="icon icon-check" /> } <span> One lowercase character </span> </label>
      </div>
      <div>
        <label>{ errors && errors.uppercaseError ? <i className="icon icon-dot" /> : <i className="icon icon-check" /> } <span>One uppercase character</span> </label>
      </div>
      <div>
        <label>{ errors && errors.specialCharactersError ? <i className="icon icon-dot" /> : <i className="icon icon-check" /> } <span> One special character </span></label>
      </div>
      <div>
        <label>{ errors && errors.lengthError ? <span><i className="icon icon-dot" /></span> : <span><i className="icon icon-check" /></span> } 8 characters minimum </label>
      </div>*/}
    </div>
  );
};

PasswordIndicator.defaultProps = {
  password: ""
};

PasswordIndicator.propTypes = {
  password: PropTypes.string.isRequired
};

export default PasswordIndicator;
