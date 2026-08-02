/*!
 * whatsapp-image-upload.js
 * ווידג'ט העלאת תמונות + צילום מהמצלמה + שליחה ב-WhatsApp.
 *
 * שימוש מהיר:
 *   <script src="whatsapp-image-upload.js"></script>
 *   <div data-image-upload data-label="תמונות" data-max="10"></div>
 *
 * שדרוג שדות קיימים בקובץ HTML קיים:
 *   <body data-enhance-file-inputs>  ->  כל input[type=file][accept*=image] יקבל את הווידג'ט,
 *   וימשיך להישלח עם ה-form כרגיל (הקבצים נכתבים חזרה ל-input.files).
 *
 * ללא תלויות. עובד ב-Vanilla JS.
 */
(function (global) {
  'use strict';

  var STYLE = [
    '.iuw{--iuw-bg:#fff;--iuw-fg:#111827;--iuw-muted:#6b7280;--iuw-border:#d1d5db;--iuw-accent:#25d366;',
    '--iuw-accent-dark:#128c7e;--iuw-radius:14px;font-family:inherit;color:var(--iuw-fg);display:block;',
    'background:var(--iuw-bg);border-radius:var(--iuw-radius);}',
    '@media (prefers-color-scheme:dark){.iuw{--iuw-bg:#111827;--iuw-fg:#f3f4f6;--iuw-muted:#9ca3af;--iuw-border:#374151}}',
    '.iuw *{box-sizing:border-box}',
    '.iuw-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:8px}',
    '.iuw-label{font-weight:600;font-size:15px}',
    '.iuw-count{font-size:12px;color:var(--iuw-muted);font-variant-numeric:tabular-nums}',
    '.iuw-drop{border:2px dashed var(--iuw-border);border-radius:var(--iuw-radius);padding:20px 16px;text-align:center;',
    'transition:border-color .15s,background .15s;outline:none}',
    '.iuw-drop:focus-visible,.iuw-drop.is-over{border-color:var(--iuw-accent);background:rgba(37,211,102,.07)}',
    '.iuw-drop-icon{font-size:28px;line-height:1}',
    '.iuw-drop-text{margin:6px 0 12px;font-size:13px;color:var(--iuw-muted)}',
    '.iuw-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}',
    '.iuw-btn{appearance:none;border:1px solid var(--iuw-border);background:transparent;color:inherit;font:inherit;',
    'font-size:14px;padding:9px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}',
    '.iuw-btn:hover:not(:disabled){border-color:var(--iuw-accent)}',
    '.iuw-btn:disabled{opacity:.5;cursor:not-allowed}',
    '.iuw-btn-primary{background:var(--iuw-accent);border-color:var(--iuw-accent);color:#04240f;font-weight:600}',
    '.iuw-btn-primary:hover:not(:disabled){background:var(--iuw-accent-dark);border-color:var(--iuw-accent-dark);color:#fff}',
    '.iuw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:12px}',
    '.iuw-grid:empty{display:none}',
    '.iuw-thumb{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#0002}',
    '.iuw-thumb img{width:100%;height:100%;object-fit:cover;display:block}',
    '.iuw-thumb-size{position:absolute;inset-inline-start:0;inset-block-end:0;background:#000a;color:#fff;',
    'font-size:10px;padding:2px 5px;border-start-end-radius:6px;font-variant-numeric:tabular-nums}',
    '.iuw-thumb-del{position:absolute;inset-inline-end:4px;inset-block-start:4px;width:24px;height:24px;border:0;',
    'border-radius:50%;background:#000a;color:#fff;font-size:15px;line-height:1;cursor:pointer;display:grid;place-items:center}',
    '.iuw-thumb-del:hover{background:#dc2626}',
    '.iuw-wa{margin-top:16px;padding-top:16px;border-top:1px solid var(--iuw-border)}',
    '.iuw-wa[hidden]{display:none}',
    '.iuw-field{margin-bottom:10px}',
    '.iuw-field>label{display:block;font-size:13px;font-weight:600;margin-bottom:5px}',
    '.iuw-phone{display:flex;gap:6px}',
    // הסלקטורים כאן מקדימים ב-.iuw כדי לנצח CSS של הדף המארח (למשל .row input{width:100%})
    '.iuw .iuw-input,.iuw .iuw-select,.iuw .iuw-textarea{width:100%;font:inherit;font-size:14px;',
    'padding:9px 11px;border-radius:10px;border:1px solid var(--iuw-border);background:transparent;color:inherit}',
    '.iuw .iuw-phone .iuw-input{flex:1 1 0;min-width:0;width:auto}',
    '.iuw .iuw-phone .iuw-select{width:auto;flex:0 0 auto}',
    '.iuw-input:focus,.iuw-select:focus,.iuw-textarea:focus{outline:2px solid var(--iuw-accent);outline-offset:-1px;border-color:transparent}',
    '.iuw-textarea{resize:vertical;min-height:64px}',
    '.iuw-wa-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}',
    '.iuw-hint{font-size:12px;color:var(--iuw-muted);margin:8px 0 0;line-height:1.5}',
    '.iuw-hint.is-error{color:#dc2626}',
    '.iuw-hint.is-ok{color:var(--iuw-accent-dark)}',
    '.iuw-cam{position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column}',
    '.iuw-cam video{flex:1;width:100%;object-fit:contain;background:#000}',
    '.iuw-cam-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;',
    'background:#000;padding-bottom:calc(14px + env(safe-area-inset-bottom))}',
    '.iuw-cam-bar .iuw-btn{color:#fff;border-color:#fff6}',
    '.iuw-shutter{width:64px;height:64px;border-radius:50%;border:4px solid #fff;background:#fff3;cursor:pointer}',
    '.iuw-shutter:active{background:#fff}',
    '.iuw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  ].join('');

  var COUNTRIES = [
    { c: '972', n: 'IL 🇮🇱' }, { c: '1', n: 'US 🇺🇸' }, { c: '44', n: 'UK 🇬🇧' },
    { c: '7', n: 'RU 🇷🇺' }, { c: '33', n: 'FR 🇫🇷' }, { c: '49', n: 'DE 🇩🇪' },
    { c: '380', n: 'UA 🇺🇦' }, { c: '91', n: 'IN 🇮🇳' }, { c: '55', n: 'BR 🇧🇷' }
  ];

  var PHONE_STORE_KEY = 'iuw:last-phone';
  var uid = 0;

  function injectCss() {
    if (document.getElementById('iuw-style')) return;
    var s = document.createElement('style');
    s.id = 'iuw-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== false) node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /** מנרמל מספר לפורמט בינלאומי בלי סימנים: 0501234567 + 972 -> 972501234567 */
  function normalizePhone(dial, raw) {
    var digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return '';
    var cc = String(dial || '').replace(/\D/g, '');
    if (digits.indexOf('00') === 0) digits = digits.slice(2);
    if (cc && digits.indexOf(cc) === 0 && digits.length > cc.length + 6) return digits;
    digits = digits.replace(/^0+/, '');
    return cc + digits;
  }

  /**
   * דוחס תמונה: מקטין לרוחב/גובה מקסימלי ומקודד ל-JPEG.
   * אם הדפדפן לא מצליח לפענח (למשל HEIC) — מחזיר את הקובץ המקורי.
   */
  function compress(file, maxDim, quality) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type) || /svg|gif/.test(file.type)) return resolve(file);

      var done = function (bitmapOrImg, w, h) {
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        canvas.getContext('2d').drawImage(bitmapOrImg, 0, 0, cw, ch);
        if (bitmapOrImg.close) bitmapOrImg.close();
        canvas.toBlob(function (blob) {
          if (!blob || blob.size >= file.size) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
            type: 'image/jpeg', lastModified: Date.now()
          }));
        }, 'image/jpeg', quality);
      };

      if (global.createImageBitmap) {
        // imageOrientation מטפל ב-EXIF כך שתמונות מהטלפון לא מסתובבות
        createImageBitmap(file, { imageOrientation: 'from-image' })
          .then(function (bm) { done(bm, bm.width, bm.height); })
          .catch(function () { resolve(file); });
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { done(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(url); };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function Widget(host, options) {
    var d = host.dataset;
    this.host = host;
    this.opts = Object.assign({
      label: d.label || 'תמונות',
      max: parseInt(d.max, 10) || 10,
      maxDim: parseInt(d.maxDim, 10) || 1600,
      quality: parseFloat(d.quality) || 0.82,
      whatsapp: d.whatsapp !== 'false',
      message: d.message || '',
      phone: d.phone || '',
      dial: d.dial || '972',
      uploadUrl: d.uploadUrl || '',   // POST multipart -> {urls:[...]} או [{url}]
      waEndpoint: d.waEndpoint || '', // POST json {to,message,images} -> backend ששולח בפועל
      name: d.name || ''              // שם השדה ב-form (hidden input עם JSON)
    }, options || {});

    this.files = [];
    this.id = 'iuw' + (++uid);
    this.targetInput = null; // input[type=file] מקורי שאותו מסנכרנים
    this.build();
  }

  Widget.prototype.build = function () {
    var self = this;
    injectCss();
    this.host.classList.add('iuw');
    if (!this.host.getAttribute('dir')) this.host.setAttribute('dir', 'rtl');

    this.countEl = el('span', { class: 'iuw-count' });
    var head = el('div', { class: 'iuw-head' }, [
      el('span', { class: 'iuw-label', text: this.opts.label }),
      this.countEl
    ]);

    // data-iuw-internal מסמן שאלה שדות של הווידג'ט עצמו, כדי ש-autoInit לא ישדרג אותם שוב
    this.picker = el('input', {
      type: 'file', accept: 'image/*', multiple: 'multiple', class: 'iuw-sr',
      'data-iuw-internal': '', tabindex: '-1', 'aria-hidden': 'true'
    });
    this.camFallback = el('input', {
      type: 'file', accept: 'image/*', capture: 'environment', class: 'iuw-sr',
      'data-iuw-internal': '', tabindex: '-1', 'aria-hidden': 'true'
    });

    var camBtn = el('button', { type: 'button', class: 'iuw-btn', text: '📸 צלם תמונה' });
    var galBtn = el('button', { type: 'button', class: 'iuw-btn', text: '🖼️ בחר מהגלריה' });

    this.drop = el('div', { class: 'iuw-drop', tabindex: '0', role: 'group',
      'aria-label': this.opts.label + ' — אזור העלאת תמונות' }, [
      el('div', { class: 'iuw-drop-icon', text: '📷', 'aria-hidden': 'true' }),
      el('p', { class: 'iuw-drop-text', text: 'גררו לכאן תמונות, הדביקו מהלוח (Ctrl+V) או בחרו פעולה' }),
      el('div', { class: 'iuw-actions' }, [camBtn, galBtn])
    ]);

    this.grid = el('div', { class: 'iuw-grid' });
    this.host.appendChild(head);
    this.host.appendChild(this.drop);
    this.host.appendChild(this.picker);
    this.host.appendChild(this.camFallback);
    this.host.appendChild(this.grid);
    if (this.opts.whatsapp) this.host.appendChild(this.buildWa());
    if (this.opts.name) {
      this.hidden = el('input', { type: 'hidden', name: this.opts.name });
      this.host.appendChild(this.hidden);
    }

    galBtn.addEventListener('click', function () { self.picker.click(); });
    camBtn.addEventListener('click', function () { self.openCamera(); });
    this.picker.addEventListener('change', function () { self.add(this.files); this.value = ''; });
    this.camFallback.addEventListener('change', function () { self.add(this.files); this.value = ''; });

    ['dragenter', 'dragover'].forEach(function (ev) {
      self.drop.addEventListener(ev, function (e) { e.preventDefault(); self.drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      self.drop.addEventListener(ev, function (e) { e.preventDefault(); self.drop.classList.remove('is-over'); });
    });
    this.drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) self.add(e.dataTransfer.files);
    });
    this.drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.picker.click(); }
    });
    this.drop.addEventListener('paste', function (e) {
      if (e.clipboardData && e.clipboardData.files.length) { e.preventDefault(); self.add(e.clipboardData.files); }
    });

    this.render();
  };

  Widget.prototype.buildWa = function () {
    var self = this;
    var sel = el('select', { class: 'iuw-select', 'aria-label': 'קידומת מדינה' });
    COUNTRIES.forEach(function (c) {
      sel.appendChild(el('option', { value: c.c, text: c.n + ' +' + c.c, selected: c.c === self.opts.dial }));
    });

    var stored = '';
    try { stored = localStorage.getItem(PHONE_STORE_KEY) || ''; } catch (e) { /* מצב פרטי */ }

    this.dialEl = sel;
    this.phoneEl = el('input', {
      type: 'tel', class: 'iuw-input', inputmode: 'tel', autocomplete: 'tel',
      placeholder: '050-123-4567', value: this.opts.phone || stored, 'aria-label': 'מספר WhatsApp'
    });
    this.msgEl = el('textarea', { class: 'iuw-textarea', placeholder: 'טקסט ההודעה (אופציונלי)' });
    this.msgEl.value = this.opts.message;

    this.sendBtn = el('button', { type: 'button', class: 'iuw-btn iuw-btn-primary', text: '🟢 שלח ב-WhatsApp' });
    var chatBtn = el('button', { type: 'button', class: 'iuw-btn', text: '💬 פתח צ\'אט בלבד' });
    this.waHint = el('p', { class: 'iuw-hint' });

    this.sendBtn.addEventListener('click', function () { self.sendWhatsApp(); });
    chatBtn.addEventListener('click', function () { self.openChat(''); });
    this.phoneEl.addEventListener('change', function () {
      try { localStorage.setItem(PHONE_STORE_KEY, this.value); } catch (e) { /* מצב פרטי */ }
    });

    this.waPanel = el('div', { class: 'iuw-wa' }, [
      el('div', { class: 'iuw-field' }, [
        el('label', { text: 'שליחה ב-WhatsApp', for: this.id + '-phone' }),
        el('div', { class: 'iuw-phone' }, [sel, this.phoneEl])
      ]),
      el('div', { class: 'iuw-field' }, [this.msgEl]),
      el('div', { class: 'iuw-wa-actions' }, [this.sendBtn, chatBtn]),
      this.waHint
    ]);
    this.phoneEl.id = this.id + '-phone';
    return this.waPanel;
  };

  Widget.prototype.add = function (fileList) {
    var self = this;
    var incoming = Array.prototype.slice.call(fileList).filter(function (f) { return /^image\//.test(f.type); });
    if (!incoming.length) return;

    var room = this.opts.max - this.files.length;
    if (room <= 0) return this.hint('הגעת למקסימום ' + this.opts.max + ' תמונות.', 'error');
    var over = incoming.length - room;
    if (over > 0) {
      incoming = incoming.slice(0, room);
      this.hint((room === 1 ? 'נוספה תמונה אחת' : 'נוספו ' + room + ' תמונות') + '; ' +
        (over === 1 ? 'אחת דולגה' : over + ' דולגו') + ' (חריגה מהמקסימום).', 'error');
    }

    Promise.all(incoming.map(function (f) { return compress(f, self.opts.maxDim, self.opts.quality); }))
      .then(function (out) {
        out.forEach(function (f) { self.files.push({ file: f, url: URL.createObjectURL(f) }); });
        self.render();
        self.emit();
      });
  };

  Widget.prototype.remove = function (i) {
    URL.revokeObjectURL(this.files[i].url);
    this.files.splice(i, 1);
    this.render();
    this.emit();
  };

  Widget.prototype.render = function () {
    var self = this;
    var total = this.files.reduce(function (s, f) { return s + f.file.size; }, 0);
    this.countEl.textContent = this.files.length + '/' + this.opts.max +
      (this.files.length ? ' · ' + fmtSize(total) : '');

    this.grid.textContent = '';
    this.files.forEach(function (item, i) {
      var del = el('button', { type: 'button', class: 'iuw-thumb-del', text: '×',
        'aria-label': 'הסר תמונה ' + (i + 1) });
      del.addEventListener('click', function () { self.remove(i); });
      self.grid.appendChild(el('div', { class: 'iuw-thumb' }, [
        el('img', { src: item.url, alt: 'תמונה ' + (i + 1), loading: 'lazy' }),
        el('span', { class: 'iuw-thumb-size', text: fmtSize(item.file.size) }),
        del
      ]));
    });

    if (this.sendBtn) this.sendBtn.disabled = !this.files.length;
    this.syncOut();
  };

  /** כותב את הקבצים חזרה ל-input המקורי ול-hidden כדי שה-form ימשיך לעבוד */
  Widget.prototype.syncOut = function () {
    var list = this.files.map(function (f) { return f.file; });
    this._synced = list; // כדי לא לקלוט שוב את מה שאנחנו עצמנו כתבנו ל-input
    if (this.targetInput && global.DataTransfer) {
      try {
        var dt = new DataTransfer();
        list.forEach(function (f) { dt.items.add(f); });
        this.targetInput.files = dt.files;
      } catch (e) { /* דפדפנים שלא תומכים בהשמה ל-files */ }
    }
    if (this.hidden) {
      this.hidden.value = JSON.stringify(list.map(function (f) {
        return { name: f.name, type: f.type, size: f.size };
      }));
    }
  };

  Widget.prototype.emit = function () {
    this.host.dispatchEvent(new CustomEvent('imageupload:change', {
      bubbles: true, detail: { files: this.getFiles(), widget: this }
    }));
  };

  Widget.prototype.getFiles = function () {
    return this.files.map(function (f) { return f.file; });
  };

  Widget.prototype.hint = function (msg, kind) {
    if (!this.waHint) return;
    this.waHint.textContent = msg;
    this.waHint.className = 'iuw-hint' + (kind ? ' is-' + kind : '');
  };

  /* ---------- מצלמה ---------- */

  Widget.prototype.openCamera = function () {
    var self = this;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return this.camFallback.click();
    this.facing = this.facing || 'environment';

    var video = el('video', { playsinline: 'playsinline', autoplay: 'autoplay', muted: 'muted' });
    var shutter = el('button', { type: 'button', class: 'iuw-shutter', 'aria-label': 'צלם' });
    var flip = el('button', { type: 'button', class: 'iuw-btn', text: '🔄 הפוך' });
    var close = el('button', { type: 'button', class: 'iuw-btn', text: '✕ סגור' });
    var modal = el('div', { class: 'iuw-cam', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'מצלמה' },
      [video, el('div', { class: 'iuw-cam-bar' }, [close, shutter, flip])]);

    var stream = null;
    function stop() {
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
    function shutdown() {
      stop();
      document.removeEventListener('keydown', onKey);
      modal.remove();
    }
    function onKey(e) { if (e.key === 'Escape') shutdown(); }

    function start() {
      stop();
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: self.facing } }, audio: false })
        .then(function (s) { stream = s; video.srcObject = s; })
        .catch(function () { shutdown(); self.camFallback.click(); });
    }

    shutter.addEventListener('click', function () {
      if (!video.videoWidth) return;
      var canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob(function (blob) {
        if (blob) self.add([new File([blob], 'photo-' + Date.now() + '.jpg', { type: 'image/jpeg' })]);
        shutdown();
      }, 'image/jpeg', 0.92);
    });
    flip.addEventListener('click', function () {
      self.facing = self.facing === 'environment' ? 'user' : 'environment';
      start();
    });
    close.addEventListener('click', shutdown);
    document.addEventListener('keydown', onKey);

    document.body.appendChild(modal);
    start();
  };

  /* ---------- WhatsApp ---------- */

  Widget.prototype.composeText = function (extraLinks) {
    var parts = [];
    if (this.msgEl && this.msgEl.value.trim()) parts.push(this.msgEl.value.trim());
    if (extraLinks && extraLinks.length) parts.push(extraLinks.join('\n'));
    return parts.join('\n\n');
  };

  Widget.prototype.openChat = function (text) {
    var to = normalizePhone(this.dialEl.value, this.phoneEl.value);
    if (!to || to.length < 8) return this.hint('הזינו מספר WhatsApp תקין.', 'error');
    var url = 'https://wa.me/' + to + (text ? '?text=' + encodeURIComponent(text) : '');
    global.open(url, '_blank', 'noopener');
    return to;
  };

  Widget.prototype.sendWhatsApp = function () {
    var self = this;
    var to = normalizePhone(this.dialEl.value, this.phoneEl.value);
    if (!to || to.length < 8) return this.hint('הזינו מספר WhatsApp תקין.', 'error');
    if (!this.files.length) return this.hint('לא נבחרו תמונות.', 'error');

    // 1. יש backend משלכם (WhatsApp Cloud API) — שליחה אמיתית ואוטומטית למספר.
    if (this.opts.waEndpoint) return this.sendViaBackend(to);

    // 2. יש שרת העלאה — מעלים, ושולחים הודעה עם הקישורים לתמונות.
    if (this.opts.uploadUrl) {
      this.hint('מעלה תמונות…');
      return this.upload().then(function (urls) {
        self.openChat(self.composeText(urls));
        self.hint('נפתח WhatsApp עם ' + urls.length + ' קישורים לתמונות.', 'ok');
      }).catch(function (err) {
        self.hint('ההעלאה נכשלה: ' + err.message, 'error');
      });
    }

    // 3. Web Share API — הדרך היחידה בצד לקוח לצרף קבצים אמיתיים ל-WhatsApp.
    var files = this.getFiles();
    if (navigator.canShare && navigator.canShare({ files: files })) {
      var text = this.composeText();
      try { navigator.clipboard && navigator.clipboard.writeText('+' + to); } catch (e) { /* אין הרשאה */ }
      return navigator.share({ files: files, text: text || undefined })
        .then(function () { self.hint('נשלח דרך תפריט השיתוף. המספר +' + to + ' הועתק ללוח.', 'ok'); })
        .catch(function (err) {
          if (err && err.name === 'AbortError') return self.hint('השיתוף בוטל.');
          self.shareFallback(to);
        });
    }

    // 4. אין כלום — פותחים צ'אט ומורידים את התמונות לצירוף ידני.
    this.shareFallback(to);
  };

  Widget.prototype.shareFallback = function (to) {
    this.files.forEach(function (item, i) {
      var a = el('a', { href: item.url, download: item.file.name || ('image-' + (i + 1) + '.jpg') });
      document.body.appendChild(a); a.click(); a.remove();
    });
    this.openChat(this.composeText());
    this.hint('הדפדפן הזה לא תומך בשליחת קבצים ישירות ל-WhatsApp. ' +
      'הצ\'אט עם +' + to + ' נפתח והתמונות הורדו — צרפו אותן בצ\'אט. ' +
      'לשליחה אוטומטית מלאה נדרש data-wa-endpoint (WhatsApp Cloud API).', 'error');
  };

  Widget.prototype.upload = function () {
    var fd = new FormData();
    this.getFiles().forEach(function (f) { fd.append('images[]', f, f.name); });
    return fetch(this.opts.uploadUrl, { method: 'POST', body: fd }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      var urls = Array.isArray(data) ? data : (data.urls || data.files || []);
      return urls.map(function (u) { return typeof u === 'string' ? u : u.url; }).filter(Boolean);
    });
  };

  Widget.prototype.sendViaBackend = function (to) {
    var self = this;
    this.hint('שולח…');
    this.sendBtn.disabled = true;
    var fd = new FormData();
    fd.append('to', to);
    fd.append('message', this.composeText());
    this.getFiles().forEach(function (f) { fd.append('images[]', f, f.name); });

    return fetch(this.opts.waEndpoint, { method: 'POST', body: fd }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function () {
      self.hint('ההודעה נשלחה ל-+' + to + ' עם ' + self.files.length + ' תמונות.', 'ok');
    }).catch(function (err) {
      self.hint('השליחה נכשלה: ' + err.message, 'error');
    }).then(function () {
      self.sendBtn.disabled = !self.files.length;
    });
  };

  /* ---------- אתחול ---------- */

  var API = {
    mount: function (target, options) {
      var host = typeof target === 'string' ? document.querySelector(target) : target;
      if (!host) return null;
      if (host._iuw) return host._iuw;
      host._iuw = new Widget(host, options);
      return host._iuw;
    },

    /** עוטף input[type=file] קיים בלי לשבור את ה-form שכבר קיים ב-HTML */
    enhanceInput: function (input, options) {
      if (input._iuwDone) return input._iuwDone;
      var host = el('div', { 'data-image-upload': '' });
      var label = '';
      if (input.id) {
        var sel = global.CSS && global.CSS.escape ? global.CSS.escape(input.id) : input.id;
        var lbl = document.querySelector('label[for="' + sel + '"]');
        if (lbl) {
          label = lbl.textContent.trim();
          // inline style ולא hidden — כדי לנצח כללי display של הדף המארח
          lbl.style.display = 'none'; // הווידג'ט מציג כותרת משלו, מונע כפילות
        }
      }
      if (!label) label = input.getAttribute('aria-label') || input.getAttribute('placeholder') || 'תמונות';

      input.parentNode.insertBefore(host, input);
      input.classList.add('iuw-sr');
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');

      var w = API.mount(host, Object.assign({
        label: label,
        max: input.multiple ? 10 : 1
      }, options || {}));
      w.targetInput = input;

      // קוד קיים בדף שממלא את ה-input ישירות (או בדיקות אוטומטיות) — נקלט גם הוא.
      // מסננים את מה ש-syncOut כתב בעצמו כדי שלא ייווצרו כפילויות.
      input.addEventListener('change', function () {
        var synced = w._synced || [];
        var fresh = Array.prototype.filter.call(input.files, function (f) {
          return synced.indexOf(f) === -1;
        });
        if (fresh.length) w.add(fresh);
      });

      input._iuwDone = w;
      return w;
    },

    get: function (target) {
      var host = typeof target === 'string' ? document.querySelector(target) : target;
      return host && host._iuw;
    },

    autoInit: function (root) {
      root = root || document;
      root.querySelectorAll('[data-image-upload]').forEach(function (n) { API.mount(n); });
      if (document.body && document.body.hasAttribute('data-enhance-file-inputs')) {
        root.querySelectorAll('input[type=file]:not([data-iuw-internal])').forEach(function (i) {
          var accept = i.getAttribute('accept') || '';
          // i.closest('.iuw') מונע שדרוג של שדות פנימיים של ווידג'ט קיים (לולאה אינסופית)
          if (/image/.test(accept) && !i.closest('.iuw')) API.enhanceInput(i);
        });
      }
    },

    normalizePhone: normalizePhone
  };

  global.ImageUploadWhatsApp = API;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { API.autoInit(); });
  } else {
    API.autoInit();
  }
})(window);
