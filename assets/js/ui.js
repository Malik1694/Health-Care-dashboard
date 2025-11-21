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

// Helper function to get the number of days left (Time Trigger)
function getDaysLeft(row) {
    const timeTriggerCell = row.cells[6]; // 7th column (index 6)
    const timeTriggerText = timeTriggerCell ? timeTriggerCell.innerText.trim() : '';

    if (timeTriggerText.includes('Expired')) return -1; // Treat expired as lowest
    if (timeTriggerText.includes('days left')) {
        const days = parseInt(timeTriggerText.split(' ')[0], 10);
        return isNaN(days) ? 9999 : days; // Use a large number for safety if parsing fails
    }
    // For 0 days left
    if (timeTriggerText.includes('0 days left')) return 0;
    
    return 9999; // Default large number for non-standard/missing data
}

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
    // 🏆 FIX: Change event on sort now correctly calls the sort function which relies on applyFilters output
    if (document.getElementById('sortSelect')) document.getElementById('sortSelect').addEventListener('change', sortRows); 

    // Dropdown Animation Listeners
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
});

// --- NEW: COMPLEX CALENDAR LOGIC (State Management, Rendering, and Interaction) ---

// 1. Logic to handle selecting the start/end date when a day cell is clicked
function handleDateClick(event) {
    // 🛑 CRITICAL FIX: STOP THE CLICK FROM BUBBLING TO THE DOCUMENT LISTENER
    event.stopPropagation(); 
    
    const dateString = event.currentTarget.dataset.date; // YYYY-MM-DD
    if (!dateString) return;

    // 🏆 FIX: Use ISO string to ensure correct date parsing regardless of local timezone offset
    // The format YYYY-MM-DD *must* be parsed as UTC midnight (Z) to avoid date shifting.
    const newDate = new Date(dateString + 'T00:00:00.000Z'); 

    // Normalize state dates to UTC midnight for comparison
    const startKey = selectedStartDate ? selectedStartDate.getTime() : null;
    const endKey = selectedEndDate ? selectedEndDate.getTime() : null;
    const newKey = newDate.getTime();


    if (!startKey || (startKey && endKey)) {
        // Case 1: Start a new selection (clear end date)
        selectedStartDate = newDate;
        selectedEndDate = null;
    } else if (newKey < startKey) {
        // Case 2: New date is before start date (swap them)
        selectedEndDate = selectedStartDate;
        selectedStartDate = newDate;
    } else {
        // Case 3: New date is after or equal to start date (set as end date)
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

    // Prepare normalized comparison keys for current selection
    // 🏆 FIX: Ensure selectedStartDate and selectedEndDate are normalized to UTC midnight for consistent comparison
    const startKey = selectedStartDate ? selectedStartDate.getTime() : null;
    const endKey = selectedEndDate ? selectedEndDate.getTime() : null;
    
    // Fill calendar days
    for (let i = 1; i <= daysInMonth; i++) {
        // 🏆 FIX: Create date using UTC for consistent comparison with state variables
        const currentDate = new Date(Date.UTC(year, month, i)); 
        const dayKey = currentDate.getTime();

        let className = 'day';
        // Compare keys (milliseconds since epoch)
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
        // 🏆 FIX: If only start is selected, show only start date
        const startFmt = start ? formatDate(start) : 'Any';
        const endFmt = end ? formatDate(end) : (start ? formatDate(start) : 'Any'); // If only start, end is the same
        
        dateRangeDisplay.textContent = `${startFmt} – ${end ? formatDate(end) : '?'}`;
        // Set the display text to be Start Date - End Date (use ? if no end date selected yet)
        if (start && !end) {
             dateRangeDisplay.textContent = `${startFmt} – ?`;
        } else if (start && end) {
             dateRangeDisplay.textContent = `${formatDate(start)} – ${formatDate(end)}`;
        } else {
             dateRangeDisplay.textContent = 'Date Range';
        }
    }
}


// --- 2. Tab Click Logic ---
window.filterTabs = function(event, category) { // Make global for HTML onclick
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
window.applyFilters = function() { // Make global for HTML onchange
    // 1. Get ALL filter values
    const statusFilter = document.getElementById('statusSelect').value.toLowerCase();
    const typeFilter = document.getElementById('typeSelect').value;
    
    // 🎯 Use COMPLEX CALENDAR STATE variables for filtering
    const startDate = selectedStartDate;
    const endDate = selectedEndDate;
    
    const tableBody = document.getElementById('tableBody');
    // 🏆 FIX: Get all rows first, including hidden ones, to ensure correct filtering.
    const allRows = Array.from(tableBody.getElementsByTagName('tr')); 

    allRows.forEach(row => {
        // Prepare Row Data
        const rowType = row.getAttribute('data-type');
        
        // A. Tab/Type Check 
        const typeMatch = (typeFilter === 'all' || rowType === typeFilter);

        // B. Status Badge Check 
        const badge = row.querySelector('.badge');
        let badgeText = badge ? badge.innerText.toLowerCase() : '';
        // Standardize the status text for comparison
        if (badgeText.includes('acknowledged') || badgeText.includes('awaiting acknowledgment')) {
            badgeText = 'acknowledged';
        } else if (badgeText.includes('approved')) {
            badgeText = 'approved';
        } else if (badgeText.includes('denied')) {
            badgeText = 'denied';
        } else if (badgeText.includes('follow-up')) {
            badgeText = 'follow-up';
        } else {
            // Catch-all for non-standard statuses, treating them as 'other'
            badgeText = 'other';
        }

        const statusMatch = (statusFilter === 'all' || badgeText === statusFilter);

        // C. Date Range Check (Uses the state variables directly)
        const submittedDateStr = row.cells[4] ? row.cells[4].innerText : ''; 
        let dateMatches = true;

        if (startDate || endDate) {
            // Helper function for robust date parsing (converts Oct 14, 2025 to a Date object)
            const parseSubmittedDate = (dateStr) => {
                if (!dateStr) return null;
                // Use the string as is and then normalize to midnight UTC for comparison
                const date = new Date(dateStr);
                // 🏆 FIX: Normalize the submitted date to UTC midnight for comparison
                return isNaN(date.getTime()) ? null : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            };

            const submittedDate = parseSubmittedDate(submittedDateStr);
            
            if (!submittedDate) {
                dateMatches = false;
            } else {
                const submittedKey = submittedDate.getTime();
                
                // Start date is inclusive (>=)
                if (startDate && submittedKey < startDate.getTime()) {
                    dateMatches = false;
                }
                // End date is inclusive (<=)
                if (endDate) {
                    // Set end date to 23:59:59.999 UTC to include the entire day
                    const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
                    // 🏆 FIX: Use UTC based end date comparison
                    const normalizedEndDate = new Date(Date.UTC(endOfDay.getFullYear(), endOfDay.getMonth(), endOfDay.getDate(), 23, 59, 59, 999));
                    
                    if (submittedKey > normalizedEndDate.getTime()) {
                        dateMatches = false;
                    }
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
window.sortRows = function() { // Make global for HTML onchange
    const sortValue = document.getElementById('sortSelect').value;
    const tableBody = document.getElementById('tableBody');
    
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
            // 🏆 FIX: Primary Sort - Use getDaysLeft to sort by Time Trigger
            const daysA = getDaysLeft(a);
            const daysB = getDaysLeft(b);

            // Handle Expired/Invalid data
            if (daysA === -1 && daysB !== -1) return sortValue === 'newest' ? 1 : -1; // Expired always last for 'newest'
            if (daysB === -1 && daysA !== -1) return sortValue === 'newest' ? -1 : 1; // Expired always last for 'newest'
            
            // "Most Recent" means CLOSEST TO EXPIRATION (lowest days left)
            if (sortValue === 'newest') {
                return daysA - daysB; // Ascending: 1, 2, 3... (closest to 1 is newest/most urgent)
            } else {
                // "Oldest" means FURTHEST FROM EXPIRATION (highest days left)
                return daysB - daysA; // Descending: 30, 29, 28... (closest to 30 is oldest)
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
window.resetFilters = function() { // Make global for HTML onclick
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