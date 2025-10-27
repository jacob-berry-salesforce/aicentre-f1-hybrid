import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './RegisterScreen.css';

function RegisterScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rig = searchParams.get('rig') || '1';

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rig,
          name: name.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to ready screen
      navigate(`/ready?rig=${rig}&name=${encodeURIComponent(name.trim())}`);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-screen fullscreen">
      <div className="register-content animate-slide-in">
        <h1>F1 RACING</h1>
        <h2>RIG {rig}</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Enter Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              maxLength={30}
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Registering...' : "Let's Race!"}
          </button>
        </form>

        <p className="register-hint">
          You'll race on Rig {rig}
        </p>
      </div>
    </div>
  );
}

export default RegisterScreen;
