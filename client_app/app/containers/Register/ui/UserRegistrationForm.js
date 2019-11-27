/**
 * Created by lakhe on 7/5/17.
 */
import React from 'react';
import { Form, Dropdown, Button, Icon } from 'semantic-ui-react';
import Captcha from 'components/Captcha';
import PasswordInputField from 'components/common/Forms/PasswordInputField';
import FormField from 'components/common/Forms/FormField';
import PasswordIndicator from 'components/PasswordIndicator';

const UserRegistrationForm = ({
	handleSubmit,
	handleSemanticChange,
	handleChange,
	data,
	errors,
	handleCheckbox,
	onRecaptchaChange,
	isRequesting,
	prefixes,
}) => {
	return (
		<Form onSubmit={handleSubmit}>
			<Form.Group>
				<Form.Field width={3} error={!!errors.gender}>
					<label>Title</label>
					<Dropdown
						name="gender"
						options={prefixes}
						onChange={handleSemanticChange}
						value={data.gender || ''}
						error={!!errors.gender}
						fluid
						search
						selection
						placeholder="Prefix"
					/>
				</Form.Field>
				<FormField
					width={7}
					label="First Name"
					name="first_name"
					value={data.first_name || ''}
					onChange={handleChange}
					placeholder="First Name"
					error={errors.first_name}
				/>
				<FormField
					width={6}
					label="Last Name"
					name="last_name"
					value={data.last_name || ''}
					onChange={handleChange}
					placeholder="Last Name"
					error={errors.last_name}
				/>
			</Form.Group>
			<div className="two fields">
				<FormField
					label="City (optional)"
					name="address_city"
					value={data.address_city || ''}
					onChange={handleChange}
					placeholder="City"
					error={errors.address_city}
				/>
			</div>
			<FormField
				label="Email"
				name="email"
				type="email"
				value={data.email || ''}
				onChange={handleChange}
				placeholder="Email"
				error={errors.email}
			/>
			<div className="pos-rel">
				{/* check error case */}
				<PasswordInputField
					password={data.password || ''}
					placeholder="Password"
					onChange={handleChange}
					error={errors.password}
				/>
			</div>
			<PasswordIndicator password={data.password || ''} />

			<div className="inline field">
				{/* <label className="custom-control custom-checkbox">
          <input
            type="checkbox" className="custom-control-input" name="email_offer_subscription"
            onChange={handleCheckbox} checked={data.email_offer_subscription}
          />
          <div className="custom-control-indicator" />
          <div className="custom-control-description">
            Please send me emails with travel deals, special offers and other information.
          </div>
        </label> */}
				<div className={`field ${errors.agree_terms_condition ? 'error' : ''}`}>
					<label className="custom-control custom-checkbox mt-1">
						<input
							type="checkbox"
							className="custom-control-input"
							name="agree_terms_condition"
							onChange={handleCheckbox}
							checked={data.agree_terms_condition}
						/>
						<div className="custom-control-indicator" />
						<div className="custom-control-description">
							I have read and agree to the Terms and Use and the Privacy Policy.
						</div>
					</label>
				</div>
			</div>
			<div className="hasCaptcha field" style={{ height: '76px' }}>
				<Captcha onChange={onRecaptchaChange} />
				{errors.reCaptcha && (
					<span data-tooltip={errors.reCaptcha}>
						<i className="icon-exclamation-triangle red" />
					</span>
				)}
			</div>
			<div className="field">
				<Button className="button primary large full-width" type="submit" loading={isRequesting}>
					Join Now
				</Button>
			</div>
		</Form>
	);
};

export default UserRegistrationForm;
