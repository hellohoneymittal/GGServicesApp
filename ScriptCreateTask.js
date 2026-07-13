const SEWAKARTA_LIST = [
  "Mahavir Smarana Prabhuji",
  "Manohar Gaur Prabhuji",
  "Satya Madhav Prabhuji",
  "Shesha Sevaka Prabhuji",
  "Atul Gaur Sewa Prabhuji",
  "Kasturi Kesavi Mataji",
  "Balwan Hari Prabhuji",
  "Naresvara Hari Prabhuji",
  "Jagatabandhu Prabhuji",
  "Aravinda Nimai Prabhuji",
  "Hridaya Parmatma Prabhuji",
  "Saanta Nimai Prabhuji",
  "Lokatma Daksh Prabhuji",
  "Vibhu Caitanya Prabhuji",
  "Anant Achyuta Prabhuji",
  "Charu Chitra Sakhi Mataji",
  "Rishabh Karuna Mataji",
  "Padma Bhushan Prabhuji",
];

let TASK_MASTER = {};

let selectedFile64String = "";
let selectedfile = "";
let selectedFileType = "";
let selectedFileName = "";

function convertRowsToTaskMaster(data) {
  const headers = data[0];
  const result = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const serviceType = row[1];
    const task = row[2];
    const owner = row[3];

    if (!result[serviceType]) {
      result[serviceType] = {
        owner: owner,
        tasks: [],
      };
    }

    const taskKey = toCamelCase(task);

    result[serviceType].tasks.push(task);
  }

  function toCamelCase(str) {
    return str
      .replace(/[^\w\s]/g, "") // remove special chars
      .split(" ")
      .filter(Boolean)
      .map((word, index) => {
        word = word.toLowerCase();

        if (index === 0) return word;

        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join("");
  }

  return result;
}

async function createTaskBtnClick() {
  const response = await CALL_API("GET_TASK_LIST", {});
  TASK_MASTER = convertRowsToTaskMaster(response?.data);

  SET_DIV_TITLE("createTaskPopup", "Create Task");
  const categorySelect = document.getElementById("categorySelect");
  const taskButtonsContainer = document.getElementById("taskButtonsContainer");
  const taskDescription = document.getElementById("taskDescription");
  const taskOwner = document.getElementById("taskOwner");
  const taskList = document.getElementById("taskList");

  Object.keys(TASK_MASTER).forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;

    taskButtonsContainer.innerHTML = "";

    taskDescription.value = "";

    taskOwner.value = "";

    if (!selectedCategory) return;

    const categoryData = TASK_MASTER[selectedCategory];

    taskOwner.value = categoryData.owner;

    categoryData.tasks.forEach((task) => {
      const button = document.createElement("button");

      button.className = "task-btn";

      button.textContent = task;

      button.addEventListener("click", () => {
        // REMOVE OLD SELECTION
        document.querySelectorAll(".task-btn").forEach((btn) => {
          btn.classList.remove("selected");
        });

        // ADD NEW SELECTION
        button.classList.add("selected");

        // SET TASK
        taskDescription.value = task;
      });

      taskButtonsContainer.appendChild(button);
    });
  });

  SHOW_SPECIFIC_DIV("createTaskPopup");
}

function resetCreateTask() {
  // Reset dropdown
  document.getElementById("categorySelect").value = "";

  // Reset owner
  document.getElementById("taskOwner").value = "";

  // Reset description
  document.getElementById("taskDescription").value = "";

  // Reset task buttons
  document.getElementById("taskButtonsContainer").innerHTML = "";

  // Reset file input
  document.getElementById("ctUploadControl").value = "";

  // Reset preview image
  document.getElementById("imagePreview").src = "";

  // Hide preview container
  document.getElementById("imagePreviewContainer").style.display = "none";

  // Reset global variables
  selectedfile = null;

  selectedFile64String = "";
}

function backToMainScreenFromCreateTask() {
  resetCreateTask();
  SHOW_SPECIFIC_DIV("menuPopup");
}

function ctFetchFile() {
  const fileInput = document.getElementById("ctUploadControl");

  if (!fileInput) {
    console.error("File input not found");
    return;
  }

  const files = fileInput.files;

  if (files.length > 0) {
    const file = files[0];

    selectedfile = file;

    const reader = new FileReader();

    reader.onload = function (event) {
      const fullBase64 = event.target.result;

      const base64String = fullBase64.split(",")[1];

      selectedFile64String = base64String;

      // IMAGE PREVIEW
      const previewImage = document.getElementById("imagePreview");

      const previewContainer = document.getElementById("imagePreviewContainer");

      previewImage.src = fullBase64;

      previewContainer.style.display = "block";
    };

    reader.readAsDataURL(file);
  } else {
    console.log("No file selected");

    document.getElementById("imagePreviewContainer").style.display = "none";
  }
}

async function createNewTaskBtnClick() {
  const category = document.getElementById("categorySelect").value;
  const owner = document.getElementById("taskOwner").value;
  const description = document.getElementById("taskDescription").value.trim();

  if (!category) {
    SHOW_ERROR_POPUP("Please select category");
    return;
  }

  if (!owner) {
    SHOW_ERROR_POPUP("Task owner missing");
    return;
  }

  if (!description) {
    SHOW_ERROR_POPUP("Please select or write task description");
    return;
  }

  const selectedBtn = document.querySelector(".task-btn.selected");

  const payload = {
    category: category,
    owner: owner,
    description: description,
    createdBy: selectedDevoteeName,
    selectedFile64String: selectedFile64String ?? "",
    selectedFileType: selectedfile?.type ?? "",
    selectedFileName: selectedfile?.name ?? "",
  };

  const response = await CALL_API("CREATE_TASK", payload);
  SHOW_SUCCESS_POPUP("Task Created Successfully");
  resetCreateTask();
}

//-------------------------------  Task List ---------------------------------------------- //

let taskList_data = [];

// STATUS CLASS

function taskList_getStatusClass(status) {
  if (status === "Open") {
    return "taskList_open";
  }

  if (status === "Completed") {
    return "taskList_completed";
  }

  return "taskList_progress";
}

// RENDER TASKS

function taskList_renderTasks(tasks = taskList_data) {
  const taskListContainer = document.getElementById("taskList_taskList");

  taskListContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    taskListContainer.innerHTML += `

      <div class="taskList_card">

        <!-- HEADER -->
        <div
          class="taskList_cardHeader"
          onclick="taskList_toggleAccordion(this)"
        >

          <div class="taskList_cardTop">

            <div class="taskList_title_div">

              <div class="taskList_title">
                ${task.actionDescription}
              </div>

              <span class="taskList_category">
                ${task.ticketFor}
              </span>

              <div class="taskList_status ${taskList_getStatusClass(task.status || "Pending")}">
                ${task.status || "Pending"}
              </div>

            </div>

            <div class="taskList_right">
              <div class="taskList_accordionIcon">
                ▶
              </div>
            </div>

          </div>

        </div>

        <!-- CONTENT -->
        <div class="taskList_content">

          <div class="taskList_contentInner">

            <div class="taskList_details">

              <div class="taskList_detailBox">
                <div class="taskList_detailTitle">
                  Task Owner
                </div>

                <div class="taskList_detailValue">
                  ${task.actionOwnerName}
                </div>
              </div>

              <div class="taskList_detailBox">
                <div class="taskList_detailTitle">
                  Created By
                </div>

                <div class="taskList_detailValue">
                  ${task.createdBy}
                </div>
              </div>

              <div class="taskList_detailBox">
                <div class="taskList_detailTitle">
                  Created On
                </div>

                <div class="taskList_detailValue">
                  ${task.date}
                </div>
              </div>

            </div>

            <div>
            <label class="taskList_commentLabel">
              Comment <span style="color:red">*</span>
            </label>

            <textarea
              id="taskComment_${index}"
              class="taskList_commentBox"
              placeholder="Enter your comment..."
            ></textarea>
            </div>

            <div class="button-row">

              ${
                task.uploadedImage
                  ? `
                    <button
                      class="taskList_btn taskList_viewBtn"
                      onclick="window.open('${task.uploadedImage}')"
                    >
                      View Attachment
                    </button>
                  `
                  : ""
              }

              <button
                class="taskList_btn taskList_editBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
                onclick="${task.canReview ? `taskList_updateStatus(${index}, 'In Progress')` : ""}"
                ${task.canReview ? "" : "disabled"}
                title="${task.canReview ? "Move this task to review." : "You are not the owner of this task."}">
                In Progress
              </button>

              <button
                class="taskList_btn taskList_closeBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
               onclick="${task.canReview ? `taskList_updateStatus(${index}, 'Complete')` : ""}"
                ${task.canReview ? "" : "disabled"}
                title="${task.canReview ? "Move this task to review." : "You are not the owner of this task."}">
                Ready to Review
              </button>

            </div>

          </div>

        </div>

      </div>

    `;
  });

  SHOW_SPECIFIC_DIV("taskListPopup");
}

function MoveToReview() {
  alert("Review clicked");
}

function taskList_toggleAccordion(element) {
  const allCards = document.querySelectorAll(".taskList_card");

  const currentCard = element.closest(".taskList_card");

  const isAlreadyOpen = currentCard.classList.contains("taskList_active");

  // CLOSE ALL

  allCards.forEach((card) => {
    card.classList.remove("taskList_active");
  });

  // OPEN CURRENT

  if (!isAlreadyOpen) {
    currentCard.classList.add("taskList_active");
  }
}

// INITIAL LOAD
async function showTaskListPopup() {
  const response = await CALL_API("GET_ISSUE_TRACKERSHEET_DATA", {
    sheetName: "Pending Actions",
  });
  taskList_data = CONVERT_ROWS_TO_OBJECTS(response?.data);
  PrepareTaskListData();
  taskList_bindFilters();
  taskList_applyFilters();
  SET_DIV_TITLE("taskListPopup", "Task List");
}

function PrepareTaskListData() {
  taskList_data = taskList_data
    .filter((task) => task.ticketFor && task.ticketFor.startsWith("ServiceApp"))
    .map((task) => ({
      ...task,
      canReview: task.actionOwnerName === selectedDevoteeName,
    }))
    .sort((a, b) => {
      const aMine = a.actionOwnerName === selectedDevoteeName;
      const bMine = b.actionOwnerName === selectedDevoteeName;

      if (aMine && !bMine) return -1;
      if (!aMine && bMine) return 1;

      return 0;
    });
}

function taskList_bindFilters() {
  const statusDDL = document.getElementById("taskStatusFilter");
  const serviceDDL = document.getElementById("taskServiceFilter");
  const ownerDDL = document.getElementById("taskOwnerFilter");

  const statuses = [
    ...new Set(taskList_data.map((x) => x.status || "Pending")),
  ].sort();

  const services = [...new Set(taskList_data.map((x) => x.ticketFor))].sort();

  const owners = [
    ...new Set(taskList_data.map((x) => x.actionOwnerName)),
  ].sort();

  statusDDL.innerHTML = '<option value="All">All</option>';
  serviceDDL.innerHTML = '<option value="All">All</option>';
  ownerDDL.innerHTML = '<option value="All">All</option>';

  statuses.forEach((x) => {
    statusDDL.innerHTML += `<option value="${x}">${x}</option>`;
  });

  services.forEach((x) => {
    serviceDDL.innerHTML += `<option value="${x}">${x}</option>`;
  });

  owners.forEach((x) => {
    ownerDDL.innerHTML += `<option value="${x}">${x}</option>`;
  });
}

function taskList_applyFilters() {
  const status = document.getElementById("taskStatusFilter").value;
  const service = document.getElementById("taskServiceFilter").value;
  const owner = document.getElementById("taskOwnerFilter").value;
  const search = document
    .getElementById("taskSearch")
    .value.trim()
    .toLowerCase();

  let filtered = taskList_data.filter((task) => {
    const taskStatus = task.status || "Pending";

    if (status != "All" && taskStatus != status) return false;

    if (service != "All" && task.ticketFor != service) return false;

    if (owner != "All" && task.actionOwnerName != owner) return false;

    if (search) {
      const found =
        (task.actionDescription || "").toLowerCase().includes(search) ||
        (task.ticketFor || "").toLowerCase().includes(search) ||
        (task.actionOwnerName || "").toLowerCase().includes(search);

      if (!found) return false;
    }

    return true;
  });

  taskList_renderTasks(filtered);
}

async function taskList_updateStatus(index, status) {
  const task = taskList_data[index];
  const taskId = task.taskId;
  const comment = document.getElementById(`taskComment_${index}`).value.trim();

  if (!comment) {
    alert("Please enter a comment.");
    return;
  }

  const payload = {
    taskId,
    comment,
    status,
  };
  const response = await CALL_API("UPDATE_TASK_STATUS", payload);
  showTaskListPopup();
  SHOW_SUCCESS_POPUP("Task Successfully Updated");
}
