import  React from 'react';
import { Button, Form, Dropdown } from 'semantic-ui-react';
import Captcha from 'components/Captcha';
import InputField from 'components/common/Forms/InputField';
import PasswordInputField from 'components/common/Forms/PasswordInputField';
import FormField from 'components/common/Forms/FormField';
import PasswordIndicator from 'components/PasswordIndicator';

const RegisterForm = ({data, errors, errorResponse, handleSubmit, handleChange, handleBlur, handleCheckbox, onRecaptchaChange, isRequesting,handleCountryChange,countries}) => {
  return (
    <div>
      {errors && errors.message &&
      <p className="negative message">{errors.message}</p>}
      {errorResponse && typeof errorResponse === 'string' &&
      <p className="negative message">{errorResponse}</p>}
      <Form className="form" onSubmit={handleSubmit}>
        <div className="two fields">
          <FormField label="First Name" name="first_name" value={data.first_name} onChange={handleChange}
                     placeholder="First Name" error={errors.first_name}
          />
          <FormField label="Last Name" name="last_name" value={data.last_name} onChange={handleChange}
                     placeholder="Last Name" error={errors.last_name}
          />
        </div>
        <div className="inline fields radio-custom">
          <label>Gender:</label>
          {errors.gender && <span data-tooltip={errors.gender} ><i className="icon-exclamation-triangle red" /></span>}
          <InputField label="Male" name="gender" type="radio" value={'mr'} onChange={handleChange}
                      error={errors.gender && errors.gender}
          />
          <InputField label="Female" name="gender" type="radio" value={'mrs'} onChange={handleChange}
                      error={errors.gender && errors.gender}
          />
          <InputField label="Other" name="gender" type="radio" value={'miss'} onChange={handleChange}
                      error={errors.gender && errors.gender}
          />
        </div>
        <div className="two fields">
          <div className="field">
            <label>
              Country
              {errors.address_country &&
              <span data-tooltip={errors.address_country}><i className="icon-exclamation-triangle red"/></span>}
            </label>
            <Dropdown fluid search selection name="address_country" options={countries} onChange={handleCountryChange}
                      value={data && data.address_country} error={!!errors.address_country}
            />
          </div>
          <FormField label="City" name="address_city" value={data.address_city} onChange={handleChange}
                     placeholder="City" error={errors.address_city && errors.address_city}
          />
        </div>
        <FormField label="Email" name="email" type="email" value={data.email} onChange={handleChange}
                   placeholder="Email" onBlur={handleBlur} error={errors.email && errors.email}
        />
        <div className="field pos-rel">
          <PasswordInputField password={data.password} onBlur={handleBlur} placeholder="Password"
                              onChange={handleChange} error={errors.password ? 'password_error' : null}
          />
        </div>
        <PasswordIndicator password={data.password} />
        <br />
        <div className="inline field">
          <label className="custom-control custom-checkbox">
            <input className="custom-control-input" type="checkbox" required="required"
                   name="agree_terms_condition" onChange={handleCheckbox} checked={data.agree_terms_condition}
            />
            <div className="custom-control-indicator" />
            <div className="custom-control-description">
              I agree the terms and conditions.{' '}
              <a href="./terms-and-conditions" target="_blank" tabIndex={-1}>Learn more</a>
            </div>
          </label>
        </div>
        <div className="inline field">
          <label className="custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" name="email_offer_subscription"
                   onChange={handleCheckbox} checked={data.email_offer_subscription}
            />
            <div className="custom-control-indicator" />
            <div className="custom-control-description">Subscribe for newsletter</div>
          </label>
        </div>
        <div className="hasCaptcha field" style={{height:'76px'}}>
          <Captcha onChange={onRecaptchaChange} />
          {errors.reCaptcha && <span data-tooltip={errors.reCaptcha} ><i className="icon-exclamation-triangle red" /></span>}
        </div>
        <div className="field">
          <Button className="button primary large full-width" type="submit" loading={isRequesting}> Join Now </Button>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;
