import React from 'react';

const Radio = props =>
  <div className="ui radio checkbox">
    <input
      type="radio"
      name={props.name}
      disabled={props.disabled}
      value={props.value}
      checked={props.isChecked && 'checked'}
      onChange={props.handleChangeEvent}
    />
    <label>
      {props.label}
    </label>
  </div>;

export default Radio;
