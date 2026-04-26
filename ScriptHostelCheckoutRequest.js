let hcrPendingStdList = {};
let selectedHCREntry = [];
let keyFiltersDataHCREntry = {};
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
  "Temple le jaane ke liye": 10,
  "Padhai Karane ke liye": 2,
  "Park le jaane ke liye": 15,
  "Swimming le jaane ke liye": 20,
  "Ghar le jaane ke liye": 2,
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
      opt.value = day * 1440; // convert to minutes
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

function HCR_PROCESS_DATA(hcRequestSheetData, allStudentsData, roleData) {
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
    debugger;
    if (obj.hostler === "Y") {
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

    // ===============================
    // PAYLOAD
    // ===============================
    const payload = {
      purpose,
      durationType,
      duration,
      studentList: studentListStrEntry,
      teacherName,
      reason,
    };

    console.log("Sending:", payload);

    // ===============================
    // API CALL
    // ===============================
    const res = await CALL_API("SAVE_HOSTEL_CHECKOUT_REQUEST", payload);

    if (res?.status) {
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

function resetHCREntryForm() {
  hcrRemoveSelectedDataFromPendingEntry();
  selectedHCREntry = [];
  hcrPopulateMultiSelectDropdownEntry();
  document.getElementById("specialEntryReason").value = "";
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
  SHOW_SPECIFIC_DIV("menuPopup");
}

async function hostelCheckoutRequestRefClick() {
  await hcrStudentEntryBtnClick();
}

async function hcrResetBtnClick() {
  const ok = confirm(
    "Are you sure?\n\nAll selected students, purpose, duration and reason will be reset.",
  );

  if (!ok) return;

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

  // rebuild dropdown fresh
  hcrPopulateMultiSelectDropdownEntry();

  // disable student selection box
  UPDATE_HCR_STUDENT_DROPDOWN_STATE();

  SHOW_SUCCESS_POPUP("Reset successfully.");
}
