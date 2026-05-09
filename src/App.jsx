import { Routes, Route, Navigate } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import WaitingPage from './pages/WaitingPage';
import AdminDashboard from './pages/AdminDashboard';
import DisplayPage from './pages/DisplayPage';
import PosterPage from './pages/PosterPage';
import LandingPage from './pages/LandingPage';
import GlobalNav from './design/GlobalNav';

function App() {
  return (
    <>
      <GlobalNav />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Customer Mobile Flow */}
      <Route path="/:shopSlug" element={<JoinPage />} />
      <Route path="/:shopSlug/ticket/:ticketId" element={<WaitingPage />} />
      
      {/* Admin Flow */}
      <Route path="/admin/:shopSlug" element={<AdminDashboard />} />
      
      {/* Public Display Flow */}
      <Route path="/display/:shopSlug" element={<DisplayPage />} />
      <Route path="/poster/:shopSlug" element={<PosterPage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
