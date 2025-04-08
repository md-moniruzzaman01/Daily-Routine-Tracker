const routines = {
  job: [
    { time: "7:00 AM", activity: "Wake up" },
    { time: "7:30 AM", activity: "Breakfast" },
    { time: "8:00 AM – 9:30 AM", activity: "Light course study (2–3 videos)" },
    { time: "9:30 AM – 10:00 AM", activity: "Prep for job" },
    { time: "10:00 AM – 6:00 PM", activity: "Time job" },
    { time: "6:30 PM", activity: "Snacks" },
    { time: "7:00 PM – 9:00 PM", activity: "Light course video review" },
    { time: "9:00 PM – 10:30 PM", activity: "Unwind / free time" },
    { time: "10:30 PM", activity: "Winding down" },
    { time: "11:00 PM", activity: "Reading or journaling" },
    { time: "11:30 PM", activity: "Dim lights" },
    { time: "12:00 AM", activity: "Sleep" },
  ],
  nonJob: [
    { time: "07:00 AM", activity: "Wake up and stretch" },
    { time: "07:30 AM", activity: "Course study session" },
    { time: "09:30 AM", activity: "Break / snack" },
    { time: "10:00 AM", activity: "Course study session 2" },
    { time: "11:00 AM", activity: "Project or deep work" },
    { time: "12:30 PM", activity: "Lunch + rest" },
    { time: "01:30 PM", activity: "Focused coding" },
    { time: "03:30 PM", activity: "Break / snack" },
    { time: "04:00 PM", activity: "Optional revision" },
    { time: "06:00 PM", activity: "Snacks" },
    { time: "07:00 PM", activity: "Free time" },
    { time: "09:00 PM", activity: "Review / prep" },
    { time: "10:30 PM", activity: "Relax screen off" },
    { time: "11:00 PM", activity: "Reading" },
    { time: "11:30 PM", activity: "Prepare room" },
    { time: "12:00 AM", activity: "Sleep" }
  ]
};

const jobDays = ["Monday", "Thursday"];

function getDayName(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getActualRoutine(day) {
  return jobDays.includes(day) ? routines.job : routines.nonJob;
}

function saveCheckboxState(day, index, checked) {
  const key = `routine-${day}-${getDateKey()}`;
  let saved = JSON.parse(localStorage.getItem(key)) || [];
  saved[index] = checked;
  localStorage.setItem(key, JSON.stringify(saved));
}

function loadRoutine(day) {
  const routineTable = document.getElementById("routineTable");
  const routine = getActualRoutine(day);
  const saved = JSON.parse(localStorage.getItem(`routine-${day}-${getDateKey()}`)) || [];

  let rows = `<tr><th>Time</th><th>Activity</th><th>Done</th></tr>`;
  routine.forEach((item, i) => {
    rows += `<tr>
        <td>${item.time}</td>
        <td class="${saved[i] ? "task-done" : ""}">${item.activity}</td>
        <td><input type="checkbox" data-index="${i}" ${saved[i] ? "checked" : ""}></td>
      </tr>`;
  });
  routineTable.innerHTML = rows;

  routineTable.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      saveCheckboxState(day, idx, e.target.checked);
      loadRoutine(day);
    });
  });
}

function initDaySelect() {
  const select = document.getElementById("daySelect");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  days.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.innerText = d;
    select.appendChild(opt);
  });

  const today = getDayName();
  select.value = today;
  loadRoutine(today);

  select.addEventListener("change", (e) => {
    loadRoutine(e.target.value);
  });
}

// ---------- TODO LIST ----------
function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const list = document.getElementById("todoList");
  const todos = JSON.parse(localStorage.getItem("todos")) || [];

  list.innerHTML = "";
  todos.forEach((todo, i) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.innerHTML = `
      <input type="checkbox" ${todo.done ? "checked" : ""} data-index="${i}">
      <span class="${todo.done ? "task-done" : ""}">${todo.text}</span>
      <button class="deleteBtn" data-index="${i}">❌</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      todos[idx].done = e.target.checked;
      saveTodos(todos);
      loadTodos();
    });
  });

  list.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      todos.splice(idx, 1);
      saveTodos(todos);
      loadTodos();
    });
  });
}

function setupTodoForm() {
  const form = document.getElementById("todoForm");
  const input = document.getElementById("todoInput");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.push({ text: value, done: false });
    saveTodos(todos);
    input.value = "";
    loadTodos();
  });
}

// Initialize everything
initDaySelect();
setupTodoForm();
loadTodos();
