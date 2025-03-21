/* eslint-disable @typescript-eslint/no-unused-vars */
class MarkdownRenderer {
  static render(content) {
    try {
      const renderer = new marked.Renderer();
      renderer.link = (href, title, text) => {
        let url = '';
        if (typeof href === 'object' && href?.href) {
          url = href.href.trim();
          if (!text && href.text) text = href.text;
        } else if (typeof href === 'string') {
          url = href.trim();
        }

        if (!text) text = url || 'link';

        if (url && url.match(/^https?:\/\/.+/)) {
          return `<a href="${url}" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style="color: #0366d6; text-decoration: underline;"
                    onclick="window.open('${url}', '_blank', 'noopener,noreferrer'); return false;">${text}</a>`;
        }

        return text;
      };
      // Set marked.js options
      marked.setOptions({
        renderer,
        gfm: true,
        breaks: true,
        sanitize: false,
        silent: true,
        highlight: function (code, lang) {
          try {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
          } catch (e) {
            console.error('Code highlighting error:', e);
            return code;
          }
        },
      });

      const html = marked.parse(content);
      const container = document.createElement('div');
      container.className = 'markdown-body';
      container.innerHTML = DOMPurify.sanitize(html);

      return container;
    } catch (error) {
      console.error('Markdown rendering error:', error);
      // Fallback to plain text if markdown rendering fails
      const container = document.createElement('div');
      container.className = 'markdown-body';
      container.textContent = content;
      return container;
    }
  }
}
