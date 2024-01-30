import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BoldLink,
  BoxContainer,
  FormContainer,
  Input,
  LineText,
  MutedLink,
  SubmitButton,
} from './common';
import { Marginer } from '../marginer';
import { AccountContext } from './accountContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';


export function LoginForm({ setLoginUser }) {
  const { switchToSignup } = useContext(AccountContext);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const login = () => {
    console.log("login----")
    axios.post('http://200.69.21.98:5000/login', user).then((res) => {
      setLoginUser(res.data.user);
      navigate('/pano');
      toast(res.data.message);

    }).catch(e => {
      if(!!e.response) {
        toast(e.response.data.error);
      } else {
        toast("Server error.");
      }
    });
  };

  return (
    <BoxContainer>
      <ToastContainer />

      <FormContainer>
        <Input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <Input
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Password"
        />
      </FormContainer>
      <Marginer direction="vertical" margin={10} />
      <MutedLink href="#">Forget your password?</MutedLink>
      <Marginer direction="vertical" margin="1.6em" />
      <SubmitButton type="submit" onClick={login}>
        Signin
      </SubmitButton>
      <Marginer direction="vertical" margin="5px" />
      <LineText>
        Don't have an accoun?{' '}
        <BoldLink onClick={switchToSignup} href="#">
          Signup
        </BoldLink>
      </LineText>
    </BoxContainer>
  );
}
