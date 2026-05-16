let serviceResponse = null;
let selectedDevoteeName = null;
const userServiceDataList = {};
let pendingNoItems = [];
let selectedData = [];
let sewaKartaList = [];
let selectedUser = null;

document.addEventListener("DOMContentLoaded", async function () {
  const loginData = await DB_GET(
    INDEX_DB.storeKey,
    INDEX_DB.dbName,
    INDEX_DB.storeName,
  );

  if (loginData) {
    selectedUser = loginData;
    selectedDevoteeName = loginData?.name;
    renderMenus(loginData?.role);
  } else {
    SHOW_SPECIFIC_DIV("passwordPopup");
  }
});

async function submitPass() {
  const today = new Date();
  const todayDate = formatDateToDDMMMYYYY(today);

  let password = GetControlValue("passworTxtBox");
  if (password) {
    password = password.toLowerCase().toString().trim();
    const request = {
      password: password,
    };

    const response = await CALL_API("GET_DEVOTEE_ACCESS_BY_PASSWORD", request);

    if (response?.status && response?.data) {
      await DB_SET(
        INDEX_DB.storeKey,
        response?.data,
        INDEX_DB.dbName,
        INDEX_DB.storeName,
      );
      selectedUser = response?.data;
      renderMenus(response?.data?.role);
    } else {
      SHOW_ERROR_POPUP("Please input some value in password fields");
    }
  }
}

async function submitUserResponse() {
  const container = document.getElementById("serviceOwnerCheckList");

  const radios = container.querySelectorAll(
    'input[type="radio"]:not([disabled])',
  );

  const isAnySelected = Array.from(radios).some((radio) => radio.checked);
  if (!isAnySelected) {
    alert("Nothing data is there to submit");
    return;
  }

  selectedData = [];
  let firstUnansweredInput = null;
  let allAnswered = true;

  container.querySelectorAll(".accordion-item").forEach((item) => {
    item.classList.remove("error-section");
  });

  container.querySelectorAll(".checklist-item").forEach((item) => {
    if (item.classList.contains("disabled-row")) return;

    let label = item.querySelector(".checklist-label")?.innerText || "";
    label = label.replace("*", "").trim();

    const radios = item.querySelectorAll('input[type="radio"]');
    let selectedValue = null;

    radios.forEach((radio) => {
      if (radio.checked) {
        selectedValue = radio.nextSibling.nodeValue.trim();
      }
    });

    if (!selectedValue) {
      allAnswered = false;
      if (!firstUnansweredInput) firstUnansweredInput = radios[0];

      const accordionItem = item.closest(".accordion-item");
      accordionItem?.classList.add("error-section");
    }

    const accordionHeader =
      item.closest(".accordion-content")?.previousElementSibling;

    const serviceName =
      accordionHeader?.querySelector(".section-title")?.innerText.trim() || "";

    selectedData.push({
      selectedDevoteeName,
      serviceName: serviceName.split("(")[0].trim(),
      task: label,
      response: selectedValue || "Not Answered",
      type: "Service Owner",
    });
  });

  if (!allAnswered) {
    if (firstUnansweredInput) {
      const accordionContent =
        firstUnansweredInput.closest(".accordion-content");
      const accordionHeader = accordionContent.previousElementSibling;

      container
        .querySelectorAll(".accordion-content")
        .forEach((c) => (c.style.display = "none"));
      container
        .querySelectorAll(".accordion-header")
        .forEach((h) => h.classList.remove("active"));

      accordionContent.style.display = "block";
      accordionHeader.classList.add("active");
      firstUnansweredInput.focus();
    }
    return;
  }

  showNoResponseComments(selectedData);
}

function showNoResponseComments(selectedData) {
  pendingNoItems = selectedData.filter((item) => item.response === "No");

  if (pendingNoItems.length > 0) {
    const containerFields = document.getElementById("commentFields");
    containerFields.innerHTML = ""; // clear previous

    pendingNoItems.forEach((item, index) => {
      const safeName = item.serviceName.replace(/\s+/g, "_");
      const safeTask = item.task.replace(/\s+/g, "_");

      const uniqueCommentId = `Comment-${safeName}-${safeTask}`;
      const uniqueDropdownId = `Dropdown-${safeName}-${safeTask}`;

      const block = document.createElement("div");
      block.classList.add("noResponseBox");

      block.innerHTML = `
        <h4>${item.serviceName} - ${item.task}</h4>

        <!-- Comment Box -->
        <input
          type="text"
          placeholder="अपनी टिप्पणी लिखें..."
          id="${uniqueCommentId}"
        />

        <!-- Dropdown -->
        <select id="${uniqueDropdownId}" style="margin-top:8px;">
          <option value="">कृपया चयन करें</option>
        </select>
      `;

      containerFields.appendChild(block);

      const dropdown = document.getElementById(uniqueDropdownId);

      if (item.task.trim() === "क्या आप सेवा में उपस्थित थे?") {
        const option = document.createElement("option");
        option.value = selectedDevoteeName;
        option.textContent = selectedDevoteeName;
        option.selected = true;

        dropdown.appendChild(option);

        // Disable dropdown
        dropdown.disabled = true;
      } else {
        // Normal dropdown population
        sewaKartaList.forEach((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;

          // Default selected
          if (
            name.trim().toLowerCase() ===
            selectedDevoteeName.trim().toLowerCase()
          ) {
            option.selected = true;
          }

          dropdown.appendChild(option);
        });
      }
    });

    document.getElementById("serviceOwnerCheckList").style.display = "none";
    document.getElementById("noResponseComments").style.display = "block";
  } else {
    callAPISaveUserServiceData(pendingNoItems?.length);
  }
}

function goToServiceCheckList() {
  document.getElementById("serviceOwnerCheckList").style.display = "block";
  document.getElementById("noResponseComments").style.display = "none";
}

function submitServiceCheckList() {
  const allCommentInputs = document.querySelectorAll(
    '#commentFields input[type="text"]',
  );
  let firstEmptyInput = null;

  for (const input of allCommentInputs) {
    if (!input.value.trim()) {
      firstEmptyInput = input;
      break; // stop at the first empty one
    }
  }

  if (firstEmptyInput) {
    firstEmptyInput.focus();
    return;
  }

  selectedData.forEach((item, index) => {
    if (item.response === "Yes") {
      item.sewaKartaName = "";
      item.comment = "";
    } else if (item.response === "No") {
      const safeName = item.serviceName.replace(/\s+/g, "_");
      const safeTask = item.task.replace(/\s+/g, "_");
      const commentInput = document.getElementById(
        `Comment-${safeName}-${safeTask}`,
      );

      const dropdownInput = document.getElementById(
        `Dropdown-${safeName}-${safeTask}`,
      );

      item.comment = commentInput ? commentInput.value.trim() : "";
      item.sewaKartaName = dropdownInput ? dropdownInput.value : "";
    }
  });

  SHOW_INFO_POPUP(`
    आपने जिन-जिन इनपुट में "नहीं" चुना है,
    उनके लिए कार्य (टास्क) बना दिया गया है।</b><br><br>
    इसकी जानकारी प्रभु जी के पास चली जाएगी<br>
    और आप इसे <span style="color: red;">'Task Tracker'</span> टैब में देख सकते हैं।
  `);

  callAPISaveUserServiceData();
}

async function callAPISaveUserServiceData() {
  if (selectedData?.length > 0) {
    const response = await CALL_API(
      API_TYPE_CONSTANT.SAVE_USER_SERVICE_DATA,
      selectedData,
    );

    if (response?.status) {
      SHOW_SUCCESS_POPUP("Saved ! Hare Krishna");
      userServiceResponse = null;
      serviceResponse = null;
      submitPass();
      goToServiceCheckList();
      const containerFields = document.getElementById("commentFields");
      containerFields.innerHTML = "";
    }
  } else {
    SHOW_ERROR_POPUP("You haven't selected anything!");
  }
}

async function onLogoutClick() {
  await DB_DELETE(INDEX_DB.storeKey, INDEX_DB.dbName, INDEX_DB.storeName);
  document.getElementById("passworTxtBox").value = "";
  SHOW_SPECIFIC_DIV("passwordPopup");
}

function CREATE_ACCORDION_FROM_OBJECT(accordionContainerId, dataObject) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const accordionContainer = document.getElementById(accordionContainerId);
  accordionContainer.innerHTML = "";

  const sortedEntries = Object.entries(dataObject).sort(
    ([keyA, itemsA], [keyB, itemsB]) => {
      const timeA = itemsA[0]?.triggerTime || "00:00";
      const timeB = itemsB[0]?.triggerTime || "00:00";
      return timeA.localeCompare(timeB);
    },
  );

  sortedEntries.forEach(([sectionTitle, items]) => {
    console.log("items honey ", items);

    // --- inject present question at top (controller) ---
    items.unshift({
      detail: "क्या आप सेवा में उपस्थित थे?",
      enableTime: items[0]?.enableTime,
      triggerTime: items[0]?.triggerTime,
      isEntryExists: items[0]?.isEntryExists,
      filledStatus: null,
      taskOwner: items[0]?.taskOwner || [],
      __isPresentController: true, // <--- flag to detect
    });

    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");

    // Header
    const header = document.createElement("button");
    header.classList.add("accordion-header");
    header.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: flex-start;">
        <div class="section-title">${sectionTitle}</div> 
        <div class="accordion-subtime"> (E - ${convertToAMPMFormat(items[0].enableTime)} )
    (T - ${convertToAMPMFormat(items[0].triggerTime)})</div>
    </div>
     <span class="icon">▼</span>`;

    // Content
    const content = document.createElement("div");
    content.classList.add("accordion-content");

    // Add checklist container
    const checklist = document.createElement("div");
    checklist.classList.add("checklist");

    items.forEach((task, index) => {
      const taskTime = parseTimeToMinutes(task.enableTime); // convert enable time to minutes
      const origDisabled = currentMinutes < taskTime || task.isEntryExists;
      const isPresentController = !!task.__isPresentController;

      const isDisabled = origDisabled;

      const checklistItem = document.createElement("div");
      checklistItem.classList.add("checklist-item");
      checklistItem.dataset.taskOwner = JSON.stringify(task?.taskOwner || []);

      const label = document.createElement("div");
      label.classList.add("checklist-label");
      label.innerText = task.detail;

      // store original disabled (needed when toggling back after Present=No)
      checklistItem.dataset.origDisabled = origDisabled ? "1" : "0";
      checklistItem.dataset.isPresentController = isPresentController
        ? "1"
        : "0";

      if (!isDisabled) {
        const requiredMark = document.createElement("span");
        requiredMark.innerText = " *";
        requiredMark.style.color = "red";
        requiredMark.classList.add("required-mark"); // NEW: easier to remove later
        label.appendChild(requiredMark);
      } else {
        header.classList.add("disabled-header");
      }

      const responseContainer = document.createElement("div");
      responseContainer.classList.add("response-options");
      const radioGroupName = `${sectionTitle}-${index}`;
      debugger;

      // Yes option
      const yesLabel = document.createElement("label");
      yesLabel.classList.add("yes-label");
      const yesCheckbox = document.createElement("input");
      yesCheckbox.type = "radio";
      yesCheckbox.name = radioGroupName;
      yesCheckbox.value = "yes";
      if (isDisabled) yesCheckbox.disabled = true;
      if (task.filledStatus && task.filledStatus.toLowerCase() === "yes")
        yesCheckbox.checked = true;
      yesLabel.appendChild(yesCheckbox);
      yesLabel.appendChild(document.createTextNode("Yes"));

      // No option
      const noLabel = document.createElement("label");
      noLabel.classList.add("no-label");
      const noCheckbox = document.createElement("input");
      noCheckbox.type = "radio";
      noCheckbox.name = radioGroupName;
      noCheckbox.value = "no";
      if (isDisabled) noCheckbox.disabled = true;
      if (task.filledStatus && task.filledStatus.toLowerCase() === "no")
        noCheckbox.checked = true;
      noLabel.appendChild(noCheckbox);
      noLabel.appendChild(document.createTextNode("No"));

      responseContainer.appendChild(yesLabel);
      responseContainer.appendChild(noLabel);

      checklistItem.appendChild(label);
      checklistItem.appendChild(responseContainer);

      // Tooltip logic if disabled (never triggers for controller row)
      let tooltip = null;
      if (isDisabled) {
        checklistItem.classList.add("disabled-row");

        tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");

        if (task.isEntryExists && task.filledStatus) {
          tooltip.innerText = `Already submitted: ${task.filledStatus}`;
        } else {
          tooltip.innerText = `Enable Time: ${task.enableTime}`;
        }

        checklistItem.appendChild(tooltip);

        [yesLabel, noLabel].forEach((label) => {
          label.addEventListener("click", (e) => {
            e.preventDefault();
            tooltip.classList.add("visible");
            setTimeout(() => {
              tooltip.classList.remove("visible");
            }, 1000);
          });
        });
      }

      checklistItem.addEventListener("click", (e) => {
        if (isDisabled && tooltip) {
          e.preventDefault();
          e.stopPropagation();
          tooltip.classList.add("visible");
          setTimeout(() => {
            tooltip.classList.remove("visible");
          }, 1000);
        }
      });

      // --- Controller behavior: disable/enable rest of section ---
      if (isPresentController) {
        yesCheckbox.addEventListener("change", () => {
          if (yesCheckbox.checked) {
            toggleSectionItems(checklist, true);
          }
        });
        noCheckbox.addEventListener("change", () => {
          if (noCheckbox.checked) {
            toggleSectionItems(checklist, false);
          }
        });
      }

      checklist.appendChild(checklistItem);
    });

    content.appendChild(checklist);

    // Toggle logic
    header.addEventListener("click", function () {
      const isOpen = content.style.display === "block";
      document.querySelectorAll(".accordion-content").forEach((item) => {
        item.style.display = "none";
      });
      document.querySelectorAll(".accordion-header").forEach((item) => {
        item.classList.remove("active");
      });

      if (!isOpen) {
        content.style.display = "block";
        header.classList.add("active");
      }
    });

    accordionItem.appendChild(header);
    accordionItem.appendChild(content);
    accordionContainer.appendChild(accordionItem);
  });

  function toggleSectionItems(checklistEl, enableOthers) {
    const rows = Array.from(checklistEl.querySelectorAll(".checklist-item"));
    // row[0] is controller; skip
    rows.slice(1).forEach((row) => {
      const radios = row.querySelectorAll('input[type="radio"]');
      const requiredMark = row.querySelector(".required-mark");
      const origDisabled = row.dataset.origDisabled === "1";

      if (enableOthers) {
        // restore original state
        radios.forEach((r) => {
          r.disabled = origDisabled;
        });
        // restore required mark if originally enabled
        if (!origDisabled) {
          if (!requiredMark) {
            const label = row.querySelector(".checklist-label");
            const mark = document.createElement("span");
            mark.innerText = " *";
            mark.style.color = "red";
            mark.classList.add("required-mark");
            label.appendChild(mark);
          }
        }
        row.classList.toggle("disabled-row", origDisabled);
      } else {
        // force disable + clear required
        radios.forEach((r) => {
          r.disabled = true;
          r.checked = false; // optional: clear answers
        });
        if (requiredMark) requiredMark.remove();
        row.classList.add("disabled-row");
      }
    });

    // Store state on checklist for validation
    checklistEl.dataset.presentNo = enableOthers ? "0" : "1";
  }
}
