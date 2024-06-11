import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import CitySelectionPage from './pages/citySelectionPage';
import ResultPage from './pages/resultPage';

const App = ()=> {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/CitySelectionPage" element={<CitySelectionPage />} />
        <Route path="/resultPage" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;