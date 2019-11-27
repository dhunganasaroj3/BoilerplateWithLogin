import React from 'react';
import PropTypes from 'prop-types';
import { RECAPTCHA_SITE_KEY } from 'containers/App/constants';
import ReCAPTCHA from './ReCAPTCHA';

const Captcha = props => <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={props.onChange} />;

Captcha.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default Captcha;
