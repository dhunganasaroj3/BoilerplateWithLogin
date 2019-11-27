import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

const FormField = props => {
  let extraProps = {};
  if (props.width) {
    extraProps.width = props.width;
  }
  return (
    <Form.Field error={!!props.error} {...extraProps}>
      {props.label && <label htmlFor={props.id} className={`${props.labelClassName || ''}`}>{props.label}</label>}
      <input
        type={props.type}
        id={props.id}
        name={props.name}
        placeholder={props.placeholder}
        className={props.className || ''}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        min={(props.type === 'number' && props.minValue) ? `${props.minValue}` : null}
        max={(props.type === 'number' && props.maxValue) ? `${props.maxValue}` : null}
        readOnly={props.readOnly || false}
        autoComplete={props.autoComplete || 'nope'}
      />
      {props.error && <span className="error" data-tooltip={props.error} ><i className="icon-exclamation-triangle red" /></span>}
      {props.children && props.children}
    </Form.Field>
  );
};

FormField.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  labelClassName: PropTypes.string,
  placeholder: PropTypes.string,
  onBlur: PropTypes.func,
  id: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

FormField.defaultProps = {
  type: 'text',
};
export default FormField;
