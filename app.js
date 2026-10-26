(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY='30days-forward-v3', OLD_KEYS=['30days-forward-v2','30days-forward'];
const nowDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const nowMonth=()=>nowDate().slice(0,7);
const makeId=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const defaultState=()=>({version:3,theme:'dark',start:nowDate(),active:nowDate(),goal:'',why:'',daily:{},habits:[{id:'prayer',text:'תפילה ולימוד לפי השגרה שלי',done:false},{id:'family',text:'זמן נוכח עם המשפחה בלי טלפון',done:false},{id:'health',text:'תנועה או בחירה טובה לבריאות',done:false}],plans:[],goals:[],reviews:[],events:[],finance:{transactions:[],budgets:[],savings:[]}});
function loadState(){
 let raw=localStorage.getItem(KEY);
 if(!raw){
  for(const k of OLD_KEYS){
   const old=localStorage.getItem(k);
   if(old){
    try{
     const parsed=JSON.parse(old);
     const migrated={...defaultState(),...parsed,version:3,finance:{transactions:[],budgets:[],savings:[]},events:[]};
     localStorage.setItem(KEY,JSON.stringify(migrated));
     return migrated;
    }catch{}
   }
  }
 }
 try{return {...defaultState(),...JSON.parse(raw||'{}')}}catch{return defaultState()}
}
let s=loadState();
s.daily=s.daily||{};
s.habits=Array.isArray(s.habits)?s.habits:defaultState().habits;
s.plans=Array.isArray(s.plans)?s.plans:[];
s.goals=Array.isArray(s.goals)?s.goals:[];
s.reviews=Array.isArray(s.reviews)?s.reviews:[];
s.events=Array.isArray(s.events)?s.events:[];
s.finance=s.finance||{transactions:[],budgets:[],savings:[]};
for(const k of ['transactions','budgets','savings'])if(!Array.isArray(s.finance[k]))s.finance[k]=[];
const save=()=>{s.version=3;localStorage.setItem(KEY,JSON.stringify(s))};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',maximumFractionDigits:2}).format(Number(n)||0);
const dateLabel=d=>d?new Date(d+'T12:00:00').toLocaleDateString('he-IL',{day:'numeric',month:'short'}):'';

function toast(msg){
 $('toast').textContent=msg;
 $('toast').classList.add('show');
 clearTimeout(toast.t);
 toast.t=setTimeout(()=>$('toast').classList.remove('show'),2500);
}
function renderTop(){
 document.body.classList.toggle('light',s.theme==='light');
 $('theme').textContent=s.theme==='light'?'☾':'◐';
 $('dateLabel').textContent=new Date().toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'});
 const n=Math.max(1,Math.min(30,Math.floor((new Date(nowDate()+'T12:00:00')-new Date((s.start||nowDate())+'T12:00:00'))/86400000)+1));
 $('dayLabel').textContent=`יום ${n} מתוך 30`;
 $('progress').style.width=(n/30*100)+'%';
 $('goalStatus').textContent=s.goal?'יעד מוגדר':'יעד לא הוגדר';
}
function renderHabits(){
 $('habits').innerHTML=s.habits.map(h=>`<label class="habit ${h.done?'done':''}"><input type="checkbox" data-habit="${esc(h.id)}" ${h.done?'checked':''}><span>${esc(h.text)}</span><button class="delete" data-del-habit="${esc(h.id)}" aria-label="מחק הרגל">×</button></label>`).join('')||'<p class="empty">אין עוגנים. אפשר להוסיף אחד למעלה.</p>';
}
function renderGoals(){
 $('mainGoal').value=s.goal||'';
 $('why').value=s.why||'';
 $('goalList').innerHTML=s.goals.length?s.goals.map(g=>`<div class="goal-card"><div class="between"><b>${esc(g.title)}</b><button class="delete" data-del-goal="${esc(g.id)}" aria-label="מחק יעד">×</button></div><small class="muted">${esc(g.area)} · ${g.period==='year'?'שנתי':g.period==='month'?'חודשי':'30 יום'}${g.month?' · '+esc(g.month):''}</small><label>התקדמות: <span>${Number(g.progress)||0}%</span></label><input type="range" min="0" max="100" step="5" value="${Number(g.progress)||0}" data-progress="${esc(g.id)}"></div>`).join(''):'<p class="empty">היעדים שתוסיף יופיעו כאן.</p>';
}
function renderHistory(){
 $('history').innerHTML=s.reviews.length?[...s.reviews].sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<div class="list-row"><div class="tx-main"><b>${esc(r.date)}</b><small>התקדמות: ${esc(r.win||'לא צוין')} · חסם: ${esc(r.block||'לא צוין')} · מחר: ${esc(r.tomorrow||'לא צוין')}</small></div></div>`).join(''):'<p class="empty">אין סיכומים קודמים.</p>';
}
function renderDaily(){
 const d=s.daily[nowDate()]||{};
 $('task').value=d.task||'';
 $('minutes').value=d.minutes||'25';
 $('when').value=d.when||'';
 $('first').value=d.first||'';
}
const categories={
 income:[['salary','משכורת'],['event','אירועים'],['business','הכנסה עסקית'],['benefit','קצבאות / הטבות'],['other-income','אחר']],
 expense:[['housing','דיור ושכירות'],['food','מזון וסופר'],['children','ילדים וחינוך'],['bills','חשבונות'],['transport','רכב ותחבורה'],['health','בריאות'],['leisure','בילויים וחופשות'],['charity','צדקה / מעשר'],['supplies','ציוד וחומרים לעסק'],['marketing','שיווק'],['fees','עמלות ומסים'],['other-expense','אחר']]
};
function fillCategories(){
 const type=document.querySelector('input[name="transactionType"]:checked')?.value||'income';
 $('txCategory').innerHTML=(categories[type]||[]).map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
 const ex=categories.expense;
 $('budgetCategory').innerHTML=ex.map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
}
const catName=v=>Object.values(categories).flat().find(x=>x[0]===v)?.[1]||v;
function selectedMonth(){return $('financeMonth').value||nowMonth()}
function selectedScope(){return $('financeScope').value||'family'}

function renderFinance(){
 const month=selectedMonth(),scope=selectedScope();
 const all=s.finance.transactions.filter(t=>t.date?.slice(0,7)===month&&(scope==='all'||t.scope===scope));
 const paid=all.filter(t=>t.status==='paid');
 const inc=paid.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount),0);
 const exp=paid.filter(t=>t.type==='expense').reduce((a,t)=>a+Number(t.amount),0);
 const pending=all.filter(t=>t.status==='pending').reduce((a,t)=>a+Number(t.amount),0);
 $('incomeTotal').textContent=money(inc);
 $('expenseTotal').textContent=money(exp);
 $('balanceTotal').textContent=money(inc-exp);
 $('balanceTotal').className=inc-exp<0?'negative':'positive';
 $('pendingTotal').textContent=money(pending);

 const filter=$('txFilterType').value;
 const list=all.filter(t=>filter==='all'||(filter==='pending'?t.status==='pending':t.type===filter)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 $('transactionList').innerHTML=list.length?list.map(t=>`<div class="list-row"><div class="tx-main"><b>${esc(t.description||catName(t.category))}</b><small>${esc(t.scope==='family'?'משפחה':'עסק')} · ${esc(catName(t.category))} · ${dateLabel(t.date)} · ${t.status==='pending'?'ממתין לתשלום':'בוצע'}</small></div><span class="amount ${t.type==='income'?'positive':'negative'}">${t.type==='income'?'+':'−'}${money(t.amount)}</span><button class="delete" data-del-tx="${esc(t.id)}" aria-label="מחק תנועה">×</button></div>`).join(''):'<p class="empty">אין תנועות בתקופה ובסינון שנבחרו.</p>';

 const budgets=s.finance.budgets.filter(b=>b.month===month&&(scope==='all'||b.scope===scope));
 $('budgetList').innerHTML=budgets.length?budgets.map(b=>{
  const spent=s.finance.transactions.filter(t=>t.scope===b.scope&&t.type==='expense'&&t.status==='paid'&&t.category===b.category&&t.date?.slice(0,7)===month).reduce((a,t)=>a+Number(t.amount),0);
  const pct=b.limit>0?Math.min(100,spent/b.limit*100):0;
  return `<div class="budget-row"><div class="budget-top"><b>${esc(b.scope==='family'?'משפחה':'עסק')} · ${esc(catName(b.category))}</b><span>${money(spent)} / ${money(b.limit)}</span><button class="delete" data-del-budget="${esc(b.id)}" aria-label="מחק תקציב">×</button></div><div class="budget-track"><span style="width:${pct}%;${spent>b.limit?'background:var(--danger)':''}"></span></div></div>`;
 }).join(''):'<p class="empty">הוסף תקציב לקטגוריה כדי לעקוב אחריו.</p>';

 $('savingList').innerHTML=s.finance.savings.length?s.finance.savings.map(g=>{
  const pct=g.target>0?Math.min(100,Number(g.current)/Number(g.target)*100):0;
  return `<div class="goal-card"><div class="between"><b>${esc(g.title)} · ${g.scope==='family'?'משפחה':'עסק'}</b><button class="delete" data-del-saving="${esc(g.id)}" aria-label="מחק יעד חיסכון">×</button></div><div class="between"><span>${money(g.current)} מתוך ${money(g.target)}</span><b>${Math.round(pct)}%</b></div><div class="budget-track"><span style="width:${pct}%"></span></div></div>`;
 }).join(''):'<p class="empty">לא הוגדרו יעדי חיסכון.</p>';
}

function renderCalendar(){
 const mode=$('calendarMode').value||'day',date=$('calendarDate').value||nowDate();
 const events=[...s.events].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
 const evHtml=arr=>arr.length?arr.map(e=>`<div class="event-item"><div class="event-time">${esc(e.start||'כל היום')}${e.end?'–'+esc(e.end):''}</div><div class="event-detail"><b>${esc(e.title)}</b><small>${esc(e.type||'אישי')} · ${dateLabel(e.date)}${e.notes?' · '+esc(e.notes):''}</small></div><button class="delete" data-del-event="${esc(e.id)}" aria-label="מחק פעילות">×</button></div>`).join(''):'<p class="empty">אין פעילויות מתוכננות בתקופה הזו.</p>';
 let html='';
 if(mode==='day'){
  const arr=events.filter(e=>e.date===date);
  html=`<h3>${new Date(date+'T12:00:00').toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'})}</h3>${evHtml(arr)}`;
 }else if(mode==='week'){
  const d=new Date(date+'T12:00:00');
  const wd=(d.getDay()+6)%7;
  const start=new Date(d);
  start.setDate(d.getDate()-wd);
  const dates=Array.from({length:7},(_,i)=>{
   const x=new Date(start);
   x.setDate(start.getDate()+i);
   return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  });
  html='<div class="calendar-grid">'+dates.map(dt=>`<button class="calendar-day ${dt===date?'selected':''} ${events.some(e=>e.date===dt)?'has-event':''}" data-pick-date="${dt}">${new Date(dt+'T12:00:00').toLocaleDateString('he-IL',{weekday:'short'})}<br>${Number(dt.slice(-2))}</button>`).join('')+'</div>'+evHtml(events.filter(e=>dates.includes(e.date)));
 }else if(mode==='month'){
  const month=date.slice(0,7),[y,m]=month.split('-').map(Number);
  const first=new Date(y,m-1,1),offset=(first.getDay()+6)%7,count=new Date(y,m,0).getDate();
  const cells=Array.from({length:offset},()=>'<div></div>');
  for(let i=1;i<=count;i++){
   const dt=`${y}-${String(m).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
   cells.push(`<button class="calendar-day ${dt===date?'selected':''} ${events.some(e=>e.date===dt)?'has-event':''}" data-pick-date="${dt}">${i}</button>`);
  }
  html='<div class="calendar-grid">'+['ב׳','ג׳','ד׳','ה׳','ו׳','ש׳','א׳'].map((x,i)=>`<div class="muted small" style="text-align:center">${['ב','ג','ד','ה','ו','ש','א'][i]}</div>`).join('')+cells.join('')+'</div>'+evHtml(events.filter(e=>e.date?.startsWith(month)));
 }else{
  const year=Number(date.slice(0,4));
  html='<div class="year-list">'+Array.from({length:12},(_,i)=>{
   const month=`${year}-${String(i+1).padStart(2,'0')}`;
   const arr=events.filter(e=>e.date?.startsWith(month));
   const goals=s.goals.filter(g=>g.period==='month'&&g.month===month);
   return `<div class="year-month"><b>${new Date(year,i,1).toLocaleDateString('he-IL',{month:'long'})}</b><small class="muted">${arr.length} פעילויות · ${goals.length} יעדים</small>${goals.slice(0,2).map(g=>`<div class="small">◎ ${esc(g.title)}</div>`).join('')}</div>`;
  }).join('')+'</div>';
 }
 $('calendarContent').innerHTML=html;
}

function render(){renderTop();renderDaily();renderHabits();renderGoals();renderHistory();renderFinance();renderCalendar()}
function saveDaily(){
 s.daily[nowDate()]={task:$('task').value.trim(),minutes:$('minutes').value,when:$('when').value.trim(),first:$('first').value.trim()};
 save();
 toast('התוכנית להיום נשמרה.');
}
function promptText(){
 const d=s.daily[nowDate()]||{};
 return `פעל כמאמן אישי מעשי עבורי במסגרת "30 יום קדימה". עזור לי לבחור את הצעד הנכון בלי להציף אותי. ענה בעברית, ישירות ובאופן מעשי.
יעד מרכזי: ${s.goal||'לא הוגדר'}
למה חשוב: ${s.why||'לא צוין'}
המצב כרגע: ${$('situation').value}
משימת היום: ${d.task||'לא הוגדרה'}
צעד ראשון: ${d.first||'לא הוגדר'}
זמן שהוקצה: ${d.minutes||25} דקות
מתי: ${d.when||'לא צוין'}
משימות פתוחות: ${s.plans.filter(p=>!p.done).slice(0,8).map(p=>p.text).join('; ')||'אין'}
הצג פעולה אחת בעדיפות ראשונה, צעד ראשון של שתי דקות, ושאלה ממוקדת אחת אם חסר מידע.`;
}
async function prepare(open){
 const p=promptText();
 $('prompt').value=p;
 try{
  await navigator.clipboard.writeText(p);
  $('coachStatus').textContent='ההודעה הועתקה. הדבק אותה בשיחת ChatGPT.';
 }catch{
  $('coachStatus').textContent='ההודעה מוכנה בתיבה. אפשר לסמן ולהעתיק.';
 }
 if(open){
  const w=window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
  if(!w)toast('הדפדפן חסם פתיחת חלון. ההודעה מוכנה בתיבה.');
  else toast('נפתח ChatGPT. הדבק את ההודעה בשיחה.');
 }
}
function exportBackup(){
 const data={...s,exportedAt:new Date().toISOString(),app:'30-yom-backup-v3'};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;
 a.download=`30-yom-backup-${nowDate()}.json`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('backupStatus').textContent='קובץ הגיבוי ירד למכשיר. שמור אותו במקום בטוח.';
 toast('הגיבוי הורד');
}
function importBackup(file){
 if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const x=JSON.parse(reader.result);
   if(!x||typeof x!=='object'||(!Array.isArray(x.habits)&&!Array.isArray(x.finance?.transactions)))throw Error('invalid');
   if(!confirm('ייבוא הגיבוי יחליף את הנתונים הנוכחיים. מומלץ לייצא גיבוי לפני ההמשך. להמשיך?'))return;
   s={...defaultState(),...x,version:3};
   s.finance={transactions:[],budgets:[],savings:[],...(x.finance||{})};
   for(const k of ['transactions','budgets','savings'])if(!Array.isArray(s.finance[k]))s.finance[k]=[];
   s.events=Array.isArray(s.events)?s.events:[];
   save();
   render();
   $('backupStatus').textContent='הגיבוי נטען בהצלחה.';
   toast('הגיבוי שוחזר');
  }catch{
   $('backupStatus').textContent='הקובץ לא נראה כמו גיבוי תקין של האפליקציה.';
   toast('לא ניתן לטעון את הקובץ');
  }
 };
 reader.readAsText(file);
}

// ניווט בין המסכים
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));
 b.classList.add('active');
 $(b.dataset.view).classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});
}));

$('theme').onclick=()=>{
 s.theme=s.theme==='light'?'dark':'light';
 save();
 renderTop();
};
$('backupTop').onclick=exportBackup;
$('saveTask').onclick=saveDaily;
$('startTimer').onclick=()=>{
 saveDaily();
 $('timerBox').classList.remove('hidden');
 remaining=Number($('minutes').value)*60;
 showTimer();
};
let remaining=0,interval=null;
function showTimer(){
 $('timer').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
}
$('timerToggle').onclick=()=>{
 if(interval){
  clearInterval(interval);
  interval=null;
  $('timerToggle').textContent='המשך';
  return;
 }
 if(!remaining)remaining=Number($('minutes').value)*60;
 $('timerToggle').textContent='השהה';
 interval=setInterval(()=>{
  remaining--;
  showTimer();
  if(remaining<=0){
   clearInterval(interval);
   interval=null;
   $('timerToggle').textContent='התחל שוב';
   toast('הזמן הסתיים. מה הצלחת לבצע?');
  }
 },1000);
};
$('timerReset').onclick=()=>{
 clearInterval(interval);
 interval=null;
 remaining=Number($('minutes').value)*60;
 showTimer();
 $('timerToggle').textContent='התחל טיימר';
};

$('addHabit').onclick=()=>{
 const text=$('newHabit').value.trim();
 if(!text)return toast('כתוב הרגל לפני ההוספה.');
 s.habits.push({id:makeId(),text,done:false});
 $('newHabit').value='';
 save();
 renderHabits();
};
$('habits').onchange=e=>{
 if(e.target.dataset.habit){
  const h=s.habits.find(x=>x.id===e.target.dataset.habit);
  if(h)h.done=e.target.checked;
  save();
  renderHabits();
 }
};
$('habits').onclick=e=>{
 if(e.target.dataset.delHabit){
  s.habits=s.habits.filter(h=>h.id!==e.target.dataset.delHabit);
  save();
  renderHabits();
 }
};

$('ask').onclick=()=>prepare(true);
$('copy').onclick=()=>prepare(false);
$('saveGoal').onclick=()=>{
 s.goal=$('mainGoal').value.trim();
 s.why=$('why').value.trim();
 save();
 renderTop();
 toast('היעד נשמר');
};
$('addGoal').onclick=()=>{
 const title=$('goalTitle').value.trim();
 if(!title)return toast('כתוב יעד.');
 s.goals.push({id:makeId(),title,area:$('goalArea').value,period:$('goalPeriod').value,month:$('goalMonth').value,progress:0});
 $('goalTitle').value='';
 save();
 renderGoals();
 renderCalendar();
};
$('goalList').oninput=e=>{
 if(e.target.dataset.progress){
  const g=s.goals.find(x=>x.id===e.target.dataset.progress);
  if(g)g.progress=Number(e.target.value);
  save();
  const label=e.target.closest('.goal-card')?.querySelector('label span');
  if(label)label.textContent=g.progress+'%';
 }
};
$('goalList').onclick=e=>{
 if(e.target.dataset.delGoal){
  s.goals=s.goals.filter(g=>g.id!==e.target.dataset.delGoal);
  save();
  renderGoals();
  renderCalendar();
 }
};

$('calendarDate').value=nowDate();
$('eventDate').value=nowDate();
$('calendarMode').onchange=renderCalendar;
$('calendarDate').onchange=renderCalendar;
$('calendarContent').onclick=e=>{
 const b=e.target.closest('[data-pick-date]');
 if(b){
  $('calendarDate').value=b.dataset.pickDate;
  $('eventDate').value=b.dataset.pickDate;
  renderCalendar();
 }
 if(e.target.dataset.delEvent){
  s.events=s.events.filter(x=>x.id!==e.target.dataset.delEvent);
  save();
  renderCalendar();
 }
};
$('addEvent').onclick=()=>{
 const title=$('eventTitle').value.trim(),date=$('eventDate').value;
 if(!title||!date)return toast('צריך למלא שם ותאריך.');
 s.events.push({id:makeId(),title,date,start:$('eventStart').value,end:$('eventEnd').value,type:$('eventType').value,notes:$('eventNotes').value.trim()});
 save();
 $('eventTitle').value='';
 $('eventNotes').value='';
 $('calendarDate').value=date;
 renderCalendar();
 toast('הפעילות נוספה ליומן');
};

$('financeScope').value='family';
$('financeMonth').value=nowMonth();
$('txDate').value=nowDate();
$('budgetCategory').innerHTML=categories.expense.map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
document.querySelectorAll('input[name="transactionType"]').forEach(el=>el.onchange=fillCategories);
fillCategories();
$('financeScope').onchange=renderFinance;
$('financeMonth').onchange=renderFinance;
$('txFilterType').onchange=renderFinance;

$('addTransaction').onclick=()=>{
 const type=document.querySelector('input[name="transactionType"]:checked').value;
 const amount=Number($('txAmount').value),date=$('txDate').value;
 if(!Number.isFinite(amount)||amount<=0||!date)return toast('הזן סכום חיובי ותאריך תקין.');
 s.finance.transactions.push({id:makeId(),type,scope:$('txScope').value,amount:Math.round(amount*100)/100,category:$('txCategory').value,date,description:$('txDescription').value.trim(),status:$('txStatus').value,createdAt:new Date().toISOString()});
 save();
 $('txAmount').value='';
 $('txDescription').value='';
 $('txStatusMessage').textContent='התנועה נשמרה.';
 renderFinance();
 toast('התנועה נשמרה');
};
$('transactionList').onclick=e=>{
 if(e.target.dataset.delTx){
  if(!confirm('למחוק את התנועה הזו?'))return;
  s.finance.transactions=s.finance.transactions.filter(t=>t.id!==e.target.dataset.delTx);
  save();
  renderFinance();
 }
};

$('saveBudget').onclick=()=>{
 const limit=Number($('budgetLimit').value),scope=$('budgetScope').value,category=$('budgetCategory').value,month=selectedMonth();
 if(!Number.isFinite(limit)||limit<0)return toast('הזן תקציב תקין.');
 const existing=s.finance.budgets.find(b=>b.scope===scope&&b.category===category&&b.month===month);
 if(existing)existing.limit=limit;
 else s.finance.budgets.push({id:makeId(),scope,category,month,limit});
 save();
 $('budgetLimit').value='';
 renderFinance();
 toast('התקציב נשמר');
};
$('budgetList').onclick=e=>{
 if(e.target.dataset.delBudget){
  s.finance.budgets=s.finance.budgets.filter(b=>b.id!==e.target.dataset.delBudget);
  save();
  renderFinance();
 }
};

$('addSaving').onclick=()=>{
 const title=$('savingTitle').value.trim(),target=Number($('savingTarget').value),current=Number($('savingCurrent').value||0);
 if(!title||!Number.isFinite(target)||target<=0||!Number.isFinite(current)||current<0)return toast('בדוק את שם היעד והסכומים.');
 s.finance.savings.push({id:makeId(),title,scope:$('savingScope').value,target,current});
 save();
 $('savingTitle').value='';
 $('savingTarget').value='';
 $('savingCurrent').value='0';
 renderFinance();
 toast('יעד החיסכון נוסף');
};
$('savingList').onclick=e=>{
 if(e.target.dataset.delSaving){
  s.finance.savings=s.finance.savings.filter(g=>g.id!==e.target.dataset.delSaving);
  save();
  renderFinance();
 }
};

$('saveReview').onclick=()=>{
 const r={date:nowDate(),win:$('win').value.trim(),block:$('block').value.trim(),tomorrow:$('tomorrow').value.trim()};
 if(!r.win&&!r.block&&!r.tomorrow)return toast('כתוב לפחות דבר אחד.');
 s.reviews=s.reviews.filter(x=>x.date!==r.date);
 s.reviews.push(r);
 save();
 renderHistory();
 $('reviewStatus').textContent='הסיכום נשמר. מחר מתחילים בצעד הראשון.';
 toast('הסיכום נשמר');
};
$('export').onclick=exportBackup;
$('importBtn').onclick=()=>$('importFile').click();
$('importFile').onchange=e=>{
 importBackup(e.target.files?.[0]);
 e.target.value='';
};

if(s.active!==nowDate()){
 s.active=nowDate();
 s.habits.forEach(h=>h.done=false);
 save();
}
render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http')){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
})();
