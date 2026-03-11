import React, { useState } from 'react';
import api from '../api/client';

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', fontFamily: "'Segoe UI', sans-serif" },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e', textAlign: 'center' },
  subtitle: { margin: '8px 0 32px', fontSize: 14, color: '#888', textAlign: 'center' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, marginBottom: 20, boxSizing: 'border-box', outline: 'none' },
  button: { width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#e94560', fontSize: 13, textAlign: 'center', marginBottom: 16 },
};

export default function LoginPage({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { login, password });
      onLogin(data.token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Studio Stretch</h1>
        <p style={styles.subtitle}>Аналитика звонков</p>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>Логин</label>
        <input style={styles.input} value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Введите логин" />
        <label style={styles.label}>Пароль</label>
        <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" />
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
