/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import makeAsyncScriptLoader from './makeAsyncScriptLoader';

class ReCAPTCHA extends React.Component {
  state = {};

  componentDidMount() {
    this.explicitRender();
  }

  componentDidUpdate() {
    this.explicitRender();
  }
  getValue = () => {
    if (this.props.grecaptcha && this.state.widgetId !== undefined) {
      return this.props.grecaptcha.getResponse(this.state.widgetId);
    }
    return null;
  };

  getWidgetId = () => {
    if (this.props.grecaptcha && this.state.widgetId !== undefined) {
      return this.state.widgetId;
    }
    return null;
  };

  execute = () => {
    const { grecaptcha } = this.props;
    const { widgetId } = this.state;

    if (grecaptcha && widgetId !== undefined) {
      return grecaptcha.execute(widgetId);
    }
    this._executeRequested = true;
    return null;
  };

  reset = () => {
    if (this.props.grecaptcha && this.state.widgetId !== undefined) {
      this.props.grecaptcha.reset(this.state.widgetId);
    }
  };

  handleExpired = () => {
    if (this.props.onExpired) {
      this.props.onExpired();
    } else if (this.props.onChange) {
      this.props.onChange(null);
    }
  };

  explicitRender = (cb) => {
    if (this.props.grecaptcha && this.props.grecaptcha.render && this.state.widgetId === undefined) {
      const id = this.props.grecaptcha.render(this.captcha, {
        sitekey: this.props.sitekey,
        callback: this.props.onChange,
        theme: this.props.theme,
        type: this.props.type,
        tabindex: this.props.tabindex,
        'expired-callback': this.handleExpired,
        size: this.props.size,
        stoken: this.props.stoken,
        badge: this.props.badge,
      });
      this.setState({
        widgetId: id,
      }, cb);
    }
    if (this._executeRequested && this.props.grecaptcha && this.state.widgetId !== undefined) {
      this._executeRequested = false;
      this.execute();
    }
  };


  handleRecaptchaRef = (elem) => {
    this.captcha = elem;
  };

  render() {
    // consume properties owned by the reCATPCHA, pass the rest to the div so the user can style it.
    /* eslint-disable no-unused-vars */
    const { sitekey, onChange, theme, type, tabindex, onExpired, size, stoken, grecaptcha, badge, ...childProps } = this.props;
    /* eslint-enable no-unused-vars */
    return (
      <div {...childProps} ref={this.handleRecaptchaRef} />
    );
  }
}

ReCAPTCHA.displayName = 'ReCAPTCHA';
ReCAPTCHA.propTypes = {
  sitekey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  grecaptcha: PropTypes.object,
  theme: PropTypes.oneOf(['dark', 'light']),
  type: PropTypes.oneOf(['image', 'audio']),
  tabindex: PropTypes.number,
  onExpired: PropTypes.func,
  size: PropTypes.oneOf(['compact', 'normal', 'invisible']),
  stoken: PropTypes.string,
  badge: PropTypes.oneOf(['bottomright', 'bottomleft', 'inline']),
};
ReCAPTCHA.defaultProps = {
  theme: 'light',
  type: 'image',
  tabindex: 0,
  size: 'normal',
  badge: 'bottomright',
};

const callbackName = 'onloadcallback';
const lang = typeof window !== 'undefined' && (window.recaptchaOptions && window.recaptchaOptions.lang) ?
  `&hl=${window.recaptchaOptions.lang}` :
  '';
const URL = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit${lang}`;
const globalName = 'grecaptcha';

export default makeAsyncScriptLoader(ReCAPTCHA, URL, {
  callbackName,
  globalName,
  exposeFuncs: ['getValue', 'getWidgetId', 'reset', 'execute'],
});
