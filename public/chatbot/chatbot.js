class Chatbot {
  constructor(botId) {
    // Core properties
    this.botId = botId;
    this.apiKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyOWMzYWEwOTY3MTU0OWRjMmU5YWUiLCJsb2dpblRpbWUiOjE3NDI0NTkwMjU0OTYsInJvbGVJZCI6eyJfaWQiOiI2NWU1YmE1NzNkNzI3MmU1NmVlMjMxMjMifSwiaWF0IjoxNzQyNDU5MDI1LCJleHAiOjE3NDUwNTEwMjV9.uvXuJobZaRMyrZAR9c4VMbIXbXUOXsaa7HiR8UWZqm8';
    this.baseUrl = 'http://localhost:4040/api';
    this.conversationId = null;

    // UI elements
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');
    this.chatMessages = document.getElementById('chat-messages');

    // State management
    this.requestQueue = Promise.resolve();
    this.isLoading = false;
    this.lastApiCall = 0;

    // Configuration
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.apiCooldown = 1000; // 1 second cooldown
    this.maxStorageAge = 24 * 60 * 60 * 1000; // 24 hours

    // Defaults
    this.botName = 'AI Assistant';
    this.botColor = '#578FCA';
    this.customIcon = '🤖';

    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    this.iconFromUrl = urlParams.get('icon');
    this.setIconContent(this.iconFromUrl || this.customIcon);

    // Initialize the chatbot
    this.setupEventListeners();
    this.startupSequence();
  }

  // INITIALIZATION METHODS

  async startupSequence() {
    try {
      await this.loadBotState();
      await this.loadConversationState();
    } catch (err) {
      console.error('Error during startup:', err);
      this.showBotWelcomeMessage();
    }

    // Only show welcome if no conversation exists
    if (!this.conversationId) {
      this.showBotWelcomeMessage();
    }

    this.checkStorageExpiration();
    setInterval(() => this.checkStorageExpiration(), 60 * 60 * 1000); // Hourly check
  }

  setupEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  // UI METHODS

  setIconContent(iconSource) {
    if (this.isImageUrl(iconSource)) {
      this.customIcon = `<img src="${iconSource}" alt="Bot" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      this.customIcon = iconSource;
    }

    const botIcon = document.getElementById('bot-icon');
    if (botIcon) botIcon.innerHTML = this.customIcon;
  }

  isImageUrl(str) {
    return str && str.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i);
  }

  updateThemeColor() {
    // Update header
    const header = document.getElementById('chat-header');
    header.style.backgroundColor = this.botColor;

    // Update bot avatar
    const headerBotAvatar = document.getElementById('bot-avatar');
    headerBotAvatar.style.backgroundColor = this.botColor;

    // Update bot icon
    document.getElementById('bot-icon').innerHTML = this.customIcon;

    // Update existing bot avatars
    document.querySelectorAll('.bot-avatar').forEach((avatar) => {
      avatar.style.backgroundColor = this.botColor;
    });

    // Apply theme colors
    const style = document.createElement('style');
    style.textContent = `
      .bot-avatar { background-color: ${this.botColor} !important; }
      .user-message .message-content { background: ${this.botColor}; }
      .typing-indicator span { background: ${this.adjustColor(this.botColor, 40)} !important; }
      #send-button { background-color: ${this.botColor}; }
      #send-button:hover { background-color: ${this.adjustColor(this.botColor, -20)}; }
      #message-input:focus { border-color: ${this.botColor}; }
    `;
    document.head.appendChild(style);

    this.notifyParentAboutColor();
  }

  notifyParentAboutColor() {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'BOT_COLOR', color: this.botColor },
        '*',
      );
    }
  }

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

  // MESSAGE HANDLING

  async sendMessage() {
    if (!this.validateInput()) return;

    const message = this.messageInput.value.trim();
    this.messageInput.value = '';
    this.messageInput.focus();

    this.addMessage(message, 'user');
    this.showLoadingMessage();

    try {
      const sanitizedMessage = DOMPurify.sanitize(message).trim();
      const payload = {
        botId: this.botId,
        message: {
          content: sanitizedMessage,
          role: 'user',
          timestamp: new Date().toISOString(),
        },
      };

      if (this.conversationId) payload.conversationId = this.conversationId;

      const endpoint = `${this.baseUrl}/conversations${this.conversationId ? '/' + this.conversationId : ''}`;
      const method = this.conversationId ? 'PATCH' : 'POST';

      const data = await this.makeSecureRequest(endpoint, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!this.conversationId) {
        this.conversationId = data.data._id;
        this.saveConversationState();
      }

      const botMessage = data.data.messages[data.data.messages.length - 1];
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

    this.lastApiCall = now;
    return true;
  }

  addMessage(content, type, timestamp = new Date(), scrollToBottom = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-timestamp';
    timeDiv.textContent = this.formatTime(timestamp);
    messageDiv.appendChild(timeDiv);

    // Create message row
    const messageRow = document.createElement('div');
    messageRow.className = 'message-row';

    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = `avatar ${type}-avatar`;
    if (type === 'bot') {
      avatar.innerHTML = this.customIcon;
      avatar.style.backgroundColor = this.isImageUrl(this.iconFromUrl)
        ? 'white'
        : this.botColor;
    } else {
      avatar.innerHTML = '👤';
    }

    // Create message content
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
          ? "I'm sorry, I couldn't format that message properly."
          : content;
    }

    // Assemble message
    messageRow.appendChild(avatar);
    messageRow.appendChild(messageContent);
    messageDiv.appendChild(messageRow);
    this.chatMessages.appendChild(messageDiv);

    if (scrollToBottom) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  showLoadingMessage() {
    this.isLoading = true;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-message';

    const messageRow = document.createElement('div');
    messageRow.className = 'message-row';

    const avatar = document.createElement('div');
    avatar.className = 'avatar bot-avatar';
    avatar.innerHTML = this.customIcon;
    avatar.style.backgroundColor = this.isImageUrl(this.iconFromUrl)
      ? 'white'
      : this.botColor;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content loading-content';
    messageContent.innerHTML = `
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;

    messageRow.appendChild(avatar);
    messageRow.appendChild(messageContent);
    loadingDiv.appendChild(messageRow);
    this.chatMessages.appendChild(loadingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  removeLoadingMessage() {
    this.isLoading = false;
    const loadingMessage = this.chatMessages.querySelector('.loading-message');
    if (loadingMessage) loadingMessage.remove();
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

  formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Dhaka', // GMT+6
    }).format(new Date(date));
  }

  // API & DATA HANDLING

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
              if (attempt < this.retryAttempts - 1) {
                await new Promise((r) =>
                  setTimeout(r, this.retryDelay * (attempt + 1)),
                );
              } else {
                reject(error);
              }
            }
          }
        })
        .catch(reject);
    });
  }

  async showBotWelcomeMessage() {
    try {
      const response = await fetch(`${this.baseUrl}/bots/${this.botId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bot details');

      const result = await response.json();
      const botData = result.data || {};

      // Set bot properties
      this.botName = botData.name || 'AI Assistant';
      this.botColor = botData.color || '#578FCA';

      // Set icon with priority: API icon/logo > URL param > default
      let iconSource = botData.icon || botData.logo || this.iconFromUrl;
      if (iconSource) this.setIconContent(iconSource);

      // Save and update UI
      this.saveBotState(this.botName, this.botColor);
      document.getElementById('bot-name').textContent = this.botName;
      document.getElementById('bot-icon').innerHTML = this.customIcon;
      this.updateThemeColor();

      // Show welcome message
      const welcomeMsg =
        botData.welcomeMessage || 'Hello! How can I help you today?';
      this.addMessage(welcomeMsg, 'bot');
    } catch (error) {
      console.error('Error fetching bot details:', error);
      if (!this.loadBotState()) {
        // Set defaults if no saved state
        this.botName = 'AI Assistant';
        this.botColor = '#578FCA';
        document.getElementById('bot-name').textContent = this.botName;
        this.updateThemeColor();
      }
      this.addMessage('Hello! How can I help you today?', 'bot');
    }
  }

  // LOCAL STORAGE HANDLING

  async loadBotState() {
    try {
      const botState = localStorage.getItem(`bot_state_${this.botId}`);
      if (botState) {
        const { name, color, icon, timestamp } = JSON.parse(botState);

        if (Date.now() - timestamp < this.maxStorageAge) {
          this.botName = name;
          this.botColor = color;
          this.customIcon = icon || this.customIcon;

          document.getElementById('bot-name').textContent = this.botName;
          document.getElementById('bot-icon').innerHTML = this.customIcon;

          this.updateThemeColor();
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
      localStorage.setItem(
        `bot_state_${this.botId}`,
        JSON.stringify({
          name,
          color,
          icon: this.customIcon,
          timestamp: Date.now(),
        }),
      );
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
        localStorage.setItem(
          `chatbot_${this.botId}`,
          JSON.stringify({
            conversationId: this.conversationId,
            timestamp: Date.now(),
          }),
        );
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

  async loadPreviousMessages() {
    try {
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

      if (!data?.data?.messages || !Array.isArray(data.data.messages)) {
        throw new Error('Invalid response format');
      }

      this.chatMessages.innerHTML = '';

      data.data.messages.forEach((message) => {
        if (this.validateMessage(message)) {
          this.addMessage(
            message.content,
            message.role === 'user' ? 'user' : 'bot',
            message.timestamp,
            false, // Don't scroll for each message
          );
        }
      });

      // Scroll once all messages are loaded
      requestAnimationFrame(() => {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
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
    );
  }

  handleLoadError(error) {
    if (
      error.message.includes('Invalid conversation ID') ||
      error.message.includes('404') ||
      error.message.includes('400')
    ) {
      this.clearConversationState();
      this.showBotWelcomeMessage();
    } else {
      this.addMessage(
        'Unable to load previous messages. Starting new conversation.',
        'bot',
      );
      this.clearConversationState();
    }
  }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const botId = urlParams.get('botId');

  if (botId) {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
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
