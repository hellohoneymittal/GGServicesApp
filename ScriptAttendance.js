let studentList = [];
const hostel_start_time = "19:30";
const hostel_end_time = "05:45";
let now = new Date();
let currentSlotDetails = "";
let attendanceTimestampMap = new Map();
let currentMinutes = now.getHours() * 60 + now.getMinutes();
let time_slots = {
  "16:30 - 23:00": {
    name: "Sleeping Slot",
    instructions: [
      "The form is to be opened before 8:05 PM for Sewakarta attendance!",
      "Students have brushed their teeth",
      "Tomorrow's clothes arranged",
      "Missing essentials(brush, toothpaste, etc) taken by the student",
      "Water bottle filled",
      "Bedsheet on mattress",
      "Air cooler tank filled",
    ],
  },
  "23:00 - 04:35": {
    name: "Wake up Slot",
    instructions: [
      "Students out of bed",
      "Students drank water",
      "Taken their bathrrom kit",
      "Taken undergarments and towel",
      "Went to bath",
    ],
  },
  "04:35 - 05:45": {
    name: "Morning Program Slot",
    instructions: [
      "Wearing proper school uniform(Kurta and Plain dhoti/lower)",
      "Hair oiled",
      "Wearing undergarments",
      "Full body Tilak",
      "Towel and wet clothes hung on rope",
    ],
  },
};

function populateStudentMultiSelectDropdown(outId, inArr, name) {
  const container = document.getElementById(outId);
  container.innerHTML = ""; // clear old list

  inArr.forEach((student, index) => {
    const studentId = `student-${index}`; // unique id per student

    const option = document.createElement("div");
    option.classList.add("options");

    option.innerHTML = `
      <input type="checkbox" id="${studentId}" name="${name}" value="${student}" class="custom-checkbox">
      <label for="${studentId}" class="custom-label-student">${student}</label>
    `;

    container.appendChild(option);
  });
}

async function openAttendanceWindow(view = 0) {
  //28.657501589771897, 77.43753484576277
  const schoolLat = 28.657501589771897; // your school latitude
  const schoolLng = 77.43753484576277; // your school longitude
  const allowedRadius = 150; // meters
  let ignoreTeachers = ["Amani Nitai Prabhuji"];
  let result = 0;
  currentSlotDetails = getCurrentTimeSlotInstructions();
  let formOpenTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  console.log(formOpenTime);
  attendanceTimestampMap.clear();
  attendanceTimestampMap.set(selectedUser.name, formOpenTime);

  if (view == 0 && currentSlotDetails == null) {
    SHOW_INFO_POPUP("⚠️ Cannot mark attendance outside of hostel hours!");
    return;
  }

  console.log(currentSlotDetails.name);
  console.log(selectedUser);

  //Check current location
  if (view == 0 && !ignoreTeachers.includes(selectedUser.name)) {
    try {
      result = await checkLocation(schoolLat, schoolLng, allowedRadius);
    } catch (error) {
      console.error(error);
      if (error.message)
        SHOW_ERROR_POPUP(`❌ Action Disallowed ❌\n\nERROR: ${error.message}`);
      return;
    }

    if (result !== 1) {
      SHOW_ERROR_POPUP(
        `❌ Action Disallowed ❌\n\n⚠️ Your current location ${result.split("%")[1]} is ${result.split("%")[0]} away from Gurukul.\n\nAttendance can only be marked within the hostel campus.`,
      );
      return; // ✅ NOW this works as expected
    }

    console.log(`Inside Gurukul!`);
  }

  const instructionsBox = document.getElementById("instructionsBox");

  // CLEAR OLD DATA
  instructionsBox.innerHTML = "";

  // ADD INSTRUCTIONS
  currentSlotDetails.instructions.forEach((instruction) => {
    const li = document.createElement("li");

    li.textContent = instruction;

    instructionsBox.appendChild(li);
  });

  const outputData = await CALL_API(API_TYPE_CONSTANT.GET_STUDENT_LIST, {
    slotName: currentSlotDetails.name,
    viewOnly: view,
  });

  if (outputData?.status && outputData.data) {
    if (
      typeof outputData.data === "string" &&
      outputData.data.includes("ERR")
    ) {
      SHOW_ERROR_POPUP(outputData.data.split("ERR: ")[1]);
      return;
    }

    if (Object.keys(outputData.data).length == 0) {
      SHOW_INFO_POPUP("No students in hostel today!");
      return;
    }

    studentList = outputData.data;
    populateStudentMultiSelectDropdown(
      "dynamic-student-list",
      studentList,
      "studentList",
    );
  } else {
    SHOW_ERROR_POPUP("Unable to fetch the students in the hostel!!");
    return;
  }

  document.getElementById("selectStudentsHeading_lbl").innerHTML =
    selectedUser.name;
  document.getElementById("student-list").innerHTML =
    `Student List (${studentList.length})`;

  document
    .getElementById("dynamic-student-list")
    .addEventListener("change", function (e) {
      if (e.target.type === "checkbox") {
        const value = e.target.value;
        const timestamp = new Date();

        if (e.target.checked) {
          attendanceTimestampMap.set(value, timestamp);
        } else {
          attendanceTimestampMap.delete(value);
        }
      }
    });

  let markAttButton = document.getElementById("mark_attendance_button");

  markAttButton.hidden = view == 1;
  document.querySelector(".instructions").hidden = view == 1;
  document.getElementById("attendanceHeading").innerHTML =
    view == 1 ? "Hostel Residents" : "Hostel Attendance";

  SHOW_SPECIFIC_DIV("stdAttendanceContainer");
}

function getCurrentTimeSlotInstructions() {
  // Current time in minutes
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const [slot, details] of Object.entries(time_slots)) {
    const [start, end] = slot.split(" - ");

    const startMinutes = convertToMinutes(start);
    const endMinutes = convertToMinutes(end);

    let isInSlot = false;

    // Normal slot
    if (startMinutes < endMinutes) {
      isInSlot = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    // Cross-midnight slot
    else {
      isInSlot = currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    if (isInSlot) {
      return {
        slot,
        ...details,
      };
    }
  }

  return null;
}

async function markAttendance() {
  const payload = Object.fromEntries(attendanceTimestampMap);

  console.log(payload);

  const outputData = await CALL_API(
    API_TYPE_CONSTANT.SUBMIT_STUDENT_ATTENDANCE,
    {
      slotName: currentSlotDetails.name,
      timeMap: payload,
      user: selectedUser.name,
    },
  );

  if (
    outputData?.status &&
    outputData.data &&
    typeof outputData.data === "string"
  ) {
    console.log(outputData.data);
    if (outputData.data == "ok")
      SHOW_SUCCESS_POPUP("Response submitted Successfully!", () =>
        SHOW_SPECIFIC_DIV("menuPopup"),
      );
    else
      SHOW_ERROR_POPUP(
        "Unable to submit data !!\n\n" + outputData.data.split("ERR: ")[1],
      );
  } else SHOW_ERROR_POPUP("Unable to submit data !!");

  return;
}
