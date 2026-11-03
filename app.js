(function () {
'use strict';

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dkey(new Date());
const monthKey = () => today().slice(0, 7);
function weekStart() { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay()); return dkey(x); }
const dayIndex = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

/* ---------- content (from the infographics) ---------- */
const MORNING = [
  'לא פותחים את היום עם הטלפון – לפחות 15 דקות בלי מסכים',
  'כוס מים מיד כשקמים',
  'כותבים 3 דברים שרוצים להספיק היום',
  'מקדישים 5 דקות ללמידה – קריאה, האזנה או משהו חדש'
];
const SUGGEST = [
  ['בריאות ואנרגיה', ['הליכה של 20 דקות', 'שעות שינה קבועות', 'ירקות ופירות בתפריט', 'הפסקה מהישיבה – לקום, להתמתח']],
  ['עבודה ופרודוקטיביות', ['להתחיל מהמשימה החשובה ביותר', 'פרק עבודה ממוקד של 25 דקות', 'לתכנן את מחר לפני שמסיימים לעבוד']],
  ['חשיבה והתפתחות', ['לשאול "מה למדתי היום?"', 'לכתוב דבר אחד שמעריכים בחיים', 'פחות השוואה לאחרים']],
  ['כסף והתנהלות', ['לעקוב אחר ההוצאות', 'לחסוך סכום קבוע מכל הכנסה', 'להמתין 24 שעות לפני רכישה לא מתוכננת']],
  ['מערכות יחסים', ['להתקשר לאדם יקר לפחות פעם בשבוע', 'להקשיב בלי לקטוע ובלי טלפון', 'להגיד תודה ולהביע הערכה']]
];
const QUESTIONS = [
  ['מטרות ושאיפות', ['מה הדבר שהכי הייתי רוצה להשיג בחיים?', 'איפה אני רואה את עצמי בעוד 5 שנים?', 'אילו לא הייתי מפחד מכישלון, מה הייתי עושה?', 'האם אני פועל היום בכיוון החיים שאני באמת רוצה?']],
  ['ערכים ואמונות', ['מהם הערכים הכי חשובים לי בחיים?', 'האם אני חי לפי מה שבאמת חשוב לי?', 'באילו נושאים אני לא מוכן להתפשר?', 'אילו אמונות שלי מקדמות אותי ואילו מגבילות אותי?']],
  ['רגשות ומחשבות', ['מה הדבר שהכי מעסיק אותי כרגע?', 'באילו מצבים אני מרגיש הכי טוב עם עצמי?', 'מה גורם לי להרגיש לחץ או חוסר ביטחון?', 'האם אני מקדיש זמן להקשיב לעצמי ולהבין מה אני מרגיש?']],
  ['הרגלים והתנהלות יומיומית', ['אילו הרגלים שלי מקדמים אותי ואילו מעכבים אותי?', 'איך אני בדרך כלל מתחיל ומסיים את היום שלי?', 'על מה אני מבזבז יותר מדי זמן?', 'איזה שינוי קטן יכול לשפר משמעותית את החיים שלי?']],
  ['מערכות יחסים וסביבה', ['מי האנשים שמשפיעים עליי בצורה הטובה ביותר?', 'האם אני מקיף את עצמי באנשים שמעודדים אותי לצמוח?', 'האם אני יודע להציב גבולות כשמשהו לא מתאים לי?', 'למי אני רוצה להקדיש יותר זמן ותשומת לב?']],
  ['צמיחה והגשמה אישית', ['מה למדתי על עצמי מהאתגרים שעברתי?', 'באיזה תחום בחיים אני רוצה להשתפר?', 'מתי בפעם האחרונה עשיתי משהו שהוציא אותי מאזור הנוחות?', 'מה גורם לי להרגיש באמת משמעותי ומסופק?']]
];
const ALLQ = []; QUESTIONS.forEach(([c, qs]) => qs.forEach(q => ALLQ.push({ i: ALLQ.length, c, q })));
const STOP = [
  ['להשוות את עצמכם לאחרים', 'בדקו את ההתקדמות שלכם ביחס לעצמכם.'],
  ['להגיד כן לכל בקשה', 'עצרו רגע ובדקו אם יש לכם זמן וכוח.'],
  ['לדחות החלטות', 'אספו את המידע הדרוש וקבעו מועד להחלטה.'],
  ['להעמיס משימות על כל יום', 'בחרו שלוש משימות חשובות והתמקדו בהן.'],
  ['לבדוק את הטלפון בלי הפסקה', 'קבעו זמנים מוגדרים לבדיקה.'],
  ['לנסות לרצות את כולם', 'פעלו לפי הערכים שלכם, לא לפי כל ציפייה.'],
  ['להשאיר הכול לרגע האחרון', 'חלקו משימות גדולות לצעדים קטנים.'],
  ['לחכות למוטיבציה', 'התחילו בצעד קטן גם בלי חשק.'],
  ['להתעכב על טעויות מהעבר', 'הפיקו לקח אחד והחליטו מה עושים אחרת.'],
  ['להתעלם מהצורך במנוחה', 'קבעו הפסקות קצרות במהלך היום.'],
  ['לחשוב במקום לפעול', 'הפכו מחשבה אחת לפעולה מעשית.'],
  ['להתמקד במה שאין לכם', 'כתבו בכל יום שלושה דברים שאתם מעריכים.'],
  ['לחכות לרגע המושלם', 'התחילו עם מה שיש לכם עכשיו.'],
  ['להזניח קשרים חשובים', 'הקדישו זמן קבוע לאנשים שחשובים לכם.'],
  ['להיכנס לוויכוחים מיותרים', 'בחרו מתי נכון להגיב ומתי לשחרר.']
];
const SIGNS = [
  ['אתם מגיבים אחרת לקשיים', 'במקום להיבהל מכל מכשול, אתם עוצרים, חושבים ומחפשים דרך להתמודד.'],
  ['אתם מציבים גבולות', 'אתם מבינים שלא חייבים להסכים לכל בקשה, ושמותר לכם לשמור על הזמן והאנרגיה שלכם.'],
  ['פחות חשוב לכם אישור', 'אתם מקבלים החלטות לפי הערכים שלכם, ולא רק לפי מה שאחרים יחשבו.'],
  ['אתם משווים פחות', 'אתם מתמקדים בדרך שלכם, במקום למדוד את ההתקדמות מול החיים של אחרים.'],
  ['אתם לוקחים אחריות', 'במקום להאשים את הנסיבות, אתם בודקים מה נמצא בשליטתכם ומה אפשר לשנות.'],
  ['אתם מתמידים גם בלי חשק', 'אתם לומדים לפעול גם בימים שבהם המוטיבציה לא מגיעה.'],
  ['אתם בוחרים במה להתמקד', 'אתם משקיעים יותר זמן בדברים שחשובים לכם, ופחות במה שרק מסיח את דעתכם.'],
  ['אתם לומדים מטעויות', 'אתם מפסיקים לראות בכל טעות כישלון, ומתחילים לשאול מה אפשר ללמוד ממנה.'],
  ['אתם יודעים לבקש עזרה', 'אתם מבינים שלא צריך להתמודד עם הכול לבד, ופונים לאנשים הנכונים כשצריך.'],
  ['אתם מעריכים התקדמות קטנה', 'אתם מבינים ששינוי משמעותי נבנה מצעדים קטנים שחוזרים על עצמם.'],
  ['אתם לא מוותרים אחרי נפילה', 'גם כשאתם יוצאים מהמסלול, אתם חוזרים אליו בלי לחכות ליום מושלם.'],
  ['אתם מקשיבים לעצמכם', 'אתם מזהים טוב יותר מה אתם צריכים, מתי לנוח ומתי הגיע הזמן לפעול.']
];
const DIGITAL = [
  ['מחיקת אפליקציות', ['עברו על רשימת האפליקציות', 'מחקו אפליקציות שאינכם משתמשים בהן או שאינן תורמות לכם', 'שקלו להחליף אפליקציות מבזבזות זמן בחלופות מועילות יותר']],
  ['ביטול התראות מיותרות', ['עברו על אפליקציות ההודעות', 'כבו התראות לא חיוניות', 'השאירו רק התראות חשובות ואמיתיות בזמן אמת']],
  ['ניקוי תמונות וסרטונים', ['מחקו תמונות וסרטונים מיותרים או כפולים', 'גבו תכנים חשובים לענן או למחשב', 'ארגנו את התמונות באלבומים לנוחות ושליפה מהירה']],
  ['סידור מסך הבית', ['השאירו במסך הבית רק אפליקציות שאתם באמת משתמשים בהן', 'ארגנו את האפליקציות בתיקיות לפי נושאים (עבודה, לימודים, אישי)', 'הסירו ווידג׳טים לא נחוצים']],
  ['הגדרת מגבלות שימוש', ['הגדירו מגבלת זמן יומית לאפליקציות שגוזלות מכם זמן (כגון רשתות חברתיות)', 'הפעילו מצב "נא לא להפריע" בשעות עבודה, למידה או שינה', 'שקלו להפעיל "זמן מסך" למעקב אחר השימוש שלכם']],
  ['הסרת קבוצות מיותרות', ['עברו על קבוצות הוואטסאפ שלכם', 'צאו מקבוצות שאינן רלוונטיות, אקטיביות או שמעיקות עליכם', 'השאירו רק קבוצות חשובות ובעלות ערך אמיתי']]
];
const CLEAN = {
  daily: ['סדרו את המיטה', 'פתחו את החלונות', 'שטפו כלים', 'נגבו את הכיריים', 'החזירו חפצים למקום', 'הוציאו שקיות אשפה מלאות', 'השאירו את המטבח מסודר'],
  weekly: ['כבסו כביסה', 'החליפו מצעים', 'נקו את חדר האמבטיה', 'נגבו רצפות', 'סדרו משטחים', 'נקו במהירות את המקרר', 'בדקו תאריכי תפוגה של מזון'],
  monthly: ['נקו ארונות', 'סדרו מגירות', 'נקו עמוק את המטבח', 'שטפו את פח האשפה', 'בדקו מלאי עודף', 'תרמו או השליכו פריטים לא בשימוש']
};
const CLEAN_TITLES = { daily: 'יומית', weekly: 'שבועית', monthly: 'חודשית' };
const MEALS = [
  ['🥚 ביצים', ['חביתה', 'ביצים מקושקשות', 'ביצים קשות', 'ארוחה מהירה ועשירה בחלבון']],
  ['🍚 אורז', ['למדו את היחס הבסיסי', 'בשלו כמות נוספת', 'אחסנו כראוי', 'השתמשו בו למספר ארוחות שונות']],
  ['🍝 פסטה', ['שמרו את הרוטב פשוט', 'הוסיפו ירקות וחלבון', 'מהיר וזול', 'הימנעו מעומס מיותר']],
  ['🫘 קטניות', ['הקפיאו במנות', 'תבלו פשוט', 'בשלו כמות גדולה', 'חסכו זמן כל השבוע']],
  ['🍗 עוף', ['שלטו בתיבול בסיסי אחד', 'בשלו והקפיאו במנות', 'השתמשו בו בארוחות שונות', 'הפחיתו תלות במזון מהיר']],
  ['🧄 מצרכים חוסכי זמן', ['שום קפוא', 'ירקות קפואים', 'תבלינים פשוטים', 'ארוחות מוכנות לאכילה', 'כלי בישול מאורגנים', 'אל תפחדו לחזור על אותם פריטים']]
];
const SHOP_BEFORE = ['בדקו מה יש כבר בבית', 'כתבו רשימת קניות והתמידו בה', 'קבעו תקציב לקניות', 'אל תצאו לקניות רעבים', 'תכננו מראש ארוחות, לא מוצרים אקראיים', 'השתמשו באותם מצרכים לכמה ארוחות'];
const SHOP_STORE = ['התחילו ממזונות בסיסיים', 'השוו מחירים לפי משקל או נפח', 'הימנעו ממעברי קנייה אימפולסיבית כשאתם עייפים', 'אל תקנו משהו רק כי הוא במבצע', 'בחרו מזונות פשוטים שאתם באמת אוכלים', 'תעדיפו מזונות בסיסיים רב-שימושיים', 'תעדיפו מותגים פרטיים (מותגי רשת)'];
const SHOP_WASTE = ['הזמנת אוכל לעיתים קרובות מדי', 'קנייה בלי רשימה', 'בזבוז מזון', 'קניית מוצרים טרנדיים שלא באמת צריך', 'הליכה לסופר לעיתים קרובות מדי'];
const BASICS = ['אורז', 'קטניות (שעועית, עדשים, חומוס)', 'ביצים', 'פסטה', 'ירקות קפואים', 'פירות טריים', 'לחם', 'חלבונים קפואים', 'שיבולת שועל', 'יוגורט', 'רוטב עגבניות', 'תבלינים בסיסיים'];
const HOME_SYS = [
  ['🍳 המטבח', ['שמרו על פריטים חיוניים באותו מקום קבוע', 'שמרו על הכיור נקי ככל האפשר', 'הקפיאו מנות מוכנות מראש במנות אישיות', 'בדקו את המקרר לפני שיוצאים לקניות']],
  ['👕 בגדים', ['מיינו בגדים לפי קטגוריה', 'כבסו לפני שהערימה גדלה', 'קפלו והחזירו לארון באותו יום (אם אפשר)', 'הכינו סט "מועדף" ליום-יום']],
  ['📁 מסמכים', ['תיקייה ייעודית למסמכים', 'סדרו חשבונות לתשלום', 'שמרו קבלות חשובות', 'סרקו מה שאפשר']],
  ['🧼 ניקיון', ['שמרו על מוצרי ניקיון נגישים', 'קבעו שגרת ניקיון מינימלית', 'השתמשו ברשימת מטלות פשוטה', 'ניקוי מהיר לפני שהבלגן יוצא משליטה']],
  ['🧺 דברים שמקלים על החיים', ['סל כביסה', 'מוצרי ניקיון בסיסיים', 'בדי ניקוי נוספים', 'שקיות אשפה', 'קופסאות אחסון', 'קופסאות אוכל', 'פריטים חיוניים כפולים', 'מנות מוכנות להקפאה', 'רשימת מטלות']],
  ['✅ הרגלים מועילים', ['החזירו כל דבר למקומו', 'מקום קבוע לכל דבר', 'עשו קצת כל יום', 'הכינו את עצמכם למחר היום', 'פחות עומס, יותר רוגע']]
];
const MEMORY = [
  ['להפסיק להסתמך על הזיכרון', ['כתבו דברים מיד', 'השתמשו בתזכורות בלי להסס', 'הכניסו אירועים ליומן מיד', 'שמרו מידע חשוב במקום אחד']],
  ['רוצחי הזיכרון', ['יותר מדי הסחות דעת', 'שינה לא מספקת', 'ריבוי משימות', 'לחץ כרוני', 'עומס מידע', 'לא כותבים דברים חשובים']],
  ['מערכת ארגון בסיסית', ['צרו תיקייה למסמכים', 'שמרו הערות בטלפון', 'השתמשו ביומן לכל השנה', 'צרו רשימת קניות קבועה', 'השתמשו ברשימת מטלות פשוטה', 'עקבו אחר שגרה שבועית בסיסית']],
  ['הרגלים שעוזרים', ['השתמשו ברשימות', 'החזיקו מחברת תכנון', 'הגדירו תזכורות והתראות', 'היצמדו לשגרה קבועה', 'החזירו תמיד פריטים חשובים למקום הקבוע שלהם', 'הוציאו משימות מראש אל הכתב']],
  ['תזכורת מפתח', ['המוח לא תוכנן לזכור כל דבר', 'ארגון מפחית עומס מנטלי', 'מערכות עובדות יותר טוב ממוטיבציה', 'פחות החלטות = פחות עייפות מנטלית']]
];
const TIPS = [
  'לא צריך לאמץ את כל ההרגלים בבת אחת. בחרו הרגל אחד או שניים, ורק כשהם הופכים לחלק מהשגרה – הוסיפו עוד אחד.',
  'שינוי גדול לא מתחיל בהחלטה דרמטית. הוא מתחיל בדבר אחד קטן שאתם בוחרים לעשות אחרת היום.',
  'התקדמות לא תמיד נראית כמו קפיצה גדולה. לפעמים היא פשוט הדרך שבה אתם מתמודדים היום עם דברים שפעם עצרו אתכם.',
  'להכיר את עצמכם זו לא משימה שמסתיימת ביום אחד. חזרו לשאלות מדי פעם.',
  'אם זה לוקח פחות מ-2 דקות – עשו את זה עכשיו.',
  'מערכות עובדות יותר טוב ממוטיבציה.'
];
const GOAL_CATS = ['אישי', 'בריאות', 'קריירה', 'כסף', 'לימודים', 'קשרים', 'אחר'];

/* ---------- state ---------- */
const KEY = 'growth.v1';
const DEFAULT = () => ({
  habits: [], goals: [], daily: {}, notdo: [], dump: [], frog: {},
  homeCustom: { daily: [], weekly: [], monthly: [] }, homeDone: {},
  shop: [], budget: '', meals: {}, signs: {}, answers: {}, digital: {}, pomo: {}
});
let S;
function sanitize(obj) {
  const d = DEFAULT(), out = {};
  Object.keys(d).forEach(k => {
    const v = obj && obj[k];
    out[k] = (Array.isArray(d[k]) === Array.isArray(v) && typeof v === typeof d[k] && v !== null) ? v : d[k];
  });
  out.homeCustom = Object.assign({ daily: [], weekly: [], monthly: [] }, out.homeCustom);
  ['daily', 'weekly', 'monthly'].forEach(p => { if (!Array.isArray(out.homeCustom[p])) out.homeCustom[p] = []; });
  return out;
}
function load() {
  try { S = sanitize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { S = DEFAULT(); }
}
let saveT;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('השמירה נכשלה – ייתכן שהאחסון מלא'); } }
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(save, 300); }
function day(d) {
  d = d || today();
  if (!S.daily[d]) S.daily[d] = { morning: {}, tasks: [], reflect: {} };
  return S.daily[d];
}

/* ---------- ui state ---------- */
let tab = 'today';
const SEG = { focus: 'pomo', home: 'clean', learn: 'q' };
let openGoalForm = false;
const OPEN = new Set();

/* ---------- templates ---------- */
const row = (on, act, id, label, extra) => `<div class="row ${on ? 'done' : ''}"><input type="checkbox" class="chk" data-act="${act}" data-id="${esc(id)}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><div class="grow">${esc(label)}</div>${extra || ''}</div>`;
const delBtn = (act, id) => `<button class="x" data-act="${act}" data-id="${esc(id)}" aria-label="מחיקה">✕</button>`;
const addBar = (act, ph, id) => `<div class="add"><input type="text" data-in="${act}" ${id != null ? `data-id="${esc(id)}"` : ''} placeholder="${esc(ph)}" maxlength="140"><button class="btn" data-act="${act}" ${id != null ? `data-id="${esc(id)}"` : ''}>הוסף</button></div>`;
const bar = (p, ok) => `<div class="bar ${ok ? 'ok' : ''}"><i style="width:${p}%"></i></div>`;
const acc = (k, title, body, cls) => `<details class="card accordion ${cls || ''}" data-k="${esc(k)}" ${OPEN.has(k) ? 'open' : ''}><summary>${title}</summary>${body}</details>`;
const ul = items => `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
const segs = (group, list) => `<div class="segs">${list.map(([k, l]) => `<button class="${SEG[group] === k ? 'active' : ''}" data-act="seg" data-id="${group}|${k}">${l}</button>`).join('')}</div>`;
const empty = t => `<div class="empty">${t}</div>`;

/* ---------- habits logic ---------- */
function streak(h) {
  const d = new Date();
  if (!h.days[dkey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (h.days[dkey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function goalPct(g) {
  if (!g.steps.length) return g.done ? 100 : 0;
  return Math.round(g.steps.filter(s => s.done).length / g.steps.length * 100);
}

/* ---------- pages ---------- */
function pToday() {
  const d = day(), t = today();
  const mDone = MORNING.filter((_, i) => d.morning['m' + i]).length;
  const hDone = S.habits.filter(h => h.days[t]).length;
  const tDone = d.tasks.filter(x => x.done).length;
  const total = MORNING.length + S.habits.length + d.tasks.length;
  const done = mDone + hDone + tDone;
  const pct = total ? Math.round(done / total * 100) : 0;
  const msg = pct === 0 ? 'בואו נתחיל בצעד קטן אחד' : pct < 50 ? 'יפה, ממשיכים' : pct < 100 ? 'כמעט שם!' : 'יום מלא – כל הכבוד 🎉';
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'בוקר טוב' : hr < 18 ? 'צהריים טובים' : hr < 22 ? 'ערב טוב' : 'לילה טוב';
  const best = S.habits.reduce((m, h) => Math.max(m, streak(h)), 0);
  const activeGoals = S.goals.filter(g => !g.done).length;

  let html = `<div class="card"><div class="ring-wrap"><div class="ring" style="--p:${pct}"><b>${pct}%</b></div>
    <div><h2 style="margin:0 0 4px">${greet} 👋</h2><div class="hint" style="margin:0">${msg}</div><div class="hint" style="margin:4px 0 0">${done} מתוך ${total} הושלמו</div></div></div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><b>🔥 ${best}</b><span>רצף הרגלים</span></div>
      <div class="stat"><b>🍅 ${S.pomo[t] || 0}</b><span>פומודורו היום</span></div>
      <div class="stat"><b>🎯 ${activeGoals}</b><span>מטרות פעילות</span></div></div></div>`;

  html += `<div class="card blue"><h2>🌅 שגרת בוקר <small>${mDone}/${MORNING.length}</small></h2>${MORNING.map((x, i) => row(!!d.morning['m' + i], 'tgM', 'm' + i, x)).join('')}</div>`;

  html += `<div class="card green"><h2>🔁 הרגלים להיום <small>${hDone}/${S.habits.length}</small></h2>`;
  html += S.habits.length ? S.habits.map(h => row(!!h.days[t], 'tgH', h.id, h.name, streak(h) ? `<span class="streak">🔥${streak(h)}</span>` : '')).join('')
    : empty('עוד אין הרגלים. <br><button class="btn small ghost" data-act="go" data-id="habits" style="margin-top:8px">בחרו הרגל ראשון</button>');
  html += `</div>`;

  const sizes = [['big', '🐸 המשימה הגדולה', 1], ['mid', 'משימות בינוניות', 3], ['small', 'משימות קטנות', 5]];
  html += `<div class="card yellow"><h2>🗂️ כלל 1-3-5 <small>${tDone}/${d.tasks.length}</small></h2><div class="hint" style="margin-top:-4px">משימה גדולה אחת, 3 בינוניות ו-5 קטנות. לא יותר.</div>`;
  sizes.forEach(([k, label, lim]) => {
    const list = d.tasks.filter(x => x.size === k);
    html += `<div style="margin-top:10px"><b>${label}</b> <span class="pill">${list.length}/${lim}</span>`;
    html += list.map(x => row(x.done, 'tgT', x.id, x.t, delBtn('delT', x.id))).join('');
    if (list.length < lim) html += addBar('addT', 'הוסיפו משימה…', k);
    html += `</div>`;
  });
  html += `</div>`;

  const qi = dayIndex() % ALLQ.length, q = ALLQ[qi], ans = S.answers[qi];
  html += `<div class="card purple"><h2>💭 שאלת היום <small>${esc(q.c)}</small></h2><div class="quote">${esc(q.q)}</div>
    <div class="field" style="margin-top:10px"><textarea data-bind="ans" data-id="${qi}" placeholder="כתבו כמה משפטים…">${esc(ans ? ans.text : '')}</textarea></div></div>`;

  const r = d.reflect;
  html += `<div class="card pink"><h2>🌙 סיכום סוף יום</h2>
    <div class="field"><label>מה למדתי היום?</label><textarea data-bind="ref" data-id="learned">${esc(r.learned || '')}</textarea></div>
    <div class="field"><label>דבר אחד שאני מעריך בחיים</label><textarea data-bind="ref" data-id="grateful">${esc(r.grateful || '')}</textarea></div>
    <div class="field"><label>מה אני רוצה להספיק מחר? (תכנון היום הבא)</label><textarea data-bind="ref" data-id="tomorrow">${esc(r.tomorrow || '')}</textarea></div></div>`;

  html += `<div class="card"><b>זכרו:</b> <span class="hint">${esc(TIPS[dayIndex() % TIPS.length])}</span></div>`;
  return html;
}

function pHabits() {
  const t = today();
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  let html = `<div class="card"><h2>ההרגלים שלי</h2>`;
  if (!S.habits.length) html += empty('בחרו הרגל אחד או שניים להתחלה – לא צריך הכול בבת אחת.');
  S.habits.forEach(h => {
    const s = streak(h);
    html += `<div class="row" style="flex-wrap:wrap"><div class="grow"><b>${esc(h.name)}</b> ${s ? `<span class="streak">🔥 ${s}</span>` : ''}</div>${delBtn('delH', h.id)}
      <div class="week" style="width:100%;justify-content:space-between">${days.map(d => { const k = dkey(d); return `<button class="${h.days[k] ? 'on' : ''} ${k === t ? 'today' : ''}" data-act="tgHd" data-id="${h.id}|${k}">${LETTERS[d.getDay()]}</button>`; }).join('')}</div></div>`;
  });
  html += addBar('addH', 'הרגל חדש (קטן וספציפי)…') + `</div>`;

  html += `<div class="card purple"><h2>⚡ כללים שעוזרים להתחיל</h2><ul style="margin:0;padding-inline-start:20px;line-height:1.8">
    <li><b>כלל 2 הדקות:</b> אם זה לוקח פחות מ-2 דקות – עשו את זה עכשיו. אל תתנו למשימות קטנות להצטבר.</li>
    <li><b>הרגל קטן קודם:</b> עדיף הרגל של 2 דקות שמתמידים בו מהרגל גדול שנוטשים.</li>
    <li><b>נפלתם? חוזרים:</b> לא מוותרים אחרי נפילה, חוזרים למחרת בלי לחכות ליום מושלם.</li></ul></div>`;

  html += `<div class="card"><h2>הצעות להרגלים קטנים</h2><div class="hint">הקישו כדי להוסיף. התחילו עם אחד או שניים.</div>`;
  SUGGEST.forEach(([cat, items]) => {
    html += `<div style="margin:10px 0 4px"><b>${cat}</b></div><div class="chips">${items.map(n => {
      const has = S.habits.some(h => h.name === n);
      return `<button class="chip ${has ? 'sel' : ''}" data-act="sugH" data-id="${esc(n)}" ${has ? 'disabled' : ''}>${has ? '✓ ' : '+ '}${esc(n)}</button>`;
    }).join('')}</div>`;
  });
  return html + `</div>`;
}

function pGoals() {
  const act = S.goals.filter(g => !g.done), fin = S.goals.filter(g => g.done);
  let html = `<button class="btn block" data-act="newGoal" style="margin-bottom:12px">+ מטרה חדשה</button>`;
  if (!act.length) html += `<div class="card">${empty('עוד אין מטרות פעילות. מטרה טובה = כיוון + צעד קטן ראשון.')}</div>`;
  act.forEach(g => {
    const p = goalPct(g), next = g.steps.find(s => !s.done);
    let due = '';
    if (g.due) {
      const left = Math.ceil((new Date(g.due + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000);
      due = left < 0 ? `<span class="pill" style="background:#fee2e2;color:#b91c1c">באיחור ${-left} ימים</span>` : `<span class="pill">נותרו ${left} ימים</span>`;
    }
    html += `<div class="card"><h2><span>${esc(g.title)}</span><span class="pill ${p === 100 ? 'ok' : ''}">${p}%</span></h2>${bar(p, p === 100)}
      <div style="margin:8px 0"><span class="pill">${esc(g.cat)}</span> ${due}</div>
      ${g.why ? `<p class="hint">למה זה חשוב לי: ${esc(g.why)}</p>` : ''}
      ${next ? `<p class="hint"><b>הצעד הבא:</b> ${esc(next.t)}</p>` : '<p class="hint">פרקו את המטרה לצעדים קטנים כדי להתחיל.</p>'}
      ${g.steps.map(s => row(s.done, 'tgS', g.id + '|' + s.id, s.t, delBtn('delS', g.id + '|' + s.id))).join('')}
      ${addBar('addS', 'צעד קטן הבא…', g.id)}
      <div class="btns"><button class="btn small" data-act="doneG" data-id="${g.id}">סמנו כהושגה ✓</button><button class="btn small danger" data-act="delG" data-id="${g.id}">מחיקה</button></div></div>`;
  });
  if (fin.length) html += `<div class="card green"><h2>🏆 הושגו <small>${fin.length}</small></h2>${fin.map(g => `<div class="row"><div class="grow">${esc(g.title)}</div><button class="btn small ghost" data-act="undoG" data-id="${g.id}">החזרה</button>${delBtn('delG', g.id)}</div>`).join('')}</div>`;
  return html;
}

/* timer engine */
const T = { kind: 'pomo', mode: 'focus', total: 1500, left: 1500, running: false, end: 0, iv: null, cycle: 0 };
const MODES = { focus: ['עבודה ממוקדת', 1500], short: ['הפסקה קצרה', 300], long: ['הפסקה ארוכה', 900] };
const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
function tSet(kind, mode, secs) { clearInterval(T.iv); Object.assign(T, { kind, mode, total: secs, left: secs, running: false }); }
function tStart() {
  if (T.running) return;
  T.end = Date.now() + T.left * 1000; T.running = true;
  clearInterval(T.iv); T.iv = setInterval(tTick, 250); render();
}
function tPause() { clearInterval(T.iv); T.running = false; render(); }
function tTick() {
  T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000));
  const el = $('#tDisp'); if (el) el.textContent = fmt(T.left);
  if (T.left <= 0) tDone();
}
function tDone() {
  clearInterval(T.iv); T.running = false; beep();
  if (T.kind === 'pomo') {
    if (T.mode === 'focus') {
      S.pomo[today()] = (S.pomo[today()] || 0) + 1; T.cycle++; save();
      const m = T.cycle % 4 === 0 ? 'long' : 'short'; tSet('pomo', m, MODES[m][1]); toast('סבב הושלם 🍅 זמן להפסקה');
    } else { tSet('pomo', 'focus', MODES.focus[1]); toast('ההפסקה הסתיימה. חוזרים לעבודה'); }
  } else { tSet('two', 'two', 120); toast('2 דקות עברו – כל הכבוד!'); }
  render();
}
function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = 0.2; o.start();
    setTimeout(() => { o.stop(); c.close(); }, 600);
  } catch (e) { /* ignore */ }
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
const FIVE = { n: null, iv: null };

function timerCard(kind) {
  const mine = T.kind === kind;
  const left = mine ? T.left : (kind === 'two' ? 120 : MODES.focus[1]);
  const pct = mine ? Math.round((1 - T.left / T.total) * 100) : 0;
  return `<div class="timer"><div class="label">${kind === 'two' ? 'כלל 2 הדקות' : MODES[T.kind === 'pomo' ? T.mode : 'focus'][0]}</div>
    <div class="t" id="tDisp">${fmt(left)}</div>${bar(pct)}
    <div class="btns" style="justify-content:center">${mine && T.running ? `<button class="btn" data-act="tPause">השהיה</button>` : `<button class="btn" data-act="tGo" data-id="${kind}">${mine && T.left < T.total ? 'המשך' : 'התחל'}</button>`}
    <button class="btn ghost" data-act="tReset" data-id="${kind}">איפוס</button>
    ${kind === 'pomo' ? `<button class="btn ghost" data-act="tSkip">דלג</button>` : ''}</div></div>`;
}

function pFocus() {
  const k = SEG.focus;
  let html = segs('focus', [['pomo', '🍅 פומודורו'], ['two', '⏱️ 2 דקות'], ['five', '5️⃣ 5 שניות'], ['frog', '🐸 צפרדע'], ['lists', '📝 רשימות']]);
  if (k === 'pomo') {
    html += `<div class="card">${timerCard('pomo')}<div class="hint" style="text-align:center;margin-top:10px">25 דקות עבודה ממוקדת · 5 דקות הפסקה · חוזרים על המחזור · אחרי 4 מחזורים הפסקה ארוכה</div>
      <div class="stats" style="margin-top:10px"><div class="stat"><b>${S.pomo[today()] || 0}</b><span>סבבים היום</span></div><div class="stat"><b>${T.cycle % 4}/4</b><span>במחזור הנוכחי</span></div><div class="stat"><b>${Object.values(S.pomo).reduce((a, b) => a + b, 0)}</b><span>סה״כ</span></div></div></div>`;
  } else if (k === 'two') {
    html += `<div class="card">${timerCard('two')}</div>
      <div class="card purple"><h2>כלל 2 הדקות</h2><ul style="margin:0;padding-inline-start:20px;line-height:1.8"><li>אם זה לוקח פחות מ-2 דקות – עשו את זה עכשיו.</li><li>אל תתנו למשימות קטנות להצטבר.</li><li>צמצמו עומס מנטלי.</li></ul></div>`;
  } else if (k === 'five') {
    html += `<div class="card"><div class="bignum" id="fiveNum">${FIVE.n == null ? '5' : FIVE.n === 0 ? 'התחל!' : FIVE.n}</div>
      <div class="btns" style="justify-content:center"><button class="btn" data-act="fiveGo">התחילו ספירה</button></div></div>
      <div class="card green"><h2>כלל 5 השניות</h2><ul style="margin:0;padding-inline-start:20px;line-height:1.8"><li>ספרו לאחור 5-4-3-2-1 ואז התחילו.</li><li>אל תחכו למוטיבציה.</li><li>התמודדו עם התנגדות ראשונית.</li></ul></div>`;
  } else if (k === 'frog') {
    const f = S.frog[today()];
    html += `<div class="card green"><h2>🐸 לאכול את הצפרדע</h2><ul style="margin:0 0 10px;padding-inline-start:20px;line-height:1.8"><li>התחילו במשימה הקשה ביותר.</li><li>סיימו את העבודה הכי קשה כבר בבוקר.</li><li>צרו מומנטום להמשך היום.</li></ul>
      ${f ? row(f.done, 'tgF', 'f', f.t, delBtn('delF', 'f')) : addBar('addF', 'מהי המשימה הקשה ביותר היום?')}</div>
      <div class="card"><h2>🧩 פרקו משימות גדולות</h2><div class="hint">פרקו לצעדים קטנים, צמצמו תחושת הצפה, וקל יותר להתחיל. את המטרות הגדולות תפרקו בלשונית <b>מטרות</b>.</div></div>
      <div class="card"><h2>🚫 הפסק רב-משימות</h2><div class="hint">התמקדו במשימה אחת בכל פעם, צמצמו עייפות מנטלית ושפרו ריכוז ויעילות.</div></div>`;
  } else {
    html += `<div class="card pink"><h2>🚫 רשימת "לא לעשות"</h2><div class="hint" style="margin-top:-4px">הסר משימות מיותרות, האצל כשאפשר ושמור על האנרגיה המנטלית שלך.</div>
      ${S.notdo.map(x => `<div class="row"><div class="grow">${esc(x.t)}</div>${delBtn('delN', x.id)}</div>`).join('') || empty('עוד ריק')}${addBar('addN', 'דבר שאני מפסיק לעשות…')}</div>
      <div class="card blue"><h2>🧠 לכתוב מיד <small>פריקת ראש</small></h2><div class="hint" style="margin-top:-4px">כתבו כל דבר שעולה בראש במקום לזכור אותו.</div>
      ${S.dump.map(x => `<div class="row"><div class="grow">${esc(x.t)}</div><button class="btn small ghost" data-act="dumpTask" data-id="${x.id}">למשימה</button>${delBtn('delD', x.id)}</div>`).join('') || empty('הראש ריק – יפה')}${addBar('addD', 'כתבו מחשבה, משימה או רעיון…')}</div>`;
  }
  return html;
}

function periodKey(p) { return p === 'daily' ? today() : p === 'weekly' ? weekStart() : monthKey(); }
function cleanList(p) {
  const pk = periodKey(p);
  const items = CLEAN[p].map((t, i) => ({ id: p + i, t })).concat(S.homeCustom[p].map(x => ({ id: x.id, t: x.t, custom: true })));
  const done = items.filter(x => S.homeDone[p + '|' + pk + '|' + x.id]).length;
  const pct = items.length ? Math.round(done / items.length * 100) : 0;
  return `<div class="card ${p === 'daily' ? 'blue' : p === 'weekly' ? 'green' : 'purple'}"><h2>${CLEAN_TITLES[p]} <small>${done}/${items.length}</small></h2>${bar(pct, pct === 100)}
    ${items.map(x => row(!!S.homeDone[p + '|' + pk + '|' + x.id], 'tgC', p + '|' + x.id, x.t, x.custom ? delBtn('delC', p + '|' + x.id) : '')).join('')}${addBar('addC', 'משימת בית משלי…', p)}</div>`;
}

function pHome() {
  const k = SEG.home;
  let html = segs('home', [['clean', '🧹 ניקיון'], ['food', '🍳 אוכל'], ['shop', '🛒 קניות'], ['sys', '🏠 מערכות']]);
  if (k === 'clean') {
    html += `<div class="hint" style="margin:0 2px 10px">שגרה מינימלית: מסמנים, והרשימה מתאפסת לבד – כל יום, שבוע וחודש.</div>` + ['daily', 'weekly', 'monthly'].map(cleanList).join('');
  } else if (k === 'food') {
    const names = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    html += `<div class="card yellow"><h2>🍽️ תכנון ארוחות שבועי</h2>${names.map((n, i) => `<div class="field"><label>${n}</label><input type="text" data-bind="meal" data-id="${i}" value="${esc(S.meals[i] || '')}" placeholder="ארוחת ערב…"></div>`).join('')}</div>`;
    html += `<div class="hint" style="margin:0 2px 8px">5 ארוחות בסיסיות שמצילות את השבוע:</div>` + MEALS.map(([t, items]) => acc('meal' + t, t, ul(items))).join('');
  } else if (k === 'shop') {
    const left = S.shop.filter(x => !x.done).length;
    html += `<div class="card"><h2>🛒 רשימת קניות <small>${left} נותרו</small></h2>
      <div class="field"><label>תקציב לקנייה (₪)</label><input type="number" inputmode="decimal" data-bind="budget" value="${esc(S.budget)}" placeholder="למשל 400"></div>
      ${S.shop.map(x => row(x.done, 'tgP', x.id, x.t, delBtn('delP', x.id))).join('') || empty('הרשימה ריקה')}${addBar('addP', 'מה צריך לקנות?')}
      <div class="btns"><button class="btn small ghost" data-act="clearP">נקה מסומנים</button><button class="btn small ghost" data-act="basicsP">הוסף מוצרי בסיס</button></div></div>`;
    html += acc('sb', '📋 לפני שיוצאים', ul(SHOP_BEFORE)) + acc('ss', '🏪 בסופר', ul(SHOP_STORE)) + acc('sw', '💸 הרגלים שמבזבזים כסף', ul(SHOP_WASTE)) + acc('sbas', '🥫 מזונות שמקלים על החיים', ul(BASICS));
  } else {
    html += HOME_SYS.map(([t, items]) => acc('sys' + t, t, ul(items))).join('');
  }
  return html;
}

function pLearn() {
  const k = SEG.learn;
  let html = segs('learn', [['q', 'שאלות'], ['signs', 'סימנים'], ['stop', 'להפסיק'], ['digital', 'דיגיטלי'], ['mem', 'זיכרון']]);
  if (k === 'q') {
    const n = Object.keys(S.answers).length;
    html += `<div class="card"><h2>היכרות עצמית <small>${n}/${ALLQ.length} נענו</small></h2>${bar(Math.round(n / ALLQ.length * 100))}<div class="hint">הקישו על שאלה כדי לכתוב תשובה. חזרו אליה כל כמה חודשים.</div></div>`;
    QUESTIONS.forEach(([c]) => {
      html += `<div class="card"><h2>${esc(c)}</h2>${ALLQ.filter(q => q.c === c).map(q => `<div class="row" data-act="openQ" data-id="${q.i}" style="cursor:pointer"><div class="grow">${esc(q.q)}</div><span>${S.answers[q.i] ? '✅' : '✏️'}</span></div>`).join('')}</div>`;
    });
  } else if (k === 'signs') {
    const w = weekStart(), cur = S.signs[w] || {}, cnt = SIGNS.filter((_, i) => cur['s' + i]).length;
    html += `<div class="card"><h2>12 סימנים שאתם מתקדמים <small>${cnt}/12 השבוע</small></h2>${bar(Math.round(cnt / 12 * 100), cnt >= 6)}<div class="hint">סמנו פעם בשבוע מה זיהיתם אצל עצמכם. התקדמות לא תמיד נראית כמו קפיצה גדולה.</div></div>
      <div class="card">${SIGNS.map(([t, d], i) => `<div class="row ${cur['s' + i] ? 'done' : ''}"><input type="checkbox" class="chk" data-act="tgSign" data-id="s${i}" ${cur['s' + i] ? 'checked' : ''}><div class="grow"><b>${esc(t)}</b><div class="hint" style="margin:2px 0 0">${esc(d)}</div></div></div>`).join('')}</div>`;
  } else if (k === 'stop') {
    html += `<div class="hint" style="margin:0 2px 8px">15 דברים שכדאי להפסיק לעשות – ומה לעשות במקום:</div>` + STOP.map(([a, b], i) => acc('stop' + i, esc(a), `<p class="hint"><b>במקום:</b> ${esc(b)}</p>`)).join('');
  } else if (k === 'digital') {
    const all = DIGITAL.reduce((a, [, it]) => a + it.length, 0), done = Object.values(S.digital).filter(Boolean).length;
    html += `<div class="card"><h2>📱 ניקוי דיגיטלי ב-30 דקות <small>${done}/${all}</small></h2>${bar(Math.round(done / all * 100), done === all)}${done === all ? '<p class="hint"><b>התוצאה:</b> טלפון נקי, מסודר וממוקד יותר 🎉</p>' : ''}<div class="btns"><button class="btn small ghost" data-act="resetDigital">איפוס</button></div></div>`;
    DIGITAL.forEach(([t, items], gi) => { html += `<div class="card"><h2>${t}</h2>${items.map((x, ii) => row(!!S.digital['g' + gi + '_' + ii], 'tgDg', 'g' + gi + '_' + ii, x)).join('')}</div>`; });
  } else {
    html += `<div class="hint" style="margin:0 2px 8px">איך להפסיק לשכוח כל דבר:</div>` + MEMORY.map(([t, items]) => acc('mem' + t, t, ul(items))).join('');
  }
  return html;
}

/* ---------- render ---------- */
const PAGES = {
  today: [pToday, 'היום', () => new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })],
  habits: [pHabits, 'הרגלים', () => 'צעד קטן, כל יום'],
  goals: [pGoals, 'מטרות', () => 'מה אני רוצה להשיג'],
  focus: [pFocus, 'פוקוס', () => 'להפסיק לדחות ולהתחיל'],
  home: [pHome, 'בית ואוכל', () => 'מערכות שמורידות עומס'],
  learn: [pLearn, 'ידע ורפלקציה', () => 'להכיר את עצמי טוב יותר']
};
let lastTab = null;
function render() {
  const y = window.scrollY, p = PAGES[tab];
  $('#view').innerHTML = p[0]();
  $('#pageTitle').textContent = p[1]; $('#pageSub').textContent = p[2]();
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  if (lastTab === tab) window.scrollTo(0, y); else window.scrollTo(0, 0);
  lastTab = tab;
}
function commit() { save(); render(); }

function toast(m) {
  const t = $('#toast'); t.textContent = m; t.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 2400);
}
function openModal(html) { $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

const inVal = (act, id) => {
  const i = document.querySelector(`[data-in="${act}"]${id != null && id !== '' ? `[data-id="${id}"]` : ''}`);
  return i ? i.value.trim() : '';
};

/* ---------- actions ---------- */
const A = {
  go: id => { tab = id; render(); },
  seg: id => { const [g, k] = id.split('|'); SEG[g] = k; render(); },
  tgM: id => { const d = day(); d.morning[id] = !d.morning[id]; commit(); },
  tgH: id => { const h = S.habits.find(x => x.id === id), t = today(); if (h) { h.days[t] ? delete h.days[t] : (h.days[t] = true); } commit(); },
  tgHd: id => { const [hid, k] = id.split('|'), h = S.habits.find(x => x.id === hid); if (h) { h.days[k] ? delete h.days[k] : (h.days[k] = true); } commit(); },
  addH: () => { const v = inVal('addH'); if (!v) return; S.habits.push({ id: uid(), name: v, days: {}, created: today() }); commit(); },
  sugH: id => { if (!S.habits.some(h => h.name === id)) S.habits.push({ id: uid(), name: id, days: {}, created: today() }); toast('נוסף להרגלים'); commit(); },
  delH: id => { if (confirm('למחוק את ההרגל?')) { S.habits = S.habits.filter(h => h.id !== id); commit(); } },
  addT: id => {
    const v = inVal('addT', id); if (!v) return;
    const lim = { big: 1, mid: 3, small: 5 }[id], d = day();
    if (d.tasks.filter(x => x.size === id).length >= lim) return toast('הגעתם למגבלה – זה בכוונה 🙂');
    d.tasks.push({ id: uid(), t: v, size: id, done: false }); commit();
  },
  tgT: id => { const x = day().tasks.find(t => t.id === id); if (x) x.done = !x.done; commit(); },
  delT: id => { const d = day(); d.tasks = d.tasks.filter(t => t.id !== id); commit(); },
  newGoal: () => openModal(`<h3>מטרה חדשה</h3>
    <div class="field"><label>מה המטרה?</label><input type="text" id="gTitle" maxlength="100" placeholder="למשל: לרוץ 5 ק״מ"></div>
    <div class="field"><label>למה זה חשוב לי?</label><input type="text" id="gWhy" maxlength="160"></div>
    <div class="field"><label>תחום</label><select id="gCat">${GOAL_CATS.map(c => `<option>${c}</option>`).join('')}</select></div>
    <div class="field"><label>תאריך יעד (לא חובה)</label><input type="date" id="gDue"></div>
    <div class="field"><label>צעדים קטנים (שורה לכל צעד)</label><textarea id="gSteps" placeholder="צעד ראשון&#10;צעד שני"></textarea></div>
    <div class="btns"><button class="btn" data-act="saveGoal">שמירה</button><button class="btn ghost" data-act="closeModal">ביטול</button></div>`),
  saveGoal: () => {
    const title = $('#gTitle').value.trim(); if (!title) return toast('צריך לכתוב מטרה');
    S.goals.unshift({ id: uid(), title, why: $('#gWhy').value.trim(), cat: $('#gCat').value, due: $('#gDue').value, done: false, created: today(),
      steps: $('#gSteps').value.split('\n').map(s => s.trim()).filter(Boolean).map(t => ({ id: uid(), t, done: false })) });
    closeModal(); commit();
  },
  closeModal: () => closeModal(),
  addS: id => { const v = inVal('addS', id), g = S.goals.find(x => x.id === id); if (v && g) { g.steps.push({ id: uid(), t: v, done: false }); commit(); } },
  tgS: id => { const [gid, sid] = id.split('|'), g = S.goals.find(x => x.id === gid); if (!g) return; const s = g.steps.find(x => x.id === sid); if (s) s.done = !s.done; commit(); },
  delS: id => { const [gid, sid] = id.split('|'), g = S.goals.find(x => x.id === gid); if (g) { g.steps = g.steps.filter(x => x.id !== sid); commit(); } },
  doneG: id => { const g = S.goals.find(x => x.id === id); if (g) { g.done = true; toast('כל הכבוד על ההישג! 🏆'); commit(); } },
  undoG: id => { const g = S.goals.find(x => x.id === id); if (g) { g.done = false; commit(); } },
  delG: id => { if (confirm('למחוק את המטרה?')) { S.goals = S.goals.filter(g => g.id !== id); commit(); } },
  tGo: id => { if (T.kind !== id) tSet(id, id === 'two' ? 'two' : 'focus', id === 'two' ? 120 : MODES.focus[1]); tStart(); },
  tPause: () => tPause(),
  tReset: id => { tSet(id, id === 'two' ? 'two' : 'focus', id === 'two' ? 120 : MODES.focus[1]); render(); },
  tSkip: () => { if (T.kind !== 'pomo') return; const m = T.mode === 'focus' ? 'short' : 'focus'; tSet('pomo', m, MODES[m][1]); render(); },
  fiveGo: () => {
    clearInterval(FIVE.iv); FIVE.n = 5; const el = () => $('#fiveNum');
    if (el()) el().textContent = '5';
    FIVE.iv = setInterval(() => {
      FIVE.n--; if (el()) el().textContent = FIVE.n > 0 ? FIVE.n : 'התחל!';
      if (FIVE.n <= 0) { clearInterval(FIVE.iv); beep(); }
    }, 1000);
  },
  addF: () => { const v = inVal('addF'); if (v) { S.frog[today()] = { t: v, done: false }; commit(); } },
  tgF: () => { const f = S.frog[today()]; if (f) f.done = !f.done; commit(); },
  delF: () => { delete S.frog[today()]; commit(); },
  addN: () => { const v = inVal('addN'); if (v) { S.notdo.push({ id: uid(), t: v }); commit(); } },
  delN: id => { S.notdo = S.notdo.filter(x => x.id !== id); commit(); },
  addD: () => { const v = inVal('addD'); if (v) { S.dump.unshift({ id: uid(), t: v }); commit(); } },
  delD: id => { S.dump = S.dump.filter(x => x.id !== id); commit(); },
  dumpTask: id => {
    const x = S.dump.find(d => d.id === id); if (!x) return; const d = day();
    const size = ['small', 'mid', 'big'].find(k => d.tasks.filter(t => t.size === k).length < { big: 1, mid: 3, small: 5 }[k]);
    if (!size) return toast('אין מקום ברשימה של היום');
    d.tasks.push({ id: uid(), t: x.t, size, done: false }); S.dump = S.dump.filter(z => z.id !== id); toast('הועבר למשימות של היום'); commit();
  },
  tgC: id => { const [p, iid] = id.split('|'), k = p + '|' + periodKey(p) + '|' + iid; S.homeDone[k] ? delete S.homeDone[k] : (S.homeDone[k] = true); commit(); },
  addC: id => { const v = inVal('addC', id); if (v) { S.homeCustom[id].push({ id: uid(), t: v }); commit(); } },
  delC: id => { const [p, iid] = id.split('|'); S.homeCustom[p] = S.homeCustom[p].filter(x => x.id !== iid); commit(); },
  addP: () => { const v = inVal('addP'); if (v) { S.shop.push({ id: uid(), t: v, done: false }); commit(); } },
  tgP: id => { const x = S.shop.find(s => s.id === id); if (x) x.done = !x.done; commit(); },
  delP: id => { S.shop = S.shop.filter(x => x.id !== id); commit(); },
  clearP: () => { S.shop = S.shop.filter(x => !x.done); commit(); },
  basicsP: () => { BASICS.forEach(b => { if (!S.shop.some(s => s.t === b)) S.shop.push({ id: uid(), t: b, done: false }); }); commit(); },
  tgSign: id => { const w = weekStart(); S.signs[w] = S.signs[w] || {}; S.signs[w][id] = !S.signs[w][id]; commit(); },
  tgDg: id => { S.digital[id] = !S.digital[id]; commit(); },
  resetDigital: () => { if (confirm('לאפס את הצ׳קליסט?')) { S.digital = {}; commit(); } },
  openQ: id => {
    const q = ALLQ[+id], a = S.answers[id];
    openModal(`<h3>${esc(q.q)}</h3><div class="hint">${esc(q.c)}${a ? ' · נכתב ב-' + esc(a.date) : ''}</div>
      <div class="field"><textarea id="qText" style="min-height:140px" placeholder="כתבו בכנות, זה רק בשבילכם…">${esc(a ? a.text : '')}</textarea></div>
      <div class="btns"><button class="btn" data-act="saveQ" data-id="${id}">שמירה</button><button class="btn ghost" data-act="closeModal">סגירה</button></div>`);
  },
  saveQ: id => { const v = $('#qText').value.trim(); if (v) S.answers[id] = { text: v, date: today() }; else delete S.answers[id]; closeModal(); commit(); },
  backup: () => openModal(`<h3>גיבוי ושחזור</h3><p class="hint">כל הנתונים נשמרים רק במכשיר הזה. מומלץ לגבות מדי פעם.</p>
    <div class="btns"><button class="btn" data-act="export">הורדת גיבוי</button><label class="btn ghost" style="cursor:pointer">שחזור מקובץ<input type="file" id="impFile" accept="application/json" hidden></label></div>
    <p class="hint" style="margin-top:14px">טיפ: אפשר להוסיף את האפליקציה למסך הבית מתפריט הדפדפן ("הוסף למסך הבית").</p>
    <div class="btns"><button class="btn danger small" data-act="wipe">מחיקת כל הנתונים</button><button class="btn ghost small" data-act="closeModal">סגירה</button></div>`),
  export: () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
    a.download = `growth-backup-${today()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  wipe: () => { if (confirm('למחוק את כל הנתונים? אי אפשר לשחזר.')) { S = DEFAULT(); closeModal(); commit(); } }
};

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && A[el.dataset.act]) { A[el.dataset.act](el.dataset.id, el); return; }
  if (e.target.id === 'modal') closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const i = e.target.closest && e.target.closest('[data-in]');
  if (i && A[i.dataset.in]) { e.preventDefault(); A[i.dataset.in](i.dataset.id); }
});
document.addEventListener('input', e => {
  const b = e.target.dataset && e.target.dataset.bind; if (!b) return;
  const v = e.target.value, id = e.target.dataset.id;
  if (b === 'ref') day().reflect[id] = v;
  else if (b === 'ans') { if (v.trim()) S.answers[id] = { text: v, date: today() }; else delete S.answers[id]; }
  else if (b === 'meal') S.meals[id] = v;
  else if (b === 'budget') S.budget = v;
  saveSoon();
});
document.addEventListener('change', e => {
  if (e.target.id !== 'impFile' || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => {
    try { S = sanitize(JSON.parse(r.result)); closeModal(); commit(); toast('השחזור הושלם'); }
    catch (err) { toast('הקובץ לא תקין'); }
  };
  r.readAsText(e.target.files[0]);
});
document.addEventListener('toggle', e => {
  const k = e.target.dataset && e.target.dataset.k; if (!k) return;
  e.target.open ? OPEN.add(k) : OPEN.delete(k);
}, true);
$('#tabbar').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; render(); } });
$('#btnBackup').addEventListener('click', () => A.backup());
document.addEventListener('visibilitychange', () => { if (!document.hidden && T.running) tTick(); });

/* ---------- boot ---------- */
function showFatal(err) {
  const v = $('#view'); if (!v) return;
  v.innerHTML = '<div class="card"><h2>אופס, משהו השתבש</h2><p class="hint">נסו לרענן. אם זה חוזר, שלחו את הטקסט הזה:</p><pre style="white-space:pre-wrap;direction:ltr;font-size:12px">' + esc(err && (err.stack || err.message || err)) + '</pre></div>';
}
window.addEventListener('error', e => { if (!$('#view').innerHTML.trim()) showFatal(e.error || e.message); });
try { load(); render(); } catch (err) { showFatal(err); }
// clean up any old service worker / caches from earlier versions of the app, then register the current one
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  navigator.serviceWorker.getRegistrations()
    .then(rs => Promise.all(rs.map(r => r.unregister())))
    .then(() => (window.caches ? caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))) : null))
    .then(() => navigator.serviceWorker.register('sw.js?v=3'))
    .catch(() => {});
}
})();
