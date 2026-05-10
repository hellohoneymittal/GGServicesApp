let studentList = [];
let currentSlotDetails = "";
let attendanceTimestampMap = new Map();
let time_slots = {
  "19:35 - 23:00": {
    name: "Sleeping Slot",
    instructions: [
      "Students have brushed their teeth",
      "Tomorrow's clothes arranged",
      "Missing essentials(brush, toothpaste, etc) taken by the student",
      "Water bottle filled",
      "Bedsheet on mattress",
      "Air cooler tank filled",
    ],
  },
  "03:30 - 05:00": {
    name: "Wake up Slot",
    instructions: [
      "Students out of bed",
      "Students drank water",
      "Taken their bathrrom kit",
      "Taken undergarments and towel",
      "Went to bath",
    ],
  },
  "05:05 - 06:10": {
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
  let now = new Date();
  let ignoreTeachers = [];
  let result = 0;
  currentSlotDetails = getCurrentTimeSlotInstructions();
  let formOpenTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const instructionsBox = document.getElementById("instructionsBox");
  let attendanceHeading = document.getElementById("attendanceHeading");
  let markAttButton = document.getElementById("mark_attendance_button");
  let instructionsRoot = document.querySelector(".instructions");

  console.log(formOpenTime);
  attendanceTimestampMap.clear();
  attendanceTimestampMap.set(selectedUser.name, formOpenTime);

  if (view == 0) {
    if (currentSlotDetails == null) {
      SHOW_INFO_POPUP(
        "⚠️ Cannot mark attendance outside of defined slot hours!",
      );
      return;
    }

    //Check current location
    if (!ignoreTeachers.includes(selectedUser.name)) {
      try {
        result = await checkLocation(schoolLat, schoolLng, allowedRadius);
      } catch (error) {
        console.error(error);
        if (error.message)
          SHOW_ERROR_POPUP(
            `❌ Action Disallowed ❌\n\nERROR: ${error.message}`,
          );
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

    console.log(currentSlotDetails.name);
    console.log(selectedUser);

    // CLEAR OLD DATA
    instructionsBox.innerHTML = "";

    // ADD INSTRUCTIONS
    currentSlotDetails.instructions.forEach((instruction) => {
      const li = document.createElement("li");

      li.textContent = instruction;

      instructionsBox.appendChild(li);
    });

    attendanceHeading.innerHTML = "Hostel Attendance";
    markAttButton.hidden = false;
    instructionsRoot.hidden = false;
  } else {
    attendanceHeading.innerHTML = "Hostel Residents";
    markAttButton.hidden = true;
    instructionsRoot.hidden = true;
  }

  const outputData = await CALL_API(API_TYPE_CONSTANT.GET_STUDENT_LIST, {
    slotName: view == 0 ? currentSlotDetails.name : "",
    viewOnly: view,
  });

  if (outputData?.status && outputData.data) {
    if (typeof outputData.data === "string") {
      if (outputData.data.includes("ERR"))
        SHOW_ERROR_POPUP(outputData.data.split("ERR: ")[1]);
      else SHOW_INFO_POPUP(outputData.data);
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

  SHOW_SPECIFIC_DIV("stdAttendanceContainer");
}

function getCurrentTimeSlotInstructions() {
  // Current time in minutes
  let now = new Date();
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
        end,
        ...details,
      };
    }
  }

  return null;
}

async function markAttendance() {
  let now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = convertToMinutes(currentSlotDetails.end);

  if (currentMinutes > endMinutes) {
    SHOW_ERROR_POPUP(
      `❌ Action Disallowed ❌\n\n⚠️ Submission time EXCEEDS the slot end time!`,
    );
    SHOW_SPECIFIC_DIV("menuPopup");
    return;
  }

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
