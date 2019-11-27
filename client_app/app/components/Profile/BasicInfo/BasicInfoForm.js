import React from 'react';
import ReactDropzone from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';
import { Button, Form, Segment, Radio, Input } from 'semantic-ui-react';
import InputField from 'components/common/Forms/InputField';
import DatePicker from 'components/common/DatePicker';
import DefaultAvatar from 'assets/image/avatar.png';
import Countries from 'components/common/countries';

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
	setEditorRef,
	onCrop,
	newImage,
}) => (
	<Form onSubmit={handleSubmit} className="py-2">
		<h2 className="main_title">Basic Info</h2>
		<Form.Field>
			<ReactDropzone onDrop={onDrop}>
				<img className="ui image" src={avatarImage || DefaultAvatar} alt="profile image" />
			</ReactDropzone>
			{newImage && (
				<div>
					<AvatarEditor
						image={avatarImage}
						width={250}
						height={250}
						borderRadius={5000}
						scale={1.2}
						ref={setEditorRef}
					/>
					<Button onClick={onCrop}>Crop</Button>
				</div>
			)}
		</Form.Field>
		<div className="form__elements">
			<Form.Group widths="equal">
				<Form.Field>
					{/* <label>First Name</label> */}
					<input
						placeholder="first name"
						name="first_name"
						value={user.first_name || ''}
						onChange={handleChange}
					/>
				</Form.Field>
				<Form.Field>
					{/* <label>Last Name</label> */}
					<input
						placeholder="last name"
						name="last_name"
						value={user.last_name || ''}
						onChange={handleChange}
					/>
				</Form.Field>
			</Form.Group>
			<Form.Group inline>
				<Form.Field>
					<label>Gender:</label>
				</Form.Field>
				<Form.Field>
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
			</Form.Group>
			<Form.Field>
				<label>Date of Birth: </label>
				<DatePicker datechange={datechange} date={user.birth_date || null} />
			</Form.Field>
			<Form.Group widths="equal">
				<Form.Field>
					{/* <label>User Name</label> */}
					<input
						placeholder="username"
						name="username"
						value={user.username || ''}
						onChange={handleChange}
						disabled
					/>
				</Form.Field>
				<Form.Field>
					{/* <label>Email</label> */}
					<input placeholder="email" name="email" value={user.email || ''} onChange={handleChange} disabled />
				</Form.Field>
			</Form.Group>
			<Segment>
				{/* <h3>Address</h3> */}
				<Form.Group widths="equal">
					<InputField
						placeholder="address line 1"
						type="text"
						// label="Address Line 1"
						name="address_address_line_1"
						value={user.address_address_line_1 || ''}
						onChange={handleChange}
					/>
					<InputField
						type="text"
						placeholder="address line 1"
						// label="Address Line 2"
						name="address_address_line_2"
						value={user.address_address_line_2 || ''}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group widths="equal">
					<InputField
						type="text"
						placeholder="City"
						name="address_city"
						value={user.address_city || ''}
						onChange={handleChange}
					/>
					<InputField
						type="text"
						placeholder="State/Province/Region"
						name="address_state_region_province"
						value={user.address_state_region_province || ''}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group widths="equal">
					<Form.Field>
						{/* <label>Country</label> */}
						<select
							className="search dropdown"
							name="address_country"
							onChange={handleChange}
							value={user.address_country || ''}
						>
							{countries}
						</select>
					</Form.Field>
					<Form.Field>
						<Input>
							<input
								type="text"
								placeholder="ZIP/Postal Code"
								name="address_zip_postal_code"
								value={user.address_zip_postal_code || ''}
								onChange={handleChange}
							/>
						</Input>
					</Form.Field>
				</Form.Group>
			</Segment>
			<Button type="submit" primary loading={isLoading} disabled={isLoading}>
				Save
			</Button>
		</div>
	</Form>
);

export default BasicInfoForm;
