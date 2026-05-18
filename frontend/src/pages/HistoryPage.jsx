import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Copy, Trash2, Clock, Edit2, Search } from 'lucide-react';
import './HistoryPage.css';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('both'); // 'title', 'content', 'both'
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
    if (!dateString) return '';
    const date = new Date(dateString);
    // If invalid date, return empty
    if (isNaN(date.getTime())) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="history-container"><p>Loading history...</p></div>;
  }

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = item.title && item.title.toLowerCase().includes(query);
    const contentMatch = item.content && item.content.toLowerCase().includes(query);
    
    if (searchFilter === 'title') return titleMatch;
    if (searchFilter === 'content') return contentMatch;
    return titleMatch || contentMatch;
  });

  return (
    <div className="history-container animate-fade-in">
      <div className="history-header">
        <h2>Your Saved Drafts</h2>
        <p className="history-subtitle">Manage and reuse your formatted Instagram captions</p>
      </div>

      <div className="history-search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search drafts..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="search-filters">
          <button 
            className={`filter-btn ${searchFilter === 'both' ? 'active' : ''}`}
            onClick={() => setSearchFilter('both')}
          >
            Both
          </button>
          <button 
            className={`filter-btn ${searchFilter === 'title' ? 'active' : ''}`}
            onClick={() => setSearchFilter('title')}
          >
            Title
          </button>
          <button 
            className={`filter-btn ${searchFilter === 'content' ? 'active' : ''}`}
            onClick={() => setSearchFilter('content')}
          >
            Text
          </button>
        </div>
      </div>

      {message && <div className="toast-message-history">{message}</div>}

      {history.length === 0 ? (
        <div className="empty-history glass-panel">
          <Clock size={48} className="empty-icon" />
          <h3>No drafts yet</h3>
          <p>Go to the editor to save your first beautifully formatted caption.</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-history glass-panel">
          <Search size={48} className="empty-icon" />
          <h3>No results found</h3>
          <p>We couldn't find any drafts matching your search.</p>
        </div>
      ) : (
        <div className="history-grid">
          {filteredHistory.map((item) => (
            <div key={item._id} className="history-card glass-panel">
              <div className="history-card-header">
                <h3 className="history-title">{item.title || 'Untitled Draft'}</h3>
                <div className="history-meta">
                  <div className="date-badge">
                    <span className="date-label">Created</span>
                    <span className="history-date">{formatDate(item.createdAt)}</span>
                  </div>
                  {item.updatedAt && formatDate(item.createdAt) !== formatDate(item.updatedAt) && (
                    <div className="date-badge update-badge">
                      <span className="date-label">Edited</span>
                      <span className="history-date">{formatDate(item.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="history-content">
                {/* Preserve whitespace visually */}
                <pre>{item.content}</pre>
              </div>
              <div className="history-card-footer">
                <button 
                  onClick={() => handleDelete(item._id)} 
                  className="btn-icon text-red delete-btn"
                  title="Delete Draft"
                >
                  <Trash2 size={16} /> <span className="btn-text">Delete</span>
                </button>
                <div className="history-card-actions">
                  <button 
                    onClick={() => handleEdit(item)} 
                    className="btn-secondary btn-icon btn-sm"
                    title="Edit Draft"
                  >
                    <Edit2 size={16} /> <span className="btn-text">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleCopy(item.content)} 
                    className="btn-primary btn-icon btn-sm"
                    title="Copy to Clipboard"
                  >
                    <Copy size={16} /> <span className="btn-text">Copy</span>
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
