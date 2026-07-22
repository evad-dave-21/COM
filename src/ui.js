  function renderTaskList(container, dayKey, tasks, showAddBtn) {
    const completions = state.completions[dayKey] || {};
    const done = tasks.filter(t => completions[t.id]).length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const complete = pct === 100 && tasks.length > 0;
    const notVisited = isNotVisited(dayKey);

    let html = '';

    if (notVisited) {
      html += `
        <div class="not-visited-badge">
          <div class="nv-dot"></div>
          <div>
            <div class="nv-text">NOT VISITED · MISSED DAY</div>
            <div class="nv-swahili">Umezingua</div>
          </div>
        </div>
      `;
    }

    if (tasks.length > 0) {
      html += `
        <div class="progress-row">
          <span class="progress-label">Progress</span>
          <span class="progress-count ${complete ? 'done' : ''}">${done}/${tasks.length}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${complete ? 'done' : ''}" style="width:${pct}%"></div>
        </div>
      `;
    } else {
      html += `<div class="empty-msg">// No tasks for this day</div>`;
    }

    tasks.forEach(task => {
      const checked = !!completions[task.id];
      html += `
        <div class="task-row">
          <button class="task-check ${checked ? 'checked' : ''}" onclick="toggleTask('${dayKey}','${task.id}')">
            <span class="check-icon">${checked ? '✓' : ''}</span>
          </button>
          <span class="task-label ${checked ? 'checked' : ''}">${escHtml(task.label)}</span>
          ${!task.isDefault ? `<button class="task-remove" onclick="removeCustomTask('${dayKey}','${task.id}')">×</button>` : ''}
        </div>
      `;
    });

    if (showAddBtn) {
      const inputId = 'add-input-' + dayKey;
      const rowId = 'add-row-' + dayKey;
      const btnId = 'add-btn-' + dayKey;
      html += `
        <button class="add-task-btn" id="${btnId}" onclick="showAddRow('${dayKey}','${inputId}','${rowId}','${btnId}')">+ Add task for this day</button>
        <div class="add-task-row" id="${rowId}" style="display:none;">
          <input type="text" id="${inputId}" placeholder="Task name..."
            onkeydown="if(event.key==='Enter') addCustomTask('${dayKey}','${inputId}'); if(event.key==='Escape') hideAddRow('${inputId}','${rowId}','${btnId}')" />
          <button onclick="addCustomTask('${dayKey}','${inputId}')">+</button>
        </div>
      `;
    }

    container.innerHTML = html;
  }


  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── View switching ───────────────────────────────────────────────────────────

  function render() {
    document.getElementById('header-date').textContent =
      today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

    // Streak
    const streak = getStreak();
    document.getElementById('streak-count').textContent = streak;

    if (currentView === 'today') {
      markVisited(todayKey);
      const tasks = getTasksForDay(todayKey);
      const completions = state.completions[todayKey] || {};
      const done = tasks.filter(t => completions[t.id]).length;
      const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      const complete = pct === 100 && tasks.length > 0;

      const hero = document.getElementById('today-hero');
      if (tasks.length > 0) {
        hero.style.display = 'block';
        document.getElementById('hero-pct').innerHTML = `${pct}<span>%</span>`;
        document.getElementById('hero-sub').textContent = `${done} of ${tasks.length} tasks complete`;
        const bar = document.getElementById('hero-bar');
        bar.style.width = pct + '%';
        bar.className = 'hero-bar' + (complete ? ' done' : '');
      } else {
        hero.style.display = 'none';
      }

      renderTaskList(document.getElementById('today-tasks'), todayKey, tasks, true);
    }

    if (currentView === 'month') {
      document.getElementById('cal-label').textContent = `${MONTHS[calMonth]} ${calYear}`;

      const firstDay = new Date(calYear, calMonth, 1).getDay();
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      let gridHtml = '';

      for (let i = 0; i < firstDay; i++) gridHtml += `<div class="cal-cell empty"></div>`;

      for (let d = 1; d <= daysInMonth; d++) {
        const key = dateKey(calYear, calMonth, d);
        const isTodayCell = (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear());
        const isSelected = key === selectedDayKey;
        const prog = getDayProgress(key);
        const notV = isNotVisited(key);

        let cls = 'cal-cell';
        if (isTodayCell) cls += ' today';
        if (isSelected) cls += ' selected';
        if (notV) cls += ' not-visited';

        let indicator = '';
        if (notV) {
          indicator = `<div class="nv-dot-mini"></div>`;
        } else if (prog) {
          const pct = prog.done / prog.total;
          indicator = `<div class="cal-mini-bar"><div class="cal-mini-fill ${pct===1?'done':''}" style="width:${Math.round(pct*100)}%"></div></div>`;
        }

        gridHtml += `
          <div class="${cls}" onclick="selectDay('${key}')">
            <span>${d}</span>
            ${indicator}
          </div>
        `;
      }

      document.getElementById('cal-grid').innerHTML = gridHtml;

      const panelWrap = document.getElementById('day-panel-wrap');
      if (selectedDayKey) {
        const parts = selectedDayKey.split('-');
        const y = parts[0], m = parseInt(parts[1])-1, d = parseInt(parts[2]);
        const tasks = getTasksForDay(selectedDayKey);
        panelWrap.innerHTML = `
          <div class="day-panel">
            <div class="day-panel-title">${MONTHS[m]} ${d}, ${y}</div>
            <div id="day-panel-tasks"></div>
          </div>
        `;
        renderTaskList(document.getElementById('day-panel-tasks'), selectedDayKey, tasks, true);
      } else {
        panelWrap.innerHTML = '';
      }
    }

    if (currentView === 'settings') {
      const list = document.getElementById('default-task-list');
      if (state.defaultTasks.length === 0) {
        list.innerHTML = '<div class="empty-msg">// No default tasks yet</div>';
      } else {
        list.innerHTML = state.defaultTasks.map(t => `
          <div class="default-task-row">
            <span>${escHtml(t.label)}</span>
            <button class="task-remove" onclick="removeDefaultTask('${t.id}')">×</button>
          </div>
        `).join('');
      }
    }
  }

