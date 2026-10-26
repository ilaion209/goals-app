
(() => {
const $=id=>document.getElementById(id), KEY='30days-forward-v2';
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const defaults=()=>({theme:'dark',start:today(),active:today(),goal:'',why:'',daily:{},habits:[{id:'prayer',text:'תפילה ולימוד לפי השגרה שלי',done:false},{id:'family',text:'זמן נוכח עם המשפחה בלי טלפון',done:false},{id:'health',text:'תנועה או בחירה טובה לבריאות',done:false}],plans:[],goals:[],reviews:[]});
let s;
try{s={...defaults(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{s=defaults()}
s.habits=Array.isArray(s.habits)?s.habits:defaults().habits;
s.plans=Array.isArray(s.plans)?s.plans:[];
s.goals=Array.isArray(s.goals)?s.goals:[];
s.reviews=Array.isArray(s.reviews)?s.reviews:[];
s.daily=s.daily||{};

const save=()=>localStorage.setItem(KEY,JSON.stringify(s));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){
  $('toast').textContent=t;
  $('toast').classList.add('show');
  clearTimeout(toast.t);
  toast.t=setTimeout(()=>$('toast').classList.remove('show'),2400);
}
function day(){
  return Math.max(1,Math.min(30,Math.floor(
    (new Date(today()+'T12:00:00')-new Date(s.start+'T12:00:00'))/86400000
  )+1));
}
function render(){
  document.body.classList.toggle('light',s.theme==='light');
  $('theme').textContent=s.theme==='light'?'☾':'◐';
  $('dateLabel').textContent=new Date().toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'});
  $('dayLabel').textContent=`יום ${day()} מתוך 30`;
  $('progress').style.width=day()/30*100+'%';
  $('goalStatus').textContent=s.goal?'יעד מוגדר':'צריך לבחור יעד';
  $('mainGoal').value=s.goal;
  $('why').value=s.why;

  const d=s.daily[today()]||{};
  $('task').value=d.task||'';
  $('minutes').value=d.minutes||'25';
  $('when').value=d.when||'';
  $('first').value=d.first||'';

  $('habits').innerHTML=s.habits.map(h=>`
    <label class="habit ${h.done?'done':''}">
      <input type="checkbox" data-habit="${esc(h.id)}" ${h.done?'checked':''}>
      <span>${esc(h.text)}</span>
      <button class="delete" data-del-habit="${esc(h.id)}" aria-label="מחק">×</button>
    </label>`).join('');

  $('planList').innerHTML=s.plans.length?s.plans.map(p=>`
    <div class="planitem ${p.done?'done':''}">
      <input type="checkbox" data-plan="${esc(p.id)}" ${p.done?'checked':''}>
      <span>${esc(p.text)}<small class="muted"> · ${esc(p.area)}</small></span>
      <button class="delete" data-del-plan="${esc(p.id)}">×</button>
    </div>`).join(''):'<p class="muted">הוסף פעולה אחת שאפשר לבצע.</p>';

  $('goalList').innerHTML=s.goals.length?s.goals.map(g=>`
    <div class="goalitem">
      <b>${esc(g.title)}</b>
      <button class="delete" data-del-goal="${esc(g.id)}">×</button>
      <p class="muted">${esc(g.area)} · ${g.progress||0}%</p>
      <input type="range" min="0" max="100" step="5" value="${g.progress||0}" data-progress="${esc(g.id)}">
    </div>`).join(''):'<p class="muted">הוסף יעד קטן לתחום שחשוב לך.</p>';

  $('history').innerHTML=s.reviews.length?[...s.reviews]
    .sort((a,b)=>b.date.localeCompare(a.date))
    .map(r=>`
      <div class="historyitem">
        <b>${esc(r.date)}</b>
        <p><b>התקדמות:</b> ${esc(r.win||'לא צוין')}</p>
        <p><b>חסם:</b> ${esc(r.block||'לא צוין')}</p>
        <p><b>מחר:</b> ${esc(r.tomorrow||'לא צוין')}</p>
      </div>`).join(''):'<p class="muted">הסיכומים שלך יופיעו כאן.</p>';
}

function saveDaily(){
  s.daily[today()]={
    task:$('task').value.trim(),
    minutes:$('minutes').value,
    when:$('when').value.trim(),
    first:$('first').value.trim()
  };
  save();
  toast('התוכנית להיום נשמרה.');
}

function promptText(){
  const d=s.daily[today()]||{};
  return `פעל כמאמן אישי מעשי עבורי במסגרת "30 יום קדימה". עזור לי לבחור מה הדבר הנכון לעשות עכשיו בלי להציף אותי ובלי סיסמאות.

הנחיות: התחשב במידע ואל תמציא. אם חסר פרט קריטי, שאל שאלה ממוקדת אחת. אחרת הצע פעולה אחת בעדיפות ראשונה, הסבר בקצרה למה, פרק אותה לצעד ראשון של 2 דקות, וסיים בשאלה שמקדמת אותי לביצוע. אם היום השתבש, בנה תוכנית מינימלית שאפשר להציל.

היעד המרכזי: ${s.goal||'לא הוגדר'}
למה חשוב: ${s.why||'לא צוין'}
המצב כרגע: ${$('situation').value}
המשימה היום: ${d.task||'לא הוגדרה'}
הצעד הראשון: ${d.first||'לא הוגדר'}
זמן שהוקצה: ${d.minutes||25} דקות
מתי: ${d.when||'לא צוין'}
עוגנים: ${s.habits.map(h=>`${h.text} (${h.done?'בוצע':'לא בוצע'})`).join('; ')}
משימות פתוחות: ${s.plans.filter(p=>!p.done).slice(0,8).map(p=>p.text+' ('+p.area+')').join('; ')||'אין'}
סיכומים אחרונים: ${s.reviews.slice(-3).map(r=>r.date+': '+r.win+'; חסם: '+r.block+'; מחר: '+r.tomorrow).join('\n')||'אין'}

ענה בעברית, ישירות ובאופן מעשי.`;
}

async function prepare(open){
  const p=promptText();
  $('prompt').value=p;
  let copied=false;
  try{
    await navigator.clipboard.writeText(p);
    copied=true;
  }catch{
    try{
      $('prompt').focus();
      $('prompt').select();
      copied=document.execCommand('copy');
    }catch{}
  }
  $('coachStatus').textContent=copied
    ?'ההודעה הועתקה. הדבק אותה בשיחת ChatGPT.'
    :'ההודעה מוכנה בתיבה. סמן והעתק אותה ידנית.';

  if(open){
    const w=window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
    if(!w)toast('הדפדפן חסם פתיחת חלון. ההודעה מוכנה להעתקה.');
    else toast(copied?'נפתח ChatGPT. הדבק את ההודעה בשיחה.':'נפתח ChatGPT. העתק את ההודעה מהתיבה.');
  }else{
    toast(copied?'ההודעה הועתקה.':'העתק את ההודעה מהתיבה.');
  }
}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  $(b.dataset.view).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
});

$('theme').onclick=()=>{
  s.theme=s.theme==='light'?'dark':'light';
  save();
  render();
};

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
  if(!text)return toast('כתוב עוגן לפני ההוספה.');
  s.habits.push({id:id(),text,done:false});
  $('newHabit').value='';
  save();
  render();
};

$('habits').onchange=e=>{
  if(e.target.dataset.habit){
    const h=s.habits.find(x=>x.id===e.target.dataset.habit);
    if(h)h.done=e.target.checked;
    save();
    render();
  }
};

$('habits').onclick=e=>{
  if(e.target.dataset.delHabit){
    s.habits=s.habits.filter(h=>h.id!==e.target.dataset.delHabit);
    save();
    render();
  }
};

$('ask').onclick=()=>prepare(true);
$('copy').onclick=()=>prepare(false);

$('addPlan').onclick=()=>{
  const text=$('newPlan').value.trim();
  if(!text)return toast('כתוב משימה.');
  s.plans.push({id:id(),text,area:$('area').value,done:false});
  $('newPlan').value='';
  save();
  render();
};

$('planList').onchange=e=>{
  if(e.target.dataset.plan){
    const p=s.plans.find(x=>x.id===e.target.dataset.plan);
    if(p)p.done=e.target.checked;
    save();
    render();
  }
};

$('planList').onclick=e=>{
  if(e.target.dataset.delPlan){
    s.plans=s.plans.filter(p=>p.id!==e.target.dataset.delPlan);
    save();
    render();
  }
};

$('saveGoal').onclick=()=>{
  s.goal=$('mainGoal').value.trim();
  s.why=$('why').value.trim();
  save();
  render();
  toast('היעד נשמר');
};

$('addGoal').onclick=()=>{
  const title=$('goalTitle').value.trim();
  if(!title)return toast('כתוב יעד.');
  s.goals.push({id:id(),title,area:$('goalArea').value,progress:0});
  $('goalTitle').value='';
  save();
  render();
};

$('goalList').oninput=e=>{
  if(e.target.dataset.progress){
    const g=s.goals.find(x=>x.id===e.target.dataset.progress);
    if(g)g.progress=Number(e.target.value);
    save();
    render();
  }
};

$('goalList').onclick=e=>{
  if(e.target.dataset.delGoal){
    s.goals=s.goals.filter(g=>g.id!==e.target.dataset.delGoal);
    save();
    render();
  }
};

$('saveReview').onclick=()=>{
  const r={
    date:today(),
    win:$('win').value.trim(),
    block:$('block').value.trim(),
    tomorrow:$('tomorrow').value.trim()
  };
  if(!r.win&&!r.block&&!r.tomorrow)return toast('כתוב לפחות דבר אחד.');
  s.reviews=s.reviews.filter(x=>x.date!==r.date);
  s.reviews.push(r);
  save();
  render();
  $('reviewStatus').textContent='הסיכום נשמר. מחר מתחילים מהצעד הראשון.';
  toast('הסיכום נשמר');
};

$('export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;
  a.download='30-yom-backup-'+today()+'.json';
  a.click();
  URL.revokeObjectURL(url);
};

$('importBtn').onclick=()=>$('importFile').click();

$('importFile').onchange=async e=>{
  try{
    const x=JSON.parse(await e.target.files[0].text());
    if(!x||!Array.isArray(x.habits))throw Error();
    s={...defaults(),...x};
    save();
    render();
    toast('הגיבוי נטען');
  }catch{
    toast('הקובץ אינו גיבוי תקין');
  }
  e.target.value='';
};

if(s.active!==today()){
  s.active=today();
  s.habits.forEach(h=>h.done=false);
  save();
}

render();

if('serviceWorker'in navigator&&location.protocol.startsWith('http')){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
})();
