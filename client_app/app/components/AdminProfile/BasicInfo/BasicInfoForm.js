import React from 'react';
import ReactDropzone from 'react-dropzone';
import { Button, Form, Radio } from 'semantic-ui-react';
import InputField from 'components/common/Forms/InputField';
import DatePicker from 'components/common/DatePicker/index';
import Avatar from 'assets/image/avatar.png';
import Countries from 'components/common/countries';
import AvatarEditor from 'react-avatar-editor';

// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

const countries = Countries.map((country) => (
	<option key={country.code} value={country.name}>
		{country.name}
	</option>
));

const BasicInfoForm = ({
	date,
	focused,
	onDateChange,
	onFocusChange,
	isOutsideRange,
	user,
	avatarImage,
	handleChange,
	handleSubmit,
	handleCheckBox,
	onDrop,
	handleGenderChange,
	isLoading,
	datechange,
	parseDate,
	handlePublishDateChange,
	setEditorRef,
	onCrop,
	newImage,
}) => (
	<Form className="form" onSubmit={handleSubmit}>
		<div className="stackable grid">
			<div className="four wide column field">
				<ReactDropzone onDrop={onDrop} className="imgUploder">
					<img className="ui small circular image" src={avatarImage || Avatar} alt="profile image" />
				</ReactDropzone>
				<p className="text-sm mg-top-sm muted">Square photos preferred</p>
			</div>
			{newImage && (
				<div>
					<AvatarEditor
						image={avatarImage}
						width={250}
						height={250}
						borderRadius={1000}
						scale={1.2}
						ref={setEditorRef}
					/>
					<br />
					<Button onClick={onCrop}>Crop</Button>
				</div>
			)}
			<div className="twelve wide column">
				<div className="two equal fields">
					<div className="field">
						<label>First Name</label>
						<input name="first_name" value={user.first_name || ''} onChange={handleChange} />
					</div>
					<div className="column field">
						<label>Last Name</label>
						<input name="last_name" value={user.last_name || ''} onChange={handleChange} />
					</div>
				</div>
				<div className="inline fields">
					<Form.Field>Gender:</Form.Field>
					<Form.Field inline>
						<Radio
							label="Male"
							name="gender"
							value="Male"
							checked={(user.gender || '').toLowerCase() === 'male'}
							onChange={handleGenderChange}
						/>
					</Form.Field>
					<Form.Field>
						<Radio
							label="Female"
							name="gender"
							value="Female"
							checked={(user.gender || '').toLowerCase() === 'female'}
							onChange={handleGenderChange}
						/>
					</Form.Field>
					<Form.Field>
						<Radio
							label="Other"
							name="gender"
							value="Other"
							checked={(user.gender || '').toLowerCase() === 'other'}
							onChange={handleGenderChange}
						/>
					</Form.Field>
				</div>
				<Form.Field>
					<label>Date of Birth: </label>
					<DatePicker datechange={datechange} date={user.birth_date || null} />
				</Form.Field>

				<div className="field">
					<label>User Name</label>
					<input name="username" value={user.username || ''} onChange={handleChange} disabled />
				</div>
				<div className="field">
					<label>Email</label>
					<input name="email" value={user.email || ''} onChange={handleChange} disabled />
				</div>
				<div className="card">
					<h2>Address</h2>
					<InputField
						type="text"
						label="Address Line 1"
						name="address_address_line_1"
						value={user.address_address_line_1 || ''}
						onChange={handleChange}
					/>
					<InputField
						type="text"
						label="Address Line 2"
						name="address_address_line_2"
						value={user.address_address_line_2 || ''}
						onChange={handleChange}
					/>
					<InputField
						type="text"
						label="City"
						name="address_city"
						value={user.address_city || ''}
						onChange={handleChange}
					/>
					<InputField
						type="text"
						label="ZIP/Postal Code"
						name="address_zip_postal_code"
						value={user.address_zip_postal_code || ''}
						onChange={handleChange}
					/>
					<div className="two column stackable grid">
						<div className="column">
							<InputField
								type="text"
								label="State/Province/Region"
								name="address_state_region_province"
								value={user.address_state_region_province || ''}
								onChange={handleChange}
							/>
						</div>
						<div className="column">
							<div className="field">
								<label>Country</label>
								<select
									className="ui selection dropdown"
									name="address_country"
									onChange={handleChange}
									value={user.address_country || ''}
								>
									{countries}
								</select>
							</div>
						</div>
					</div>
				</div>
				<Button type="submit" loading={isLoading} disabled={isLoading}>
					Save
				</Button>
			</div>
		</div>
	</Form>
);

export default BasicInfoForm;
