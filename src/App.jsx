import { useEffect, useState } from 'react';
import ClickSpark from './components/ClickSpark.jsx';
import FaqChatbot from './components/FaqChatbot.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PortalPage from './pages/PortalPage.jsx';
import FacultyPortalPage from './pages/FacultyPortalPage.jsx';
import RecruiterPortalPage from './pages/RecruiterPortalPage.jsx';

function getPath() {
  return window.location.pathname === '/index.html' ? '/' : window.location.pathname;
}

export default function App() {
  const [path, setPath] = useState(getPath);

  const navigate = nextPath => {
    window.history.pushState({}, '', nextPath);
    setPath(getPath());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePop = () => setPath(getPath());
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  let page = <LandingPage navigate={navigate} />;
  if (path === '/login') page = <LoginPage navigate={navigate} />;
  if (path === '/student-portal') page = <PortalPage navigate={navigate} />;
  if (path === '/faculty-portal') page = <FacultyPortalPage navigate={navigate} />;
  if (path === '/recruiter-portal') page = <RecruiterPortalPage navigate={navigate} />;

  return (
    <ClickSpark sparkColor="#f7c948" sparkSize={13} sparkRadius={24} sparkCount={10} duration={520} extraScale={1.15}>
      {page}
      <FaqChatbot />
    </ClickSpark>
  );
}
