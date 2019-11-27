import React from "react";
import PropTypes from "prop-types";

const TextArea = props => {
  return (
    <div className ={`field ${props.error && 'error'}`}>
      <label htmlFor={props.id}>{props.label}</label>
      <textarea cols={props.cols || '1'} rows={props.rows || '5'} name={props.name} value={props.value}
        onChange={props.onChange} placeholder={props.placeholder} />
      {props.error && <span data-tooltip={props.error} ><i className="icon-exclamation-triangle red" /></span>}
    </div>
  );
};

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  rows: PropTypes.string,
  cols: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string
};

export default TextArea;
