import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  h1: { margin: 0, fontSize: 22, color: '#1a1a2e' },
  uploadCard: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  fileRow: { display: 'flex', gap: 16, alignItems: 'end' },
  btn: { padding: '10px 24px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDisabled: { padding: '10px 24px', background: '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'not-allowed', whiteSpace: 'nowrap' },
  card: { background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' },
  cardInfo: { flex: 1 },
  cardName: { fontWeight: 600, fontSize: 15, color: '#1a1a2e', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: '#888' },
  badges: { display: 'flex', gap: 8 },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 12, fontWeight: 600 },
  badgeGreen: { background: '#d4edda', color: '#155724' },
  badgeGray: { background: '#eee', color: '#666' },
  empty: { textAlign: 'center', color: '#888', padding: 40 },
  msg: { padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
};

export default function DashboardPage() {
  const [recordings, setRecordings] = useState([]);
  const [file, setFile] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordTime, setRecordTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const fetchRecordings = async () => {
    try {
      const { data } = await api.get('/api/recordings');
      setRecordings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchRecordings(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !adminName || !recordTime) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('admin_name', adminName);
      fd.append('record_date', recordDate);
      fd.append('record_time', recordTime);
      await api.post('/api/recordings', fd);
      setMessage({ type: 'success', text: 'Файл успешно загружен!' });
      setFile(null);
      setAdminName('');
      setRecordTime('');
      e.target.reset();
      fetchRecordings();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Ошибка загрузки' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.h1}>Записи звонков</h1>
      </div>

      <div style={styles.uploadCard}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#333' }}>Загрузить аудиофайл</h3>
        {message && (
          <div style={{ ...styles.msg, background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleUpload}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Имя администратора</label>
              <input style={styles.input} value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Например: Анна" required />
            </div>
            <div>
              <label style={styles.label}>Дата записи</label>
              <input style={styles.input} type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} required />
            </div>
            <div>
              <label style={styles.label}>Время записи</label>
              <input style={styles.input} type="time" value={recordTime} onChange={(e) => setRecordTime(e.target.value)} required />
            </div>
          </div>
          <div style={styles.fileRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Аудиофайл</label>
              <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} required style={{ fontSize: 14 }} />
            </div>
            <button type="submit" style={uploading ? styles.btnDisabled : styles.btn} disabled={uploading}>
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        </form>
      </div>

      <h2 style={{ fontSize: 18, color: '#333', marginBottom: 16 }}>Все записи</h2>
      {recordings.length === 0 ? (
        <div style={styles.empty}>Пока нет загруженных записей</div>
      ) : (
        recordings.map((r) => (
          <div key={r.id} style={styles.card} onClick={() => navigate(`/recording/${r.id}`)}>
            <div style={styles.cardInfo}>
              <div style={styles.cardName}>{r.original_name}</div>
              <div style={styles.cardMeta}>
                {r.admin_name} &middot; {r.record_date} {r.record_time}
              </div>
            </div>
            <div style={styles.badges}>
              {r.has_transcription ? (
                <span style={{ ...styles.badge, ...styles.badgeGreen }}>Транскрибация</span>
              ) : (
                <span style={{ ...styles.badge, ...styles.badgeGray }}>Нет транскрибации</span>
              )}
              {r.has_analysis ? (
                <span style={{ ...styles.badge, ...styles.badgeGreen }}>Анализ</span>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
