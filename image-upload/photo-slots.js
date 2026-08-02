/*!
 * photo-slots.js — carnet de voyage : capture photo dans les emplacements + envoi WhatsApp
 *
 * Se branche sur la structure existante de la page, sans la modifier :
 *   .dayhead  -> titre du jour       (sert de groupe pour l'envoi)
 *   .mband .tt-> titre du moment     (sert de légende)
 *   .slot     -> emplacement photo   (devient cliquable : appareil photo / galerie)
 *   .slot.full/.del/.count           -> états déjà prévus par le CSS de la page
 *
 * Intégration : une seule ligne, avant </body>
 *   <script src="photo-slots.js"></script>
 *
 * Les photos sont conservées dans IndexedDB : elles survivent au rechargement
 * et à la fermeture du navigateur — indispensable pendant un voyage.
 *
 * Clé de stockage : data-slot-id sur le .slot si présent, sinon une clé dérivée
 * de la position (jour/moment/rang). Ajoutez data-slot-id pour que les photos
 * restent attachées au bon emplacement même si vous réorganisez la page.
 */
(function (global) {
  'use strict';

  var CFG = {
    dbName: 'carnet-photos',
    store: 'photos',
    maxDim: 1600,
    quality: 0.82,
    perShare: 10,      // WhatsApp/Web Share : on envoie par lots
    dial: '33'         // indicatif par défaut (France)
  };

  var T = {
    take: 'Prendre une photo',
    pick: 'Choisir dans la galerie',
    cancel: 'Annuler',
    close: 'Fermer',
    add: 'Ajouter',
    deleteAll: 'Tout supprimer',
    confirmDelete: 'Supprimer les {n} photos de cet emplacement ?',
    photos: 'Photos',
    send: 'Envoyer par WhatsApp',
    number: 'Numéro WhatsApp',
    message: 'Message (optionnel)',
    scope: 'Que voulez-vous envoyer ?',
    all: 'Toutes les photos',
    noPhotos: 'Aucune photo pour le moment.',
    badNumber: 'Saisissez un numéro WhatsApp valide.',
    sending: 'Envoi…',
    shared: 'Partagé. Le numéro {n} a été copié.',
    cancelled: 'Partage annulé.',
    fallback: 'Ce navigateur ne peut pas joindre les fichiers à WhatsApp. La discussion avec {n} est ouverte et les photos ont été téléchargées — glissez-les dans la conversation.',
    quota: 'Espace de stockage insuffisant. Supprimez quelques photos.',
    saved: '{n} photo(s) ajoutée(s).'
  };

  function t(key, vars) {
    return String(T[key]).replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : ''; });
  }

  var STYLE = [
    '.ps-sheet-bg{position:fixed;inset:0;background:rgba(15,25,37,.55);z-index:900;display:flex;',
    'align-items:flex-end;justify-content:center;animation:ps-fade .15s ease}',
    '@keyframes ps-fade{from{opacity:0}to{opacity:1}}',
    '.ps-sheet{background:#fff;width:100%;max-width:820px;border-radius:16px 16px 0 0;padding:16px 16px',
    ' calc(16px + env(safe-area-inset-bottom));animation:ps-up .2s cubic-bezier(.2,.8,.3,1);max-height:88vh;overflow:auto}',
    '@keyframes ps-up{from{transform:translateY(20px)}to{transform:translateY(0)}}',
    '.ps-sheet h3{margin:0 0 12px;font-size:15px;font-weight:800;color:#0F1925}',
    '.ps-act{display:block;width:100%;text-align:left;font:inherit;font-size:15px;font-weight:600;',
    'padding:14px 16px;margin-bottom:8px;border-radius:11px;border:1px solid #D8D2C4;background:#FAF8F4;',
    'color:#0F1925;cursor:pointer}',
    '.ps-act:active{background:#EDE8DC}',
    '.ps-act-primary{background:#B8863B;border-color:#B8863B;color:#fff;text-align:center}',
    '.ps-act-ghost{background:transparent;text-align:center;color:#6B6B6B}',
    '.ps-field{margin-bottom:12px}',
    '.ps-field label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;color:#0F1925}',
    '.ps-row{display:flex;gap:6px}',
    '.ps-sheet input[type=tel],.ps-sheet select,.ps-sheet textarea{font:inherit;font-size:15px;padding:11px 12px;',
    'border-radius:10px;border:1px solid #D8D2C4;background:#fff;color:#0F1925;width:100%}',
    '.ps-sheet select{width:auto;flex:0 0 auto}',
    '.ps-sheet input[type=tel]{flex:1 1 0;min-width:0}',
    '.ps-sheet textarea{resize:vertical;min-height:62px}',
    '.ps-scope{max-height:34vh;overflow:auto;border:1px solid #D8D2C4;border-radius:10px;margin-bottom:12px}',
    '.ps-scope label{display:flex;align-items:center;gap:9px;padding:10px 12px;font-size:14px;',
    'border-bottom:1px solid #EDE8DC;cursor:pointer}',
    '.ps-scope label:last-child{border-bottom:0}',
    '.ps-scope input{flex:0 0 auto;width:17px;height:17px;accent-color:#B8863B}',
    '.ps-scope .n{margin-left:auto;font-size:12px;color:#6B6B6B;font-variant-numeric:tabular-nums}',
    '.ps-hint{font-size:12px;color:#6B6B6B;margin:10px 0 0;line-height:1.5}',
    '.ps-hint.err{color:#B3261E}',
    '.ps-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:800;',
    'background:#25D366;color:#fff;border:0;border-radius:30px;padding:13px 19px;font:inherit;font-size:14px;',
    'font-weight:800;box-shadow:0 6px 18px rgba(15,25,37,.28);cursor:pointer;display:none;align-items:center;gap:8px}',
    '.ps-fab.on{display:inline-flex}',
    '.ps-fab .b{background:rgba(255,255,255,.28);border-radius:11px;padding:1px 7px;font-size:12px}',
    '.ps-mgr{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-bottom:12px}',
    '.ps-mgr figure{position:relative;margin:0;aspect-ratio:1;border-radius:9px;overflow:hidden;background:#EDE8DC}',
    '.ps-mgr img{width:100%;height:100%;object-fit:cover;display:block}',
    '.ps-mgr button{position:absolute;top:4px;right:4px;width:26px;height:26px;border:0;border-radius:50%;',
    'background:rgba(15,25,37,.72);color:#fff;font-size:15px;line-height:1;cursor:pointer;display:grid;place-items:center}',
    '.ps-cam{position:fixed;inset:0;z-index:1000;background:#000;display:flex;flex-direction:column}',
    '.ps-cam video{flex:1;width:100%;object-fit:contain;background:#000}',
    '.ps-cam-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;',
    'background:#000;padding-bottom:calc(16px + env(safe-area-inset-bottom))}',
    '.ps-cam-bar button{font:inherit;font-size:14px;font-weight:600;color:#fff;background:transparent;',
    'border:1px solid rgba(255,255,255,.45);border-radius:10px;padding:9px 15px;cursor:pointer}',
    '.ps-shutter{width:66px;height:66px;border-radius:50%;border:4px solid #fff !important;',
    'background:rgba(255,255,255,.22) !important;padding:0 !important}',
    '.ps-shutter:active{background:#fff !important}',
    '.ps-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(80px + env(safe-area-inset-bottom));',
    'z-index:1100;background:#0F1925;color:#fff;font-size:13px;padding:11px 17px;border-radius:22px;',
    'max-width:88vw;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.3)}',
    '.ps-busy{opacity:.55;pointer-events:none}',
    '.ps-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  ].join('');

  /* ---------- utilitaires ---------- */

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function toast(msg, isErr) {
    var n = el('div', { class: 'ps-toast', text: msg, role: 'status' });
    if (isErr) n.style.background = '#B3261E';
    document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 4200);
  }

  function normalizePhone(dial, raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return '';
    var cc = String(dial || '').replace(/\D/g, '');
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (cc && d.indexOf(cc) === 0 && d.length > cc.length + 6) return d;
    return cc + d.replace(/^0+/, '');
  }

  function compress(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type) || /svg|gif/.test(file.type)) return resolve(file);
      var draw = function (src, w, h) {
        var s = Math.min(1, CFG.maxDim / Math.max(w, h));
        var c = el('canvas');
        c.width = Math.round(w * s); c.height = Math.round(h * s);
        c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
        if (src.close) src.close();
        c.toBlob(function (b) {
          if (!b || b.size >= file.size) return resolve(file);
          resolve(new File([b], (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg',
            { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', CFG.quality);
      };
      if (global.createImageBitmap) {
        // imageOrientation : sinon les photos de téléphone arrivent pivotées (EXIF)
        createImageBitmap(file, { imageOrientation: 'from-image' })
          .then(function (bm) { draw(bm, bm.width, bm.height); })
          .catch(function () { resolve(file); });
        return;
      }
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { draw(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(url); };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  /* ---------- stockage (IndexedDB) ---------- */

  var DB = {
    _p: null,
    open: function () {
      if (this._p) return this._p;
      this._p = new Promise(function (res, rej) {
        if (!global.indexedDB) return rej(new Error('IndexedDB indisponible'));
        var rq = indexedDB.open(CFG.dbName, 1);
        rq.onupgradeneeded = function () {
          var db = rq.result;
          if (!db.objectStoreNames.contains(CFG.store)) {
            var st = db.createObjectStore(CFG.store, { keyPath: 'id' });
            st.createIndex('slot', 'slot', { unique: false });
          }
        };
        rq.onsuccess = function () { res(rq.result); };
        rq.onerror = function () { rej(rq.error); };
      });
      return this._p;
    },
    tx: function (mode, fn) {
      return this.open().then(function (db) {
        return new Promise(function (res, rej) {
          var tx = db.transaction(CFG.store, mode);
          var out = fn(tx.objectStore(CFG.store));
          tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
          tx.onerror = function () { rej(tx.error); };
          tx.onabort = function () { rej(tx.error || new Error('abort')); };
        });
      });
    },
    all: function () {
      return this.tx('readonly', function (st) { return st.getAll(); });
    },
    put: function (rec) {
      return this.tx('readwrite', function (st) { return st.put(rec); });
    },
    del: function (id) {
      return this.tx('readwrite', function (st) { return st.delete(id); });
    },
    delSlot: function (ids) {
      return this.tx('readwrite', function (st) { ids.forEach(function (i) { st.delete(i); }); });
    }
  };

  /* ---------- modèle ---------- */

  var slots = [];       // { node, key, day, moment, label, items:[{id,blob,url,ts}] }
  var byKey = {};
  var storageOk = true;

  /** Chaque .slot reçoit son jour et son moment en balayant le document dans l'ordre. */
  function indexDocument() {
    var all = document.querySelectorAll('.dayhead, .demihead, .mband, .slot');
    var day = '', moment = '', dayIdx = -1, momentIdx = -1, slotIdx = 0;

    Array.prototype.forEach.call(all, function (node) {
      if (node.classList.contains('dayhead')) {
        var h = node.querySelector('h2');
        day = (h ? h.textContent : node.textContent).trim();
        dayIdx++; momentIdx = -1;
        return;
      }
      if (node.classList.contains('demihead') || node.classList.contains('mband')) {
        var tt = node.querySelector('.tt') || node.querySelector('.h');
        moment = (tt ? tt.textContent : node.textContent).trim();
        momentIdx++; slotIdx = 0;
        return;
      }
      var lbl = node.querySelector('.lbl');
      var key = node.getAttribute('data-slot-id') ||
        ('d' + Math.max(dayIdx, 0) + '-m' + Math.max(momentIdx, 0) + '-s' + slotIdx);
      slotIdx++;

      var rec = {
        node: node, key: key, day: day, moment: moment,
        label: lbl ? lbl.textContent.trim() : '', items: []
      };
      node.setAttribute('data-slot-key', key);
      slots.push(rec);
      byKey[key] = rec;
    });
  }

  function restore() {
    return DB.all().then(function (rows) {
      rows.sort(function (a, b) { return a.ts - b.ts; });
      rows.forEach(function (r) {
        var s = byKey[r.slot];
        if (!s) return; // emplacement disparu de la page : on garde la donnée sans l'afficher
        s.items.push({ id: r.id, blob: r.blob, url: URL.createObjectURL(r.blob), ts: r.ts });
      });
      slots.forEach(paint);
      refreshFab();
    }).catch(function (err) {
      storageOk = false;
      console.warn('[photo-slots] stockage indisponible, les photos ne seront pas conservées :', err);
      slots.forEach(paint);
    });
  }

  /* ---------- rendu d'un emplacement ---------- */

  function paint(slot) {
    var node = slot.node;
    var placeholders = node.querySelectorAll('.ico, .lbl');

    var img = node.querySelector('img.ps-cover');
    var del = node.querySelector('.del');
    var count = node.querySelector('.count');

    if (!slot.items.length) {
      node.classList.remove('full');
      if (img) img.remove();
      if (count) count.style.display = 'none';
      if (del) del.style.display = '';   // le CSS de la page gère l'affichage via .slot.full
      Array.prototype.forEach.call(placeholders, function (p) { p.style.display = ''; });
      node.setAttribute('aria-label', (slot.label || t('photos')) + ' — ' + T.take);
      return;
    }

    node.classList.add('full');
    Array.prototype.forEach.call(placeholders, function (p) { p.style.display = 'none'; });

    if (!img) {
      img = el('img', { class: 'ps-cover', alt: slot.label || slot.moment || t('photos') });
      node.insertBefore(img, node.firstChild);
    }
    if (img.src !== slot.items[0].url) img.src = slot.items[0].url;

    if (!del) {
      del = el('button', { class: 'del', type: 'button', 'aria-label': T.deleteAll, text: '×' });
      node.appendChild(del);
    }
    if (!del._psWired) {
      del._psWired = true;
      del.addEventListener('click', function (e) {
        e.stopPropagation();
        clearSlot(slot);
      });
    }

    if (!count) {
      count = el('span', { class: 'count' });
      node.appendChild(count);
    }
    count.textContent = slot.items.length > 1 ? slot.items.length + ' 📷' : '';
    count.style.display = slot.items.length > 1 ? '' : 'none';

    node.setAttribute('aria-label',
      (slot.label || t('photos')) + ' — ' + slot.items.length + ' ' + t('photos'));
  }

  function totalCount() {
    return slots.reduce(function (n, s) { return n + s.items.length; }, 0);
  }

  function refreshFab() {
    var n = totalCount();
    fab.classList.toggle('on', n > 0);
    fabBadge.textContent = n;
  }

  /* ---------- ajout / suppression ---------- */

  function addFiles(slot, fileList) {
    var incoming = Array.prototype.filter.call(fileList || [], function (f) { return /^image\//.test(f.type); });
    if (!incoming.length) return Promise.resolve(0);

    slot.node.classList.add('ps-busy');
    return Promise.all(incoming.map(compress)).then(function (files) {
      var chain = Promise.resolve();
      files.forEach(function (f) {
        chain = chain.then(function () {
          var rec = {
            id: slot.key + '#' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            slot: slot.key, blob: f, name: f.name, ts: Date.now()
          };
          var item = { id: rec.id, blob: f, url: URL.createObjectURL(f), ts: rec.ts };
          slot.items.push(item);
          if (!storageOk) return;
          return DB.put(rec).catch(function (err) {
            // quota dépassé : on retire la photo plutôt que d'afficher ce qui ne sera pas conservé
            var i = slot.items.indexOf(item);
            if (i > -1) { URL.revokeObjectURL(item.url); slot.items.splice(i, 1); }
            throw err;
          });
        });
      });
      return chain.then(function () { return files.length; });
    }).then(function (n) {
      slot.node.classList.remove('ps-busy');
      paint(slot); refreshFab();
      return n;
    }).catch(function (err) {
      slot.node.classList.remove('ps-busy');
      paint(slot); refreshFab();
      toast(/quota|storage/i.test(err && err.name + err.message) ? t('quota') : String(err.message || err), true);
      return 0;
    });
  }

  function removeItem(slot, id) {
    var i = slot.items.findIndex(function (x) { return x.id === id; });
    if (i < 0) return Promise.resolve();
    URL.revokeObjectURL(slot.items[i].url);
    slot.items.splice(i, 1);
    paint(slot); refreshFab();
    return storageOk ? DB.del(id).catch(function () {}) : Promise.resolve();
  }

  function clearSlot(slot) {
    var n = slot.items.length;
    if (n > 1 && !global.confirm(t('confirmDelete', { n: n }))) return;
    var ids = slot.items.map(function (x) { URL.revokeObjectURL(x.url); return x.id; });
    slot.items = [];
    paint(slot); refreshFab();
    if (storageOk) DB.delSlot(ids).catch(function () {});
  }

  /* ---------- feuilles (sheets) ---------- */

  function sheet(title, buildBody) {
    var body = el('div');
    var panel = el('div', { class: 'ps-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      [el('h3', { text: title }), body]);
    var bg = el('div', { class: 'ps-sheet-bg' }, [panel]);

    function close() {
      bg.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', onKey);
    buildBody(body, close);
    document.body.appendChild(bg);
    return close;
  }

  /* ---------- sélection de photos ---------- */

  var picker, camInput, pickTarget = null;

  function openSlot(slot) {
    if (slot.items.length) return openManager(slot);
    openPickSheet(slot);
  }

  function openPickSheet(slot) {
    sheet(slot.label || slot.moment || t('photos'), function (body, close) {
      var cam = el('button', { class: 'ps-act', type: 'button', text: '📸  ' + T.take });
      var gal = el('button', { class: 'ps-act', type: 'button', text: '🖼️  ' + T.pick });
      var no = el('button', { class: 'ps-act ps-act-ghost', type: 'button', text: T.cancel });
      cam.addEventListener('click', function () { close(); openCamera(slot); });
      gal.addEventListener('click', function () { close(); pickTarget = slot; picker.click(); });
      no.addEventListener('click', close);
      [cam, gal, no].forEach(function (b) { body.appendChild(b); });
    });
  }

  function openManager(slot) {
    sheet((slot.label || slot.moment || t('photos')) + ' — ' + slot.items.length, function (body, close) {
      var grid = el('div', { class: 'ps-mgr' });
      function fill() {
        grid.textContent = '';
        slot.items.forEach(function (it) {
          var rm = el('button', { type: 'button', text: '×', 'aria-label': 'Supprimer' });
          rm.addEventListener('click', function () {
            removeItem(slot, it.id).then(function () {
              if (!slot.items.length) return close();
              fill();
            });
          });
          grid.appendChild(el('figure', {}, [
            el('img', { src: it.url, alt: '', loading: 'lazy' }), rm
          ]));
        });
      }
      fill();
      body.appendChild(grid);

      var cam = el('button', { class: 'ps-act', type: 'button', text: '📸  ' + T.take });
      var gal = el('button', { class: 'ps-act', type: 'button', text: '🖼️  ' + T.pick });
      var no = el('button', { class: 'ps-act ps-act-ghost', type: 'button', text: T.close });
      cam.addEventListener('click', function () { close(); openCamera(slot); });
      gal.addEventListener('click', function () { close(); pickTarget = slot; picker.click(); });
      no.addEventListener('click', close);
      [cam, gal, no].forEach(function (b) { body.appendChild(b); });
    });
  }

  /* ---------- appareil photo ---------- */

  var facing = 'environment';

  function openCamera(slot) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      pickTarget = slot;
      return camInput.click();
    }
    var video = el('video', { playsinline: 'playsinline', autoplay: 'autoplay', muted: 'muted' });
    var shot = el('button', { type: 'button', class: 'ps-shutter', 'aria-label': T.take });
    var flip = el('button', { type: 'button', text: '🔄' });
    var close = el('button', { type: 'button', text: '✕' });
    var modal = el('div', { class: 'ps-cam', role: 'dialog', 'aria-modal': 'true', 'aria-label': T.take },
      [video, el('div', { class: 'ps-cam-bar' }, [close, shot, flip])]);

    var stream = null;
    function stop() { if (stream) stream.getTracks().forEach(function (tr) { tr.stop(); }); stream = null; }
    function shutdown() { stop(); document.removeEventListener('keydown', onKey); modal.remove(); }
    function onKey(e) { if (e.key === 'Escape') shutdown(); }
    function start() {
      stop();
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false })
        .then(function (s) { stream = s; video.srcObject = s; })
        .catch(function () { shutdown(); pickTarget = slot; camInput.click(); });
    }

    shot.addEventListener('click', function () {
      if (!video.videoWidth) return;
      var c = el('canvas');
      c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext('2d').drawImage(video, 0, 0);
      c.toBlob(function (b) {
        if (b) addFiles(slot, [new File([b], 'photo-' + Date.now() + '.jpg', { type: 'image/jpeg' })]);
        shutdown();
      }, 'image/jpeg', 0.92);
    });
    flip.addEventListener('click', function () {
      facing = facing === 'environment' ? 'user' : 'environment';
      start();
    });
    close.addEventListener('click', shutdown);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(modal);
    start();
  }

  /* ---------- WhatsApp ---------- */

  function groups() {
    var out = [], map = {};
    slots.forEach(function (s) {
      if (!s.items.length) return;
      var name = s.day || 'Photos';
      if (!map[name]) { map[name] = { name: name, slots: [] }; out.push(map[name]); }
      map[name].slots.push(s);
    });
    return out;
  }

  function filesOf(list) {
    var out = [];
    list.forEach(function (s) {
      s.items.forEach(function (it) {
        out.push(new File([it.blob], (s.day ? s.day.replace(/[^\wÀ-ɏ ]+/g, '') + ' - ' : '') +
          (s.moment || s.label || 'photo').replace(/[^\wÀ-ɏ ]+/g, '') + '-' + it.ts + '.jpg',
          { type: it.blob.type || 'image/jpeg' }));
      });
    });
    return out;
  }

  function openWhatsAppSheet() {
    var gs = groups();
    if (!gs.length) return toast(t('noPhotos'));

    sheet(T.send, function (body, close) {
      // périmètre
      var scope = el('div', { class: 'ps-scope' });
      var boxes = [];
      gs.forEach(function (g) {
        var n = g.slots.reduce(function (a, s) { return a + s.items.length; }, 0);
        var cb = el('input', { type: 'checkbox', checked: 'checked' });
        cb._group = g;
        boxes.push(cb);
        scope.appendChild(el('label', {}, [cb, el('span', { text: g.name }), el('span', { class: 'n', text: n + ' 📷' })]));
      });
      body.appendChild(el('div', { class: 'ps-field' }, [el('label', { text: T.scope }), scope]));

      // numéro
      var dial = el('select', { 'aria-label': 'Indicatif' });
      [['33', 'FR +33'], ['972', 'IL +972'], ['32', 'BE +32'], ['41', 'CH +41'],
       ['44', 'UK +44'], ['1', 'US +1']].forEach(function (c) {
        var o = el('option', { value: c[0], text: c[1] });
        if (c[0] === CFG.dial) o.selected = true;
        dial.appendChild(o);
      });
      var stored = '';
      try { stored = localStorage.getItem('ps:phone') || ''; } catch (e) { /* navigation privée */ }
      var phone = el('input', { type: 'tel', inputmode: 'tel', autocomplete: 'tel',
        placeholder: '06 12 34 56 78', value: stored });
      body.appendChild(el('div', { class: 'ps-field' }, [
        el('label', { text: T.number }), el('div', { class: 'ps-row' }, [dial, phone])
      ]));

      var msg = el('textarea', { placeholder: 'Nos photos de Paris…' });
      body.appendChild(el('div', { class: 'ps-field' }, [el('label', { text: T.message }), msg]));

      var hint = el('p', { class: 'ps-hint' });
      var go = el('button', { class: 'ps-act ps-act-primary', type: 'button', text: '🟢  ' + T.send });
      var no = el('button', { class: 'ps-act ps-act-ghost', type: 'button', text: T.cancel });
      no.addEventListener('click', close);

      go.addEventListener('click', function () {
        var to = normalizePhone(dial.value, phone.value);
        if (!to || to.length < 8) { hint.textContent = t('badNumber'); hint.className = 'ps-hint err'; return; }
        try { localStorage.setItem('ps:phone', phone.value); } catch (e) { /* navigation privée */ }

        var chosen = boxes.filter(function (b) { return b.checked; })
          .reduce(function (acc, b) { return acc.concat(b._group.slots); }, []);
        if (!chosen.length) { hint.textContent = t('noPhotos'); hint.className = 'ps-hint err'; return; }

        var files = filesOf(chosen);
        var text = (msg.value.trim() ? msg.value.trim() + '\n\n' : '') +
          boxes.filter(function (b) { return b.checked; })
            .map(function (b) { return '• ' + b._group.name; }).join('\n');

        close();
        sendWhatsApp(to, files, text);
      });

      body.appendChild(go);
      body.appendChild(no);
      body.appendChild(hint);
    });
  }

  /**
   * Un lien wa.me ne transporte que du texte : impossible d'y joindre des images.
   * Seul le partage natif (Web Share) permet d'envoyer les fichiers eux-mêmes.
   */
  function sendWhatsApp(to, files, text) {
    if (navigator.canShare && navigator.canShare({ files: files })) {
      var batches = [];
      for (var i = 0; i < files.length; i += CFG.perShare) batches.push(files.slice(i, i + CFG.perShare));

      try { navigator.clipboard && navigator.clipboard.writeText('+' + to); } catch (e) { /* refusé */ }

      var step = function (k) {
        if (k >= batches.length) return toast(t('shared', { n: '+' + to }));
        return navigator.share({
          files: batches[k],
          text: k === 0 ? (text || undefined) : undefined
        }).then(function () { return step(k + 1); });
      };

      return step(0).catch(function (err) {
        if (err && err.name === 'AbortError') return toast(t('cancelled'));
        shareFallback(to, files, text);
      });
    }
    shareFallback(to, files, text);
  }

  function shareFallback(to, files, text) {
    files.forEach(function (f) {
      var u = URL.createObjectURL(f);
      var a = el('a', { href: u, download: f.name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 15000);
    });
    global.open('https://wa.me/' + to + (text ? '?text=' + encodeURIComponent(text) : ''), '_blank', 'noopener');
    toast(t('fallback', { n: '+' + to }), true);
  }

  /* ---------- initialisation ---------- */

  var fab, fabBadge;

  function init() {
    if (document.getElementById('ps-style')) return;
    document.head.appendChild(el('style', { id: 'ps-style', text: STYLE }));

    picker = el('input', { type: 'file', accept: 'image/*', multiple: 'multiple', class: 'ps-sr',
      tabindex: '-1', 'aria-hidden': 'true' });
    camInput = el('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'ps-sr',
      tabindex: '-1', 'aria-hidden': 'true' });
    document.body.appendChild(picker);
    document.body.appendChild(camInput);

    function ingest(input) {
      return function () {
        var slot = pickTarget;
        pickTarget = null;
        var fl = input.files;
        if (slot && fl && fl.length) {
          addFiles(slot, fl).then(function (n) { if (n) toast(t('saved', { n: n })); });
        }
        input.value = '';
      };
    }
    picker.addEventListener('change', ingest(picker));
    camInput.addEventListener('change', ingest(camInput));

    fabBadge = el('span', { class: 'b', text: '0' });
    fab = el('button', { class: 'ps-fab', type: 'button' }, [
      document.createTextNode('🟢 WhatsApp'), fabBadge
    ]);
    fab.addEventListener('click', openWhatsAppSheet);
    document.body.appendChild(fab);

    indexDocument();

    slots.forEach(function (slot) {
      slot.node.setAttribute('role', 'button');
      slot.node.setAttribute('tabindex', '0');

      slot.node.addEventListener('click', function (e) {
        if (e.target.closest('.del')) return; // géré séparément
        openSlot(slot);
      });
      slot.node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSlot(slot); }
      });

      ['dragenter', 'dragover'].forEach(function (ev) {
        slot.node.addEventListener(ev, function (e) { e.preventDefault(); slot.node.style.borderColor = '#B8863B'; });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        slot.node.addEventListener(ev, function (e) { e.preventDefault(); slot.node.style.borderColor = ''; });
      });
      slot.node.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files.length) addFiles(slot, e.dataTransfer.files);
      });
    });

    restore();
  }

  global.PhotoSlots = {
    init: init,
    config: CFG,
    strings: T,
    slots: function () { return slots; },
    count: totalCount,
    normalizePhone: normalizePhone,
    /** Vide tout le carnet (photos + stockage). */
    reset: function () {
      slots.forEach(function (s) {
        s.items.forEach(function (i) { URL.revokeObjectURL(i.url); });
        s.items = []; paint(s);
      });
      refreshFab();
      return DB.tx('readwrite', function (st) { return st.clear(); });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
