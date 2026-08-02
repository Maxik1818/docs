/**
 * דוגמת שרת ל-data-wa-endpoint — שליחת תמונות אמיתית ל-WhatsApp Cloud API.
 *
 * זה המסלול היחיד שבו התמונות נשלחות אוטומטית למספר, בלי שהמשתמש יצרף אותן ידנית.
 * המסלולים בצד הלקוח (wa.me / Web Share) לא יכולים לצרף קבצים בשם המשתמש.
 *
 *   npm i express multer
 *   WA_TOKEN=... WA_PHONE_ID=... node server-example.js
 *   ואז ב-HTML:  <div data-image-upload data-wa-endpoint="/api/whatsapp/send"></div>
 *
 * חשוב: אל תכניסו את WA_TOKEN לקוד צד לקוח — הוא חייב להישאר בשרת בלבד.
 */
const express = require('express');
const multer = require('multer');

const TOKEN = process.env.WA_TOKEN;             // Meta permanent/system-user token
const PHONE_ID = process.env.WA_PHONE_ID;       // Phone Number ID מלוח הבקרה של Meta
const API = 'https://graph.facebook.com/v21.0';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 } // WhatsApp מגביל תמונות ל-5MB
});

/** מעלה קובץ ל-Meta ומחזיר media id לשימוש חוזר בהודעה */
async function uploadMedia(file) {
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', file.mimetype);
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);

  const res = await fetch(`${API}/${PHONE_ID}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `media upload failed (${res.status})`);
  return data.id;
}

async function sendMessage(payload) {
  const res = await fetch(`${API}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...payload })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `send failed (${res.status})`);
  return data;
}

app.post('/api/whatsapp/send', upload.array('images[]', 10), async (req, res) => {
  try {
    const to = String(req.body.to || '').replace(/\D/g, '');
    const caption = (req.body.message || '').slice(0, 1024); // מגבלת caption של WhatsApp
    if (!to) return res.status(400).json({ error: 'missing "to"' });
    if (!req.files?.length) return res.status(400).json({ error: 'no images' });

    const results = [];
    for (const [i, file] of req.files.entries()) {
      const mediaId = await uploadMedia(file);
      results.push(await sendMessage({
        to,
        type: 'image',
        // ה-caption נשלח פעם אחת, על התמונה הראשונה
        image: i === 0 && caption ? { id: mediaId, caption } : { id: mediaId }
      }));
    }
    res.json({ ok: true, sent: results.length });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('listening'));
