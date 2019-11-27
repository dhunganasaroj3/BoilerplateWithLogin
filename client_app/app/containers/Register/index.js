import React from 'react';
import SignupForm from './SignupForm';

const Register = (props) => (
  <div className="header-top-gap ptn-1">
    <div className="ui container text pd-btm-lg">
      <div className="segment maxWidth500 m-auto">
        <SignupForm {...props}/>
      </div>
    </div>
  </div>
);

export default Register;
