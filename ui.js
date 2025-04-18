document.getElementById("addRoutineBtn").addEventListener("click", function () {
    document.getElementById("routineFormContainer").style.display = "block"; // Show form
    this.style.display = "none"; // Hide the "Add Routine" button after it is clicked
});

document.getElementById("closeBtn").addEventListener("click", function () {
    document.getElementById("routineFormContainer").style.display = "none"; // Hide form
    document.getElementById("addRoutineBtn").style.display = "inline-block"; // Show "Add Routine" button again
});

// Handle task completion (cross out text and hide checked tasks)
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('completeTask')) {
        const row = e.target.closest('tr');
        row.classList.toggle('crossed'); // Cross out task
        
        // Save the checked status (optional - for persistence)
        // You can store it in localStorage or another method if needed
    }
});

// Hide checked routines when "Hide Checked" button is clicked
document.getElementById("hideCheckedBtn").addEventListener("change", function () {
    const isChecked = this.checked;
    const rows = document.querySelectorAll('#customRoutineTable tr');

    rows.forEach(row => {
        const checkbox = row.querySelector('.completeTask');
        if (checkbox && checkbox.checked) {
            row.style.display = isChecked ? 'none' : ''; // Hide or show the row
        }
    });
});
