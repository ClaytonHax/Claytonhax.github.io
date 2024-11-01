// Element references
const timerDisplay = document.getElementById('timer');
const scrambleDisplay = document.getElementById('scramble');
const timesDisplay = document.querySelector('.times-list');
const bestTimeDisplay = document.getElementById('best-time');
const averageDisplay = document.getElementById('average');
const averageOf5Display = document.getElementById('average-of-5');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettings = document.getElementById('close-settings');
const scrambleLengthSlider = document.getElementById('scramble-length');
const scrambleLengthValue = document.getElementById('scramble-length-value');
const timeOptionsMenu = document.getElementById('time-options');
const selectedscramble = document.getElementById('selected-scramble');
const checkbox = document.getElementById('myCheckbox'); // Reference to the checkbox

let isRunning = false; // Indicates if the timer is currently running
let startTime, timerInterval, colorTimeout, readyTimeout; // Timing variables
let isReadyToStart = false; // Indicates if timer is ready to start
let isSpacePressed = false; // Indicates if space is pressed (for keyboard)
let selectedTimeIndex = -1; // Index of the selected time for editing
let times = []; // Array to hold recorded times

// Moves according to specified order for cube scrambling
const faceMoves = ["F", "F'", "F2", "B", "B'", "B2"];
const sideMoves = ["R", "R2", "R'", "L", "L'", "L2"];
const upDownMoves = ["U", "U'", "U2", "D", "D'", "D2"];

// Generate a random cube scramble based on the selected length
function generateScramble() {
    const scramble = [];
    let lastMove = "";

    // Build scramble based on length selected
    for (let i = 0; i < parseInt(scrambleLengthSlider.value); i++) {
        let move;
        if (i % 3 === 0) { // Face moves
            do {
                move = faceMoves[Math.floor(Math.random() * faceMoves.length)];
            } while (move[0] === lastMove[0]); // Prevent sequential same faces
        } else if (i % 3 === 1) { // Side moves
            do {
                move = sideMoves[Math.floor(Math.random() * sideMoves.length)];
            } while (move[0] === lastMove[0]); // Prevent sequential same sides
        } else { // Up/Down moves
            do {
                move = upDownMoves[Math.floor(Math.random() * upDownMoves.length)];
            } while (move[0] === lastMove[0]); // Prevent sequential same up/down moves
        }
        scramble.push(move);
        lastMove = move; // Update last move
    }
    return scramble.join(' '); // Return the scramble as a string
}

// Update scramble display on the page
function updateScramble() {
    const scramble = generateScramble();
    scrambleDisplay.textContent = "Scramble: " + scramble; // Display scramble
}

// Format time in mm:ss.mm format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

// Start the timer
function startTimer() {
    timerDisplay.textContent = "00:00.00"; // Reset display
    lastRecordedTime = timerDisplay.textContent; // Reset last recorded time
    timerDisplay.classList.add('running'); // Add running class for styling
    timerDisplay.style.color = "white"; // Set timer color
    startTime = Date.now(); // Capture start time
    timerInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time
        timerDisplay.textContent = formatTime(elapsedTime); // Update display
    }, 10); // Update every 10 ms
}

// Stop the timer and save the time
function stopTimer() {
    clearInterval(timerInterval); // Stop the interval
    timerDisplay.classList.remove('running'); // Remove running class
    const endTime = (Date.now() - startTime) / 1000; // Calculate end time
    addTime(endTime); // Add the recorded time to the list
    isRunning = false; // Set the running state to false
    lastRecordedTime = formatTime(endTime); // Store the last recorded time
}

// Add time to the times array and update the display
function addTime(elapsedTime) {
    const scramble = scrambleDisplay.textContent; // Get the current scramble
    times.push({ time: elapsedTime, scramble }); // Push new time and scramble to the array
    updateTimesDisplay(); // Refresh the display of times
    saveTimes(); // Save the updated times to local storage
}

// Update the times display
function updateTimesDisplay() {
    // Identify the best (minimum) time from the list
    const bestTime = Math.min(...times.map(entry => entry.time));

    // Generate HTML for each time entry, using an if statement to add 'best-time' styling for the best time
    timesDisplay.innerHTML = times
        .map((entry, index) => {
            const isBestTime = entry.time === bestTime; // Check if this entry is the best time
            const bestTimeStyle = isBestTime ? 
                'style="font-weight: 600; border: 2px solid green; padding: 5px; border-radius: 4px; box-shadow: 0 0 10px green;"' : '';

            // Return the HTML with inline styling for the best time
            return `
                <div class="time-entry" data-index="${index}" ${bestTimeStyle}>
                    #${index + 1}: ${formatTime(entry.time)}
                </div>`;
        })
        .reverse() // Reverse the display order so the latest time is at the top
        .join(""); // Join entries into a single HTML block

    // Update additional stats like best time, average, etc.
    updateStats();
}

// Update best time, average, and average of 5
function updateStats() {
    if (times.length === 0) return; // If no times recorded, exit

    const bestTime = Math.min(...times.map(entry => entry.time)).toFixed(3); // Calculate best time
    bestTimeDisplay.innerHTML = `Best Time: <span class='highlight'>${formatTime(bestTime)}</span>`; // Update display

    const average = (times.reduce((sum, entry) => sum + entry.time, 0) / times.length).toFixed(3); // Calculate average
    averageDisplay.textContent = "Average: " + formatTime(average); // Update average display

    if (times.length >= 5) { // Calculate average of last 5 times if available
        const last5 = times.slice(-5);
        last5.sort((a, b) => a.time - b.time); // Sort the last 5 times
        const avgOf5 = (last5.slice(1, 4).reduce((sum, entry) => sum + entry.time, 0) / 3).toFixed(3); // Average of middle 3
        averageOf5Display.textContent = "Average of 5: " + formatTime(avgOf5); // Display average of 5
    } else {
        averageOf5Display.textContent = "Average of 5: N/A"; // Not enough times
    }
}

// Save times to local storage
function saveTimes() {
    localStorage.setItem('CTimes', JSON.stringify(times)); // Save times array as JSON
}

// Load times from local storage
function loadTimes() {
    const savedTimes = localStorage.getItem('CTimes'); // Retrieve saved times
    if (savedTimes) {
        times = JSON.parse(savedTimes); // Parse JSON back into an array
        updateTimesDisplay(); // Update times display
    }
}

// Spacebar Keydown for Timer Control
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!isSpacePressed && !isRunning) {
            isSpacePressed = true; // Mark space as pressed
            timerDisplay.style.color = "red"; // Change display color to red
            timerDisplay.textContent = "Hold..."; // Prompt user to hold
            colorTimeout = setTimeout(() => {
                if (isSpacePressed) { // Ensure space is still held down
                    timerDisplay.style.color = "green"; // Change color to green
                    timerDisplay.textContent = "00:00.00"; // Reset timer display
                    isReadyToStart = true; // Set ready state
                }
            }, 500); // Wait for 500ms before changing to ready state
        } else if (isRunning) {
            stopTimer(); // If timer is running, stop it and update the scramble
            updateScramble();
        }
    }
});

// Spacebar Keyup to Reset Display on Early Release and Start Timer
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        clearTimeout(colorTimeout); // Clear the color change timeout

        // If released before being ready, reset to last recorded time
        if (!isReadyToStart && !isRunning) {
            timerDisplay.style.color = "white"; // Reset color
            timerDisplay.textContent = lastRecordedTime; // Show last recorded time
        }

        // Start the timer if ready
        if (isReadyToStart && !isRunning) {
            startTimer(); // Start the timer
            isRunning = true; // Set running state to true
            isReadyToStart = false; // Reset ready state
        }

        // Reset for next hold attempt
        isSpacePressed = false; // Reset space pressed status
        isReadyToStart = false; // Reset ready state
    }
});

// Toggle settings panel visibility
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('visible'); // Show/hide settings panel
});

closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('visible'); // Close settings panel
});

// Update displayed scramble length value
scrambleLengthSlider.addEventListener('input', () => {
    scrambleLengthValue.textContent = scrambleLengthSlider.value; // Update displayed value
    updateScramble(); // Update scramble when length changes
});

// Click event for times display
timesDisplay.addEventListener('click', (event) => {
    if (event.target.classList.contains('time-entry')) {
        event.stopPropagation(); // Prevent document-level click from closing menu
        selectedTimeIndex = event.target.dataset.index; // Get index of selected time
        
        // Position and show the time options menu
        const rect = event.target.getBoundingClientRect();
        timeOptionsMenu.style.display = 'block'; // Show the options menu
        timeOptionsMenu.style.top = `${rect.top + window.scrollY - timeOptionsMenu.offsetHeight}px`; // Position above the time entry
        timeOptionsMenu.style.left = `${rect.left}px`; // Align left with the time entry
        
        // Show corresponding scramble in scrambleDisplay
        selectedscramble.textContent = times[selectedTimeIndex].scramble; // Display scramble for selected time
    }
});

// Add 2 seconds to the selected time
document.getElementById('add-2-seconds').addEventListener('click', () => {
    if (selectedTimeIndex > -1) { // Check if a time is selected
        times[selectedTimeIndex].time += 2; // Add 2 seconds to selected time
        updateTimesDisplay(); // Refresh time display
        saveTimes(); // Save updated times
        timeOptionsMenu.style.display = 'none'; // Hide options menu
        selectedTimeIndex = -1; // Reset selected index
    }
});

// Delete selected time
document.getElementById('delete-time').addEventListener('click', () => {
    if (selectedTimeIndex > -1) { // Check if a time is selected
        times.splice(selectedTimeIndex, 1); // Remove selected time
        updateTimesDisplay(); // Refresh time display
        saveTimes(); // Save updated times
        timeOptionsMenu.style.display = 'none'; // Hide options menu
        selectedTimeIndex = -1; // Reset selected index
    }
});

// Hide time options menu when clicking outside
document.addEventListener('click', (event) => {
    if (!timeOptionsMenu.contains(event.target) && event.target !== timeOptionsMenu) {
        timeOptionsMenu.style.display = 'none'; // Hide menu if clicked outside
    }
});

// Prevent the menu from hiding if clicking inside the menu itself
timeOptionsMenu.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event from bubbling up to document click
});

// Mouse down event (equivalent to spacebar press)
document.addEventListener('mousedown', (event) => {
    // Only handle left mouse button (button 0)
    if (event.button === 0 && checkbox.checked) { // Check if checkbox is checked
        if (!isSpacePressed && !isRunning) {
            isSpacePressed = true; // Mark mouse button as pressed
            timerDisplay.style.color = "red"; // Change display color to red
            timerDisplay.textContent = "Hold..."; // Prompt user to hold
            colorTimeout = setTimeout(() => {
                if (isSpacePressed) { // Ensure mouse button is still held down
                    timerDisplay.style.color = "green"; // Change color to green
                    timerDisplay.textContent = "00:00.00"; // Reset timer display
                    isReadyToStart = true; // Set ready state
                }
            }, 500); // Wait for 500ms
        } else if (isRunning) {
            stopTimer(); // Stop the timer if it is running
            updateScramble(); // Update the scramble display
        }
    }
});

// Mouse up event (equivalent to spacebar release)
document.addEventListener('mouseup', (event) => {
    if (event.button === 0 && checkbox.checked) { // Only handle left mouse button if checkbox is checked
        clearTimeout(colorTimeout); // Clear the color change timeout

        // If released before being ready, reset to last recorded time
        if (!isReadyToStart && !isRunning) {
            timerDisplay.style.color = "white"; // Reset color
            timerDisplay.textContent = lastRecordedTime; // Show last recorded time
        }

        // Start the timer if ready
        if (isReadyToStart && !isRunning) {
            startTimer(); // Start the timer
            isRunning = true; // Set running state to true
            isReadyToStart = false; // Reset ready state
        }

        // Reset for next hold attempt
        isSpacePressed = false; // Reset space pressed status
        isReadyToStart = false; // Reset ready state
    }
});

// Prevent text selection during timer operation
document.addEventListener('selectstart', (event) => {
    if (isSpacePressed || isRunning) { // If space pressed or timer running
        event.preventDefault(); // Prevent text selection
    }
});

// Prevent default browser behaviors that might interfere
document.addEventListener('contextmenu', (event) => {
    if (isSpacePressed || isRunning) { // If space pressed or timer running
        event.preventDefault(); // Prevent context menu from appearing
    }
});

// Initialize scramble and load saved times
updateScramble(); // Generate initial scramble
loadTimes(); // Load saved times from local storage