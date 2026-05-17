import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Copy, Trash2, Clock, Edit2 } from 'lucide-react';
import './HistoryPage.css';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/history`);
        setHistory(res.data.data.history);
      } catch {
        setMessage('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/history/${id}`);
      setHistory(history.filter(item => item._id !== id));
      setMessage('Draft deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to delete draft');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to copy');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (item) => {
    navigate('/', { state: { editItem: item } });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="history-container"><p>Loading history...</p></div>;
  }

  return (
    <div className="history-container animate-fade-in">
      <div className="history-header">
        <h2>Your Saved Drafts</h2>
        <p className="history-subtitle">Manage and reuse your formatted Instagram captions</p>
      </div>

      {message && <div className="toast-message-history">{message}</div>}

      {history.length === 0 ? (
        <div className="empty-history glass-panel">
          <Clock size={48} className="empty-icon" />
          <h3>No drafts yet</h3>
          <p>Go to the editor to save your first beautifully formatted caption.</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item._id} className="history-card glass-panel">
              <div className="history-card-header">
                <h3 className="history-title">{item.title}</h3>
                <span className="history-date">{formatDate(item.createdAt)}</span>
              </div>
              <div className="history-content">
                {/* Preserve whitespace visually */}
                <pre>{item.content}</pre>
              </div>
              <div className="history-card-footer">
                <button 
                  onClick={() => handleDelete(item._id)} 
                  className="btn-icon text-red"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button 
                    onClick={() => handleEdit(item)} 
                    className="btn-secondary btn-icon btn-sm"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleCopy(item.content)} 
                    className="btn-primary btn-icon btn-sm"
                  >
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
