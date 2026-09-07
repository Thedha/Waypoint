/* ===================== data + date helpers ===================== */
const STORAGE_KEY = 'waypoint-goals-v1';
const WEEKDAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const WEEKDAY_MIN = ['S','M','T','W','T','F','S'];

function pad(n){ return n.toString().padStart(2,'0'); }
function dateKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function startOfDay(d){ const nd = new Date(d); nd.setHours(0,0,0,0); return nd; }
function addDays(d,n){ const nd = new Date(d); nd.setDate(nd.getDate()+n); return nd; }
function startOfWeek(d){ const nd = startOfDay(d); nd.setDate(nd.getDate()-nd.getDay()); return nd; }
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function isSameDay(a,b){ return dateKey(a)===dateKey(b); }
function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36); }
function escapeHtml(s){
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function fmtDay(d, today){
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, addDays(today,-1))) return 'Yesterday';
  if (isSameDay(d, addDays(today,1))) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
}
function scheduleLabel(schedule){
  if (schedule.type==='daily') return 'Every day';
  if (schedule.type==='weekly'){
    if (schedule.days.length===7) return 'Every day';
    if (schedule.days.length===0) return 'No days selected';
    return schedule.days.slice().sort((a,b)=>a-b).map(d=>WEEKDAY_FULL[d].slice(0,3)).join(', ');
  }
  if (schedule.type==='once'){
    const d = new Date(schedule.date + 'T00:00:00');
    return `Once \u00b7 ${d.toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric' })}`;
  }
  return '';
}
function isScheduledOn(cp, date){
  const s = cp.schedule;
  if (s.type==='daily') return true;
  if (s.type==='weekly') return s.days.includes(date.getDay());
  if (s.type==='once') return dateKey(date)===s.date;
  return false;
}
function dayStats(goal, date){
  let scheduled=0, completed=0;
  for (const cp of goal.checkpoints){
    if (isScheduledOn(cp, date)){
      scheduled++;
      if (cp.completions[dateKey(date)]) completed++;
    }
  }
  return { scheduled, completed };
}
function graphCellClass(stats, isFuture){
  if (isFuture) return 'cell future';
  if (stats.scheduled===0) return 'cell level-none';
  const ratio = stats.completed/stats.scheduled;
  if (ratio===0) return 'cell level-0';
  if (ratio<0.34) return 'cell level-1';
  if (ratio<0.67) return 'cell level-2';
  if (ratio<1) return 'cell level-3';
  return 'cell level-4';
}

/* ===================== storage ===================== */
function loadGoals(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function saveGoals(goals){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); }
  catch(e){ console.error('Save failed', e); }
}

/* ===================== icons (small inline svg) ===================== */
const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><polyline points="4 6 5 7 6.5 5"/><polyline points="4 12 5 13 6.5 11"/><polyline points="4 18 5 19 6.5 17"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M16 13l-2.5 2.5L12 14"/></svg>',
};

/* ===================== app state ===================== */
const state = {
  goals: loadGoals(),
  tab: 'agenda',        // 'agenda' | 'goals'
  selectedGoalId: null,
  modal: null,           // null | 'addGoal' | 'addCheckpoint' | 'confirmDeleteGoal'
  agendaRange: 'today',  // 'today' | 'week' | 'month'
};
const today = startOfDay(new Date());

// scratch state for the currently-open checkpoint form (not persisted)
const cpForm = { mode: 'weekly', days: [], onceDate: dateKey(today) };

function persistGoals(next){ state.goals = next; saveGoals(next); render(); }

/* ===================== rendering: consistency graph ===================== */
function renderGraph(goal, weeks){
  const start = startOfWeek(addDays(today, -7*(weeks-1)));
  let cols = '';
  for (let w=0; w<weeks; w++){
    let col = '';
    for (let d=0; d<7; d++){
      const date = addDays(start, w*7+d);
      const isFuture = date > today;
      const stats = dayStats(goal, date);
      const cls = graphCellClass(stats, isFuture);
      const title = isFuture ? '' : `title="${date.toDateString()}: ${stats.completed}/${stats.scheduled}"`;
      col += `<div class="${cls}" ${title}></div>`;
    }
    cols += `<div class="graph-col">${col}</div>`;
  }
  return `<div class="graph">${cols}</div>`;
}

/* ===================== rendering: bottom nav ===================== */
function renderBottomNav(){
  return `
  <div class="bottom-nav">
    <button class="nav-btn ${state.tab==='agenda'?'active':''}" data-action="set-tab" data-tab="agenda">
      <span class="icon">${ICONS.list}</span><span>Checkpoints</span>
    </button>
    <button class="nav-btn ${state.tab==='goals'?'active':''}" data-action="set-tab" data-tab="goals">
      <span class="icon">${ICONS.target}</span><span>Goals</span>
    </button>
  </div>`;
}

/* ===================== rendering: goals list ===================== */
function renderGoalsList(){
  const goals = state.goals;
  const empty = goals.length===0 ? `
    <div class="empty-state">Nothing here yet. Add a goal, decide how you'll get there, and how you'll know you've made it.</div>
  ` : '';

  const cards = goals.map(goal=>{
    const totalCp = goal.checkpoints.length;
    const dueToday = goal.checkpoints.filter(cp=>isScheduledOn(cp, today)).length;
    const doneToday = goal.checkpoints.filter(cp=>isScheduledOn(cp, today) && cp.completions[dateKey(today)]).length;
    const sub = totalCp===0 ? 'No checkpoints yet' : dueToday>0 ? `${doneToday}/${dueToday} due today` : `${totalCp} checkpoint${totalCp>1?'s':''}`;
    return `
    <button class="goal-card" data-action="open-goal" data-id="${goal.id}">
      <div class="goal-card-title">${escapeHtml(goal.title)}</div>
      <div class="goal-card-sub">${sub}</div>
      <div class="goal-card-graph">${renderGraph(goal, 10)}</div>
    </button>`;
  }).join('');

  return `
  <div class="page">
    <div class="page-header"><h1>Goals</h1></div>
    ${empty}
    <div class="goal-list">${cards}</div>
  </div>
  <button class="fab" data-action="open-modal" data-modal="addGoal">${ICONS.plus}</button>
  `;
}

/* ===================== rendering: agenda ===================== */
function buildDayGroups(){
  let dates = [];
  if (state.agendaRange==='today') dates = [today];
  else if (state.agendaRange==='week'){
    const start = startOfWeek(today);
    dates = Array.from({length:7}, (_,i)=>addDays(start,i));
  } else {
    const start = startOfMonth(today);
    const days = endOfMonth(today).getDate();
    dates = Array.from({length:days}, (_,i)=>addDays(start,i));
  }
  let groups = dates.map(date=>{
    const items = [];
    for (const goal of state.goals){
      for (const cp of goal.checkpoints){
        if (isScheduledOn(cp, date)) items.push({ goal, cp });
      }
    }
    return { date, items };
  });
  if (state.agendaRange==='month') groups = groups.filter(g=>g.items.length>0);
  return groups;
}

function renderAgenda(){
  const groups = buildDayGroups();
  const allEmpty = groups.every(g=>g.items.length===0);

  const tabs = ['today','week','month'].map(key=>{
    const label = key==='today'?'Day':key==='week'?'Week':'Month';
    return `<button class="seg-btn ${state.agendaRange===key?'active':''}" data-action="set-range" data-range="${key}">${label}</button>`;
  }).join('');

  const empty = allEmpty ? `<div class="empty-state">Nothing scheduled for this ${state.agendaRange==='today'?'day':state.agendaRange}.</div>` : '';

  const days = groups.map(({date, items})=>{
    if (state.agendaRange==='month' && items.length===0) return '';
    const isFuture = date > today;
    const isPast = date < today && !isSameDay(date, today);
    const dayLabel = fmtDay(date, today);
    const rows = items.length===0 ? `<div class="agenda-empty-row">Nothing scheduled</div>` : items.map(({goal, cp})=>{
      const done = !!cp.completions[dateKey(date)];
      let stateCls = isFuture ? 'disabled' : done ? 'done' : isPast ? 'missed' : '';
      return `
      <div class="agenda-row">
        <button class="circle ${stateCls}" ${isFuture?'disabled':''} data-action="toggle" data-goal="${goal.id}" data-cp="${cp.id}" data-date="${dateKey(date)}">
          ${ICONS.check}
        </button>
        <div class="agenda-row-text">
          <div class="agenda-row-title ${done?'done':''}">${escapeHtml(cp.title)}</div>
          <div class="agenda-row-goal">${escapeHtml(goal.title)}</div>
        </div>
      </div>`;
    }).join('');
    return `
    <div class="agenda-day">
      <div class="agenda-day-label ${isSameDay(date,today)?'today':''}">${dayLabel}</div>
      ${rows}
    </div>`;
  }).join('');

  return `
  <div class="page">
    <div class="page-header"><h1>Checkpoints</h1></div>
    <div class="segmented">${tabs}</div>
    ${empty}
    <div class="agenda-list">${days}</div>
  </div>`;
}

/* ===================== rendering: goal detail ===================== */
function renderGoalDetail(goal){
  const todayKey = dateKey(today);
  const rows = goal.checkpoints.length===0 ? `
    <div class="empty-state small">No checkpoints yet. Add one to start tracking.</div>
  ` : goal.checkpoints.map(cp=>{
    const doneToday = !!cp.completions[todayKey];
    const scheduledToday = isScheduledOn(cp, today);
    const cls = !scheduledToday ? 'disabled' : doneToday ? 'done' : '';
    return `
    <div class="cp-row">
      <button class="circle ${cls}" ${!scheduledToday?'disabled':''} data-action="toggle" data-goal="${goal.id}" data-cp="${cp.id}" data-date="${todayKey}">
        ${ICONS.check}
      </button>
      <div class="cp-row-text">
        <div class="cp-row-title">${escapeHtml(cp.title)}</div>
        <div class="cp-row-sub">${escapeHtml(scheduleLabel(cp.schedule))}</div>
      </div>
      <button class="icon-btn muted" data-action="delete-checkpoint" data-goal="${goal.id}" data-cp="${cp.id}">${ICONS.trash}</button>
    </div>`;
  }).join('');

  const strategy = goal.strategy ? `
    <div class="detail-row">
      <span class="icon accent">${ICONS.repeat}</span>
      <div><div class="detail-label">How you'll get there</div><div class="detail-text">${escapeHtml(goal.strategy)}</div></div>
    </div>` : '';
  const metric = goal.metric ? `
    <div class="detail-row">
      <span class="icon amber">${ICONS.flag}</span>
      <div><div class="detail-label">Success looks like</div><div class="detail-text">${escapeHtml(goal.metric)}</div></div>
    </div>` : '';

  return `
  <div class="page detail">
    <div class="detail-topbar">
      <button class="icon-btn" data-action="back">${ICONS.back}</button>
      <div class="spacer"></div>
      <button class="icon-btn muted" data-action="open-modal" data-modal="confirmDeleteGoal">${ICONS.trash}</button>
    </div>
    <div class="detail-body">
      <h1 class="detail-title">${escapeHtml(goal.title)}</h1>
      ${strategy}
      ${metric}
      <div class="graph-section">
        <div class="section-label">Consistency \u00b7 last 14 weeks</div>
        ${renderGraph(goal, 14)}
      </div>
      <div class="section-header">
        <span class="section-label">Checkpoints</span>
        <button class="link-btn" data-action="open-modal" data-modal="addCheckpoint">${ICONS.plus} Add</button>
      </div>
      <div class="cp-list">${rows}</div>
    </div>
  </div>`;
}

/* ===================== rendering: modals ===================== */
function renderModal(){
  if (!state.modal) return '';
  if (state.modal === 'addGoal') return renderGoalFormModal();
  if (state.modal === 'addCheckpoint') return renderCheckpointFormModal();
  if (state.modal === 'confirmDeleteGoal') return renderConfirmDeleteModal();
  return '';
}

function renderGoalFormModal(){
  return `
  <div class="overlay" data-action="close-modal">
    <div class="sheet" data-stop>
      <div class="sheet-header">
        <h2>New goal</h2>
        <button class="icon-btn muted" data-action="close-modal">${ICONS.x}</button>
      </div>
      <label class="field">
        <span>What do you want to achieve?</span>
        <input id="f-title" class="input" placeholder="Run a 5k in under 20 minutes" autofocus />
      </label>
      <label class="field">
        <span>How will you achieve it?</span>
        <textarea id="f-strategy" class="input" rows="2" placeholder="Run consistently until race day"></textarea>
      </label>
      <label class="field">
        <span>How will you measure success?</span>
        <textarea id="f-metric" class="input" rows="2" placeholder="When I run the race in under 20 minutes"></textarea>
      </label>
      <button class="btn-primary" data-action="save-goal">Create goal</button>
    </div>
  </div>`;
}

function renderCheckpointFormModal(){
  const dayBtns = WEEKDAY_MIN.map((label,i)=>`<button class="day-pill ${cpForm.days.includes(i)?'active':''}" data-action="toggle-day" data-day="${i}">${label}</button>`).join('');
  return `
  <div class="overlay" data-action="close-modal">
    <div class="sheet" data-stop>
      <div class="sheet-header">
        <h2>New checkpoint</h2>
        <button class="icon-btn muted" data-action="close-modal">${ICONS.x}</button>
      </div>
      <label class="field">
        <span>What's the checkpoint?</span>
        <input id="f-cp-title" class="input" placeholder="Training run" autofocus />
      </label>
      <span class="field-label">Schedule</span>
      <div class="mode-toggle">
        <button class="mode-btn ${cpForm.mode==='weekly'?'active':''}" data-action="set-cp-mode" data-mode="weekly">${ICONS.repeat} Recurring</button>
        <button class="mode-btn ${cpForm.mode==='once'?'active':''}" data-action="set-cp-mode" data-mode="once">${ICONS.clock} One-time</button>
      </div>
      <div id="cp-weekly-section" class="${cpForm.mode==='weekly'?'':'hidden'}">
        <div class="day-pills">${dayBtns}</div>
      </div>
      <div id="cp-once-section" class="${cpForm.mode==='once'?'':'hidden'}">
        <label class="field">
          <span>Date</span>
          <input id="f-cp-date" type="date" class="input" value="${cpForm.onceDate}" />
        </label>
      </div>
      <button class="btn-primary" data-action="save-checkpoint">Add checkpoint</button>
    </div>
  </div>`;
}

function renderConfirmDeleteModal(){
  const goal = state.goals.find(g=>g.id===state.selectedGoalId);
  if (!goal) return '';
  return `
  <div class="overlay" data-action="close-modal">
    <div class="confirm-box" data-stop>
      <div class="confirm-text">Delete "${escapeHtml(goal.title)}" and all of its checkpoints? This can't be undone.</div>
      <div class="confirm-actions">
        <button class="btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn-danger" data-action="delete-goal" data-id="${goal.id}">Delete</button>
      </div>
    </div>
  </div>`;
}

/* ===================== main render ===================== */
function render(){
  const root = document.getElementById('app');
  const goal = state.goals.find(g=>g.id===state.selectedGoalId);
  let html = '';
  if (goal){
    html = renderGoalDetail(goal);
  } else if (state.tab==='agenda'){
    html = renderAgenda() + renderBottomNav();
  } else {
    html = renderGoalsList() + renderBottomNav();
  }
  html += renderModal();
  root.innerHTML = html;
}

function focusFirstField(){
  // Must run synchronously in the same tap/click handler as the modal open —
  // iOS Safari will only pop the keyboard for a .focus() call that's still
  // tied to the user gesture. Any setTimeout/delay breaks that link.
  const field = document.querySelector('.sheet input, .sheet textarea');
  if (field) field.focus({ preventScroll: true });
}

/* ===================== event delegation ===================== */
document.addEventListener('DOMContentLoaded', ()=>{
  const root = document.getElementById('app');

  // keep the focused field visible above the iOS keyboard
  root.addEventListener('focusin', (e)=>{
    if (e.target.matches('input, textarea')){
      setTimeout(()=>{
        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 300);
    }
  });

  root.addEventListener('click', (e)=>{
    // clicking the overlay background (not the sheet) closes the modal
    const overlay = e.target.closest('.overlay');
    if (overlay && e.target === overlay){
      state.modal = null; render(); return;
    }

    const el = e.target.closest('[data-action]');
    if (!el) return;

    // if the click happened inside a data-stop container (the sheet/confirm box)
    // but the matched action element lives outside it (e.g. the overlay), ignore it —
    // that's the "closest() climbed past the sheet" bug that closed the modal on tap.
    const stopEl = e.target.closest('[data-stop]');
    if (stopEl && !stopEl.contains(el)) return;

    const action = el.dataset.action;

    switch(action){
      case 'set-tab':
        state.tab = el.dataset.tab; render(); break;

      case 'set-range':
        state.agendaRange = el.dataset.range; render(); break;

      case 'open-goal':
        state.selectedGoalId = el.dataset.id; render(); break;

      case 'back':
        state.selectedGoalId = null; render(); break;

      case 'open-modal':
        state.modal = el.dataset.modal;
        if (state.modal === 'addCheckpoint'){
          cpForm.mode = 'weekly'; cpForm.days = []; cpForm.onceDate = dateKey(today);
        }
        render();
        focusFirstField();
        break;

      case 'close-modal':
        state.modal = null; render(); break;

      case 'save-goal': {
        const title = document.getElementById('f-title').value.trim();
        if (!title) return;
        const strategy = document.getElementById('f-strategy').value.trim();
        const metric = document.getElementById('f-metric').value.trim();
        const newGoal = { id: uid(), title, strategy, metric, checkpoints: [] };
        state.modal = null;
        persistGoals([newGoal, ...state.goals]);
        break;
      }

      case 'delete-goal': {
        const id = el.dataset.id;
        state.modal = null;
        state.selectedGoalId = null;
        persistGoals(state.goals.filter(g=>g.id!==id));
        break;
      }

      case 'set-cp-mode': {
        cpForm.mode = el.dataset.mode;
        document.getElementById('cp-weekly-section').classList.toggle('hidden', cpForm.mode!=='weekly');
        document.getElementById('cp-once-section').classList.toggle('hidden', cpForm.mode!=='once');
        el.parentElement.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
        el.classList.add('active');
        break;
      }

      case 'toggle-day': {
        const day = parseInt(el.dataset.day, 10);
        const idx = cpForm.days.indexOf(day);
        if (idx>=0) cpForm.days.splice(idx,1); else cpForm.days.push(day);
        el.classList.toggle('active');
        break;
      }

      case 'save-checkpoint': {
        const title = document.getElementById('f-cp-title').value.trim();
        if (!title) return;
        let schedule;
        if (cpForm.mode==='once'){
          const dateVal = document.getElementById('f-cp-date').value;
          schedule = { type:'once', date: dateVal || dateKey(today) };
        } else {
          if (cpForm.days.length===0) return;
          schedule = { type:'weekly', days: cpForm.days.slice().sort() };
        }
        const cp = { id: uid(), title, schedule, completions: {} };
        const goalId = state.selectedGoalId;
        state.modal = null;
        persistGoals(state.goals.map(g=> g.id===goalId ? { ...g, checkpoints:[...g.checkpoints, cp] } : g));
        break;
      }

      case 'delete-checkpoint': {
        const goalId = el.dataset.goal, cpId = el.dataset.cp;
        persistGoals(state.goals.map(g=> g.id===goalId ? { ...g, checkpoints: g.checkpoints.filter(c=>c.id!==cpId) } : g));
        break;
      }

      case 'toggle': {
        const goalId = el.dataset.goal, cpId = el.dataset.cp, dKey = el.dataset.date;
        const next = state.goals.map(g=>{
          if (g.id!==goalId) return g;
          return { ...g, checkpoints: g.checkpoints.map(c=>{
            if (c.id!==cpId) return c;
            const completions = { ...c.completions };
            if (completions[dKey]) delete completions[dKey]; else completions[dKey]=true;
            return { ...c, completions };
          })};
        });
        persistGoals(next);
        break;
      }
    }
  });

  render();

  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});
