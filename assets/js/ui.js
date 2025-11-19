document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".action-buttons .tab");
    const contentWrapper = document.getElementById("tabContentWrapper");
  
    // Save original content (Review Supporting Documents)
    const originalContent = contentWrapper.innerHTML;
  
    // ---------------------------------------------
    // VIEW SIGNING DOCUMENT CONTENT
    // ---------------------------------------------
    const viewSigningHTML = `
        <div class="document-list">
          <h3>Signing Document</h3>
  
          <div style="background: #2C2C2C; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0; font-size: 14px; font-weight: 600;">MYLIB.HumanEd Health Services (Marian)</p>
              <button style="background: #fff; color: #000; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 700; cursor: pointer; font-size: 12px;">
                <i class="fa-solid fa-download"></i> DOWNLOAD
              </button>
            </div>
          </div>
  
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 40px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%23009BC5' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='12' y1='18' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='9' y1='15' x2='15' y2='15'%3E%3C/line%3E%3C/svg%3E" alt="Document" style="margin-bottom: 20px;">
  
              <h2 style="font-size: 24px; font-weight: 700; color: #009BC5; margin-bottom: 16px; font-family: 'Helvetica Neue';">CCSS Application - Jessica Johnson</h2>
  
              <div style="border-top: 2px dashed #ccc; border-bottom: 2px dashed #ccc; padding: 12px 0; margin: 24px 0;">
                <p style="font-size: 16px; font-weight: 600; color: #333;">Page 1</p>
              </div>
  
              <div style="text-align: left; line-height: 1.8;">
                <h3 style="font-size: 18px; font-weight: 700; color: #333; margin-bottom: 12px;">Guide</h3>
                <p style="font-size: 14px; font-weight: 700; color: #333; margin-bottom: 12px;">When to Submit the Application:</p>
  
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 8px;">Agencies/Organizations who want to provide Comprehensive Community Support Services CCSS and have the capacity to do so.</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 8px;">Agencies/Organizations who are opening a new location (requires separate application)</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 8px;">After completion of CCSS training (requires uploading educational certificate) need credentialed staff</li>
                </ul>
  
                <p style="font-size: 14px; font-weight: 700; color: #333; margin: 16px 0 12px;">Supporting Documentation to Gather: CCSS Clinical Supervisor</p>
  
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Copy of License</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Evidence of 1 year of Supervisory Experience</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Evidence of training in Supervised Clinical LettersCertification</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Copy of College Transcript documenting Supervision of Non-Clinical Staff</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Copy of CCSS Training Certificate</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Resume (detailing one or more years of supervisory experience)</li>
                </ul>
  
                <p style="font-size: 13px; color: #4b5563; margin: 16px 0;">CCSS Program Supervisor (If this is a different person than the Clinical Supervisor, these will be required)</p>
  
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Copy of Bachelor's Degree in a human services field from an accredited university</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Copy of certificate that shows 1 year's related experience in a position working with CCSS with the target population and care managers</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Resume (detailing one or more years of supervisory experience)</li>
                  <li style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">Copy of CCSS Training Certificate</li>
                </ul>
  
                <p style="font-size: 13px; color: #4b5563; margin-top: 20px; line-height: 1.6;">If you have hired CSWs/CSPs, you will be required to state their names and upload the following documents<br><strong style="color: #dc2626;">**IMPORTANT NOTE: These documents are REQUIRED to be uploaded with the application.**</strong></p>
              </div>
  
              <div style="display: flex; gap: 12px; margin-top: 32px; justify-content: center;">
                <button style="background: #dc2626; color: white; padding: 12px 32px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Back to List Doc</button>
                <button style="background: #2C2C2C; color: white; padding: 12px 32px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Print Document</button>
                <button style="background: #009BC5; color: white; padding: 12px 32px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Save as PDF</button>
              </div>
            </div>
          </div>
        </div>
    `;
  
    // ---------------------------------------------
    // APPROVE / DENY PROVIDER CONTENT
    // ---------------------------------------------
    const approveDenyHTML = `
        <div class="document-list">
          <h3 style="margin-bottom: 24px;">Choose one:</h3>
  
          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            <button id="approveBtn" style="background: #80C342; color: white; padding: 12px 32px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">APPROVE</button>
            <button id="denyBtn" style="background: #fff; color: #dc2626; padding: 12px 32px; border: 1px solid #dc2626; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">DENY</button>
          </div>
  
          <p style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 16px;">Let's generate your APPROVAL letter.</p>
          <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">Details:</p>
  
          <div style="margin-bottom: 24px;">
            <label style="font-size: 14px; font-weight: 700; color: #333; display: block; margin-bottom: 8px;">Select Approvals:</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <button style="background: #fff; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer;">CCSS ×</button>
              <button style="background: #fff; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer;">IOP ×</button>
              <button style="background: #fff; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer;">PSR ×</button>
              <button style="background: #fff; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer;">^</button>
            </div>
          </div>
  
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 14px; font-weight: 700; color: #333; margin-bottom: 12px;">Program Specific Selections:</p>
  
            <div style="background: #009BC5; color: white; padding: 12px 20px; border-radius: 6px; margin-bottom: 12px; font-weight: 600;">
              CCSS-Contracted Support Services
            </div>
  
            <div style="padding: 12px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px;">
              IOP (Intensive Outpatient Program)
            </div>
  
            <div style="padding: 12px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 12px;">
              PSR (Psychosocial Rehabilitation)
            </div>
  
            <p style="font-size: 12px; color: #6b7280; font-style: italic;">*You can choose multiple Programs</p>
  
            <button style="background: #dc2626; color: white; padding: 10px 24px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; margin-top: 12px;">APPLY NOW</button>
          </div>
  
          <div style="margin-bottom: 24px;">
            <label style="font-size: 14px; font-weight: 700; color: #333; display: block; margin-bottom: 8px;">Custom Message: *</label>
            <textarea style="width: 100%; min-height: 150px; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; resize: vertical;" placeholder="Enter custom message (optional)"></textarea>
          </div>
  
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;">
  
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <div>
                <p style="font-size: 14px; font-weight: 700; color: #333; margin-bottom: 8px;">What would you like to do?</p>
              </div>
              <button style="background: #80C342; color: white; padding: 10px 24px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px;">
                GENERATE LETTER
              </button>
            </div>
  
            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
              <button style="background: #fff; color: #333; padding: 10px 24px; border: 1px solid #ccc; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px;">
                DOWNLOAD LETTER
              </button>
              <button style="background: #f59e0b; color: white; padding: 10px 24px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px;">
                EMAIL LETTER TO PROVIDER
              </button>
            </div>
  
            <div style="margin-bottom: 20px;">
              <label style="font-size: 14px; font-weight: 700; color: #333; display: block; margin-bottom: 8px;">From: *</label>
              <input type="email" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;" placeholder="Sender Email Address Here">
            </div>
  
            <div style="margin-bottom: 20px;">
              <label style="font-size: 14px; font-weight: 700; color: #333; display: block; margin-bottom: 8px;">CC:</label>
              <input type="email" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;" placeholder="CC Email Addresses">
            </div>
  
            <div style="margin-bottom: 20px;">
              <label style="font-size: 14px; font-weight: 700; color: #333; display: block; margin-bottom: 8px;">Subject: *</label>
              <input type="text" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;" placeholder="Email Subject">
            </div>
  
            <div style="margin-bottom: 20px;">
              <label style="font-size: 14px; font-weight: 700; color: #333; display: block; margin-bottom: 8px;">Message: *</label>
              <textarea style="width: 100%; min-height: 200px; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
              <p style="font-size: 24px; color: #f59e0b; font-weight: 700; margin-top: 8px;">3143</p>
            </div>
  
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button style="background: #f59e0b; color: white; padding: 12px 32px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">
                SAVE DRAFT
              </button>
              <button style="background: #80C342; color: white; padding: 12px 48px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">
                SEND
              </button>
            </div>
          </div>
        </div>
    `;
  
    // ---------------------------------------------
    // TAB CLICK HANDLING
    // ---------------------------------------------
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
  
        if (index === 0) {
          contentWrapper.innerHTML = originalContent;
        }
  
        if (index === 1) {
          contentWrapper.innerHTML = viewSigningHTML;
        }
  
        if (index === 2) {
          contentWrapper.innerHTML = approveDenyHTML;
  
          setTimeout(() => {
            const approveBtn = document.getElementById("approveBtn");
            const denyBtn = document.getElementById("denyBtn");
  
            if (approveBtn && denyBtn) {
              approveBtn.addEventListener("click", () => {
                approveBtn.style.background = "#80C342";
                approveBtn.style.color = "#fff";
                approveBtn.style.border = "none";
  
                denyBtn.style.background = "#fff";
                denyBtn.style.color = "#dc2626";
                denyBtn.style.border = "1px solid #dc2626";
              });
  
              denyBtn.addEventListener("click", () => {
                denyBtn.style.background = "#dc2626";
                denyBtn.style.color = "#fff";
                denyBtn.style.border = "none";
  
                approveBtn.style.background = "#fff";
                approveBtn.style.color = "#80C342";
                approveBtn.style.border = "1px solid #80C342";
              });
            }
          }, 50);
        }
      });
    });
  
  });
  