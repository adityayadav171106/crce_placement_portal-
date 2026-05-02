import { useState } from 'react';
import MagicRings from '../components/MagicRings.jsx';
import { loginUser } from '../data/portalStorage.js';

const roleConfig = {
  student: { email: 'student@crce.edu.in', label: 'Student', redirect: '/student-portal' },
  faculty: { email: 'faculty@crce.edu.in', label: 'Faculty', redirect: '/faculty-portal' },
  recruiter: { email: 'hr@company.com', label: 'Recruiter', redirect: '/recruiter-portal' }
};

export default function LoginPage({ navigate }) {
  const [role, setRole] = useState(() => {
    const hashRole = window.location.hash.replace('#', '');
    return roleConfig[hashRole] ? hashRole : 'student';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitLogin = async event => {
    event.preventDefault();
    const current = roleConfig[role];
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!setPasswordOpen && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (setPasswordOpen && (newPassword.length < 6 || newPassword !== confirmPassword)) {
      setError('New password must be 6 characters and match the confirmation.');
      return;
    }

    try {
      setLoading(true);
      await loginUser({
        email,
        role,
        password,
        setPassword: setPasswordOpen,
        newPassword
      });
      navigate(current.redirect);
    } catch (apiError) {
      setError(apiError.message || 'Could not sign in. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual" aria-hidden="true">
        <MagicRings
          color="#f7c948"
          colorTwo="#18c2a7"
          ringCount={7}
          speed={0.75}
          attenuation={9}
          lineThickness={2.2}
          baseRadius={0.2}
          radiusStep={0.08}
          scaleRate={0.16}
          opacity={0.95}
          noiseAmount={0.04}
          rotation={24}
          ringGap={1.28}
          followMouse
          mouseInfluence={0.16}
          hoverScale={1.18}
          parallax={0.08}
          clickBurst
        />
      </div>

      <button className="floating-back" onClick={() => navigate('/')}>
        <span className="material-icons-outlined">arrow_back</span>
        Home
      </button>

      <main className="login-layout">
        <section className="login-intro">
          <span className="eyebrow">Secure Access</span>
          <h1>One portal for every placement move.</h1>
          <p>Pick your role, sign in, and keep the hiring workflow moving without losing the thread.</p>
        </section>

        <section className="login-card">
          <div className="login-logo">
            <img src="/HEADER_LOGO.png" alt="CRCE Logo" />
            <div>
              <h2>Welcome Back</h2>
              <p>Signing in as {roleConfig[role].label}</p>
            </div>
          </div>

          <div className="role-selector" aria-label="Select role">
            {Object.entries(roleConfig).map(([key, cfg]) => (
              <button key={key} className={role === key ? 'active' : ''} onClick={() => setRole(key)}>
                {cfg.label}
              </button>
            ))}
          </div>

          <form onSubmit={submitLogin}>
            <label>
              Email
              <span className="input-shell">
                <span className="material-icons-outlined">mail</span>
                <input value={email} onChange={event => setEmail(event.target.value)} placeholder={roleConfig[role].email} />
              </span>
            </label>

            <label>
              Password
              <span className="input-shell">
                <span className="material-icons-outlined">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder={setPasswordOpen ? 'Current password, if any' : 'Enter your password'}
                />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label="Toggle password visibility">
                  <span className="material-icons-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </span>
            </label>

            {setPasswordOpen && (
              <div className="set-password-panel">
                <label>
                  New Password
                  <span className="input-shell">
                    <span className="material-icons-outlined">lock_open</span>
                    <input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} />
                  </span>
                </label>
                <label>
                  Confirm Password
                  <span className="input-shell">
                    <span className="material-icons-outlined">verified_user</span>
                    <input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
                  </span>
                </label>
              </div>
            )}

            <div className="login-options">
              <label className="remember-check">
                <input type="checkbox" defaultChecked />
                Remember me
              </label>
              <button type="button" onClick={() => setSetPasswordOpen(value => !value)}>
                {setPasswordOpen ? 'Use Existing Password' : 'Set Password'}
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : setPasswordOpen ? 'Set Password and Sign In' : 'Sign In'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
