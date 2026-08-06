//This script is to handle the leaves for hostel students submitted by the admin

let hostelStudents = [];
let selectedHostelStudents = {};

let searchBox = "";

let resultBody = "";

let selectedBody = "";

let submitBtn = "";

let resetBtn = "";

function formatDateDisplayLeaves(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
}

function resetLeavesForm() {
  searchBox.value = "";

  resultBody.innerHTML = "";

  selectedHostelStudents = {};

  refreshSelectedTable();
}

function defineEventListeners() {
  resetBtn.addEventListener("click", function () {
    SHOW_CONFIRMATION_POPUP("Are you sure to reset the form?", resetLeavesForm);
  });

  submitBtn.addEventListener("click", async function () {
    const leaveList = Object.values(selectedHostelStudents);

    console.log(leaveList);

    const outputData = await CALL_API(
      API_TYPE_CONSTANT.SUBMIT_STUDENT_LEAVES,
      leaveList,
    );

    if (outputData?.status && outputData.data) {
      if (typeof outputData.data === "string") {
        if (outputData.data.includes("ERR"))
          SHOW_ERROR_POPUP(outputData.data.split("ERR: ")[1]);
        else
          SHOW_SUCCESS_POPUP(
            "Leaves Submitted Successfully!",
            SHOW_SPECIFIC_DIV("menuPopup"),
          );
        return;
      }
    } else {
      SHOW_ERROR_POPUP("Unable to submit student Leaves!!");
      return;
    }
  });

  //------------------------------------------------------
  // Search Student
  //------------------------------------------------------

  searchBox.addEventListener("input", function () {
    const text = this.value.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];

    resultBody.innerHTML = "";

    if (text == "") return;

    const matches = hostelStudents.filter((student) =>
      student.toLowerCase().includes(text),
    );

    matches.forEach((student) => {
      const existing = selectedHostelStudents[student];

      const row = document.createElement("tr");

      row.innerHTML = `

        <td>${student}</td>

        <td>
            <input
                type="date"
                class="startDate"
                min="${today}"
                value="${existing ? existing.start : ""}">
                <div></div>
        </td>

        <td>
            <input
                type="date"
                class="endDate"
                value="${existing ? existing.end : ""}"
                ${existing && existing.start ? "" : "disabled"}>
                <div></div>
        </td>

        <td>
            <input
                type="text"
                class="comments"
                placeholder="Minimum 10 characters"
                value="${existing ? existing.comments : ""}"
                ${existing && existing.start ? "" : "disabled"}>
                <div class="error"></div>
        </td>

    `;

      resultBody.appendChild(row);

      // Set minimum end date if data already exists
      if (existing) {
        row.querySelector(".endDate").min = existing.start;
      }

      initialiseRow(row, student);
    });
  });
}

async function launchLeavesContainer() {
  searchBox = document.getElementById("searchHostelStudent");

  resultBody = document.getElementById("hostelStudentTable");

  selectedBody = document.getElementById("selectedHostelStudentTable");

  submitBtn = document.getElementById("hostelLeavesSubmitBtn");

  resetBtn = document.getElementById("hostelLeavesResetBtn");
  document.getElementById("hostelLeavessHeading_lbl").innerHTML =
    selectedUser.name;

  resetLeavesForm();

  const outputData = await CALL_API(API_TYPE_CONSTANT.GET_STUDENT_LIST, {
    slotName: "",
    viewOnly: 2,
  });

  if (outputData?.status && outputData.data) {
    if (typeof outputData.data === "string") {
      if (outputData.data.includes("ERR"))
        SHOW_ERROR_POPUP(outputData.data.split("ERR: ")[1]);
      else SHOW_INFO_POPUP(outputData.data);
      return;
    }

    hostelStudents = outputData.data;
  } else {
    SHOW_ERROR_POPUP("Unable to fetch the students in the hostel!!");
    return;
  }

  defineEventListeners();

  SHOW_SPECIFIC_DIV("hostelLeavesContainer");
}

//------------------------------------------------------
// Attach events to one row
//------------------------------------------------------

function initialiseRow(row, student) {
  const start = row.querySelector(".startDate");

  const end = row.querySelector(".endDate");

  const comments = row.querySelector(".comments");

  //--------------------------------------------------
  // Start Date
  //--------------------------------------------------

  start.addEventListener("change", function () {
    if (this.value == "") {
      end.disabled = true;
      comments.disabled = true;

      end.value = "";
      comments.value = "";

      row.querySelector(".error").textContent = "";

      removeSelected(student);

      return;
    }

    end.disabled = false;
    comments.disabled = false;

    end.min = this.value;

    if (end.value == "" || end.value < this.value) {
      end.value = this.value;
    }

    updateSelected(student, row);
  });

  //--------------------------------------------------
  // End Date
  //--------------------------------------------------

  end.addEventListener("change", function () {
    if (this.value < start.value) {
      this.value = start.value;
    }

    updateSelected(student, row);
  });

  //--------------------------------------------------
  // Comments
  //--------------------------------------------------

  comments.addEventListener("input", function () {
    const error = row.querySelector(".error");

    if (this.value.trim().length > 0 && this.value.trim().length < 10) {
      error.textContent = "Comments must be at least 10 characters.";
    } else {
      error.textContent = "";
    }

    updateSelected(student, row);
  });
}

function getRowData(student, row) {
  return {
    name: student,

    start: row.querySelector(".startDate").value,

    end: row.querySelector(".endDate").value,

    comments: row.querySelector(".comments").value,
  };
}

//------------------------------------------------------
// Update Selected Students
//------------------------------------------------------

function updateSelected(student, row) {
  const leave = getRowData(student, row);

  const validStart = leave.start !== "";

  const validEnd = leave.end !== "" && leave.end >= leave.start;

  const validComments = leave.comments.trim().length >= 10;

  if (!(validStart && validEnd && validComments)) {
    removeSelected(student);
    return;
  }

  selectedHostelStudents[student] = leave;

  refreshSelectedTable();
}

//------------------------------------------------------
// Remove Student
//------------------------------------------------------

function removeSelected(studentName) {
  delete selectedHostelStudents[studentName];

  refreshSelectedTable();
}

//------------------------------------------------------
// Refresh Selected Table
//------------------------------------------------------

function refreshSelectedTable() {
  selectedBody.innerHTML = "";

  const list = Object.values(selectedHostelStudents);

  list.forEach((student) => {
    selectedBody.innerHTML += `

        <tr>

            <td>${student.name}</td>

            <td>${formatDateDisplayLeaves(student.start)}</td>
            
            <td>${formatDateDisplayLeaves(student.end)}</td>

            <td>${student.comments}</td>

            <td>

                <button
                    class="red"
                    onclick="removeEntry('${student.name}')">
                    Remove<br/>
                </button>
                <div></div>
                <div></div>

            </td>

        </tr>

        `;
  });

  submitBtn.disabled = list.length == 0;
}

//------------------------------------------------------
// Remove Button
//------------------------------------------------------

function removeEntry(studentName) {
  delete selectedHostelStudents[studentName];

  //--------------------------------------------------
  // Clear row if visible in search table
  //--------------------------------------------------

  [...resultBody.rows].forEach((row) => {
    if (row.cells[0].textContent == studentName) {
      row.querySelector(".startDate").value = "";

      row.querySelector(".endDate").value = "";

      row.querySelector(".comments").value = "";

      row.querySelector(".endDate").disabled = true;

      row.querySelector(".comments").disabled = true;
    }
  });

  refreshSelectedTable();
}
