import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);

      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid username or password!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>BANK OF ALGERIA</h2>
        <h3 style={styles.subtitle}>Login</h3>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label>Username</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button style={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',

    // 🔥 BACKGROUND IMAGE + DARK OVERLAY
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
      url("https://www.bank-of-algeria.dz/wp-content/uploads/2022/08/IMG_3621-wecompress.com_-scaled.jpg")
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    width: '400px',
    height: '400px',
  },

  title: {
    textAlign: 'center',
    color: '#001838',
    marginBottom: '5px'
  },

  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginBottom: '20px'
  },

  inputGroup: {
    marginBottom: '15px'
  },

  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '5px',
    border: '1px solid #ffffff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },

  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#001838',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },

  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px'
  }
};

export default Login;