import { Routes, Route } from 'react-router-dom';
import AttractScreen from './pages/AttractScreen';
import RegisterScreen from './pages/RegisterScreen';
import ReadyScreen from './pages/ReadyScreen';
import ResultsScreen from './pages/ResultsScreen';

function App() {
  return (
    <Routes>
      <Route path="/attract" element={<AttractScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/ready" element={<ReadyScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
      <Route path="/" element={<AttractScreen />} />
    </Routes>
  );
}

export default App;
