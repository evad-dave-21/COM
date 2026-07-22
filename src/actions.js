  function toggleTask(dayKey, taskId) {
    if (!state.completions[dayKey]) state.completions[dayKey] = {};
    state.completions[dayKey][taskId] = !state.completions[dayKey][taskId];
    markVisited(dayKey);
    save();

    // Check if all done → flash
    const tasks = getTasksForDay(dayKey);
    const done = tasks.filter(t => state.completions[dayKey]?.[t.id]).length;
    if (done === tasks.length && tasks.length > 0) {
      document.getElementById('complete-flash').classList.remove('show');
      void document.getElementById('complete-flash').offsetWidth;
      document.getElementById('complete-flash').classList.add('show');
    }
    render();
  }


  function addDefaultTask() {
    const input = document.getElementById('new-default-input');
    const label = input.value.trim();
    if (!label) return;
    state.defaultTasks.push({ id: 'def_' + Date.now(), label });
    input.value = '';
    save();
    render();
  }


  function removeDefaultTask(id) {
    state.defaultTasks = state.defaultTasks.filter(t => t.id !== id);
    save(); render();
  }


  function addCustomTask(dayKey, inputId) {
    const input = document.getElementById(inputId);
    const label = input.value.trim();
    if (!label) return;
    if (!state.customDayTasks[dayKey]) state.customDayTasks[dayKey] = [];
    state.customDayTasks[dayKey].push({ id: 'cust_' + Date.now(), label });
    markVisited(dayKey);
    input.value = '';
    save(); render();
  }


  function removeCustomTask(dayKey, taskId) {
    if (!state.customDayTasks[dayKey]) return;
    state.customDayTasks[dayKey] = state.customDayTasks[dayKey].filter(t => t.id !== taskId);
    save(); render();
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  function showAddRow(dayKey, inputId, rowId, btnId) {
    document.getElementById(rowId).style.display = 'flex';
    document.getElementById(btnId).style.display = 'none';
    setTimeout(() => document.getElementById(inputId)?.focus(), 50);
  }


  function hideAddRow(inputId, rowId, btnId) {
    document.getElementById(rowId).style.display = 'none';
    document.getElementById(btnId).style.display = 'block';
    document.getElementById(inputId).value = '';
  }


  function switchView(view) {
    currentView = view;
    ['view-today','view-month','view-settings'].forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    const map = { today: 'view-today', month: 'view-month', settings: 'view-settings' };
    document.getElementById(map[view]).style.display = 'block';
    document.querySelectorAll('nav button')[['today','month','settings'].indexOf(view)].classList.add('active');
    render();
  }


  function shiftMonth(dir) {
    calMonth += dir;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    if (calMonth > 11) { calMonth = 0; calYear++; }
    selectedDayKey = null;
    render();
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  function selectDay(key) {
    selectedDayKey = selectedDayKey === key ? null : key;
    render();
  }
