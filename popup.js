const routines = {
  job: [
    { time: "7:00 AM", activity: "Wake up" },
    { time: "7:30 AM", activity: "Breakfast" },
    { time: "8:00 AM – 9:30 AM", activity: "Light course study (2–3 videos)" },
    { time: "9:30 AM – 10:00 AM", activity: "Prep for job" },
    { time: "10:00 AM – 6:00 PM", activity: "Time job" },
    { time: "6:30 PM", activity: "Snacks" },
    { time: "7:00 PM – 9:00 PM", activity: "Light course video review (3–4 videos max)" },
    { time: "9:00 PM – 10:30 PM", activity: "Unwind / free time" },
    { time: "10:30 PM", activity: "Start winding down (screen off, relax)" },
    { time: "11:00 PM", activity: "Reading or journaling (non-digital)" },
    { time: "11:30 PM", activity: "Dim lights, prepare room (cool, quiet, dark)" },
    { time: "12:00 AM", activity: "Sleep" },
  ],
  nonJob: [
    { time: "07:00 AM – 07:30 AM", activity: "Wake up, hydrate, quick stretch or walk" },
    { time: "07:30 AM - 09:00 AM", activity: "Course study session 1" },
    { time: "9:30 AM", activity: "Break / light snack" },
    { time: "10:00 AM", activity: "Course study session 2" },
    { time: "11:00 AM – 12:30 PM", activity: "Deep work on course projects or code" },
    { time: "12:30 PM", activity: "Lunch + short rest" },
    { time: "1:30 PM – 3:30 PM", activity: "Focused coding or coursework" },
    { time: "3:30 PM – 4:00 PM", activity: "Break / walk / light snack" },
    { time: "4:00 PM – 5:30 PM", activity: "Optional coding session / revision" },
    { time: "6:00 PM", activity: "Snacks" },
    { time: "7:00 PM – 9:00 PM", activity: "Free time (gaming, hobby)" },
    { time: "9:00 PM – 10:30 PM", activity: "Light review / prep next day" },
    { time: "10:30 PM", activity: "Screen off or blue light filters" },
    { time: "10:45 PM", activity: "Stretching or meditation" },
    { time: "11:00 PM", activity: "Reading or journaling" },
    { time: "11:30 PM", activity: "Dim lights, prepare room" },
    { time: "12:00 AM", activity: "Sleep" },
  ],
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

  // Add event listeners
  routineTable.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      handleCheck(day, index, e.target.checked);
    });
  });
}

function handleCheck(day, index, checked) {
  saveCheckboxState(day, index, checked);
  loadRoutine(day);
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

initDaySelect();

document.getElementById("openFullPage")?.addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html")
  });
});
