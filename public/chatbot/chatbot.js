class Chatbot {
  constructor(botId) {
    // Move requestQueue initialization to top
    this.requestQueue = Promise.resolve();
    this.retryAttempts = 3;
    this.retryDelay = 1000;

    this.botId = botId;
    this.apiKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyOWMzYWEwOTY3MTU0OWRjMmU5YWUiLCJsb2dpblRpbWUiOjE3NDI0NTkwMjU0OTYsInJvbGVJZCI6eyJfaWQiOiI2NWU1YmE1NzNkNzI3MmU1NmVlMjMxMjMifSwiaWF0IjoxNzQyNDU5MDI1LCJleHAiOjE3NDUwNTEwMjV9.uvXuJobZaRMyrZAR9c4VMbIXbXUOXsaa7HiR8UWZqm8';
    this.baseUrl = 'http://localhost:4040/api';
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');
    this.chatMessages = document.getElementById('chat-messages');
    this.conversationId = null;
    this.botName = 'AI Assistant'; // Default name until we fetch it
    this.isLoading = false;
    this.botColor = '#578FCA'; // Default color
    this.lastApiCall = 0;
    this.apiCooldown = 1000; // 1 second cooldown between API calls
    this.maxStorageAge = 24 * 60 * 60 * 1000; // 24 hours
    this.loadBotState().then(() => {
      this.loadConversationState().catch((err) => {
        console.error('Error loading conversation:', err);
        this.showBotWelcomeMessage();
      });
    });

    this.initialize();
  }

  async loadBotState() {
    try {
      const botState = localStorage.getItem(`bot_state_${this.botId}`);
      if (botState) {
        const { name, color, timestamp } = JSON.parse(botState);

        // Check if data is still valid (less than 24 hours old)
        if (Date.now() - timestamp < this.maxStorageAge) {
          this.botName = name;
          this.botColor = color;
          document.getElementById('bot-name').textContent = this.botName;
          this.updateThemeColor();
          // Notify parent about color on state load
          this.notifyParentAboutColor();
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading bot state:', error);
    }
    return false;
  }

  saveBotState(name, color) {
    try {
      const botState = {
        name,
        color,
        timestamp: Date.now(),
      };
      localStorage.setItem(`bot_state_${this.botId}`, JSON.stringify(botState));

      // Set expiration for localStorage item
      this.setStorageExpiration(`bot_state_${this.botId}`);
    } catch (error) {
      console.error('Error saving bot state:', error);
    }
  }

  async loadConversationState() {
    try {
      const savedState = localStorage.getItem(`chatbot_${this.botId}`);
      if (!savedState) return;

      const { conversationId, timestamp } = JSON.parse(savedState);
      if (!conversationId || Date.now() - timestamp >= this.maxStorageAge) {
        this.clearConversationState();
        return;
      }

      this.conversationId = conversationId;
      await this.loadPreviousMessages();
    } catch (error) {
      this.clearConversationState();
      throw error;
    }
  }

  saveConversationState() {
    try {
      if (this.conversationId) {
        const state = {
          conversationId: this.conversationId,
          timestamp: Date.now(),
        };
        localStorage.setItem(`chatbot_${this.botId}`, JSON.stringify(state));

        // Set expiration for localStorage item
        this.setStorageExpiration(`chatbot_${this.botId}`);
      }
    } catch (error) {
      console.error('Error saving conversation state:', error);
    }
  }

  clearConversationState() {
    localStorage.removeItem(`chatbot_${this.botId}`);
    this.conversationId = null;
  }

  setStorageExpiration(key) {
    try {
      const expirations = JSON.parse(
        localStorage.getItem('storage_expirations') || '{}',
      );
      expirations[key] = Date.now() + this.maxStorageAge;
      localStorage.setItem('storage_expirations', JSON.stringify(expirations));
    } catch (error) {
      console.error('Error setting storage expiration:', error);
    }
  }

  checkStorageExpiration() {
    try {
      const expirations = JSON.parse(
        localStorage.getItem('storage_expirations') || '{}',
      );
      const now = Date.now();

      Object.entries(expirations).forEach(([key, expiry]) => {
        if (now >= expiry) {
          localStorage.removeItem(key);
          delete expirations[key];
        }
      });

      localStorage.setItem('storage_expirations', JSON.stringify(expirations));
    } catch (error) {
      console.error('Error checking storage expiration:', error);
    }
  }

  async makeSecureRequest(url, options) {
    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue
        .then(async () => {
          let lastError;
          for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
              const response = await fetch(url, {
                ...defaultOptions,
                ...options,
              });
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.message || `HTTP error! status: ${response.status}`,
                );
              }
              const data = await response.json();
              resolve(data);
              return;
            } catch (error) {
              lastError = error;
              if (attempt < this.retryAttempts - 1) {
                await new Promise((resolve) =>
                  setTimeout(resolve, this.retryDelay * (attempt + 1)),
                );
              }
            }
          }
          reject(lastError);
        })
        .catch(reject);
    });
  }

  async loadPreviousMessages() {
    try {
      // Validate conversation ID
      if (
        !this.conversationId ||
        !/^[0-9a-fA-F]{24}$/.test(this.conversationId)
      ) {
        throw new Error('Invalid conversation ID');
      }

      const data = await this.makeSecureRequest(
        `${this.baseUrl}/conversations/${this.conversationId}`,
        { method: 'GET' },
      );

      // Validate response data
      if (!data?.data?.messages || !Array.isArray(data.data.messages)) {
        throw new Error('Invalid response format');
      }

      this.chatMessages.innerHTML = '';

      // Add messages with sanitization
      data.data.messages.forEach((message) => {
        if (this.validateMessage(message)) {
          this.addMessage(
            message.content,
            message.role === 'user' ? 'user' : 'bot',
            message.timestamp,
          );
        }
      });
    } catch (error) {
      console.error('Error loading previous messages:', error);
      this.handleLoadError(error);
    }
  }

  validateMessage(message) {
    return (
      message &&
      typeof message.content === 'string' &&
      ['user', 'bot'].includes(message.role) &&
      message.content.length <= 10000
    ); // Reasonable message length limit
  }

  handleLoadError(error) {
    if (
      error.message.includes('Invalid conversation ID') ||
      error.message.includes('404') ||
      error.message.includes('400')
    ) {
      // Clear invalid conversation state
      this.clearConversationState();
      this.showBotWelcomeMessage();
    } else {
      // Show error message to user
      this.addMessage(
        'Unable to load previous messages. Starting new conversation.',
        'bot',
      );
      this.clearConversationState();
    }
  }

  initialize() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Only show welcome message if there's no existing conversation
    if (!this.conversationId) {
      this.showBotWelcomeMessage();
    }

    // Check for expired storage items on initialization
    this.checkStorageExpiration();

    // Regular cleanup interval
    setInterval(() => this.checkStorageExpiration(), 60 * 60 * 1000); // Check every hour
  }

  async showBotWelcomeMessage() {
    try {
      const response = await fetch(`${this.baseUrl}/bots/${this.botId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bot details');
      }

      const result = await response.json();
      const botData = result.data || {};

      // Set and save bot name and color
      this.botName = botData.name || 'AI Assistant';
      this.botColor = botData.color || '#007bff';

      // Save to localStorage
      this.saveBotState(this.botName, this.botColor);

      // Update UI
      document.getElementById('bot-name').textContent = this.botName;
      this.updateThemeColor();

      // Notify parent window immediately about the color
      this.notifyParentAboutColor();

      // Show welcome message
      if (botData.welcomeMessage) {
        this.addMessage(botData.welcomeMessage, 'bot');
      } else {
        this.addMessage('Hello! How can I help you today?', 'bot');
      }
    } catch (error) {
      console.error('Error fetching bot details:', error);
      if (!this.loadBotState()) {
        // Only set defaults if no saved state exists
        this.botName = 'AI Assistant';
        this.botColor = '#007bff';
        document.getElementById('bot-name').textContent = this.botName;
        this.updateThemeColor();
      }
      this.addMessage('Hello! How can I help you today?', 'bot');
    }
  }

  notifyParentAboutColor() {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'BOT_COLOR', color: this.botColor },
        '*',
      );
    }
  }

  updateThemeColor() {
    // Update header background
    const header = document.getElementById('chat-header');
    header.style.backgroundColor = this.botColor;

    // Update bot avatar in header and set background color
    const headerBotAvatar = document.getElementById('bot-avatar');
    headerBotAvatar.style.backgroundColor = this.botColor;

    // Update all existing bot avatars in messages
    const botAvatars = document.querySelectorAll('.bot-avatar');
    botAvatars.forEach((avatar) => {
      avatar.style.backgroundColor = this.botColor;
    });

    // Update styles for theme colors
    const style = document.createElement('style');
    style.textContent = `
      .bot-avatar {
        background-color: ${this.botColor} !important;
      }
      .user-message .message-content {
        background: ${this.botColor};
      }
      .typing-indicator span {
        background: ${this.adjustColor(this.botColor, 40)} !important;
      }
      #send-button {
        background-color: ${this.botColor};
      }
      #send-button:hover {
        background-color: ${this.adjustColor(this.botColor, -20)};
      }
      #message-input:focus {
        border-color: ${this.botColor};
      }
    `;
    document.head.appendChild(style);

    // If this is inside an iframe, send color to parent
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'BOT_COLOR', color: this.botColor },
        '*',
      );
    }
  }

  // Utility function to darken/lighten colors
  adjustColor(color, amount) {
    return (
      '#' +
      color
        .replace(/^#/, '')
        .replace(/../g, (color) =>
          (
            '0' +
            Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(
              16,
            )
          ).substr(-2),
        )
    );
  }

  async sendMessage() {
    if (!this.validateInput()) return;

    const message = this.messageInput.value.trim();
    if (!message || this.isLoading) return;

    // Implement API call throttling
    const now = Date.now();
    if (now - this.lastApiCall < this.apiCooldown) {
      console.log('Too many requests, please wait...');
      return;
    }
    this.lastApiCall = now;

    this.addMessage(message, 'user');
    this.messageInput.value = '';
    this.messageInput.focus();

    // Show loading message
    this.showLoadingMessage();

    try {
      // Sanitize message content
      const sanitizedMessage = DOMPurify.sanitize(message).trim();

      const payload = {
        botId: this.botId,
        message: {
          content: sanitizedMessage,
          role: 'user',
          timestamp: new Date().toISOString(),
        },
      };

      if (this.conversationId) {
        payload.conversationId = this.conversationId;
      }

      const data = await this.makeSecureRequest(
        `${this.baseUrl}/conversations${this.conversationId ? '/' + this.conversationId : ''}`,
        {
          method: this.conversationId ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        },
      );

      if (!this.conversationId) {
        this.conversationId = data.data._id;
        this.saveConversationState(); // Save state when new conversation is created
      }

      const botMessage = data.data.messages[data.data.messages.length - 1];

      // Remove loading message before showing bot response
      this.removeLoadingMessage();
      this.addMessage(botMessage.content, 'bot', botMessage.timestamp);
    } catch (error) {
      this.handleSendError(error);
    }
  }

  validateInput() {
    const message = this.messageInput.value.trim();

    if (!message) return false;
    if (message.length > 1000) {
      // Reasonable input length limit
      this.addMessage(
        'Message is too long. Please keep it under 1000 characters.',
        'bot',
      );
      return false;
    }
    if (this.isLoading) return false;

    const now = Date.now();
    if (now - this.lastApiCall < this.apiCooldown) {
      this.addMessage(
        'Please wait a moment before sending another message.',
        'bot',
      );
      return false;
    }

    return true;
  }

  handleSendError(error) {
    this.removeLoadingMessage();
    console.error('Error sending message:', error);

    let errorMessage = 'Sorry, there was an error processing your message.';
    if (error.message.includes('401')) {
      errorMessage = 'Authentication failed. Please refresh the page.';
    } else if (error.message.includes('429')) {
      errorMessage = 'Too many messages. Please wait a moment.';
    }

    this.addMessage(errorMessage, 'bot');
  }

  showLoadingMessage() {
    this.isLoading = true;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-message';
    loadingDiv.innerHTML = `
      <div class="avatar bot-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    this.chatMessages.appendChild(loadingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  removeLoadingMessage() {
    this.isLoading = false;
    const loadingMessage = this.chatMessages.querySelector('.loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Dhaka', // GMT+6
    }).format(new Date(date));
  }

  addMessage(content, type, timestamp = new Date()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    // Add timestamp at the top
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-timestamp';
    timeDiv.textContent = this.formatTime(timestamp);
    messageDiv.appendChild(timeDiv);

    // Create message row for avatar and content
    const messageRow = document.createElement('div');
    messageRow.className = 'message-row';

    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = `avatar ${type}-avatar`;
    avatar.innerHTML = type === 'bot' ? '🤖' : '👤';
    if (type === 'bot') {
      avatar.style.backgroundColor = this.botColor;
    }

    // Create message content container
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    try {
      if (type === 'bot') {
        const cleanContent = DOMPurify.sanitize(content);
        const renderedContent = MarkdownRenderer.render(cleanContent);
        messageContent.appendChild(renderedContent);
      } else {
        messageContent.textContent = content;
      }
    } catch (error) {
      console.error('Message rendering error:', error);
      messageContent.textContent =
        type === 'bot'
          ? "I'm sorry, I couldn't format that message properly. Please try again."
          : content;
    }

    // Assemble message
    messageRow.appendChild(avatar);
    messageRow.appendChild(messageContent);
    messageDiv.appendChild(messageRow);

    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}

// Initialize chatbot with persisted storage handling
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const botId = urlParams.get('botId');

  if (botId) {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Refresh storage expiration check when tab becomes visible
        const chatbot = new Chatbot(botId);
        chatbot.checkStorageExpiration();
      }
    });

    new Chatbot(botId);
  } else {
    console.error('Missing required parameter: botId');
    document.getElementById('chat-messages').innerHTML =
      '<div class="error-message">Missing required bot ID parameter.</div>';
  }
});
