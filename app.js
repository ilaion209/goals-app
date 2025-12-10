// ===== נתונים בסיסיים =====
var STORAGE_KEY = "goals_app_v_final";

var state = {
  goals: [],   // {id, title}
  targets: [], // {id, title, goalId, month}
  tasks: []    // {id, title, goalId, targetId, month, done, importance, urgency}
};

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var loaded = JSON.parse(raw);
      state.goals   = loaded.goals   || [];
      state.targets = loaded.targets || [];
      state.tasks   = loaded.tasks   || [];
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      goals: state.goals,
      targets: state.targets,
      tasks: state.tasks
    })
  );
}

var monthNames = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"
];

function currentMonthNumber() {
  return new Date().getMonth() + 1;
}

var MOTIVATION_QUOTES = [
  "כל משימה קטנה שאתה מסיים היא צעד גדול לשנה שאתה רוצה.",
  "לא חייבים לעשות הכול היום – מספיק שעושים את הצעד הבא.",
  "התקדמות עדיפה על שלמות. תמשיך לזוז.",
  "היום אתה בונה את השנה שתרצה להסתכל עליה בגאווה.",
  "משימה אחת פחות, מטרה אחת קרובה יותר."
];

var FEEDBACK_MESSAGES = [
  "כל הכבוד! עוד משימה בדרך למטרה 👏",
  "יפה מאוד, אתה בתנועה קדימה 💪",
  "מעולה! ככה בונים שנה חזקה ✨",
  "ככה נראית התקדמות אמיתית 🚀",
  "נהדר! כל V כזה מצטבר 💡"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== אלמנטים מה-DOM =====
var tabButtons   = document.querySelectorAll(".tabs button");
var tabSections  = document.querySelectorAll(".tab");

var yearGoalsSummary  = document.getElementById("year-goals-summary");
var yearTasksSummary  = document.getElementById("year-tasks-summary");
var yearProgressBar   = document.getElementById("year-progress-bar");
var yearProgressText  = document.getElementById("year-progress-text");

var motivationText    = document.getElementById("motivation-text");

var homeMonthTitle        = document.getElementById("home-month-title");
var homeMonthTargets      = document.getElementById("home-month-targets");
var homeMonthTasksSummary = document.getElementById("home-month-tasks-summary");
var homeMonthProgressBar  = document.getElementById("home-month-progress-bar");
var homeMonthProgressText = document.getElementById("home-month-progress-text");
var goToTasksCurrentMonth = document.getElementById("go-to-tasks-current-month");

var todayDateLabel    = document.getElementById("today-date");
var todayTasksList    = document.getElementById("today-tasks-list");
var todayTasksSummary = document.getElementById("today-tasks-summary");

var goalForm       = document.getElementById("goal-form");
var goalTitleInput = document.getElementById("goal-title");
var goalsList      = document.getElementById("goals-list");

var monthTargetsSelect = document.getElementById("month-targets-select");
var targetForm         = document.getElementById("target-form");
var targetTitleInput   = document.getElementById("target-title-input");
var targetGoalSelect   = document.getElementById("target-goal-select");
var targetsList        = document.getElementById("targets-list");

// לוח משימות – פילטרים
var boardGoalFilter     = document.getElementById("board-goal-filter");
var boardTargetFilter   = document.getElementById("board-target-filter");
var boardMonthFilter    = document.getElementById("board-month-filter");
var boardPriorityFilter = document.getElementById("board-priority-filter");

// לוח משימות – הוספת משימה
var boardTaskForm        = document.getElementById("board-task-form");
var boardTaskTitle       = document.getElementById("board-task-title");
var boardTaskGoal        = document.getElementById("board-task-goal");
var boardTaskTarget      = document.getElementById("board-task-target");
var boardTaskMonth       = document.getElementById("board-task-month");
var boardTaskImportance  = document.getElementById("board-task-importance");
var boardTaskUrgency     = document.getElementById("board-task-urgency");

// לוח משימות – תצוגה
var boardTasksList    = document.getElementById("board-tasks-list");
var boardTasksSummary = document.getElementById("board-tasks-summary");

// טוסט פידבק
var feedbackToast = document.getElementById("feedback-toast");

// ===== ניווט בין טאבים =====
if (tabButtons && tabSections) {
  for (var i = 0; i < tabButtons.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");

        for (var j = 0; j < tabButtons.length; j++) {
          tabButtons[j].classList.remove("active");
        }
        btn.classList.add("active");

        for (var k = 0; k < tabSections.length; k++) {
          var sec = tabSections[k];
          if (sec.id === target) {
            sec.classList.add("active");
          } else {
            sec.classList.remove("active");
          }
        }

        updateUI();
      });
    })(tabButtons[i]);
  }
}

// מעבר מלוח היום ללוח משימות עבור החודש הנוכחי
if (goToTasksCurrentMonth) {
  goToTasksCurrentMonth.addEventListener("click", function () {
    var curr = currentMonthNumber();

    // לעבור ללשונית לוח משימות
    for (var i = 0; i < tabButtons.length; i++) {
      var b = tabButtons[i];
      var tab = b.getAttribute("data-tab");
      if (tab === "tasks-board") {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    }
    for (var j = 0; j < tabSections.length; j++) {
      var s = tabSections[j];
      if (s.id === "tasks-board") {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    }

    if (boardMonthFilter) {
      boardMonthFilter.value = String(curr);
    }

    updateUI();
  });
}

// ===== אתחול חודשים ל-selectים =====
function initMonthSelects() {
  var i, opt;
  if (monthTargetsSelect) {
    monthTargetsSelect.innerHTML = "";
    for (i = 0; i < monthNames.length; i++) {
      opt = document.createElement("option");
      opt.value = i + 1;
      opt.textContent = monthNames[i];
      monthTargetsSelect.appendChild(opt);
    }
    monthTargetsSelect.value = currentMonthNumber();
  }

  if (boardMonthFilter) {
    boardMonthFilter.innerHTML = "";
    opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "כל החודשים";
    boardMonthFilter.appendChild(opt);

    for (i = 0; i < monthNames.length; i++) {
      opt = document.createElement("option");
      opt.value = i + 1;
      opt.textContent = monthNames[i];
      boardMonthFilter.appendChild(opt);
    }
  }

  if (boardTaskMonth) {
    boardTaskMonth.innerHTML = "";
    for (i = 0; i < monthNames.length; i++) {
      opt = document.createElement("option");
      opt.value = i + 1;
      opt.textContent = monthNames[i];
      boardTaskMonth.appendChild(opt);
    }
    boardTaskMonth.value = currentMonthNumber();
  }
}

// ===== עדכון select של מטרות (Goals) =====
function updateGoalSelects() {
  var i, opt, prev, g;

  // ליעדים חודשיים
  if (targetGoalSelect) {
    prev = targetGoalSelect.value;
    targetGoalSelect.innerHTML = "";
    opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "בחר מטרה לשנה";
    targetGoalSelect.appendChild(opt);

    for (i = 0; i < state.goals.length; i++) {
      g = state.goals[i];
      opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.title;
      targetGoalSelect.appendChild(opt);
    }

    if (prev) {
      targetGoalSelect.value = prev;
    }
  }

  // פילטר לוח משימות
  if (boardGoalFilter) {
    prev = boardGoalFilter.value;
    boardGoalFilter.innerHTML = "";
    opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "כל המטרות";
    boardGoalFilter.appendChild(opt);

    for (i = 0; i < state.goals.length; i++) {
      g = state.goals[i];
      opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.title;
      boardGoalFilter.appendChild(opt);
    }

    if (prev) {
      boardGoalFilter.value = prev;
    }
  }

  // מטרה להוספת משימה בלוח משימות
  if (boardTaskGoal) {
    prev = boardTaskGoal.value;
    boardTaskGoal.innerHTML = "";
    opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "בחר מטרה";
    boardTaskGoal.appendChild(opt);

    for (i = 0; i < state.goals.length; i++) {
      g = state.goals[i];
      opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.title;
      boardTaskGoal.appendChild(opt);
    }

    if (prev) {
      boardTaskGoal.value = prev;
    }
  }
}

// ===== עדכון select של יעדים (Targets) =====
function updateTargetSelects() {
  var i, opt, prev, targetsToShow, t, goal, goalName, monthName;

  // יעדים עבור פילטר לוח משימות
  if (boardTargetFilter) {
    prev = boardTargetFilter.value;
    boardTargetFilter.innerHTML = "";
    opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "כל היעדים";
    boardTargetFilter.appendChild(opt);

    targetsToShow = state.targets.slice();
    var selectedGoalId = boardGoalFilter ? boardGoalFilter.value : "";
    if (selectedGoalId) {
      targetsToShow = targetsToShow.filter(function (item) {
        return String(item.goalId) === selectedGoalId;
      });
    }

    for (i = 0; i < targetsToShow.length; i++) {
      t = targetsToShow[i];
      opt = document.createElement("option");
      opt.value = t.id;
      goal = state.goals.find(function (g) { return g.id === t.goalId; });
      goalName = goal ? goal.title : "";
      monthName = monthNames[t.month - 1] || "";
      opt.textContent = goalName
        ? t.title + " (" + goalName + " – " + monthName + ")"
        : t.title + " (" + monthName + ")";
      boardTargetFilter.appendChild(opt);
    }

    if (prev) {
      boardTargetFilter.value = prev;
    }
  }

  // יעדים עבור הוספת משימה בלוח משימות
  if (boardTaskTarget) {
    prev = boardTaskTarget.value;
    boardTaskTarget.innerHTML = "";
    opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "בחר יעד (לא חובה)";
    boardTaskTarget.appendChild(opt);

    targetsToShow = state.targets.slice();
    var selectedGoalForTask = boardTaskGoal ? boardTaskGoal.value : "";
    if (selectedGoalForTask) {
      targetsToShow = targetsToShow.filter(function (item) {
        return String(item.goalId) === selectedGoalForTask;
      });
    }

    for (i = 0; i < targetsToShow.length; i++) {
      t = targetsToShow[i];
      opt = document.createElement("option");
      opt.value = t.id;
      monthName = monthNames[t.month - 1] || "";
      opt.textContent = t.title + " (" + monthName + ")";
      boardTaskTarget.appendChild(opt);
    }

    if (prev) {
      boardTaskTarget.value = prev;
    }
  }
}

// שינוי מטרה בטופס הוספת משימה → עדכון יעדים
if (boardTaskGoal) {
  boardTaskGoal.addEventListener("change", function () {
    updateTargetSelects();
  });
}

// שינוי מטרה בפילטר → משפיע על יעדים בפילטר
if (boardGoalFilter) {
  boardGoalFilter.addEventListener("change", function () {
    updateTargetSelects();
    updateTasksBoard();
  });
}

if (boardTargetFilter) {
  boardTargetFilter.addEventListener("change", function () {
    updateTasksBoard();
  });
}

if (boardMonthFilter) {
  boardMonthFilter.addEventListener("change", function () {
    updateTasksBoard();
  });
}

if (boardPriorityFilter) {
  boardPriorityFilter.addEventListener("change", function () {
    updateTasksBoard();
  });
}

if (monthTargetsSelect) {
  monthTargetsSelect.addEventListener("change", function () {
    updateMonthTargets();
  });
}

// ===== פידבק חיובי =====
function showFeedback() {
  if (!feedbackToast) return;
  feedbackToast.textContent = randomItem(FEEDBACK_MESSAGES);
  feedbackToast.classList.remove("hidden");
  feedbackToast.classList.add("show");
  setTimeout(function () {
    feedbackToast.classList.remove("show");
  }, 2200);
}

// ===== הוספת מטרה =====
if (goalForm) {
  goalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = goalTitleInput ? goalTitleInput.value.trim() : "";
    if (!title) return;

    state.goals.push({
      id: Date.now(),
      title: title
    });

    if (goalTitleInput) goalTitleInput.value = "";
    saveState();
    updateUI();
  });
}

// ===== הוספת יעד חודשי =====
if (targetForm) {
  targetForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = targetTitleInput ? targetTitleInput.value.trim() : "";
    var month = monthTargetsSelect
      ? parseInt(monthTargetsSelect.value, 10)
      : currentMonthNumber();
    var goalId = targetGoalSelect ? targetGoalSelect.value : "";

    if (!title || !goalId) return;

    state.targets.push({
      id: Date.now(),
      title: title,
      goalId: Number(goalId),
      month: month
    });

    if (targetTitleInput) targetTitleInput.value = "";
    saveState();
    updateUI();
  });
}

// ===== הוספת משימה בלוח משימות =====
if (boardTaskForm) {
  boardTaskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = boardTaskTitle ? boardTaskTitle.value.trim() : "";
    if (!title) return;

    var goalId = boardTaskGoal ? boardTaskGoal.value : "";
    if (!goalId) return; // חייב מטרה

    var targetId   = boardTaskTarget ? boardTaskTarget.value || null : null;
    var monthValue = boardTaskMonth
      ? parseInt(boardTaskMonth.value, 10)
      : currentMonthNumber();
    var importance = boardTaskImportance ? boardTaskImportance.value : "high";
    var urgency    = boardTaskUrgency ? boardTaskUrgency.value : "high";

    state.tasks.push({
      id: Date.now(),
      title: title,
      goalId: Number(goalId),
      targetId: targetId ? Number(targetId) : null,
      month: monthValue,
      done: false,
      importance: importance,
      urgency: urgency
    });

    if (boardTaskTitle) boardTaskTitle.value = "";
    saveState();
    updateUI();
  });
}

// ===== מסך היום + שנה + חודש =====
function updateHome() {
  if (
    !yearGoalsSummary ||
    !yearTasksSummary ||
    !yearProgressBar ||
    !yearProgressText ||
    !homeMonthTitle ||
    !homeMonthTargets ||
    !homeMonthTasksSummary ||
    !homeMonthProgressBar ||
    !homeMonthProgressText ||
    !motivationText ||
    !todayDateLabel ||
    !todayTasksList ||
    !todayTasksSummary
  ) {
    return;
  }

  // משפט מוטיבציה
  motivationText.textContent = randomItem(MOTIVATION_QUOTES);

  // תאריך היום
  var now = new Date();
  var dayNames = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  var dayName = dayNames[now.getDay()];
  var dayNum = now.getDate();
  var monthIndex = now.getMonth(); // 0-11
  var year = now.getFullYear();
  var monthNameToday = monthNames[monthIndex];
  todayDateLabel.textContent =
    "יום " + dayName + ", " + dayNum + " " + monthNameToday + " " + year;

  // ---- חלק שנה ----
  var totalGoals = state.goals.length;
  yearGoalsSummary.textContent = totalGoals + " מטרות הוגדרו";

  var totalTasks = state.tasks.length;
  var doneTasks  = state.tasks.filter(function (t) { return t.done; }).length;
  yearTasksSummary.textContent =
    doneTasks + " מתוך " + totalTasks + " משימות בוצעו";

  var yearPercent = totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100;
  yearProgressBar.style.width = yearPercent + "%";
  yearProgressText.textContent = yearPercent.toFixed(0) + "%";

  // ---- חלק חודש ----
  var currMonth = currentMonthNumber();
  var mName = monthNames[currMonth - 1];
  homeMonthTitle.textContent = "החודש – " + mName;

  var monthTargets = state.targets.filter(function (t) {
    return t.month === currMonth;
  });
  homeMonthTargets.innerHTML = "";
  if (monthTargets.length === 0) {
    var li = document.createElement("li");
    li.textContent = "אין עדיין יעדים לחודש הזה.";
    homeMonthTargets.appendChild(li);
  } else {
    monthTargets.forEach(function (t) {
      var li2 = document.createElement("li");
      var goal = state.goals.find(function (g) { return g.id === t.goalId; });
      var goalName = goal ? goal.title : "";
      li2.textContent = goalName ? t.title + " (" + goalName + ")" : t.title;
      homeMonthTargets.appendChild(li2);
    });
  }

  var monthTasks = state.tasks.filter(function (t) {
    return t.month === currMonth;
  });
  var monthDone  = monthTasks.filter(function (t) { return t.done; }).length;
  homeMonthTasksSummary.textContent =
    monthDone + " מתוך " + monthTasks.length + " משימות בוצעו";

  var monthPercent =
    monthTasks.length === 0 ? 0 : (monthDone / monthTasks.length) * 100;
  homeMonthProgressBar.style.width = monthPercent + "%";
  homeMonthProgressText.textContent = monthPercent.toFixed(0) + "%";

  // ---- "המשימות להיום" – לוח עבודה יומי ----
  var openMonthTasks = monthTasks.filter(function (t) { return !t.done; });

  var order = ["hh","hl","lh","ll"];
  openMonthTasks.sort(function (a, b) {
    var pa = order.indexOf(priorityKey(a));
    var pb = order.indexOf(priorityKey(b));
    if (pa !== pb) return pa - pb;
    return a.month - b.month;
  });

  todayTasksList.innerHTML = "";

  if (openMonthTasks.length === 0) {
    todayTasksSummary.textContent = "אין כרגע משימות פתוחות להיום.";
    var liToday = document.createElement("li");
    liToday.textContent = "אפשר להוסיף משימות בלוח המשימות או לנוח 😉";
    todayTasksList.appendChild(liToday);
  } else {
    todayTasksSummary.textContent =
      "יש לך " + openMonthTasks.length + " משימות פתוחות להיום.";

    // עד 20 משימות כדי לא להציף
    var todayList = openMonthTasks.slice(0, 20);

    todayList.forEach(function (task) {
      var li = document.createElement("li");

      var info = document.createElement("div");
      info.className = "task-info";

      var label = document.createElement("label");
      label.className = "checkbox-label";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.onchange = function () {
        var wasDone = task.done;
        task.done = checkbox.checked;
        saveState();
        updateUI();
        if (!wasDone && task.done) {
          showFeedback();
        }
      };

      var titleSpan = document.createElement("span");
      titleSpan.textContent = task.title;
      if (task.done) {
        titleSpan.style.textDecoration = "line-through";
      }

      label.appendChild(checkbox);
      label.appendChild(titleSpan);
      info.appendChild(label);

      var sub = document.createElement("div");
      sub.className = "task-sub";

      var goal = state.goals.find(function (g) { return g.id === task.goalId; });
      var target = state.targets.find(function (t) { return t.id === task.targetId; });

      var parts = [];
      if (goal) {
        parts.push("מטרה: " + goal.title);
      }
      if (target) {
        parts.push("יעד: " + target.title);
      }
      sub.textContent = parts.join(" | ");

      if (sub.textContent) {
        info.appendChild(sub);
      }

      var controls = document.createElement("div");
      controls.className = "task-controls";

      var pKey = priorityKey(task);
      var prioritySpan = document.createElement("span");
      prioritySpan.className = "priority-tag priority-" + pKey;
      prioritySpan.textContent = priorityLabel(pKey);
      controls.appendChild(prioritySpan);

      var editBtn = document.createElement("button");
      editBtn.textContent = "ערוך";
      editBtn.className = "small-btn";
      editBtn.onclick = function () {
        var newTitle = prompt("עדכון שם המשימה:", task.title);
        if (newTitle !== null) {
          newTitle = newTitle.trim();
          if (newTitle) {
            task.title = newTitle;
            saveState();
            updateUI();
          }
        }
      };
      controls.appendChild(editBtn);

      var delBtn = document.createElement("button");
      delBtn.textContent = "מחק";
      delBtn.className = "small-btn delete";
      delBtn.onclick = function () {
        state.tasks = state.tasks.filter(function (t) {
          return t.id !== task.id;
        });
        saveState();
        updateUI();
      };
      controls.appendChild(delBtn);

      li.appendChild(info);
      li.appendChild(controls);

      todayTasksList.appendChild(li);
    });
  }
}

// ===== מסך מטרות =====
function updateGoalsList() {
  if (!goalsList) return;
  goalsList.innerHTML = "";

  if (state.goals.length === 0) {
    var li = document.createElement("li");
    li.textContent = "עוד לא הגדרת מטרות. אפשר להתחיל באחת קטנה 🙂";
    goalsList.appendChild(li);
    return;
  }

  state.goals.forEach(function (goal) {
    var li = document.createElement("li");

    var info = document.createElement("div");
    info.className = "goal-info";

    var title = document.createElement("div");
    title.className = "goal-title";
    title.textContent = goal.title;

    var relatedTargets = state.targets.filter(function (t) {
      return t.goalId === goal.id;
    });
    var relatedTasks   = state.tasks.filter(function (t) {
      return t.goalId === goal.id;
    });

    var sub = document.createElement("div");
    sub.className = "goal-sub";
    sub.textContent =
      "יעדים: " + relatedTargets.length + ", משימות: " + relatedTasks.length;

    info.appendChild(title);
    info.appendChild(sub);

    var controls = document.createElement("div");
    controls.className = "goal-controls";

    var manageTargetsBtn = document.createElement("button");
    manageTargetsBtn.textContent = "ליעדים חודשיים";
    manageTargetsBtn.className = "small-btn primary";
    manageTargetsBtn.onclick = function () {
      var i, b, s;
      for (i = 0; i < tabButtons.length; i++) {
        b = tabButtons[i];
        if (b.getAttribute("data-tab") === "months") {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      }
      for (i = 0; i < tabSections.length; i++) {
        s = tabSections[i];
        if (s.id === "months") {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      }
      if (targetGoalSelect) {
        targetGoalSelect.value = goal.id;
      }
      updateUI();
    };

    var tasksBoardBtn = document.createElement("button");
    tasksBoardBtn.textContent = "לוח משימות";
    tasksBoardBtn.className = "small-btn";
    tasksBoardBtn.onclick = function () {
      var i, b, s;
      for (i = 0; i < tabButtons.length; i++) {
        b = tabButtons[i];
        if (b.getAttribute("data-tab") === "tasks-board") {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      }
      for (i = 0; i < tabSections.length; i++) {
        s = tabSections[i];
        if (s.id === "tasks-board") {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      }
      if (boardGoalFilter) {
        boardGoalFilter.value = String(goal.id);
      }
      updateUI();
    };

    var delBtn = document.createElement("button");
    delBtn.textContent = "מחק";
    delBtn.className = "small-btn delete";
    delBtn.onclick = function () {
      state.targets = state.targets.filter(function (t) {
        return t.goalId !== goal.id;
      });
      state.tasks   = state.tasks.filter(function (t) {
        return t.goalId !== goal.id;
      });
      state.goals   = state.goals.filter(function (g) {
        return g.id !== goal.id;
      });
      saveState();
      updateUI();
    };

    controls.appendChild(manageTargetsBtn);
    controls.appendChild(tasksBoardBtn);
    controls.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(controls);

    goalsList.appendChild(li);
  });
}

// ===== מסך יעדים חודשיים =====
function updateMonthTargets() {
  if (!targetsList || !monthTargetsSelect) return;
  targetsList.innerHTML = "";

  var month = parseInt(monthTargetsSelect.value, 10);
  var targetsForMonth = state.targets.filter(function (t) {
    return t.month === month;
  });

  if (targetsForMonth.length === 0) {
    var li = document.createElement("li");
    li.textContent = "אין יעדים לחודש זה. אפשר להוסיף יעד חדש 👇";
    targetsList.appendChild(li);
    return;
  }

  targetsForMonth.forEach(function (target) {
    var li = document.createElement("li");

    var info = document.createElement("div");
    info.className = "target-info";

    var title = document.createElement("div");
    title.className = "target-title";
    title.textContent = target.title;

    var goal = state.goals.find(function (g) { return g.id === target.goalId; });
    var goalName = goal ? goal.title : "";

    var relatedTasks = state.tasks.filter(function (t) {
      return t.targetId === target.id;
    });

    var sub = document.createElement("div");
    sub.className = "target-sub";
    sub.textContent = goalName
      ? "מטרה: " + goalName + " | משימות: " + relatedTasks.length
      : "משימות: " + relatedTasks.length;

    info.appendChild(title);
    info.appendChild(sub);

    var controls = document.createElement("div");
    controls.className = "target-controls";

    var tasksBtn = document.createElement("button");
    tasksBtn.textContent = "לוח משימות";
    tasksBtn.className = "small-btn primary";
    tasksBtn.onclick = function () {
      var i, b, s;
      for (i = 0; i < tabButtons.length; i++) {
        b = tabButtons[i];
        if (b.getAttribute("data-tab") === "tasks-board") {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      }
      for (i = 0; i < tabSections.length; i++) {
        s = tabSections[i];
        if (s.id === "tasks-board") {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      }

      if (boardGoalFilter)   boardGoalFilter.value   = String(target.goalId);
      if (boardTargetFilter) boardTargetFilter.value = String(target.id);
      if (boardMonthFilter)  boardMonthFilter.value  = String(target.month);

      updateUI();
    };

    var delBtn = document.createElement("button");
    delBtn.textContent = "מחק";
    delBtn.className = "small-btn delete";
    delBtn.onclick = function () {
      state.tasks   = state.tasks.filter(function (t) {
        return t.targetId !== target.id;
      });
      state.targets = state.targets.filter(function (t) {
        return t.id !== target.id;
      });
      saveState();
      updateUI();
    };

    controls.appendChild(tasksBtn);
    controls.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(controls);

    targetsList.appendChild(li);
  });
}

// ===== לוח משימות =====
function priorityKey(task) {
  var imp = task.importance === "high" ? "h" : "l";
  var urg = task.urgency === "high" ? "h" : "l";
  return imp + urg; // "hh", "hl", "lh", "ll"
}

function priorityLabel(key) {
  switch (key) {
    case "hh": return "חשוב ודחוף";
    case "hl": return "חשוב ולא דחוף";
    case "lh": return "לא חשוב אך דחוף";
    case "ll": return "לא חשוב ולא דחוף";
    default:   return "";
  }
}

function updateTasksBoard() {
  if (!boardTasksList || !boardTasksSummary) return;
  boardTasksList.innerHTML = "";

  var goalFilter     = boardGoalFilter     ? boardGoalFilter.value     : "";
  var targetFilter   = boardTargetFilter   ? boardTargetFilter.value   : "";
  var monthFilter    = boardMonthFilter    ? boardMonthFilter.value    : "";
  var priorityFilter = boardPriorityFilter ? boardPriorityFilter.value : "";

  var tasks = state.tasks.slice();

  if (goalFilter) {
    tasks = tasks.filter(function (t) { return String(t.goalId) === goalFilter; });
  }
  if (targetFilter) {
    tasks = tasks.filter(function (t) { return String(t.targetId) === targetFilter; });
  }
  if (monthFilter) {
    tasks = tasks.filter(function (t) { return String(t.month) === monthFilter; });
  }
  if (priorityFilter) {
    tasks = tasks.filter(function (t) { return priorityKey(t) === priorityFilter; });
  }

  var total = tasks.length;
  var done  = tasks.filter(function (t) { return t.done; }).length;

  boardTasksSummary.textContent =
    done + " מתוך " + total + " משימות מסוננות בוצעו";

  if (tasks.length === 0) {
    var li = document.createElement("li");
    li.textContent = "אין משימות בהתאם לסינון הנוכחי.";
    boardTasksList.appendChild(li);
    return;
  }

  var order = ["hh","hl","lh","ll"];
  tasks.sort(function (a, b) {
    var pa = order.indexOf(priorityKey(a));
    var pb = order.indexOf(priorityKey(b));
    if (pa !== pb) return pa - pb;
    return a.month - b.month;
  });

  tasks.forEach(function (task) {
    var li = document.createElement("li");

    var info = document.createElement("div");
    info.className = "task-info";

    var label = document.createElement("label");
    label.className = "checkbox-label";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.onchange = function () {
      var wasDone = task.done;
      task.done = checkbox.checked;
      saveState();
      updateUI();
      if (!wasDone && task.done) {
        showFeedback();
      }
    };

    var span = document.createElement("span");
    var monthName = monthNames[task.month - 1] || "";
    span.textContent = task.title + " (" + monthName + ")";
    if (task.done) {
      span.style.textDecoration = "line-through";
    }

    label.appendChild(checkbox);
    label.appendChild(span);

    var sub = document.createElement("div");
    sub.className = "task-sub";

    var goal = state.goals.find(function (g) { return g.id === task.goalId; });
    var target = state.targets.find(function (t) { return t.id === task.targetId; });
    var goalName   = goal   ? goal.title   : "";
    var targetName = target ? target.title : "";

    if (goalName || targetName) {
      sub.textContent =
        (goalName   ? "מטרה: " + goalName   : "") +
        (goalName && targetName ? " | " : "") +
        (targetName ? "יעד: "   + targetName : "");
    }

    info.appendChild(label);
    if (sub.textContent) info.appendChild(sub);

    var controls = document.createElement("div");
    controls.className = "task-controls";

    var pKey = priorityKey(task);
    var prioritySpan = document.createElement("span");
    prioritySpan.className = "priority-tag priority-" + pKey;
    prioritySpan.textContent = priorityLabel(pKey);
    controls.appendChild(prioritySpan);

    var delBtn = document.createElement("button");
    delBtn.textContent = "מחק";
    delBtn.className = "small-btn delete";
    delBtn.onclick = function () {
      state.tasks = state.tasks.filter(function (t) {
        return t.id !== task.id;
      });
      saveState();
      updateUI();
    };

    controls.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(controls);

    boardTasksList.appendChild(li);
  });
}

// ===== עדכון כללי =====
function updateUI() {
  updateGoalSelects();
  updateTargetSelects();
  updateHome();
  updateGoalsList();
  updateMonthTargets();
  updateTasksBoard();
}

// ===== התחלה =====
loadState();
initMonthSelects();
updateUI();

// ===== רישום Service Worker עבור עבודה בלי רשת =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(function (err) {
        console.log("Service Worker registration failed:", err);
      });
  });
}
