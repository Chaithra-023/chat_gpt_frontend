import React, { useState } from 'react';

const CreativeSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' }); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Syncing with server...' });

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: `Welcome, ${email}!` });
      } else {
        setStatus({ type: 'error', msg: data.detail || 'Signup failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Server is offline. Start FastAPI first!' });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Join the Grid</h2>
        <p style={styles.subtitle}>Enter your credentials to proceed</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input 
              type="email" 
              placeholder="Email Address" 
              style={styles.input}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <input 
              type="password" 
              placeholder="Password" 
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" style={styles.button}>
            {status.type === 'loading' ? 'Encrypting...' : 'Initialize Signup'}
          </button>
        </form>

        {status.msg && (
          <div style={{
            ...styles.alert, 
            backgroundColor: status.type === 'success' ? '#06d6a033' : '#ef476f33',
            color: status.type === 'success' ? '#06d6a0' : '#ef476f'
          }}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

// Pure CSS-in-JS to ensure it works without external CSS files
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '40px',
    width: '350px',
    textAlign: 'center',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  },
  title: { color: '#fff', marginBottom: '10px', letterSpacing: '2px' },
  subtitle: { color: '#888', marginBottom: '30px', fontSize: '14px' },
  inputGroup: { marginBottom: '20px' },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(45deg, #480ca8, #4cc9f0)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  alert: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px'
  }
};

export default CreativeSignup;