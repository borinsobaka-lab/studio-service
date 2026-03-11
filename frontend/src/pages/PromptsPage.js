import React, { useState, useEffect } from 'react';
import api from '../api/client';

const styles = {
  h1: { margin: '0 0 24px', fontSize: 22, color: '#1a1a2e' },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 16 },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', minHeight: 200, lineHeight: 1.6, resize: 'vertical', marginBottom: 16 },
  btn: { padding: '10px 24px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  promptItem: { background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' },
  promptTitle: { fontWeight: 600, fontSize: 15, color: '#1a1a2e' },
  promptMeta: { fontSize: 13, color: '#888', marginTop: 4 },
  promptPreview: { fontSize: 13, color: '#555', marginTop: 8, whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'hidden' },
  activeBadge: { background: '#d4edda', color: '#155724', fontSize: 11, padding: '3px 10px', borderRadius: 12, fontWeight: 600 },
  inactiveBadge: { background: '#eee', color: '#666', fontSize: 11, padding: '3px 10px', borderRadius: 12, fontWeight: 600 },
  actions: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'end', minWidth: 120 },
  smallBtn: { padding: '5px 12px', fontSize: 12, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  msg: { padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' },
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const fetchPrompts = async () => {
    try {
      const { data } = await api.get('/api/prompts');
      setPrompts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPrompts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await api.post('/api/prompts', { title, content });
      setMessage('Промпт сохранён и активирован');
      setTitle('');
      setContent('');
      fetchPrompts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = async (id) => {
    await api.put(`/api/prompts/${id}/activate`);
    fetchPrompts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот промпт?')) return;
    await api.delete(`/api/prompts/${id}`);
    fetchPrompts();
  };

  return (
    <div>
      <h1 style={styles.h1}>Управление промптами</h1>

      <div style={styles.card}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#333' }}>Новый промпт (инструкция для анализа)</h3>
        {message && <div style={styles.msg}>{message}</div>}
        <form onSubmit={handleCreate}>
          <label style={styles.label}>Название</label>
          <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Анализ продаж v2" required />
          <label style={styles.label}>Содержание промпта</label>
          <textarea style={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Введите инструкцию для анализа диалогов..." required />
          <button type="submit" style={styles.btn}>Сохранить и активировать</button>
        </form>
      </div>

      <h2 style={{ fontSize: 18, color: '#333', marginBottom: 16 }}>Сохранённые промпты</h2>
      {prompts.map((p) => (
        <div key={p.id} style={styles.promptItem}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={styles.promptTitle}>{p.title}</span>
              <span style={p.is_active ? styles.activeBadge : styles.inactiveBadge}>
                {p.is_active ? 'Активный' : 'Неактивный'}
              </span>
            </div>
            <div style={styles.promptMeta}>{p.created_at}</div>
            <div style={styles.promptPreview}>{p.content.substring(0, 200)}...</div>
          </div>
          <div style={styles.actions}>
            {!p.is_active && (
              <button style={{ ...styles.smallBtn, background: '#1a1a2e', color: '#fff' }} onClick={() => handleActivate(p.id)}>
                Активировать
              </button>
            )}
            <button style={{ ...styles.smallBtn, background: '#f8d7da', color: '#721c24' }} onClick={() => handleDelete(p.id)}>
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
