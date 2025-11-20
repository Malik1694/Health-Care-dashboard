// State variable to track which Tab is currently active
let currentActiveTab = 'all';

// --- Global DOM element references and NEW State Variables ---
const dateRangeToggle = document.getElementById('dateRangeToggle');
const dateRangePopover = document.getElementById('dateRangePopover');
const dateRangeApply = document.getElementById('dateRangeApply');
const dateRangeClear = document.getElementById('dateRangeClear');
const calendarContainer = document.getElementById('calendarContainer');
const dateRangeDisplay = document.getElementById('dateRangeDisplay');

// 🎯 COMPLEX CALENDAR STATE: Used for the single-calendar range selection
let selectedStartDate = null;
let selectedEndDate = null;
let currentCalendarDate = new Date(); // Tracks the currently displayed month/year


// --- 1. RUN ON PAGE LOAD (Event Listeners & Initial Filter) ---
document.addEventListener('DOMContentLoaded', function() {
    // This runs the master filter immediately so colors appear right away
    applyFilters();
    
    // 🎯 NEW: Render the calendar on page load
    renderCalendar();

    // --- POPUP CONTROL LOGIC (Date Range Button) ---
    
    // Popover Toggle Logic: Open/close when clicking the main button
    if (dateRangeToggle) {
        dateRangeToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents click on toggle from triggering outside-click listener
            if (dateRangePopover) {
                dateRangePopover.classList.toggle('hidden');
                // Toggles 'active' class to rotate the icon
                dateRangeToggle.classList.toggle('active'); 
            }
        });
    }

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (dateRangePopover && dateRangeToggle && 
            !dateRangePopover.contains(e.target) && !dateRangeToggle.contains(e.target)) {
            dateRangePopover.classList.add('hidden');
            dateRangeToggle.classList.remove('active');
        }
    });

    // Apply Button Logic: Triggers filtering and closes popover
    if (dateRangeApply) {
        dateRangeApply.addEventListener('click', () => {
            updateDateRangeDisplay(); 
            applyFilters(); // Triggers the final filter
            dateRangePopover.classList.add('hidden'); 
            dateRangeToggle.classList.remove('active');
        });
    }

    // Clear Button Logic: Resets dates, triggers filtering, and closes popover
    if (dateRangeClear) {
        dateRangeClear.addEventListener('click', () => {
            selectedStartDate = null;
            selectedEndDate = null;
            
            updateDateRangeDisplay(); 
            renderCalendar(); // Rerender to show no selection
            applyFilters();
            dateRangePopover.classList.add('hidden'); 
            dateRangeToggle.classList.remove('active');
        });
    }

    // Initialize button text on load
    updateDateRangeDisplay(); 

    // Add listeners for other dropdowns that trigger filters immediately on change
    if (document.getElementById('statusSelect')) document.getElementById('statusSelect').addEventListener('change', applyFilters);
    if (document.getElementById('typeSelect')) document.getElementById('typeSelect').addEventListener('change', applyFilters);
    if (document.getElementById('sortSelect')) document.getElementById('sortSelect').addEventListener('change', sortRows); 

    // 🏆 FIX: Moved Dropdown Animation Listeners here 
    // This runs once the DOM is ready, enabling the rotation animation.
    document.querySelectorAll('.select-wrapper select').forEach(selectElement => {
        const wrapper = selectElement.closest('.select-wrapper');

        selectElement.addEventListener('focus', () => {
            wrapper.classList.add('active');
        });

        // Removes 'active' class when the select element loses focus (i.e., dropdown closes or user tabs away)
        selectElement.addEventListener('blur', () => {
             // Use a small delay to prevent immediate removal if user clicks another element quickly
            setTimeout(() => { 
                wrapper.classList.remove('active');
            }, 100); 
        });
    });
    // 🏆 END FIX
});

// --- NEW: COMPLEX CALENDAR LOGIC (State Management, Rendering, and Interaction) ---

// 1. Logic to handle selecting the start/end date when a day cell is clicked
function handleDateClick(event) {
    // 🛑 CRITICAL FIX: STOP THE CLICK FROM BUBBLING TO THE DOCUMENT LISTENER
    event.stopPropagation(); 
    
    const dateString = event.currentTarget.dataset.date; // YYYY-MM-DD
    if (!dateString) return;

    const newDate = new Date(dateString);
    newDate.setHours(0, 0, 0, 0); // Normalize to midnight

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Case 1: Start a new selection (clear end date)
        selectedStartDate = newDate;
        selectedEndDate = null;
    } else if (newDate.getTime() < selectedStartDate.getTime()) {
        // Case 2: New date is before start date (swap them)
        selectedEndDate = selectedStartDate;
        selectedStartDate = newDate;
    } else {
        // Case 3: New date is after start date (set as end date)
        selectedEndDate = newDate;
    }
    
    // Always rerender the calendar to show the new selection
    renderCalendar();
    // Update the button display text instantly
    updateDateRangeDisplay(); 
}

// 2. Attach click handlers after rendering the calendar HTML
function attachCalendarListeners() {
    
    // Month/Year Selectors 
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    const handleSelectChange = (e) => {
        e.stopPropagation(); // Prevents selection change from closing the popover
        
        // Update state based on current selection
        const newMonth = parseInt(monthSelect.value);
        const newYear = parseInt(yearSelect.value);

        currentCalendarDate.setMonth(newMonth);
        currentCalendarDate.setFullYear(newYear);
        
        renderCalendar();
    };

    if (monthSelect) {
        monthSelect.addEventListener('change', handleSelectChange);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', handleSelectChange);
    }
    
    // Previous/Next Month Buttons
    if (document.getElementById('prevMonth')) {
        document.getElementById('prevMonth').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents nav buttons from closing the popover
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (document.getElementById('nextMonth')) {
        document.getElementById('nextMonth').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents nav buttons from closing the popover
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Attach click listeners to the dynamically rendered day cells
    if (calendarContainer) {
        calendarContainer.querySelectorAll('.day').forEach(cell => {
            cell.addEventListener('click', handleDateClick);
        });
    }
}

// 3. Render the calendar grid based on currentCalendarDate
function renderCalendar() {
    if (!calendarContainer) return;
    
    calendarContainer.innerHTML = ''; 

    const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = date.getDay(); 

    // --- Generate Month Dropdown Options ---
    let monthOptions = '';
    for (let i = 0; i < 12; i++) {
        const name = new Date(year, i, 1).toLocaleDateString(undefined, { month: 'long' });
        const selected = (i === month) ? 'selected' : '';
        monthOptions += `<option value="${i}" ${selected}>${name}</option>`;
    }
    
    // --- Generate Year Dropdown Options (e.g., current year +/- 5) ---
    let yearOptions = '';
    const currentYear = new Date().getFullYear();
    // Loop through 5 years before to 5 years after the current year
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        const selected = (i === year) ? 'selected' : '';
        yearOptions += `<option value="${i}" ${selected}>${i}</option>`;
    }

    let calendarHTML = `
        <div class="calendar-header">
            <button id="prevMonth" class="nav-button">←</button>
            <div class="month-year-selects">
                <select id="monthSelect">${monthOptions}</select>
                <select id="yearSelect">${yearOptions}</select>
            </div>
            <button id="nextMonth" class="nav-button">→</button>
        </div>
        <table class="calendar-grid">
            <thead>
                <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
            </thead>
            <tbody>
                <tr>`;

    let totalCells = 0;

    // Fill leading empty cells (days from previous month)
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarHTML += '<td></td>';
        totalCells++;
    }

    // Fill calendar days
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        
        // Normalize dates for comparison (set time to midnight)
        const dayKey = new Date(currentDate.setHours(0, 0, 0, 0)).getTime();
        const startKey = selectedStartDate ? selectedStartDate.getTime() : null;
        const endKey = selectedEndDate ? selectedEndDate.getTime() : null;

        let className = 'day';
        if (dayKey === startKey && dayKey === endKey) {
            className += ' start-date end-date';
        } else if (dayKey === startKey) {
            className += ' start-date';
        } else if (dayKey === endKey) {
            className += ' end-date';
        } else if (startKey && endKey && dayKey > startKey && dayKey < endKey) {
            className += ' range-date';
        }
        
        calendarHTML += `<td class="${className}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}">${i}</td>`;
        
        totalCells++;
        
        if (totalCells % 7 === 0 && i < daysInMonth) {
            calendarHTML += '</tr><tr>';
        }
    }

    // Fill trailing empty cells 
    while (totalCells % 7 !== 0) {
        calendarHTML += '<td></td>';
        totalCells++;
    }

    calendarHTML += '</tr></tbody></table>';
    calendarContainer.innerHTML = calendarHTML;
    
    // Re-attach event listeners 
    attachCalendarListeners();
}

// 4. Update the display function to use state variables
function updateDateRangeDisplay() {
    if (!dateRangeDisplay) return; 

    const start = selectedStartDate;
    const end = selectedEndDate;

    if (!start && !end) {
        dateRangeDisplay.textContent = 'Date Range';
    } else {
        const formatDate = (dateObj) => {
            if (!dateObj) return 'Any';
            // Use 'en-US' locale for MM/DD/YYYY format consistency
            return dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        };
        const startFmt = start ? formatDate(start) : 'Any';
        const endFmt = end ? formatDate(end) : 'Any';

        dateRangeDisplay.textContent = `${startFmt} – ${endFmt}`;
    }
}


// --- 2. Tab Click Logic ---
function filterTabs(event, category) {
    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    event.currentTarget.classList.add("active");

    const typeSelect = document.getElementById('typeSelect');
    if (typeSelect) {
        typeSelect.value = category; 
    }

    currentActiveTab = category;
    applyFilters();
}

// --- 3. Master Filter (Shows/Hides Rows) ---
function applyFilters() {
    // 1. Get ALL filter values
    const statusFilter = document.getElementById('statusSelect').value.toLowerCase();
    const typeFilter = document.getElementById('typeSelect').value;
    
    // 🎯 Use COMPLEX CALENDAR STATE variables for filtering
    const startDate = selectedStartDate;
    const endDate = selectedEndDate;
    
    const tableBody = document.getElementById('tableBody');
    const rows = Array.from(tableBody.getElementsByTagName('tr'));

    rows.forEach(row => {
        // Prepare Row Data
        const rowType = row.getAttribute('data-type');
        
        // A. Tab/Type Check 
        const typeMatch = (typeFilter === 'all' || rowType === typeFilter);

        // B. Status Badge Check 
        const badge = row.querySelector('.badge');
        let badgeText = badge ? badge.innerText.toLowerCase() : '';
        if (badgeText.includes('acknowledged')) {
            badgeText = 'acknowledged';
        } else if (badgeText.includes('approved')) {
            badgeText = 'approved';
        } else if (badgeText.includes('denied')) {
            badgeText = 'denied';
        } else if (badgeText.includes('follow-up')) {
            badgeText = 'follow-up';
        }
        const statusMatch = (statusFilter === 'all' || badgeText === statusFilter);

        // C. Date Range Check (Uses the state variables directly)
        const submittedDateStr = row.cells[4] ? row.cells[4].innerText : ''; 
        let dateMatches = true;

        if (startDate || endDate) {
            const submittedDate = submittedDateStr ? new Date(submittedDateStr) : null;

            if (!submittedDate || isNaN(submittedDate.getTime())) {
                dateMatches = false;
            } else {
                // Normalize submitted date to midnight for comparison
                const normalizedSubmittedDate = new Date(submittedDate.setHours(0, 0, 0, 0));

                if (startDate && normalizedSubmittedDate < startDate) {
                    dateMatches = false;
                }
                if (endDate && normalizedSubmittedDate > endDate) {
                    dateMatches = false;
                }
            }
        }

        // Apply Display Logic: Combine all filters
        const showRow = statusMatch && typeMatch && dateMatches;

        if (showRow) {
            row.style.display = ""; // Show
        } else {
            row.style.display = "none"; // Hide
        }
    });

    // Trigger Sort
    sortRows();
}
// --- 4. Sorting Logic (Optimized for flicker reduction) ---
function sortRows() {
    const sortValue = document.getElementById('sortSelect').value;
    const tableBody = document.getElementById('tableBody');
    const today = new Date(); // Current date for calculation
    today.setHours(0, 0, 0, 0); 
    
    // Helper function for robust date parsing (converts MM/DD/YYYY or similar to YYYY-MM-DD)
    const parseDateForSort = (dateStr) => {
        if (!dateStr) return new Date(NaN); // Return Invalid Date for empty strings
        
        // Assuming your table cell contains a date string like "11/20/2025" (MM/DD/YYYY)
        const parts = dateStr.split(/[\/\-]/); 
        
        if (parts.length === 3) {
            // Assume MM/DD/YYYY format for reliable parsing
            const date = new Date(parts[2], parts[0] - 1, parts[1]);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        
        // Fallback to standard new Date() for ISO formats or unexpected strings
        const fallbackDate = new Date(dateStr);
        fallbackDate.setHours(0, 0, 0, 0);
        return fallbackDate;
    };
    
    // **Optimization Step 1: Detach tableBody from the DOM**
    const parent = tableBody.parentNode;
    if (parent) {
        parent.removeChild(tableBody);
    }

    const allRows = Array.from(tableBody.getElementsByTagName('tr'));
    
    const visibleRows = allRows.filter(row => row.style.display !== 'none');
    const hiddenRows = allRows.filter(row => row.style.display === 'none');
    
    if (visibleRows.length > 0) {
        visibleRows.sort((a, b) => {
            // Get the submission date from the 5th column (index 4)
            const dateA = parseDateForSort(a.cells[4].innerText);
            const dateB = parseDateForSort(b.cells[4].innerText);
            
            const timeA = dateA.getTime();
            const timeB = dateB.getTime();

            // Handle Invalid Dates (e.g., empty or unparseable cells)
            const isInvalidA = isNaN(timeA);
            const isInvalidB = isNaN(timeB);

            if (isInvalidA && isInvalidB) return 0;
            if (isInvalidA) return sortValue === 'newest' ? 1 : -1; // Push invalid date to the end for 'newest'
            if (isInvalidB) return sortValue === 'newest' ? -1 : 1; // Pull valid date to the start for 'newest'

            // Primary Sort: Newest vs. Oldest
            if (sortValue === 'newest') {
                return timeB - timeA; // B - A results in descending (newest first)
            } else {
                return timeA - timeB; // A - B results in ascending (oldest first)
            }
        });
    }

    tableBody.innerHTML = '';
    
    visibleRows.forEach(row => tableBody.appendChild(row));
    hiddenRows.forEach(row => tableBody.appendChild(row));

    // **Optimization Step 2: Re-attach the tableBody to the DOM**
    if (parent) {
        parent.appendChild(tableBody);
    }

    reapplyStriping();
}
// --- 5. Striping Logic (The "Paint" Brush) ---
function reapplyStriping() {
    const tableBody = document.getElementById('tableBody');
    const rows = Array.from(tableBody.getElementsByTagName('tr'));
    
    let visibleCount = 0; 

    rows.forEach(row => {
        row.classList.remove('highlight-row');

        if (row.style.display !== 'none') {
            if (visibleCount % 2 !== 0) {
                row.classList.add('highlight-row');
            }
            visibleCount++;
        }
    });
}

// --- 6. Reset Button ---
function resetFilters() {
    document.getElementById('statusSelect').value = 'all';
    document.getElementById('typeSelect').value = 'all'; 
    document.getElementById('sortSelect').value = 'newest';
    
    // Clear the date state and rerender
    selectedStartDate = null;
    selectedEndDate = null;
    updateDateRangeDisplay(); 
    renderCalendar(); 
    
    const tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    if (tabs.length > 0) {
        tabs[0].classList.add("active");
    }
    currentActiveTab = 'all';

    applyFilters(); 
}