(() => {
  "use strict";

  const STORAGE_KEY = "30-days-forward-v1";

  const checklistItems = [
    { id: "prayer", label: "תפילה ולימוד — להתחיל את היום בכיוון הנכון" },
    { id: "business", label: "פעולה משמעותית לעסק או לפרנסה" },
    { id: "health", label: "פעולה לבריאות: אימון, הליכה או תזונה מתוכננת" },
    { id: "family", label: "זמן נוכח עם המשפחה, בלי מסך" },
    { id: "review", label: "סיכום קצר ותכנון הפעולה של מחר" }
  ];

  const days = [
    ["מתחילים באחריות", "כתוב למה אתה רוצה שינוי ומה המחיר של להישאר באותו מקום."],
    ["מגדירים הצלחה", "בחר שלושה תחומים חשובים וקבע תוצאה רצויה לכל אחד."],
    ["מנקים רעש", "זהה הרגל אחד שגוזל זמן והגדר לו גבול ברור."],
    ["בוחרים פעולה אחת", "עשה את המשימה החשובה לפני שאתה נגרר להסחות."],
    ["מסתכלים למציאות בעיניים", "כתוב מה עובד, מה לא, ומה בשליטתך."],
    ["יוצרים סביבת הצלחה", "הכן מראש את הדברים שיעזרו לך לבצע מחר."],
    ["סקירה שבועית", "בדוק מה ביצעת, בלי תירוצים ובלי שיפוט עצמי מיותר."],
    ["עוברים מדיבורים לביצוע", "בצע צעד קטן שדחית יותר מדי זמן."],
    ["מתאמנים בעקביות", "קבע זמן קבוע לפעולה חשובה וחזור עליו."],
    ["מחליפים תירוץ בתוכנית", "לכל מכשול צפוי, כתוב פתרון מעשי."],
    ["לומדים להגיד לא", "בטל או דחה דבר אחד שאינו משרת את היעדים."],
    ["מתקדמים גם בלי חשק", "בצע גרסה קטנה של המשימה גם ביום חלש."],
    ["בודקים את ההתקדמות", "השווה את הפעולות שלך ליעדים שהגדרת."],
    ["סקירה שבועית", "שמור על מה שעובד ושנה דבר אחד בלבד."],
    ["מייצרים ערך", "רשום בעיה אמיתית של אדם או עסק שאתה יכול לעזור לפתור."],
    ["מדברים עם אנשים", "צור קשר עם אדם אחד שיכול ללמד אותך או להיות לקוח."],
    ["לומדים מיומנות", "הקדש 25 דקות ללמידה שמחוברת למטרה."],
    ["בודקים כסף", "בדוק הוצאות, הכנסות והחלטה כלכלית אחת לשיפור."],
    ["מקדמים הזדמנות", "בצע פנייה, הצעה או צעד עסקי מדיד."],
    ["משפרים הצעה", "נסח בבירור למי אתה עוזר, באיזו בעיה ואיזו תוצאה."],
    ["סקירה שבועית", "בדוק אילו פעולות יצרו תוצאה ואילו רק העסיקו אותך."],
    ["מגינים על האנרגיה", "שפר דבר אחד בשינה, בתנועה או בתזונה."],
    ["נוכחות בבית", "קבע זמן משפחתי מוגדר והנח את הטלפון בצד."],
    ["חוזרים ליסודות", "בצע את ההרגל הקטן שהכי עוזר לך להתייצב."],
    ["מנקים התחייבויות", "סגור משימה פתוחה אחת שמכבידה עליך."],
    ["מבקשים משוב", "שאל אדם אמין מה אפשר לשפר בדרך הפעולה שלך."],
    ["מחליטים על הצעד הבא", "בחר פעולה אחת שתמשיך גם אחרי היום ה־30."],
    ["בונים שיטה", "כתוב שגרה שבועית ריאלית שאפשר להתמיד בה."],
    ["מודדים את הדרך", "השווה את מצבך עכשיו לנקודת ההתחלה."],
    ["סיכום והתחייבות", "כתוב מה למדת, במה השתפרת, ומה יהיו שלושת הצעדים הבאים."]
  ];

  const weekNames = [
    ["שבוע 1 · שליטה וכיוון", "להבין איפה אתה נמצא ולבחור מה חשוב."],
    ["שבוע 2 · פעולה ואחריות", "לפעול גם בלי לחכות למוטיבציה."],
    ["שבוע 3 · ערך וכסף", "לייצר ערך, ללמוד ולבנות הזדמנויות."],
    ["שבוע 4 · עקביות והמשך", "לחבר את הפעולות לשיטה שתמשיך איתך."]
  ];

  const $ = id => document.getElementById(id);

  const localDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const initialState = () => ({
    startDate: localDate(),
    checks: {},
    importantTasks: {},
    goals: [],
    reviews: {},
    theme: "dark"
  });

  let state;

  try {
    state = {
      ...initialState(),
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    };
  } catch {
    state = initialState();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function dayIndex() {
    const start = new Date(`${state.startDate || localDate()}T00:00:00`);
    const now = new Date(`${localDate()}T00:00:00`);
    return Math.max(0, Math.min(29, Math.floor((now - start) / 86400000)));
  }

  function dateLabel(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function selectTab(name) {
    document.querySelectorAll(".tab-button").forEach(button => {
      button.classList.toggle("active", button.dataset.tab === name);
    });

    document.querySelectorAll(".tab-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `tab-${name}`);
    });

    if (name === "review") renderReviews();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => selectTab(button.dataset.tab));
  });

  function overallProgress() {
    let count = 0;

    for (const checks of Object.values(state.checks)) {
      count += checklistItems.filter(item => checks && checks[item.id]).length;
    }

    return Math.min(100, count / (30 * checklistItems.length) * 100);
  }

  function renderToday() {
    const idx = dayIndex();
    const date = localDate();
    const completed = state.checks[date] || {};

    $("today-label").textContent =
      new Date(`${date}T12:00:00`).toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });

    $("day-pill").textContent = `יום ${idx + 1} מתוך 30`;
    $("daily-title").textContent = days[idx][0];
    $("daily-description").textContent = days[idx][1];
    $("important-task").value = state.importantTasks[date] || "";

    $("daily-checklist").innerHTML = checklistItems.map(item => `
      <label class="check-item ${completed[item.id] ? "done" : ""}">
        <input type="checkbox" data-check="${item.id}"
          ${completed[item.id] ? "checked" : ""}>
        <span>${item.label}</span>
      </label>
    `).join("");

    const count = checklistItems.filter(item => completed[item.id]).length;

    $("checklist-count").textContent = `${count} מתוך ${checklistItems.length}`;
    $("today-progress").style.width = `${count / checklistItems.length * 100}%`;
    $("progress-number").textContent = `${Math.round(overallProgress())}%`;
    $("progress-ring").style.setProperty("--progress", `${overallProgress()}%`);

    $("greeting").textContent =
      count === checklistItems.length
        ? "עשית את שלך להיום. כל הכבוד."
        : "בונים עקביות, יום אחרי יום.";
  }

  $("daily-checklist").addEventListener("change", event => {
    const id = event.target.dataset.check;
    if (!id) return;

    const date = localDate();
    state.checks[date] ||= {};
    state.checks[date][id] = event.target.checked;

    save();
  });

  $("save-important-task").addEventListener("click", () => {
    state.importantTasks[localDate()] = $("important-task").value.trim();
    save();
    showToast("המשימה נשמרה");
  });

  function renderPlan() {
    $("plan-weeks").innerHTML = weekNames.map((week, weekIndex) => {
      const start = weekIndex * 7;
      const end = Math.min(start + 7, 30);

      const rows = days.slice(start, end).map((day, offset) => {
        const number = start + offset;
        const date = new Date(`${state.startDate}T12:00:00`);
        date.setDate(date.getDate() + number);
        const dateString = date.toISOString().slice(0, 10);
        const isToday = number === dayIndex();

        const checked = checklistItems.every(item =>
          state.checks[dateString] && state.checks[dateString][item.id]
        );

        return `
          <div class="day-row ${isToday ? "current" : ""}">
            <div class="day-num">${number + 1}</div>
            <div>
              <h4>${escapeHTML(day[0])}</h4>
              <p>${escapeHTML(day[1])}</p>
            </div>
            <button data-goto-day="${number}" class="${checked ? "active" : ""}">
              ${checked ? "הושלם" : isToday ? "היום" : `יום ${number + 1}`}
            </button>
          </div>
        `;
      }).join("");

      return `
        <article class="week-card">
          <div class="week-title">
            <div>
              <h3>${week[0]}</h3>
              <p>${week[1]}</p>
            </div>
            <span class="pill">ימים ${start + 1}–${end}</span>
          </div>
          ${rows}
        </article>
      `;
    }).join("");
  }

  $("plan-weeks").addEventListener("click", event => {
    const button = event.target.closest("[data-goto-day]");
    if (!button) return;

    const number = Number(button.dataset.gotoDay);

    if (number !== dayIndex()) {
      showToast(`היום שלך בתוכנית הוא יום ${dayIndex() + 1}`);
    } else {
      selectTab("today");
    }
  });

  $("goal-form").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("goal-title").value.trim();
    if (!title) return;

    state.goals.push({
      id: Date.now().toString(),
      title,
      category: $("goal-category").value,
      measure: $("goal-measure").value.trim(),
      progress: 0,
      done: false
    });

    $("goal-title").value = "";
    $("goal-measure").value = "";

    save();
    showToast("היעד נוסף");
  });

  function renderGoals() {
    $("goals-list").innerHTML = state.goals.length
      ? state.goals.map(goal => `
        <article class="goal-item">
          <div class="goal-category">${escapeHTML(goal.category)}</div>
          <h3>${escapeHTML(goal.title)} ${goal.done ? "✓" : ""}</h3>
          ${goal.measure ? `<p>${escapeHTML(goal.measure)}</p>` : ""}

          <div class="goal-progress">
            <span>התקדמות</span>
            <span data-progress-label="${goal.id}">${goal.progress}%</span>
          </div>

          <input aria-label="התקדמות ביעד" type="range"
            min="0" max="100" step="5" value="${goal.progress}"
            data-goal-progress="${goal.id}">

          <div class="goal-actions">
            <button data-delete-goal="${goal.id}">מחיקת יעד</button>
          </div>
        </article>
      `).join("")
      : `<div class="card empty-state">עדיין אין יעדים. הוסף יעד שחשוב לך באמת.</div>`;
  }

  $("goals-list").addEventListener("input", event => {
    const range = event.target.closest("[data-goal-progress]");
    if (!range) return;

    const goal = state.goals.find(item => item.id === range.dataset.goalProgress);
    if (goal) goal.progress = Number(range.value);

    const label = document.querySelector(
      `[data-progress-label="${range.dataset.goalProgress}"]`
    );

    if (label) label.textContent = `${range.value}%`;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  $("goals-list").addEventListener("change", event => {
    const range = event.target.closest("[data-goal-progress]");
    if (!range) return;

    const goal = state.goals.find(item => item.id === range.dataset.goalProgress);

    if (goal) {
      goal.done = goal.progress === 100;
      save();
    }
  });

  $("goals-list").addEventListener("click", event => {
    const button = event.target.closest("[data-delete-goal]");
    if (!button) return;

    state.goals = state.goals.filter(
      goal => goal.id !== button.dataset.deleteGoal
    );

    save();
    showToast("היעד נמחק");
  });

  $("review-form").addEventListener("submit", event => {
    event.preventDefault();

    state.reviews[localDate()] = {
      win: $("review-win").value.trim(),
      improve: $("review-improve").value.trim(),
      tomorrow: $("review-tomorrow").value.trim(),
      updatedAt: new Date().toISOString()
    };

    save();
    showToast("הסיכום היומי נשמר");
  });

  function renderReviews() {
    const review = state.reviews[localDate()] || {};

    $("review-win").value = review.win || "";
    $("review-improve").value = review.improve || "";
    $("review-tomorrow").value = review.tomorrow || "";

    const entries = Object.entries(state.reviews)
      .sort((a, b) => b[0].localeCompare(a[0]));

    $("review-history").innerHTML = entries.length
      ? entries.map(([date, item]) => `
        <article class="review-entry">
          <strong>${dateLabel(date)}</strong>
          ${item.win ? `<p><b>מה עבד:</b> ${escapeHTML(item.win)}</p>` : ""}
          ${item.improve ? `<p><b>לשיפור:</b> ${escapeHTML(item.improve)}</p>` : ""}
          ${item.tomorrow ? `<p><b>למחר:</b> ${escapeHTML(item.tomorrow)}</p>` : ""}
        </article>
      `).join("")
      : `<div class="empty-state">עדיין לא נשמרו סיכומים.</div>`;
  }

  $("export-data").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `30-yom-kadima-${localDate()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showToast("קובץ הנתונים יוצא");
  });

  $("theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    document.body.classList.toggle("light-mode", state.theme === "light");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  $("reset-progress").addEventListener("click", () => {
    if (!confirm("לאפס את כל הנתונים? מומלץ לייצא קודם גיבוי.")) return;

    state = initialState();
    save();
    renderReviews();
    showToast("ההתקדמות אופסה");
  });

  function render() {
    document.body.classList.toggle("light-mode", state.theme === "light");
    renderToday();
    renderPlan();
    renderGoals();
    renderReviews();
  }

  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .catch(error => console.warn("Service worker registration failed:", error));
    });
  }
})();
