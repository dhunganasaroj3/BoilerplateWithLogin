import React from 'react';
import LoginForm from './LoginForm';
import xcelpay from '../../assets/image/xcelpay.png';
import man from '../../assets/image/man2.png';

const Login = props => (
  <div className="login">
    <div className="box">
      {/* <div className="img-holder">
        <img src={man} alt="" />
      </div> */}
      <div>
        <div className="img-holder">
          <img className="logo-login" src={xcelpay} alt="" />
        </div>
        <LoginForm {...props} />
      </div>
    </div>
  </div>
);

export default Login;
