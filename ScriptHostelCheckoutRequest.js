let hcrPendingStdList = {};
let selectedHCREntry = [];
let keyFiltersDataHCREntry = {};
let groupData = [];

const CLASS_NAME_HINDI_MAP = {
  "Pre Nursery": "प्री नर्सरी",
  Nursery: "नर्सरी",
  KG: "केजी",
  UKG: "यूकेजी",
  I: "पहली",
  II: "दूसरी",
  III: "तीसरी",
  IV: "चौथी",
  V: "पाँचवीं",
  VI: "छठी",
  VII: "सातवीं",
  VIII: "आठवीं",
  IX: "नौवीं",
  X: "दसवीं",
  XI: "ग्यारहवीं",
  XII: "बारहवीं",
};

const PURPOSE_LIMITS = {
  "Temple Visit": 15,
  "Krishna Kutir Mangal Aarti": 12,
  Sankirtan: 2,
  "Park Games": 20,
  Swimming: 2,
  "Special Occasion (Festival at Temple, Marriage, etc.)": 2,
};

const DURATION_OPTIONS = {
  day: [
    1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 22, 25, 30, 35, 40, 45, 50, 60,
  ],

  time: [
    { value: 15, label: "15 Min" },
    { value: 30, label: "30 Min" },
    { value: 60, label: "60 Min" },
    { value: 90, label: "90 Min" },
    { value: 120, label: "120 Min" },
    { value: 180, label: "180 Min" },
    { value: 300, label: "300 Min" },
  ],
};

function HANDLE_DURATION_TYPE_CHANGE() {
  const type = document.getElementById("durationTypeDropdown").value;

  const dropdown = document.getElementById("specialEntryDuration");

  dropdown.innerHTML = `<option value="">Select Duration</option>`;

  if (!type) return;

  // ===========================
  // DAYS
  // ===========================
  if (type === "day") {
    DURATION_OPTIONS.day.forEach((day) => {
      const opt = document.createElement("option");
      opt.value = day;
      opt.textContent = day === 1 ? "1 Day" : `${day} Days`;

      dropdown.appendChild(opt);
    });
  }

  // ===========================
  // TIME
  // ===========================
  if (type === "time") {
    DURATION_OPTIONS.time.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.value;
      opt.textContent = item.label;

      dropdown.appendChild(opt);
    });
  }
}

function LOAD_HCR_PURPOSE_DROPDOWN() {
  const dropdown = document.getElementById("purposeDropdown");

  dropdown.innerHTML = `<option value="">Select Purpose</option>`;

  Object.keys(PURPOSE_LIMITS).forEach((purpose) => {
    const option = document.createElement("option");
    option.value = purpose;
    option.textContent = `${purpose} (Max Student Allowed:  ${PURPOSE_LIMITS[purpose]})`;
    dropdown.appendChild(option);
  });
}

function HANDLE_PURPOSE_CHANGE(value) {
  const box = document.getElementById(
    "hostelCheckoutRequest-dynamic-dropdown-container",
  );

  if (value) box.classList.remove("disabled");
  else box.classList.add("disabled");

  const dropdown = box.querySelector(".dynamic-dropdown");

  if (dropdown?.forceUpdateSelection) {
    dropdown.forceUpdateSelection();
  }
}

CREATE_MULTI_SELECT_DROPDOWN_WITH_CATEGORY_WITH_KEYFILTER({
  containerId: "hostelCheckoutRequest-dynamic-dropdown-container",
  title: "Select",
  options: [],
  callback: () => {},
  controls: {},
  keyFilters: {},
});

function HCR_PROCESS_DATA(hcRequestSheetData, allStudentsData) {
  const today = new Date();
  const presentMap = new Map();
  const exitSet = new Set();

  function isSameDay(d1, d2) {
    return (
      d1 &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  // =============================
  // 1. ONLY HOSTELLERS (Y)
  // =============================
  Object.keys(allStudentsData).forEach((key) => {
    const obj = allStudentsData[key];

    if (
      obj.hostler === "Y" &&
      obj.currentResident === "Y" &&
      obj.gender === "Male"
    ) {
      presentMap.set(key, key);
    }
  });

  // =============================
  // 2. REMOVE THOSE ALREADY IN hcRequestSheetData (TODAY)
  // =============================
  for (let i = 1; i < hcRequestSheetData.length; i++) {
    const row = hcRequestSheetData[i];
    const rowDate = PARSE_IST_DATE(row[0]);

    if (!isSameDay(rowDate, today)) continue;

    (row[2]?.split("\n") || []).forEach((s) => {
      const name = s.trim();
      if (name) exitSet.add(name);
    });
  }

  // =============================
  // 3. PENDING = HOSTELLERS - REQUESTED
  // =============================
  const pending = Array.from(presentMap.keys()).filter(
    (student) => !exitSet.has(student),
  );

  // =============================
  // 4. CATEGORY
  // =============================
  const ALL_CLASS_NAME =
    "Pre Nursery, Nursery, KG, UKG, I, II, III, IV, V, VI, VII, VIII, IX, X, XI, XII";

  const categorized = {};

  ALL_CLASS_NAME.split(",").forEach((c) => {
    const cls = c.trim();
    const clsHindi = CLASS_NAME_HINDI_MAP[cls] || cls;
    categorized[clsHindi] = [];
  });

  // =============================
  // 5. FINAL PUSH
  // =============================
  pending.forEach((student) => {
    const obj = allStudentsData[student];
    if (!obj) return;

    const cls = obj.studentOrgClassName;
    if (!cls) return;

    const clsHindi = CLASS_NAME_HINDI_MAP[cls] || cls;
    if (!categorized[clsHindi]) return;

    categorized[clsHindi].push({
      value: obj.studentHindiName || obj.studentName,
      englishValue: student,
      class: cls,
      enableTime: obj.lastClassTime || "",
      tutionTeacher: obj.tutionTeacher || "",
    });
  });

  // =============================
  // 6. REMOVE EMPTY
  // =============================
  Object.keys(categorized).forEach((cls) => {
    if (!categorized[cls].length) delete categorized[cls];
  });

  console.log("categorized defined", categorized);
  return categorized;
}

function hcrPopulateMultiSelectDropdownEntry() {
  document.getElementById("specialEntryDuration").value = "";
  UPDATE_MULTI_SELECT_DROPDOWN_WITH_CATEGORY_WITH_KEYFILTER(
    "hostelCheckoutRequest-dynamic-dropdown-container",
    hcrPendingStdList,
    (data) => {
      console.log(data);
      selectedHCREntry = data.map((item) =>
        typeof item === "object" ? item.englishValue : item,
      );
    },
    {
      showSelectAll: false,
      showFilters: true,
      showCategoryView: false,
      selectionLimit: () => getCurrentLimit(),
    },
    {},
  );
}

function getCurrentLimit() {
  const purpose = document.getElementById("purposeDropdown").value;
  return PURPOSE_LIMITS[purpose] || null;
}

async function hcrStudentEntryBtnClick() {
  LOAD_HCR_PURPOSE_DROPDOWN();

  const output = await CALL_API("GET_HCR_RAW_DATA", {});
  hcrPendingStdList = HCR_PROCESS_DATA(
    output?.data?.hcRequestSheetData,
    output?.data?.allStudentsData,
    selectedUser?.role,
  );

  hcrPopulateMultiSelectDropdownEntry();
  SHOW_SPECIFIC_DIV("hostelCheckoutRequestPopup");
  SET_DIV_TITLE(
    "hostelCheckoutRequestPopup",
    "Hostelers Checkout Request System",
  );

  groupData = populateAllSewakartaList(
    output?.data?.hcRequestSheetData,
    output?.data?.allStudentsData,
    selectedUser?.role,
  );
  renderAccordionGroups();
}

function populateAllSewakartaList(hcRequestSheetData, allStudentsData) {
  const today = new Date();
  const finalMap = {};

  function isSameDay(d1, d2) {
    return (
      d1 &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function getDateValue(dateStr) {
    if (!dateStr) return null;
    return PARSE_IST_DATE(dateStr);
  }

  // =====================================
  // TODAY REQUESTED DATA ONLY
  // row[0] = Date
  // row[1] = Request Raised DateTime
  // row[2] = Student Names
  // row[3] = Requested By
  // =====================================
  for (let i = 1; i < hcRequestSheetData.length; i++) {
    const row = hcRequestSheetData[i];

    const rowDate = PARSE_IST_DATE(row[0]);
    if (!isSameDay(rowDate, today)) continue;

    const requestTime = getDateValue(row[1]);
    const groupName = row[3]?.toString().trim() || "Unknown Group";
    const studentList = row[2]?.split("\n") || [];

    // group create
    if (!finalMap[groupName]) {
      finalMap[groupName] = {
        group: groupName,
        members: [],
      };
    }

    studentList.forEach((studentName) => {
      const cleanName = studentName.trim();
      if (!cleanName) return;

      const studentObj = allStudentsData[cleanName];

      let currentStatus = "Requested";

      if (studentObj) {
        const resident = studentObj.currentResident;
        const movementTime = getDateValue(studentObj.hostelCheckincheckoutTime);

        // =====================================
        // STATUS RULES
        // =====================================

        if (resident === "N") {
          currentStatus = "Checked Out";
        } else if (resident === "Y") {
          console.log("name ", studentObj?.studentName);
          console.log("movementTime", movementTime);
          console.log("requestTime", requestTime);
          if (
            movementTime &&
            requestTime &&
            movementTime.getTime() > requestTime.getTime()
          ) {
            currentStatus = "Checked In";
          } else {
            currentStatus = "Requested";
          }
        }
      }

      finalMap[groupName].members.push({
        name:
          studentObj?.studentHindiName || studentObj?.studentName || cleanName,

        englishName: cleanName,
        currentStatus: currentStatus,
      });
    });
  }

  // =====================================
  // FINAL ARRAY OUTPUT
  // =====================================
  const output = Object.values(finalMap);

  console.log("Final Requested Group Data:", output);

  return output;
}

async function hcrEntrySubClick() {
  try {
    const purpose =
      document.getElementById("purposeDropdown")?.value.trim() || "";

    const durationType =
      document.getElementById("durationTypeDropdown")?.value.trim() || "";

    const duration =
      document.getElementById("specialEntryDuration")?.value.trim() || "";

    const reason =
      document.getElementById("specialEntryReason")?.value.trim() || "";

    const teacherName = selectedUser?.name || "";

    const studentListStrEntry = selectedHCREntry.join("\n");

    const isAccepted = document.getElementById(
      "hcrDeclarationCheckbox",
    )?.checked;

    if (!purpose) {
      SHOW_ERROR_POPUP("Please select purpose.");
      return;
    }

    if (!durationType) {
      SHOW_ERROR_POPUP("Please select duration type.");
      return;
    }

    if (!duration) {
      SHOW_ERROR_POPUP("Please select duration.");
      return;
    }

    if (!studentListStrEntry) {
      SHOW_ERROR_POPUP("Please select at least one student.");
      return;
    }

    if (!reason) {
      SHOW_ERROR_POPUP("Please enter reason.");
      return;
    }

    if (!isAccepted) {
      SHOW_ERROR_POPUP("Please accept responsibility declaration first.");
      return;
    }

    // ===============================
    // PAYLOAD
    // ===============================
    const payload = selectedHCREntry.map((studentName) => ({
      purpose,
      durationType,
      duration,
      studentName,
      teacherName,
      reason,
    }));

    console.log("Sending:", payload);

    // ===============================
    // API CALL
    // ===============================
    const res = await CALL_API("SAVE_HOSTEL_CHECKOUT_REQUEST", payload);

    if (res?.status) {
      hcrRemoveSelectedDataFromPendingEntry();
      resetHCREntryForm();
      SHOW_SUCCESS_POPUP("Saved successfully ✅");
    } else {
      SHOW_ERROR_POPUP("Error saving data ❌");
    }
  } catch (err) {
    console.error(err);
    SHOW_ERROR_POPUP("Something went wrong");
  }
}

function hcrRemoveSelectedDataFromPendingEntry() {
  // selected ka unique set banao (fast lookup)
  const selectedSet = new Set(
    selectedHCREntry.map((s) => (typeof s === "object" ? s.englishValue : s)),
  );

  Object.keys(hcrPendingStdList).forEach((cls) => {
    hcrPendingStdList[cls] = hcrPendingStdList[cls].filter((student) => {
      const key = typeof student === "object" ? student.englishValue : student;

      return !selectedSet.has(key);
    });

    if (hcrPendingStdList[cls].length === 0) {
      delete hcrPendingStdList[cls];
    }
  });
}

function hcrBackBtnClick() {
  SHOW_CONFIRMATION_POPUP(
    "Are you sure?<br><br>Do you want to go back to the Menu?",
    resetAndShowMenu,
  );
}

function resetAndShowMenu() {
  resetHCREntryForm();
  SHOW_SPECIFIC_DIV("menuPopup");
}

async function hostelCheckoutRequestRefClick() {
  await hcrStudentEntryBtnClick();
}

async function hcrResetBtnClick() {
  SHOW_CONFIRMATION_POPUP(
    "Are you sure?<br><br>All selected students, purpose, duration and reason will be reset.",
    resetHCREntryForm,
  );
}

function resetHCREntryForm() {
  // ===============================
  // Reset Purpose
  // ===============================
  document.getElementById("purposeDropdown").value = "";

  // ===============================
  // Reset Duration Type
  // ===============================
  document.getElementById("durationTypeDropdown").value = "";

  // ===============================
  // Reset Duration Dropdown
  // ===============================
  const durationDropdown = document.getElementById("specialEntryDuration");

  durationDropdown.innerHTML = `<option value="">Select Duration</option>`;

  durationDropdown.value = "";

  // ===============================
  // Reset Reason
  // ===============================
  document.getElementById("specialEntryReason").value = "";

  // ===============================
  // Reset Selected Students
  // ===============================
  selectedHCREntry = [];
  document.getElementById("hcrDeclarationCheckbox").checked = false;
  // rebuild dropdown fresh
  hcrPopulateMultiSelectDropdownEntry();
  UPDATE_HCR_STUDENT_DROPDOWN_STATE();
}

function UPDATE_HCR_STUDENT_DROPDOWN_STATE() {
  const purpose = document.getElementById("purposeDropdown")?.value || "";

  const durationType =
    document.getElementById("durationTypeDropdown")?.value || "";

  const duration = document.getElementById("specialEntryDuration")?.value || "";

  const box = document.getElementById(
    "hostelCheckoutRequest-dynamic-dropdown-container",
  );

  if (!box) return;

  // Enable only when all required selected
  if (purpose && durationType && duration) {
    box.classList.remove("disabled");
  } else {
    box.classList.add("disabled");
  }
}

/* ===============================
   STATIC DATA
================================= */
// const groupData = [
//   {
//     group: "Group 1",
//     members: ["Rahul", "Mohan", "Suresh", "Karan", "Vikas"],
//   },
//   {
//     group: "Group 2",
//     members: ["Ravi", "Ajay", "Deepak", "Manoj", "Nitin"],
//   },
//   {
//     group: "Group 3",
//     members: ["Amit", "Lokesh", "Tarun", "Gopal", "Sachin"],
//   },
// ];

function renderAccordionGroups() {
  const box = document.getElementById("groupAccordionSection");
  box.style.display = "block";

  box.innerHTML = `
    <div class="group-main-heading">
      Already Requested Data
    </div>

    ${groupData
      .map(
        (grp, index) => `
        <div class="group-card">

          <div class="group-header" onclick="toggleGroup(this)">
            <div>
              ${grp.group}
              <span class="group-count">(${grp.members.length})</span>
            </div>

            <span class="group-icon">⌄</span>
          </div>

          <div class="group-body">
            <ul class="group-list">

              ${grp.members
                .map((member) => {
                  let statusClass = "";

                  if (member.currentStatus === "Requested") {
                    statusClass = "status-requested";
                  } else if (member.currentStatus === "Checked In") {
                    statusClass = "status-checkedin";
                  } else if (member.currentStatus === "Checked Out") {
                    statusClass = "status-checkedout";
                  }

                  return `
                    <li>
                      ${member.englishName}

                      <span class="group-item-status-badge ${statusClass}">
                        ${member.currentStatus}
                      </span>
                    </li>
                  `;
                })
                .join("")}

            </ul>
          </div>

        </div>
      `,
      )
      .join("")}
  `;
}

function toggleGroup(el) {
  const card = el.parentElement;
  card.classList.toggle("active");
}
