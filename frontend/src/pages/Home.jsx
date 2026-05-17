import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bold, Italic, Type, Underline, Strikethrough, Copy, Save, Trash2, Undo, Redo, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/context';
import { applyStyle, convertLineBreaks } from '../utils/textFormatter';
import './Home.css';

const Home = () => {
  const [text, setText] = useState(() => localStorage.getItem('draft_text') || '');
  const [history, setHistory] = useState(() => [localStorage.getItem('draft_text') || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [title, setTitle] = useState(() => localStorage.getItem('draft_title') || '');
  const [isCopied, setIsCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState('');
  const textareaRef = useRef(null);
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.editItem) {
      const { _id, title: editTitle, content } = location.state.editItem;
      setEditingId(_id);
      setTitle(editTitle || '');
      setText(content);
      setHistory([content]);
      setHistoryIndex(0);
      setMessage('Draft loaded for editing');
      setTimeout(() => setMessage(''), 3000);
      
      // Clear location state to prevent reload from re-populating
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem('draft_text', text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem('draft_title', title);
  }, [title]);

  const updateTextAndHistory = (newText) => {
    setText(newText);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  const handleFormat = (style) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      setMessage('Please select some text to format');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const selectedText = text.substring(start, end);
    const formattedText = applyStyle(selectedText, style);

    const newText = text.substring(0, start) + formattedText + text.substring(end);
    updateTextAndHistory(newText);
    
    // Maintain selection roughly
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const handleCopy = async () => {
    const finalContent = convertLineBreaks(text);
    try {
      await navigator.clipboard.writeText(finalContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setMessage('Failed to copy to clipboard');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    if (!user || !token) {
      setMessage('Please login to save your drafts');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!text) {
      setMessage('Content cannot be empty');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const finalContent = convertLineBreaks(text);
      
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/history/${editingId}`, {
          title: title || 'Untitled Draft',
          content: finalContent
        });
        setMessage('Draft updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/history`, {
          title: title || 'Untitled Draft',
          content: finalContent
        });
        setMessage('Draft saved successfully!');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save draft');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all text?')) {
      updateTextAndHistory('');
      setTitle('');
      setEditingId('');
    }
  };

  const handleNew = () => {
    if (text.trim().length > 0 && !window.confirm('Start a new draft? Unsaved changes will be lost.')) {
      return;
    }
    updateTextAndHistory('');
    setTitle('');
    setEditingId('');
    setMessage('Started a new draft');
    setTimeout(() => setMessage(''), 3000);
  };

  const charCount = text.length;

  return (
    <div className="home-container animate-fade-in">
      <div className="editor-card glass-panel">
        
        {message && <div className="toast-message">{message}</div>}

        <div className="editor-header">
          <input
            type="text"
            className="title-input"
            placeholder="Draft Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <span className={`char-counter ${charCount > 2200 ? 'text-red' : ''}`}>
            {charCount} / 2200
          </span>
        </div>

        <div className="toolbar">
          <button onClick={() => handleFormat('bold')} className="tool-btn" title="Bold">
            <Bold size={18} />
          </button>
          <button onClick={() => handleFormat('italic')} className="tool-btn" title="Italic">
            <Italic size={18} />
          </button>
          <button onClick={() => handleFormat('monospace')} className="tool-btn" title="Monospace">
            <Type size={18} />
          </button>
          <button onClick={() => handleFormat('underline')} className="tool-btn" title="Underline">
            <Underline size={18} />
          </button>
          <button onClick={() => handleFormat('strikethrough')} className="tool-btn" title="Strikethrough">
            <Strikethrough size={18} />
          </button>
          <div className="toolbar-divider"></div>
          <button onClick={() => handleFormat('cursive')} className="tool-btn text-icon" title="Cursive">
            𝒜
          </button>
          <button onClick={() => handleFormat('doubleStruck')} className="tool-btn text-icon" title="Double Struck">
            𝔻
          </button>
          <button onClick={() => handleFormat('sansSerifBold')} className="tool-btn text-icon" title="Sans Serif Bold">
            𝗔
          </button>
          <div className="toolbar-divider"></div>
          <button onClick={handleUndo} disabled={historyIndex === 0} className="tool-btn" title="Undo">
            <Undo size={18} />
          </button>
          <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="tool-btn" title="Redo">
            <Redo size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="main-textarea"
          placeholder="Write your Instagram caption here... Select text and use the toolbar to format! Add as many blank lines as you want."
          value={text}
          onChange={(e) => updateTextAndHistory(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="editor-footer">
          <div className="footer-left" style={{display: 'flex', gap: '1rem'}}>
            <button onClick={handleNew} className="btn-secondary btn-icon">
              <Plus size={18} /> New
            </button>
            <button onClick={handleClear} className="btn-secondary btn-icon text-red">
              <Trash2 size={18} /> Clear
            </button>
          </div>
          <div className="footer-actions">
            <button onClick={handleSave} className="btn-secondary btn-icon">
              <Save size={18} /> Save Draft
            </button>
            <button onClick={handleCopy} className="btn-primary btn-icon">
              <Copy size={18} /> {isCopied ? 'Copied!' : 'Copy & Convert'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
