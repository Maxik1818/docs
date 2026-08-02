# העלאת תמונות + שליחה ב-WhatsApp

מודול Vanilla JS בלי תלויות שמוסיף לכל קובץ HTML קיים:

- 📸 **צילום מהמצלמה** — מצלמה חיה במסך מלא, החלפה בין קדמית/אחורית, נפילה חזרה ל-`capture="environment"` בטלפונים שלא תומכים.
- 🖼️ **העלאה מהגלריה** — בחירת קבצים, גרירה לאזור, והדבקה מהלוח (Ctrl+V).
- 🗜️ **דחיסה אוטומטית** — הקטנה ל-1600px וקידוד JPEG, כולל תיקון סיבוב EXIF מהטלפון.
- 🖼️ **תצוגה מקדימה** — רשת תמונות עם גודל קובץ, מחיקה, ומונה מול המקסימום.
- 🟢 **שליחה ב-WhatsApp** — הזנת מספר (עם קידומת מדינה) ושליחת התמונות אליו.

## התקנה

```html
<script src="whatsapp-image-upload.js"></script>
```

זה הכל — ה-CSS מוזרק אוטומטית, אין תלויות ואין שלב build.

## שתי דרכי חיבור

### א. שדרוג שדות תמונה שכבר קיימים ב-HTML

```html
<body data-enhance-file-inputs>
  <input id="photos" name="photos[]" type="file" accept="image/*" multiple>
</body>
```

כל `input[type=file]` עם `accept` שמכיל `image` מוחלף בווידג'ט. **ה-form ממשיך לעבוד בדיוק כמו קודם** — הקבצים הדחוסים נכתבים חזרה ל-`input.files` דרך `DataTransfer`, כך ש-`FormData` וה-submit הרגיל תופסים אותם.

### ב. הצבה נקודתית בדיוק במקום שצריך

```html
<div data-image-upload
     data-label="תמונות מהשטח"
     data-max="10"
     data-message="שלום, מצורפות התמונות."
     data-dial="972"
     data-name="photos"></div>
```

## אפשרויות (data-attributes)

| מאפיין | ברירת מחדל | תיאור |
|---|---|---|
| `data-label` | `תמונות` | כותרת השדה |
| `data-max` | `10` | מספר תמונות מקסימלי |
| `data-max-dim` | `1600` | רוחב/גובה מקסימלי בפיקסלים אחרי דחיסה |
| `data-quality` | `0.82` | איכות JPEG (0–1) |
| `data-whatsapp` | `true` | `false` מסתיר את פאנל ה-WhatsApp |
| `data-message` | — | טקסט ברירת מחדל להודעה |
| `data-phone` | — | מספר ברירת מחדל |
| `data-dial` | `972` | קידומת מדינה |
| `data-name` | — | שם שדה ל-form (hidden עם JSON של המטא-דאטה) |
| `data-upload-url` | — | POST multipart שמחזיר `{urls:[...]}` |
| `data-wa-endpoint` | — | POST ל-backend ששולח בפועל דרך WhatsApp Cloud API |

## איך השליחה ל-WhatsApp עובדת — ומה המגבלה

**זו המגבלה החשובה:** קישור `wa.me` יכול להעביר **טקסט בלבד**. אין שום דרך בדפדפן לצרף תמונות לצ'אט WhatsApp דרך קישור. לכן המודול מנסה ארבעה מסלולים, לפי סדר:

1. **`data-wa-endpoint` מוגדר** → התמונות נשלחות ל-backend שלכם, שמעביר אותן ל-WhatsApp Cloud API. **זה המסלול היחיד ששולח אוטומטית למספר**, בלי שהמשתמש עושה כלום. ראו `server-example.js`.
2. **`data-upload-url` מוגדר** → התמונות עולות לשרת, ונפתח צ'אט WhatsApp עם המספר והודעה שמכילה את הקישורים לתמונות.
3. **הדפדפן תומך ב-Web Share API עם קבצים** (רוב הטלפונים) → נפתח תפריט השיתוף עם התמונות מצורפות; המשתמש בוחר WhatsApp ואת איש הקשר. המספר מועתק ללוח כדי להקל. זו הדרך היחידה בצד לקוח שמצרפת קבצים אמיתיים.
4. **אין כלום** (בדרך כלל דסקטופ) → נפתח צ'אט עם המספר, והתמונות יורדות למחשב כדי שאפשר יהיה לגרור אותן לצ'אט. הודעת ההסבר מוצגת למשתמש.

לשליחה אוטומטית אמיתית — מסלול 1. שימו לב שב-WhatsApp Cloud API יש חלון 24 שעות: כדי לפנות למספר שלא כתב לכם לאחרונה נדרשת תבנית מאושרת (template).

## API ב-JavaScript

```js
// הצבה ידנית
const w = ImageUploadWhatsApp.mount('#my-div', { label: 'תמונות', max: 5 });

// שדרוג input קיים
ImageUploadWhatsApp.enhanceInput(document.querySelector('#photos'));

// קבלת הקבצים (דחוסים) בכל רגע
ImageUploadWhatsApp.get('#my-div').getFiles();  // File[]

// מעקב אחרי שינויים
document.addEventListener('imageupload:change', e => console.log(e.detail.files));

// נרמול מספר: '050-123-4567' + '972' -> '972501234567'
ImageUploadWhatsApp.normalizePhone('972', '050-123-4567');
```

## הרצת הדמו

```bash
python3 -m http.server 8000
# ואז http://localhost:8000/image-upload/demo.html
```

**המצלמה החיה דורשת HTTPS או localhost.** בפתיחה ישירה של `file://` הכפתור "צלם תמונה" נופל חזרה למצלמת המערכת של הטלפון — שעובדת גם היא, רק בלי התצוגה המוטמעת.

## תמיכה בדפדפנים

Chrome, Edge, Safari ו-Firefox עדכניים. `getUserMedia` דורש הקשר מאובטח; `navigator.share` עם קבצים זמין ברוב הדפדפנים בנייד ובחלק מהדסקטופ; לשניהם יש נפילה חזרה מסודרת. קבצי HEIC מאייפון שהדפדפן לא מפענח נשלחים כמו שהם, בלי דחיסה.
