let db;
const routineStoreName = 'routines';
const dbRequest = indexedDB.open('RoutineDB', 1);

// Create the object store if it doesn't exist
dbRequest.onupgradeneeded = function (e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(routineStoreName)) {
        const store = db.createObjectStore(routineStoreName, { keyPath: 'date' });
        store.createIndex('date', 'date', { unique: true });
    }
};

// Open the database
dbRequest.onsuccess = function (e) {
    db = e.target.result;
    console.log("IndexedDB opened successfully");
    initDaySelect();
};

// Handle errors
dbRequest.onerror = function (e) {
    console.error("Error opening IndexedDB", e);
};

// Check if the DB is ready before executing transactions
function isDBReady() {
    return db !== undefined;
}

// Save custom routine to IndexedDB
function saveCustomRoutine() {
    if (!isDBReady()) return;

    const daySelect = document.getElementById("daySelect");
    const selectedDays = Array.from(daySelect.selectedOptions).map(option => option.value);

    const time = document.getElementById("customTime").value;
    const activity = document.getElementById("customActivity").value.trim();

    if (!time || !activity || selectedDays.length === 0) return;

    // Save routine for each selected day
    selectedDays.forEach(day => {
        const transaction = db.transaction([routineStoreName], "readwrite");
        const store = transaction.objectStore(routineStoreName);
        const request = store.get(day);

        request.onsuccess = function () {
            const routine = request.result || { date: day, routineData: [] };
            routine.routineData.push({ time, activity, completed: false });
            store.put(routine);
            loadCustomRoutine(day);  // Refresh the table for the selected day
        };
    });
}

// Load custom routine from IndexedDB
function loadCustomRoutine(day) {
    if (!isDBReady()) return;

    const transaction = db.transaction([routineStoreName], "readonly");
    const store = transaction.objectStore(routineStoreName);
    const request = store.get(day);
    request.onsuccess = function () {
        if (request.result) {
            displayCustomRoutine(request.result.routineData, day);
        } else {
            displayCustomRoutine([], day);  // Empty if no routine found
        }
    };
}

// Display custom routine in the table
function displayCustomRoutine(routineData, day) {
    const table = document.getElementById("customRoutineTable");
    table.innerHTML = "<tr><th>Time</th><th>Activity</th><th>Actions</th><th>Complete</th></tr>";

    routineData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.activity}</td>
            <td>
                <button class="editCustomRoutine" data-index="${index}">Edit</button>
                <button class="deleteCustomRoutine" data-index="${index}">Delete</button>
            </td>
            <td><input type="checkbox" class="completeTask" data-index="${index}" ${item.completed ? 'checked' : ''}></td>
        `;
        table.appendChild(row);
    });

    // Add event listeners for delete, edit, and complete task checkboxes
    document.querySelectorAll(".deleteCustomRoutine").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteCustomRoutine(day, index);
        });
    });

    document.querySelectorAll(".editCustomRoutine").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            editCustomRoutine(day, index);
        });
    });

    document.querySelectorAll(".completeTask").forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            const index = parseInt(e.target.dataset.index);
            toggleCompleteTask(day, index, e.target.checked);
        });
    });
}

// Edit custom routine activity
function editCustomRoutine(day, index) {
    const transaction = db.transaction([routineStoreName], "readwrite");
    const store = transaction.objectStore(routineStoreName);
    const request = store.get(day);

    request.onsuccess = function () {
        const routine = request.result;
        if (routine) {
            const routineItem = routine.routineData[index];
            const newTime = prompt("Edit Time", routineItem.time);
            const newActivity = prompt("Edit Activity", routineItem.activity);

            if (newTime && newActivity) {
                routineItem.time = newTime;
                routineItem.activity = newActivity;
                store.put(routine);
                loadCustomRoutine(day);  // Refresh the table
            }
        }
    };
}

// Delete custom routine activity
function deleteCustomRoutine(day, index) {
    const transaction = db.transaction([routineStoreName], "readwrite");
    const store = transaction.objectStore(routineStoreName);
    const request = store.get(day);

    request.onsuccess = function () {
        const routine = request.result;
        if (routine) {
            routine.routineData.splice(index, 1);
            store.put(routine);
            loadCustomRoutine(day);  // Refresh the table
        }
    };
}

// Toggle the completion status of a task
function toggleCompleteTask(day, index, isChecked) {
    const transaction = db.transaction([routineStoreName], "readwrite");
    const store = transaction.objectStore(routineStoreName);
    const request = store.get(day);

    request.onsuccess = function () {
        const routine = request.result;
        if (routine) {
            routine.routineData[index].completed = isChecked;
            store.put(routine);
            loadCustomRoutine(day);  // Refresh the table
        }
    };
}

// Handle custom routine form submission
document.getElementById("customRoutineForm").addEventListener("submit", function (e) {
    e.preventDefault();
    saveCustomRoutine();
});

// Initialize day select options
function initDaySelect() {
    const select = document.getElementById("daySelect");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    days.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.innerText = d;
        select.appendChild(opt);
    });

    select.setAttribute("multiple", "multiple");
    select.size = days.length;

    select.addEventListener("change", function () {
        const selectedDay = select.value;
        loadCustomRoutine(selectedDay);
    });

    const today = new Date().toLocaleString("en-US", { weekday: "long" });
    select.value = today;
    loadCustomRoutine(today);  // Load routine for today on page load
}

// Initialize everything
window.onload = function () {
    if (db) {
        initDaySelect();
    } else {
        dbRequest.onsuccess = function (e) {
            db = e.target.result;
            initDaySelect();
        };
    }
};
