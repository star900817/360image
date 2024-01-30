import AccountBox from './accountBox/index';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';

const AppContainerS = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function AppContainer() {
  return (
    <AppContainerS>
      <AccountBox />
    </AppContainerS>
  );
}
