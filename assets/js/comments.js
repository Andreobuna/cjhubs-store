(function () {
  const STORAGE_KEY = 'cjhubs_comments';
  const API_BASE_URL = 'https://cjhubs-backend.onrender.com';
  const WORD_LIMIT = 100;
  const STYLE_ID = 'cjhubs-comments-style';

  function request(method, url, body) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(body === undefined ? null : JSON.stringify(body));
      if (xhr.status < 200 || xhr.status >= 300) return null;
      return xhr.responseText ? JSON.parse(xhr.responseText) : null;
    } catch {
      return null;
    }
  }

  let remoteCache = null;
  let remoteBootstrapped = false;
  function bootstrapRemote() {
    if (remoteBootstrapped) return remoteCache;
    remoteBootstrapped = true;
    const res = request('GET', API_BASE_URL + '/api/bootstrap');
    if (!res || !res.ok || !res.collections) return null;
    remoteCache = res.collections;
    return remoteCache;
  }

  function readComments() {
    const remote = bootstrapRemote();
    if (remote && Object.prototype.hasOwnProperty.call(remote, STORAGE_KEY)) {
      const list = remote[STORAGE_KEY];
      return Array.isArray(list) ? list : [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function writeComments(list) {
    const payload = Array.isArray(list) ? list : [];
    const remote = bootstrapRemote();
    if (remote) {
      remote[STORAGE_KEY] = payload;
      const res = request('PUT', API_BASE_URL + '/api/state', { collection: STORAGE_KEY, value: payload });
      if (res && res.ok) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
        return true;
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  function normalizeComment(comment) {
    if (!comment || typeof comment !== 'object') return null;
    const message = typeof comment.message === 'string' ? comment.message.trim() : '';
    if (!message) return null;
    return {
      id: typeof comment.id === 'string' && comment.id ? comment.id : ('c' + Date.now() + Math.random().toString(36).slice(2, 8)),
      productId: typeof comment.productId === 'string' ? comment.productId : '',
      userId: typeof comment.userId === 'string' ? comment.userId : null,
      authorName: typeof comment.authorName === 'string' ? comment.authorName.trim() : 'Guest',
      authorEmail: typeof comment.authorEmail === 'string' ? comment.authorEmail.trim() : '',
      message,
      createdAt: typeof comment.createdAt === 'number' ? comment.createdAt : Date.now(),
      updatedAt: typeof comment.updatedAt === 'number' ? comment.updatedAt : Date.now()
    };
  }

  function countWords(text) {
    return (text || '').trim().split(/\s+/).filter(Boolean).length;
  }

  function escapeHTML(value) {
    return (value || '').toString().replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .comment-shell { margin-top: 64px; padding: 28px; border: 1px solid var(--gray-200); border-radius: 24px; background: linear-gradient(180deg, #fff 0%, #fafbff 100%); box-shadow: var(--shadow-soft); }
      .comment-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
      .comment-header h2 { margin-bottom: 6px; }
      .comment-header p { max-width: 680px; margin: 0; }
      .comment-count { min-width: 116px; padding: 16px 18px; border-radius: 18px; text-align: center; background: linear-gradient(135deg, var(--navy), var(--navy-2)); color: #fff; box-shadow: var(--shadow-card); }
      .comment-count strong { display: block; font-size: 32px; line-height: 1; color: var(--gold-light); }
      .comment-count span { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,.72); }
      .comment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
      .comment-form { padding: 20px; border: 1px solid var(--gray-200); border-radius: 20px; background: var(--gray-50); }
      .comment-form .comment-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .comment-form .form-group { margin-bottom: 14px; }
      .comment-form .form-group label { display: block; margin-bottom: 8px; }
      .comment-form .form-group input, .comment-form .form-group textarea { width: 100%; padding: 13px 14px; border: 1px solid var(--gray-200); border-radius: 12px; background: #fff; color: var(--navy); outline: none; transition: var(--transition); font-family: inherit; }
      .comment-form .form-group input:focus, .comment-form .form-group textarea:focus { border-color: var(--gold-dark); box-shadow: 0 0 0 3px rgba(212,175,55,.12); }
      .comment-form .form-group textarea { min-height: 160px; resize: vertical; }
      .comment-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
      .comment-word-count { font-size: 13px; font-weight: 700; color: var(--gray-600); }
      .comment-word-count.over-limit { color: var(--danger); }
      .comment-hint { margin: 10px 0 0; font-size: 12.5px; color: var(--gray-600); }
      .comment-list-wrap h3 { font-size: 20px; margin-bottom: 16px; }
      .comment-list { display: flex; flex-direction: column; gap: 14px; }
      .comment-item { display: flex; gap: 14px; padding: 18px; border: 1px solid var(--gray-200); border-radius: 18px; background: #fff; box-shadow: var(--shadow-card); }
      .comment-avatar { width: 44px; height: 44px; border-radius: 50%; flex: 0 0 44px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--gold-light), var(--gold-dark)); color: var(--navy); font-weight: 800; }
      .comment-body { flex: 1; min-width: 0; }
      .comment-top { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-bottom: 8px; }
      .comment-top strong { color: var(--navy); font-size: 14.5px; }
      .comment-top span { color: var(--gray-600); font-size: 12.5px; white-space: nowrap; }
      .comment-body p { margin: 0; color: var(--gray-600); white-space: pre-wrap; word-break: break-word; }
      .comment-empty { padding: 22px; border-radius: 16px; border: 1px dashed var(--gray-200); background: rgba(10,22,56,.04); color: var(--gray-600); }
      @media (max-width: 900px) { .comment-shell { padding: 22px; } .comment-header { flex-direction: column; } .comment-count { align-self: flex-start; } .comment-grid { grid-template-columns: 1fr; } }
      @media (max-width: 640px) { .comment-shell { padding: 18px; } .comment-form .comment-input-grid { grid-template-columns: 1fr; } .comment-item { padding: 16px; } .comment-top { flex-direction: column; align-items: flex-start; } .comment-foot .btn { width: 100%; } }
    `;
    document.head.appendChild(style);
  }

  window.Comments = window.Comments || {
    all() {
      return readComments().map(normalizeComment).filter(Boolean);
    },
    byProduct(productId) {
      return this.all().filter(comment => comment.productId === productId).sort((a, b) => b.createdAt - a.createdAt);
    },
    countByProduct(productId) {
      return this.byProduct(productId).length;
    },
    create(comment) {
      const normalized = normalizeComment(comment);
      if (!normalized || !normalized.productId) return false;
      const comments = this.all();
      comments.unshift(normalized);
      return writeComments(comments);
    }
  };

  function renderCommentSection(product) {
    injectStyles();
    const section = document.getElementById('commentSection');
    if (!section) return;
    section.style.display = 'block';
    section.innerHTML = `
      <div class="comment-shell">
        <div class="comment-header">
          <div>
            <span class="eyebrow">Customer comments</span>
            <h2>Share what you think</h2>
            <p>Leave a helpful note for other shoppers. Keep it under 100 words and focus on what matters most.</p>
          </div>
          <div class="comment-count"><strong id="commentCount">0</strong><span>comments</span></div>
        </div>
        <div class="comment-grid">
          <form id="commentForm" class="comment-form">
            <div class="comment-input-grid">
              <div class="form-group"><label for="commentName">Name</label><input id="commentName" type="text" maxlength="80" placeholder="Your name" required></div>
              <div class="form-group"><label for="commentEmail">Email</label><input id="commentEmail" type="email" maxlength="120" placeholder="Email for your profile"></div>
            </div>
            <div class="form-group"><label for="commentText">Your comment</label><textarea id="commentText" rows="6" maxlength="800" placeholder="Tell other customers what you liked, what to expect, or any useful details." required></textarea></div>
            <div class="comment-foot"><span class="comment-word-count" id="commentWordCount">0/100 words</span><button type="submit" class="btn btn-navy">Post Comment</button></div>
            <p class="comment-hint" id="commentHint">Keep it helpful and concise. Comments are limited to 100 words.</p>
          </form>
          <div class="comment-list-wrap"><h3>Latest comments</h3><div id="commentList" class="comment-list"></div></div>
        </div>
      </div>`;

    const form = document.getElementById('commentForm');
    const list = document.getElementById('commentList');
    const countEl = document.getElementById('commentCount');
    const wordCountEl = document.getElementById('commentWordCount');
    const hintEl = document.getElementById('commentHint');
    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    const textInput = document.getElementById('commentText');
    if (!form || !list || !textInput) return;

    const user = window.Auth && typeof Auth.currentUser === 'function' ? Auth.currentUser() : null;
    if (nameInput && !nameInput.value.trim() && user) nameInput.value = user.name || '';
    if (emailInput && user) { emailInput.value = user.email || ''; emailInput.readOnly = true; }

    function updateWordCount() {
      const words = countWords(textInput.value || '');
      if (wordCountEl) {
        wordCountEl.textContent = words + '/' + WORD_LIMIT + ' words';
        wordCountEl.classList.toggle('over-limit', words > WORD_LIMIT);
      }
      if (hintEl) {
        hintEl.textContent = words > WORD_LIMIT ? 'Trim the comment to 100 words or fewer.' : 'Keep it helpful and concise. Comments are limited to 100 words.';
      }
    }

    textInput.oninput = updateWordCount;
    form.onsubmit = function (e) {
      e.preventDefault();
      const message = (textInput.value || '').trim();
      const words = countWords(message);
      if (!message) return showToast('Write a comment before posting.');
      if (words > WORD_LIMIT) return showToast('Comments must be 100 words or fewer.');
      const authorName = ((nameInput && nameInput.value) || (user && user.name) || 'Guest').trim() || 'Guest';
      const authorEmail = ((emailInput && emailInput.value) || (user && user.email) || '').trim();
      const ok = window.Comments && Comments.create({ productId: product.id, userId: user ? user.id : null, authorName, authorEmail, message });
      if (!ok) return showToast('Could not save your comment right now.');
      showToast('Comment posted');
      renderCommentSection(product);
    };

    updateWordCount();
    const comments = window.Comments ? Comments.byProduct(product.id) : [];
    if (countEl) countEl.textContent = String(comments.length);
    if (!comments.length) {
      list.innerHTML = '<div class="comment-empty">Be the first to share feedback on this product.</div>';
      return;
    }
    list.innerHTML = comments.map(function (comment) {
      const initials = (comment.authorName || 'G').trim().charAt(0).toUpperCase();
      const date = new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return '<div class="comment-item">' +
        '<div class="comment-avatar" aria-hidden="true">' + escapeHTML(initials || 'G') + '</div>' +
        '<div class="comment-body">' +
        '<div class="comment-top"><strong>' + escapeHTML(comment.authorName || 'Guest') + '</strong><span>' + date + '</span></div>' +
        '<p>' + escapeHTML(comment.message) + '</p>' +
        '</div></div>';
    }).join('');
  }

  window.renderCommentSection = renderCommentSection;
  const originalInitProductPage = window.initProductPage;
  window.initProductPage = function () {
    if (typeof originalInitProductPage === 'function') originalInitProductPage();
    const id = new URLSearchParams(window.location.search).get('id');
    const product = window.Products && typeof Products.byId === 'function' ? Products.byId(id) : null;
    if (product) renderCommentSection(product);
  };
})();
