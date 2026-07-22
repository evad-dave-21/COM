  const STORAGE_KEY = 'minja_chronicles_v2';
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let state = { defaultTasks: [], completions: {}, customDayTasks: {}, visitedDays: {} };
  let calYear, calMonth, selectedDayKey = null;
  let currentView = 'today';

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // ── Storage ──────────────────────────────────────────────────────────────────

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = { visitedDays: {}, ...parsed };
      }
    } catch(e) {}
  }


  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }


  function dateKey(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }


  function markVisited(key) {
    if (!state.visitedDays[key]) {
      state.visitedDays[key] = true;
      save();
    }
  }

  // ── Task helpers ─────────────────────────────────────────────────────────────

  function getTasksForDay(key) {
    const defaults = state.defaultTasks.map(t => ({...t, isDefault: true}));
    const custom = (state.customDayTasks[key] || []).map(t => ({...t, isDefault: false}));
    return [...defaults, ...custom];
  }


  function getDayProgress(key) {
    const tasks = getTasksForDay(key);
    if (!tasks.length) return null;
    const done = tasks.filter(t => state.completions[key]?.[t.id]).length;
    return { done, total: tasks.length };
  }


  function isNotVisited(key) {
    // Past days only (not today, not future)
    const [y, m, d] = key.split('-').map(Number);
    const cellDate = new Date(y, m - 1, d);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (cellDate >= todayDate) return false;

    const visited = state.visitedDays[key];
    const prog = getDayProgress(key);
    const hasChecked = prog && prog.done > 0;
    return !visited && !hasChecked;
  }


  function getStreak() {
    let streak = 0;
    const d = new Date(today);
    // Don't count today in streak (it's ongoing)
    d.setDate(d.getDate() - 1);
    while (true) {
      const k = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
      const prog = getDayProgress(k);
      const visited = state.visitedDays[k];
      if (!visited && (!prog || prog.done === 0)) break;
      streak++;
      d.setDate(d.getDate() - 1);
      if (streak > 365) break;
    }
    return streak;
  }

