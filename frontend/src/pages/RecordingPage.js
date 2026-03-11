import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

const styles = {
  backBtn: { background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 16, fontWeight: 600 },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  h2: { margin: '0 0 8px', fontSize: 20, color: '#1a1a2e' },
  meta: { fontSize: 14, color: '#888', marginBottom: 20 },
  btn: { padding: '10px 24px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginRight: 12 },
  btnSecondary: { padding: '10px 24px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnDisabled: { padding: '10px 24px', background: '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'not-allowed', marginRight: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' },
  dialogLine: { marginBottom: 8, lineHeight: 1.6 },
  speakerAdmin: { fontWeight: 700, color: '#e94560' },
  speakerClient: { fontWeight: 700, color: '#1a1a2e' },
  analysisText: { whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 14, color: '#333' },
  loading: { textAlign: 'center', padding: 20, color: '#888' },
  error: { color: '#e94560', padding: 12, background: '#f8d7da', borderRadius: 8, marginBottom: 16 },
};

export default function RecordingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const fetchRecording = async () => {
    try {
      const { data } = await api.get(`/api/recordings/${id}`);
      setRecording(data);
    } catch (err) {
      setError('Не удалось загрузить запись');
    }
  };

  useEffect(() => { fetchRecording(); }, [id]);

  const handleTranscribe = async () => {
    setTranscribing(true);
    setError('');
    try {
      const { data } = await api.post(`/api/transcription/${id}`);
      setRecording((prev) => ({ ...prev, transcription: data.transcription }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка транскрибации');
    } finally {
      setTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const { data } = await api.post(`/api/analysis/${id}`);
      setRecording((prev) => ({ ...prev, analysis: data.analysis }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка анализа');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!recording) return <div style={styles.loading}>Загрузка...</div>;

  const renderTranscription = () => {
    if (!recording.transcription) return null;
    const lines = recording.transcription.split('\n').filter(Boolean);
    return lines.map((line, i) => {
      const isAdmin = line.startsWith('Администратор студии:');
      const isClient = line.startsWith('Клиент:');
      if (isAdmin || isClient) {
        const [speaker, ...rest] = line.split(':');
        const text = rest.join(':').trim();
        return (
          <div key={i} style={styles.dialogLine}>
            <span style={isAdmin ? styles.speakerAdmin : styles.speakerClient}>{speaker}:</span> {text}
          </div>
        );
      }
      return <div key={i} style={styles.dialogLine}>{line}</div>;
    });
  };

  return (
    <div>
      <button style={styles.backBtn} onClick={() => navigate('/')}>&#8592; Назад к записям</button>

      <div style={styles.card}>
        <h2 style={styles.h2}>{recording.original_name}</h2>
        <div style={styles.meta}>
          Администратор: <strong>{recording.admin_name}</strong> &middot; {recording.record_date} в {recording.record_time}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={{ display: 'flex', gap: 12 }}>
          {!recording.transcription && (
            <button style={transcribing ? styles.btnDisabled : styles.btn} onClick={handleTranscribe} disabled={transcribing}>
              {transcribing ? 'Транскрибация...' : 'Транскрибация'}
            </button>
          )}
          {recording.transcription && !recording.analysis && (
            <button style={analyzing ? styles.btnDisabled : styles.btnSecondary} onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Анализ...' : 'Анализ'}
            </button>
          )}
        </div>
      </div>

      {recording.transcription && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Транскрибация диалога</h3>
          {renderTranscription()}
        </div>
      )}

      {recording.analysis && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Анализ звонка</h3>
          <div style={styles.analysisText}>{recording.analysis}</div>
        </div>
      )}
    </div>
  );
}
