import './styles.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Pano from './components/Pano';
import SignIn from './components/signin';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './components/signup';
import AppContainer from './components/AppContainer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContainer />} />
        <Route path="pano" element={<Pano />} />
      </Routes>
    </BrowserRouter>
  );
}
