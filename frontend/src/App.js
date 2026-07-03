import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TranslateIcon from '@mui/icons-material/Translate';
import WarningIcon from '@mui/icons-material/Warning';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      user: false, 
      text: "Namaste! I'm Cure AI Health Assistant. How can I help you today? Ask me about symptoms, vaccines, or diseases like dengue, malaria.", 
      time: new Date().toLocaleTimeString() 
    }
  ]);
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Refs
  const chatMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Admin states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [newAlert, setNewAlert] = useState({ disease: '', location: '', severity: 'medium', message: '' });

  // Fetch data on load
  useEffect(() => {
    fetchAlerts();
    fetchDiseases();
    fetchVaccines();
    
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Check scroll position for scroll-to-bottom button
  const handleScroll = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchDiseases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diseases');
      setDiseases(response.data);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    }
  };

  const fetchVaccines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vaccines');
      setVaccines(response.data);
    } catch (error) {
      console.error('Error fetching vaccines:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const sendMessage = async () => {
    if(!message.trim()) return;
    
    const userMessage = { 
      user: true, 
      text: message, 
      time: new Date().toLocaleTimeString() 
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    setLoading(true);
    const currentMessage = message;
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: currentMessage,
        language: language
      });
      
      const botMessage = {
        user: false,
        text: response.data.reply,
        time: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, {
        user: false,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        time: new Date().toLocaleTimeString()
      }]);
      showToast('Connection error. Please try again.', 'error');
    }
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  const handleFeatureClick = (feature) => {
    if (feature === 'alerts') {
      setShowAlertModal(true);
    } else {
      let featureMessage = '';
      switch(feature) {
        case 'symptoms':
          featureMessage = "I can help with symptoms. Which disease would you like to know about? (e.g., dengue, malaria, covid-19)";
          break;
        case 'vaccines':
          featureMessage = "Here's the vaccination schedule:\n" + vaccines.map(v => 
            `• ${v.name}: ${v.ageGroup} - ${v.description}`
          ).join('\n');
          break;
        case 'multilingual':
          featureMessage = "I support multiple languages! Use the language selector above to switch between English, Hindi, and Odia.";
          break;
        default:
          featureMessage = "How can I help you with your health today?";
      }
      
      setChatHistory(prev => [...prev, {
        user: false,
        text: featureMessage,
        time: new Date().toLocaleTimeString()
      }]);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    showToast(newMode ? 'Dark mode enabled' : 'Light mode enabled', 'success');
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // ============= FIXED VOICE INPUT FUNCTION =============
  const startVoiceInput = () => {
    // Check if browser supports voice recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.', 'error');
      return;
    }

    try {
      // Request microphone permission explicitly
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Stop the stream immediately - we just needed permission
          stream.getTracks().forEach(track => track.stop());
          
          // Proceed with voice recognition
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          // Set correct language codes
          if (language === 'hindi') {
            recognition.lang = 'hi-IN';
          } else if (language === 'odia') {
            recognition.lang = 'or-IN'; // Fixed: was 'en-IN' before
          } else {
            recognition.lang = 'en-US';
          }
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsRecording(true);
            showToast('🎤 Listening... Speak now', 'info');
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            setIsRecording(false);
            showToast('✅ Voice captured!', 'success');
          };

          recognition.onerror = (event) => {
            console.error('Voice error:', event.error);
            setIsRecording(false);
            
            // Better error messages
            if (event.error === 'not-allowed') {
              showToast('❌ Microphone access denied. Please allow microphone.', 'error');
            } else if (event.error === 'no-speech') {
              showToast('🎤 No speech detected. Try again.', 'info');
            } else if (event.error === 'audio-capture') {
              showToast('❌ No microphone found. Check your microphone.', 'error');
            } else {
              showToast('❌ Voice input failed. Please try again.', 'error');
            }
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognition.start();
          recognitionRef.current = recognition;
        })
        .catch((err) => {
          console.error('Microphone permission error:', err);
          setIsRecording(false);
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            showToast('❌ Please allow microphone access in your browser settings', 'error');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            showToast('❌ No microphone found. Please connect a microphone.', 'error');
          } else {
            showToast('❌ Could not access microphone. Please try again.', 'error');
          }
        });
        
    } catch (error) {
      console.error('Voice input error:', error);
      setIsRecording(false);
      showToast('❌ Voice input failed', 'error');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', { username, password });
      if (response.data.success) {
        setLoggedIn(true);
        showToast('Login successful!', 'success');
      } else {
        showToast('Invalid credentials', 'error');
      }
    } catch (error) {
      showToast('Login failed', 'error');
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/alerts', newAlert);
      showToast('Alert added successfully!', 'success');
      setNewAlert({ disease: '', location: '', severity: 'medium', message: '' });
      fetchAlerts();
    } catch (error) {
      showToast('Failed to add alert', 'error');
    }
  };

  const renderHome = () => (
    <div className="main-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <h3 className="sidebar-title">Chat with Health Bot</h3>
        
        <div className="feature-list">
          <div className="feature-item" onClick={() => handleFeatureClick('symptoms')}>
            <HealthAndSafetyIcon className="feature-icon" />
            <div className="feature-text">
              <h4>Symptoms Checker</h4>
              <p>Get quick advice on common health symptoms</p>
            </div>
          </div>
          
          <div className="feature-item" onClick={() => handleFeatureClick('vaccines')}>
            <VaccinesIcon className="feature-icon" />
            <div className="feature-text">
              <h4>Vaccination Reminders</h4>
              <p>Receive automatic vaccine reminders</p>
            </div>
          </div>
          
          <div className="feature-item" onClick={() => handleFeatureClick('alerts')}>
            <WarningIcon className="feature-icon" />
            <div className="feature-text">
              <h4>Outbreak Alerts</h4>
              <p>Stay informed about disease outbreaks in your area</p>
              {alerts.length > 0 && (
                <span className="alert-badge">{alerts.length}</span>
              )}
            </div>
          </div>
          
          <div className="feature-item" onClick={() => handleFeatureClick('multilingual')}>
            <TranslateIcon className="feature-icon" />
            <div className="feature-text">
              <h4>Multilingual Support</h4>
              <p>Available in English, Hindi & Odia</p>
            </div>
          </div>
        </div>

        {/* Quick Disease Info */}
        <div className="quick-info">
          <h4>Common Diseases</h4>
          <div className="disease-tags">
            {diseases.map(d => (
              <span key={d.name} className="disease-tag" onClick={() => {
                setMessage(`symptoms of ${d.name}`);
              }}>
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <div className="chat-header-left">
            <WhatsAppIcon className="whatsapp-icon" />
            <h3>Cure AI Health Assistant</h3>
          </div>
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="english">🇬🇧 English</option>
              <option value="hindi">🇮🇳 हिन्दी</option>
              <option value="odia">🇮🇳 ଓଡ଼ିଆ</option>
            </select>
          </div>
        </div>
        
        <div 
          className="chat-messages" 
          id="chat-messages"
          ref={chatMessagesRef}
          onScroll={handleScroll}
        >
          {chatHistory.length === 1 && (
            <div className="welcome-screen">
              <h3>Welcome to Cure AI! 👋</h3>
              <p>Ask me about:</p>
              <div className="suggestion-chips">
                <span onClick={() => handleSuggestionClick("What are symptoms of fever?")}>🤒 Fever symptoms</span>
                <span onClick={() => handleSuggestionClick("How to prevent dengue?")}>🦟 Dengue prevention</span>
                <span onClick={() => handleSuggestionClick("Vaccine schedule for babies")}>💉 Baby vaccines</span>
                <span onClick={() => handleSuggestionClick("Home remedies for cold")}>🍵 Cold remedies</span>
                <span onClick={() => handleSuggestionClick("Foods for immunity")}>🥗 Boost immunity</span>
              </div>
            </div>
          )}
          
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.user ? 'user-message' : 'bot-message'}`}>
              <div className="message-content">
                {!msg.user && <span className="bot-label">Cure AI</span>}
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message bot-message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        
        {showScrollBtn && (
          <div className="scroll-bottom-btn" onClick={scrollToBottom}>
            <ArrowDownwardIcon />
          </div>
        )}
        
        <div className="chat-input">
          <button 
            className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <MicIcon />
          </button>
          <input
            type="text"
            placeholder="Type your health question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>Send</button>
        </div>
        
        <div className="chat-footer">
          <span>Trusted by Govt. Of Odisha • 24/7 Health Assistant</span>
        </div>
      </div>

      {/* Alerts Modal */}
      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><WarningIcon /> Active Outbreak Alerts</h3>
              <CloseIcon onClick={() => setShowAlertModal(false)} className="close-icon" />
            </div>
            <div className="modal-body">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div key={index} className={`alert-item severity-${alert.severity}`}>
                    <h4>{alert.disease} - {alert.location}</h4>
                    <p>{alert.message}</p>
                    <small>Severity: {alert.severity.toUpperCase()}</small>
                  </div>
                ))
              ) : (
                <p>No active alerts at this time.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAbout = () => (
    <div className="about-container">
      <h2>About Cure AI</h2>
      <div className="about-content">
        <section>
          <h3>Our Mission</h3>
          <p>Cure AI is an AI-driven public health chatbot designed to educate rural and semi-urban populations about preventive healthcare, disease symptoms, and vaccination schedules.</p>
        </section>
        
        <section>
          <h3>Key Features</h3>
          <ul>
            <li>🤖 24/7 AI-powered health assistant</li>
            <li>🌐 Multilingual support (English, Hindi, Odia)</li>
            <li>🚨 Real-time disease outbreak alerts</li>
            <li>💉 Vaccination schedule reminders</li>
            <li>🏥 Symptom checker for common diseases</li>
            <li>📱 Accessible via web, WhatsApp, and SMS</li>
          </ul>
        </section>
        
        <section>
          <h3>Government Initiative</h3>
          <p>This project is developed under the Government of Odisha, Electronics & IT Department, as part of the Smart India Hackathon to improve healthcare awareness in rural communities.</p>
        </section>
        
        <section>
          <h3>Contact</h3>
          <p>For any queries or suggestions, please contact the Electronics & IT Department, Government of Odisha.</p>
        </section>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!loggedIn) {
      return (
        <div className="admin-login-container">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <p className="demo-credentials">Demo: admin / admin123</p>
          </form>
        </div>
      );
    }

    return (
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        
        <div className="admin-section">
          <h3>Add New Outbreak Alert</h3>
          <form onSubmit={handleAddAlert} className="admin-form">
            <input
              type="text"
              placeholder="Disease Name"
              value={newAlert.disease}
              onChange={(e) => setNewAlert({...newAlert, disease: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={newAlert.location}
              onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
              required
            />
            <select
              value={newAlert.severity}
              onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
            </select>
            <textarea
              placeholder="Alert Message"
              value={newAlert.message}
              onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
              required
              rows="3"
            />
            <button type="submit">Add Alert</button>
          </form>
        </div>

        <div className="admin-section">
          <h3>Current Active Alerts</h3>
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className={`alert-card severity-${alert.severity}`}>
                <h4>{alert.disease} - {alert.location}</h4>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Dark Mode Toggle Button */}
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Toast Notifications */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-top">
          <span className="govt-text">Government of Odisha</span>
          <nav className="nav-links">
            <button className="nav-btn" onClick={() => setCurrentPage('home')}>
              <HomeIcon /> Home
            </button>
            <button className="nav-btn" onClick={() => setCurrentPage('about')}>
              <InfoIcon /> About
            </button>
            <button className="nav-btn" onClick={() => setCurrentPage('admin')}>
              <AdminPanelSettingsIcon /> Admin
            </button>
          </nav>
        </div>
        <hr className="divider" />
        <div className="header-bottom">
          <h1 className="project-name">Cure AI</h1>
          <h2 className="project-title">AI-Driven Public Health Chatbot for Disease Awareness</h2>
          <p className="project-description">
            Get health advice, symptom checker, vaccination reminders, and real-time outbreak alerts straight to your phone.
          </p>
        </div>
      </header>

      {/* Main Content */}
      {currentPage === 'home' && renderHome()}
      {currentPage === 'about' && renderAbout()}
      {currentPage === 'admin' && renderAdmin()}

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Government of Odisha | Electronics & IT Department | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default App;