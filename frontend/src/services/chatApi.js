import axios from 'axios';

// Use environment variable for production or fallback to localhost
const API_URL = import.meta.env.VITE_SERVER_URL || 
               import.meta.env.VITE_CHATBOT_API_URL || 
               'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for cross-domain requests
  timeout: 30000, // 30 second timeout for serverless cold starts
});

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only redirect to auth if not already on auth page
      if (!window.location.pathname.startsWith('/auth') && 
          !window.location.pathname.startsWith('/login')) {
        console.warn('Unauthorized access, redirecting to login...');
        // Uncomment if you have auth pages:
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Send a chat message and get AI response
 * @param {string} sessionId - The session ID
 * @param {string} message - The user's message
 * @returns {Promise} Response with AI message and potential lead info
 */
export const sendMessage = async (sessionId, message) => {
  try {
    const response = await api.post('/chat', {
      session_id: sessionId,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get chat history for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} Array of messages
 */
export const getMessages = async (sessionId) => {
  try {
    const response = await api.get(`/messages/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Save lead information
 * @param {Object} leadData - Lead information (name, email, phone, shoot_type, etc.)
 * @returns {Promise} Success response
 */
export const saveLead = async (leadData) => {
  try {
    const response = await api.post('/leads', leadData);
    return response.data;
  } catch (error) {
    console.error('Error saving lead:', error);
    throw error;
  }
};

/**
 * Get portfolio items
 * @returns {Promise} Array of portfolio items
 */
export const getPortfolio = async () => {
  try {
    const response = await api.get('/portfolio');
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
};

/**
 * Get photography packages
 * @returns {Promise} Array of packages
 */
export const getPackages = async () => {
  try {
    const response = await api.get('/packages');
    return response.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

/**
 * Submit feedback
 * @param {Object} feedbackData - Feedback information (name, email, rating, message, page)
 * @returns {Promise} Success response with feedback ID
 */
export const postFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export default {
  sendMessage,
  getMessages,
  saveLead,
  getPortfolio,
  getPackages,
  postFeedback,
};
