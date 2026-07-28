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
let GET_TASK_LIST_RESPONSE = [];
let TASK_MASTER = {};

let selectedFile64String = "";
let selectedfile = "";
let selectedFileType = "";
let selectedFileName = "";

function convertRowsToTaskMaster(data) {
  const result = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const serviceType = row[1];
    const task = row[2];
    const owner = row[3];
    const reviewer = row[4];

    if (!result[serviceType]) {
      result[serviceType] = {
        tasks: [],
      };
    }

    result[serviceType].tasks.push({
      task,
      owner,
      reviewer,
    });
  }

  return result;
}

async function createTaskBtnClick() {
  resetCreateTask();
  const response = await CALL_API_WITH_CACHE("GET_TASK_LIST", {});
  TASK_MASTER = convertRowsToTaskMaster(response?.data);
  SET_DIV_TITLE("createTaskPopup", "Create Task");
  const categorySelect = document.getElementById("categorySelect");
  const taskButtonsContainer = document.getElementById("taskButtonsContainer");
  const taskDescription = document.getElementById("taskDescription");
  const taskOwner = document.getElementById("taskOwner");
  const taskReviewer = document.getElementById("taskReviewer");
  const taskList = document.getElementById("taskList");

  categorySelect.innerHTML = '<option value="">Choose Category</option>';

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
    taskReviewer.value = "";

    if (!selectedCategory) return;

    const categoryData = TASK_MASTER[selectedCategory];

    categoryData.tasks.forEach((taskObj) => {
      const button = document.createElement("button");

      button.className = "task-btn";
      button.textContent = taskObj.task;

      button.addEventListener("click", () => {
        document.querySelectorAll(".task-btn").forEach((btn) => {
          btn.classList.remove("selected");
        });

        button.classList.add("selected");

        // Populate on task selection
        taskDescription.value = taskObj.task;
        taskOwner.value = taskObj.owner;

        taskReviewer.value = taskObj.reviewer;
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

  document.getElementById("taskReviewer").value = "";

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
  const reviewer = document.getElementById("taskReviewer").value;
  const description = document.getElementById("taskDescription").value.trim();

  if (!category) {
    SHOW_ERROR_POPUP("Please select category");
    return;
  }

  if (!owner) {
    SHOW_ERROR_POPUP(
      "Please select a predefined task first before proceeding.",
    );
    //SHOW_ERROR_POPUP("Task owner missing");
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
    reviewer: reviewer,
    selectedFile64String: selectedFile64String ?? "",
    selectedFileType: selectedfile?.type ?? "",
    selectedFileName: selectedfile?.name ?? "",
  };

  const response = await CALL_API("CREATE_TASK", payload);
  SHOW_SUCCESS_POPUP("Task Created Successfully");
  resetCreateTask();
}

//-------------------------------  Task List ---------------------------------------------- //

let taskList_allData = [];
let taskList_data = [];

// STATUS CLASS

function taskList_getStatusClass(status) {
  if (status === "Open") {
    return "taskList_open";
  }

  if (status === "In Review") {
    return "taskList_inreview";
  }

  return "taskList_progress";
}

// RENDER TASKS

function old_taskList_renderTasks(tasks = taskList_data) {
  const taskListContainer = document.getElementById("taskList_taskList");

  taskListContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    let actionButtons = "";

    if (task.status === "In Review") {
      actionButtons = `
    <button
      class="taskList_btn taskList_editBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
      onclick="${task.canReview ? `taskList_updateStatus(${index}, 'Move Back')` : ""}"
      ${task.canReview ? "" : "disabled"}>
      Move Back
    </button>

    <button
      class="taskList_btn taskList_closeBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
      onclick="${task.canReview ? `taskList_updateStatus(${index}, 'Closed')` : ""}"
      ${task.canReview ? "" : "disabled"}>
      Close
    </button>
  `;
    } else {
      actionButtons = `
    <button
      class="taskList_btn taskList_editBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
      onclick="${task.canReview ? `taskList_updateStatus(${index}, 'In Progress')` : ""}"
      ${task.canReview ? "" : "disabled"}>
      In Progress
    </button>

    <button
      class="taskList_btn taskList_closeBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
      onclick="${task.canReview ? `taskList_updateStatus(${index}, 'In Review')` : ""}"
      ${task.canReview ? "" : "disabled"}>
      In Review
    </button>
  `;
    }

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
                ${(task.actionDescription || "")
                  .replace(/\r\n/g, "<br>")
                  .replace(/\n/g, "<br>")}
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
                  Task Reviewer
                </div>

                <div class="taskList_detailValue">
                  ${task.reviewerName}
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

               ${actionButtons}

            </div>

          </div>

        </div>

      </div>

    `;
  });

  SHOW_SPECIFIC_DIV("taskListPopup");
}

function taskList_renderTasks(tasks = taskList_data) {
  const taskListContainer = document.getElementById("taskList_taskList");

  taskListContainer.innerHTML = "";

  tasks.forEach((task) => {
    let actionButtons = "";

    if (task.status === "In Review") {
      actionButtons = `
        <button
          class="taskList_btn taskList_editBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
          onclick="${task.canReview ? `taskList_updateStatus('${task.taskId}', 'Move Back')` : ""}"
          ${task.canReview ? "" : "disabled"}>
          Move Back
        </button>

        <button
          class="taskList_btn taskList_closeBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
          onclick="${task.canReview ? `taskList_updateStatus('${task.taskId}', 'Closed')` : ""}"
          ${task.canReview ? "" : "disabled"}>
          Close
        </button>
      `;
    } else {
      actionButtons = `
        <button
          class="taskList_btn taskList_editBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
          onclick="${task.canReview ? `taskList_updateStatus('${task.taskId}', 'In Progress')` : ""}"
          ${task.canReview ? "" : "disabled"}>
          In Progress
        </button>

        <button
          class="taskList_btn taskList_closeBtn ${task.canReview ? "" : "taskList_btnDisabled"}"
          onclick="${task.canReview ? `taskList_updateStatus('${task.taskId}', 'In Review')` : ""}"
          ${task.canReview ? "" : "disabled"}>
          In Review
        </button>
      `;
    }

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
                ${(task.actionDescription || "")
                  .replace(/\r\n/g, "<br>")
                  .replace(/\n/g, "<br>")}
              </div>

              <span class="taskList_category">
                ${task.ticketFor}
              </span>

              <div class="taskList_status ${taskList_getStatusClass(task.status)}">
                ${task.status}
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
                  Task Reviewer
                </div>

                <div class="taskList_detailValue">
                  ${task.reviewerName}
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
                id="taskComment_${task.taskId}"
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

              ${actionButtons}

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
  taskList_allData = CONVERT_ROWS_TO_OBJECTS(response?.data);
  taskList_data = [...taskList_allData];

  PrepareTaskListData();
  console.log("taskList_data", taskList_data);
  taskList_bindFilters();
  taskList_applyFilters();
  SET_DIV_TITLE("taskListPopup", "Task List");
}

function old_PrepareTaskListData() {
  taskList_data = [...taskList_allData]
    .filter((task) => task.ticketFor?.startsWith("ServiceApp"))
    .map((task) => ({
      ...task,
      canReview:
        ((task.status === "Pending" || task.status === "In Progress") &&
          task.actionOwnerName === selectedDevoteeName) ||
        (task.status === "In Review" &&
          task.reviewerName === selectedDevoteeName),
    }));
}

function PrepareTaskListData() {
  taskList_data = taskList_allData
    .filter((task) => task.ticketFor?.startsWith("ServiceApp"))
    .map((task) => {
      const status = task.status || "Pending";

      return {
        ...task,
        status,
        canReview:
          ((status === "Pending" || status === "In Progress") &&
            task.actionOwnerName === selectedDevoteeName) ||
          (status === "In Review" && task.reviewerName === selectedDevoteeName),
      };
    });
}

function old_taskList_bindFilters() {
  const statusDDL = document.getElementById("taskStatusFilter");
  const serviceDDL = document.getElementById("taskServiceFilter");
  const ownerDDL = document.getElementById("taskOwnerFilter");

  const statuses = [
    ...new Set(taskList_data.map((x) => x.status || "Pending")),
  ].sort();

  const services = [...new Set(taskList_data.map((x) => x.ticketFor))].sort();

  let owners = [
    ...new Set(
      taskList_data.flatMap((x) => [x.actionOwnerName, x.reviewerName]),
    ),
  ]
    .filter(Boolean)
    .sort();

  // Add selected devotee at top if available
  if (selectedDevoteeName && !owners.includes(selectedDevoteeName)) {
    owners.unshift(selectedDevoteeName);
  } else if (selectedDevoteeName) {
    owners = [
      selectedDevoteeName,
      ...owners.filter((x) => x !== selectedDevoteeName),
    ];
  }

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

  // Auto select current devotee
  if (selectedDevoteeName) {
    ownerDDL.value = selectedDevoteeName;
    taskList_applyFilters();
  }
}

function taskList_bindFilters() {
  const statusDDL = document.getElementById("taskStatusFilter");
  const serviceDDL = document.getElementById("taskServiceFilter");
  const ownerDDL = document.getElementById("taskOwnerFilter");

  // Get unique Statuses
  const statuses = [...new Set(taskList_data.map((x) => x.status))].sort();

  // Get unique Services
  const services = [...new Set(taskList_data.map((x) => x.ticketFor))].sort();

  // Get unique Owners & Reviewers
  let owners = [
    ...new Set(
      taskList_data.flatMap((x) => [x.actionOwnerName, x.reviewerName]),
    ),
  ]
    .filter(Boolean)
    .sort();

  // Keep current devotee at top
  if (selectedDevoteeName) {
    owners = [
      selectedDevoteeName,
      ...owners.filter((x) => x !== selectedDevoteeName),
    ];
  }

  // Reset dropdowns
  statusDDL.innerHTML = '<option value="All">All</option>';
  serviceDDL.innerHTML = '<option value="All">All</option>';
  ownerDDL.innerHTML = '<option value="All">All</option>';

  // Bind Status
  statuses.forEach((status) => {
    statusDDL.innerHTML += `<option value="${status}">${status}</option>`;
  });

  // Bind Service
  services.forEach((service) => {
    serviceDDL.innerHTML += `<option value="${service}">${service}</option>`;
  });

  // Bind Owners
  owners.forEach((owner) => {
    ownerDDL.innerHTML += `<option value="${owner}">${owner}</option>`;
  });

  // Default selected owner
  if (selectedDevoteeName) {
    ownerDDL.value = selectedDevoteeName;
  }

  // Initial render using current filters
  taskList_applyFilters();
}

function old_taskList_applyFilters() {
  const status = document.getElementById("taskStatusFilter").value;
  const service = document.getElementById("taskServiceFilter").value;
  const owner = document.getElementById("taskOwnerFilter").value;
  const search = document
    .getElementById("taskSearch")
    .value.trim()
    .toLowerCase();

  const filtered = taskList_allData.filter((task) => {
    const taskStatus = task.status || "Pending";

    // Status Filter
    if (status !== "All" && taskStatus !== status) {
      return false;
    }

    // Service Filter
    if (service !== "All" && task.ticketFor !== service) {
      return false;
    }

    // Owner Filter
    if (owner !== "All") {
      const taskOwner =
        taskStatus === "In Review"
          ? task.reviewerName || ""
          : task.actionOwnerName || "";

      if (taskOwner !== owner) {
        return false;
      }
    }

    // Search Filter
    if (search) {
      const searchableText = [
        task.actionDescription || "",
        task.ticketFor || "",
        task.actionOwnerName || "",
        task.reviewerName || "",
        task.status || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) {
        return false;
      }
    }

    return true;
  });

  console.log("Selected Owner:", owner);
  console.log("Filtered Count:", filtered.length);

  taskList_renderTasks(filtered);
}

function taskList_applyFilters() {
  const status = document.getElementById("taskStatusFilter").value;
  const service = document.getElementById("taskServiceFilter").value;
  const owner = document.getElementById("taskOwnerFilter").value;
  const search = document
    .getElementById("taskSearch")
    .value.trim()
    .toLowerCase();

  const filtered = taskList_data.filter((task) => {
    // Status Filter
    if (status !== "All" && task.status !== status) {
      return false;
    }

    // Service Filter
    if (service !== "All" && task.ticketFor !== service) {
      return false;
    }

    // Owner Filter
    if (owner !== "All") {
      const taskOwner =
        task.status === "In Review"
          ? task.reviewerName || ""
          : task.actionOwnerName || "";

      if (taskOwner !== owner) {
        return false;
      }
    }

    // Search Filter
    if (search) {
      const searchableText = [
        task.actionDescription || "",
        task.ticketFor || "",
        task.actionOwnerName || "",
        task.reviewerName || "",
        task.status || "",
        task.createdBy || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(search)) {
        return false;
      }
    }

    return true;
  });

  console.log("Selected Owner:", owner);
  console.log("Filtered Count:", filtered.length);

  taskList_renderTasks(filtered);
}

async function taskList_updateStatus(taskId, newStatus) {
  const comment = document.getElementById(`taskComment_${taskId}`).value.trim();

  if (!comment) {
    SHOW_INFO_POPUP("Please enter a comment.");
    return;
  }

  // Find the actual task from the master dataset
  const task = taskList_data.find((x) => String(x.taskId) === String(taskId));

  if (!task) {
    SHOW_ERROR_POPUP("Task not found.");
    return;
  }

  const request = {
    taskId: task.taskId,
    comment,
    status: newStatus,
  };

  const response = await CALL_API("UPDATE_TASK_STATUS", request);

  if (response?.status) {
    // Update local data
    switch (newStatus) {
      case "Move Back":
        task.status = "In Progress";
        task.reviewerComment = comment;
        break;

      case "Closed":
        task.status = "Closed";
        task.reviewerComment = comment;
        break;

      default:
        task.status = newStatus;
        task.remarks = comment;
        break;
    }

    // Recalculate canReview because status has changed
    task.canReview =
      ((task.status === "Pending" || task.status === "In Progress") &&
        task.actionOwnerName === selectedDevoteeName) ||
      (task.status === "In Review" &&
        task.reviewerName === selectedDevoteeName);

    SHOW_SUCCESS_POPUP("Task updated successfully.");

    // Refresh UI
    taskList_applyFilters();
  }
}
