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

export function SignupForm(props) {
  const navigate = useNavigate();

  const { switchToSignin } = useContext(AccountContext);

  const [user, setUser] = useState({
    name: '',
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

  const register = () => {
    const { name, email, password } = user;
    if (name && email && password) {
      axios.post('http://200.69.21.98:5000/signup', user).then((res) => {
        console.log(res);
        toast(res.data.message);

      }).catch(e => {
        if(!!e.response) {
          toast(e.response.data.error);
        } else {
          toast("Server error.");
        }
      });
    } else {
      alert('invalid input');
    }
  };
  return (
    <BoxContainer>
      <FormContainer>
        <Input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          placeholder="Full name"
        />
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
        <Input type="password" placeholder="Confirm password" />
      </FormContainer>
      <Marginer direction="vertical" margin={10} />
      <SubmitButton type="submit" onClick={register}>
        Signup
      </SubmitButton>
      <Marginer direction="vertical" margin="5px" />
      <LineText>
        Already have an account?{' '}
        <BoldLink onClick={switchToSignin} href="#">
          Signin
        </BoldLink>
      </LineText>
      <ToastContainer />
    </BoxContainer>
  );
}
