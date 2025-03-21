(function () {
  const BS23Chat = {
    init: function (config) {
      const { botId } = config;
      if (!botId) {
        console.error('BS23Chat: botId is required');
        return;
      }

      // Configuration
      const defaultConfig = {
        buttonColor: '#007bff',
        buttonIcon: '💬',
        chatHeight: '500px',
        chatWidth: '350px',
        position: 'right', // 'right' or 'left'
      };

      const finalConfig = { ...defaultConfig, ...config };
      const positionSide = finalConfig.position === 'left' ? 'left' : 'right';

      // Create chat button
      const button = document.createElement('div');
      button.id = 'bs23-chat-button';
      button.innerHTML = finalConfig.buttonIcon;
      button.style.cssText = `
        position: fixed;
        bottom: 20px;
        ${positionSide}: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${finalConfig.buttonColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        font-size: 24px;
        z-index: 999999;
        transition: all 0.3s ease;
        -webkit-tap-highlight-color: transparent;
      `;

      // Create chat container with improved responsive design
      const container = document.createElement('div');
      container.id = 'bs23-chat-container';
      container.style.cssText = `
        position: fixed;
        bottom: 90px;
        ${positionSide}: 20px;
        width: ${finalConfig.chatWidth};
        height: ${finalConfig.chatHeight};
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: none;
        z-index: 999998;
        overflow: hidden;
        transition: all 0.3s ease;
      `;

      // Add improved responsive styles
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px) {
          #bs23-chat-container {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0;
          }
          #bs23-chat-button {
            bottom: 20px !important;
            ${positionSide}: 20px !important;
            width: 50px !important;
            height: 50px !important;
            font-size: 20px !important;
          }
        }
        
        @media (max-height: 600px) {
          #bs23-chat-container {
            height: 100% !important;
          }
        }
        
        @supports (-webkit-touch-callout: none) {
          #bs23-chat-button {
            bottom: max(20px, env(safe-area-inset-bottom)) !important;
          }
        }

        /* Close button for mobile */
        #bs23-chat-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(0,0,0,0.1);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 999999;
        }
          
        @media (max-width: 768px) {
          #bs23-chat-close {
            display: flex;
          }
        }
      `;
      document.head.appendChild(style);

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;

      // Use the server URL from config or default to localhost
      const serverUrl = config.serverUrl || 'http://localhost:4040';
      iframe.src = `${serverUrl}/public/chatbot/index.html?botId=${botId}`;

      // Add close button for mobile
      const closeButton = document.createElement('div');
      closeButton.id = 'bs23-chat-close';
      closeButton.innerHTML = '&#10006;';
      closeButton.style.color = 'white';
      closeButton.style.display = 'none';

      // Add elements to DOM
      container.appendChild(iframe);
      container.appendChild(closeButton);
      document.body.appendChild(button);
      document.body.appendChild(container);

      // Toggle chat on button click
      button.addEventListener('click', () => {
        const isVisible = container.style.display === 'block';
        container.style.display = isVisible ? 'none' : 'block';
        closeButton.style.display = isVisible ? 'none' : 'flex';
      });

      // Close chat on close button click
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        container.style.display = 'none';
        closeButton.style.display = 'none';
      });

      // Listen for color updates from iframe
      window.addEventListener('message', (event) => {
        if (event.data.type === 'BOT_COLOR') {
          button.style.backgroundColor = event.data.color;
          container.style.borderColor = event.data.color;
        }
      });
    },
  };

  // Expose to window
  window.BS23Chat = BS23Chat;
})();
