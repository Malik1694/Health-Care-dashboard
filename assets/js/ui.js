  // State variable to track which Tab is currently active
  let currentActiveTab = 'all';

  // --- 1. RUN ON PAGE LOAD ---
  document.addEventListener('DOMContentLoaded', function() {
      // This runs the master filter immediately so colors appear right away
      applyFilters();
  });

  // --- 2. Tab Click Logic ---
  function filterTabs(event, category) {
      // Update Visual Tabs
      var tabs = document.getElementsByClassName("tab");
      for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove("active");
      }
      event.currentTarget.classList.add("active");

      // ✨ FIX 1: Synchronize the 'All Types' dropdown with the clicked tab
      const typeSelect = document.getElementById('typeSelect');
      typeSelect.value = category; // Set the dropdown value to the category (e.g., 'AARTC' or 'all')

      // Update State & Run Filter
      currentActiveTab = category;
      applyFilters();
  }

  // --- 3. Master Filter (Shows/Hides Rows) ---
  function applyFilters() {
      // NOTE: Because of FIX 1, the typeFilter value is now automatically updated 
      // when a tab is clicked, ensuring tabs and dropdowns match.
      const statusFilter = document.getElementById('statusSelect').value.toLowerCase();
      const typeFilter = document.getElementById('typeSelect').value;
      
      const tableBody = document.getElementById('tableBody');
      const rows = Array.from(tableBody.getElementsByTagName('tr'));

      rows.forEach(row => {
          // A. Data Type Check
          const rowType = row.getAttribute('data-type');
          
          // This check is now slightly redundant but kept for logic consistency 
          // in case currentActiveTab is changed elsewhere.
          const tabMatch = (currentActiveTab === 'all' || rowType === currentActiveTab);

          // B. Status Badge Check (normalized to match filter options)
          const badge = row.querySelector('.badge');
          let badgeText = badge ? badge.innerText.toLowerCase() : '';
          
          // Normalize specific badge texts for filtering
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

          // C. Dropdown Type Check
          // With FIX 1, typeFilter will equal currentActiveTab, so we only need to check typeFilter 
          // against the row type to satisfy both tab and dropdown logic.
          const typeMatch = (typeFilter === 'all' || rowType === typeFilter);

          // Apply Display Logic: Filter only using status and the synchronized type
          if (statusMatch && typeMatch) {
              row.style.display = ""; // Show
          } else {
              row.style.display = "none"; // Hide
          }
      });

      // Trigger Sort (this function contains the DOM detachment/re-attachment to reduce flicker)
      sortRows();
  }

  // --- 4. Sorting Logic (Optimized for flicker reduction) ---
  function sortRows() {
      const sortValue = document.getElementById('sortSelect').value;
      const tableBody = document.getElementById('tableBody');
      
      // **Optimization Step 1: Detach tableBody from the DOM**
      const parent = tableBody.parentNode;
      if (parent) {
          parent.removeChild(tableBody);
      }

      const allRows = Array.from(tableBody.getElementsByTagName('tr'));
      
      // Separate visible and hidden rows AFTER filtering has occurred
      const visibleRows = allRows.filter(row => row.style.display !== 'none');
      const hiddenRows = allRows.filter(row => row.style.display === 'none');
      
      if (visibleRows.length > 0) {
          // Sort the visible rows in memory
          visibleRows.sort((a, b) => {
              // Assuming Date is in the 5th column (index 4)
              const dateA = new Date(a.cells[4].innerText);
              const dateB = new Date(b.cells[4].innerText);

              if (sortValue === 'newest') {
                  return dateB - dateA; 
              } else {
                  return dateA - dateB; 
              }
          });
      }

      // Clear the existing content (already detached)
      tableBody.innerHTML = '';
      
      // Append sorted visible rows first
      visibleRows.forEach(row => tableBody.appendChild(row));
      
      // Append hidden rows last
      hiddenRows.forEach(row => tableBody.appendChild(row));

      // **Optimization Step 2: Re-attach the tableBody to the DOM**
      if (parent) {
          parent.appendChild(tableBody);
      }

      // CRITICAL: Repaint the colors AFTER sorting is done
      reapplyStriping();
  }

  // --- 5. Striping Logic (The "Paint" Brush) ---
  function reapplyStriping() {
      const tableBody = document.getElementById('tableBody');
      const rows = Array.from(tableBody.getElementsByTagName('tr'));
      
      let visibleCount = 0; // Only count what the user can see

      rows.forEach(row => {
          // 1. Always remove the highlight class first to reset
          row.classList.remove('highlight-row');

          // 2. Only process visible rows
          if (row.style.display !== 'none') {
              // If the counter is ODD (1, 3, 5...), add the highlight class
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
      document.getElementById('typeSelect').value = 'all'; // ✨ FIX 2: Ensure Type dropdown is set to 'all'
      document.getElementById('sortSelect').value = 'newest';
      
      const tabs = document.getElementsByClassName("tab");
      for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove("active");
      }
      // Reset to the 'All' tab (the first one)
      if (tabs.length > 0) {
          tabs[0].classList.add("active");
      }
      currentActiveTab = 'all';

      applyFilters(); // This will trigger sortRows and reapplyStriping
  }