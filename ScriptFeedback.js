let feedbackCheckList = null;
let selectedDataFeedback = [];
async function populateDataFeedback() {
  feedbackCheckList = await CALL_API("GET_SERVICE_TASKS_LIST_FOR_FEEDBACK", {});

  document.getElementById("userNameFeedbackDiv").innerText = devoteeName;

  CREATE_ACCORDION_FROM_OBJECT_FOR_FEEDBACK(
    "otherLinkAccordionFeedback",
    feedbackCheckList?.data?.services,
  );
}

function CREATE_ACCORDION_FROM_OBJECT_FOR_FEEDBACK(
  accordionContainerId,
  dataObject,
) {
  const accordionContainer = document.getElementById(accordionContainerId);
  accordionContainer.innerHTML = "";

  // Sorting by trigger time
  const sortedEntries = Object.entries(dataObject).sort(
    ([keyA, itemsA], [keyB, itemsB]) => {
      const timeA = itemsA[0]?.triggerTime || "00:00";
      const timeB = itemsB[0]?.triggerTime || "00:00";
      return timeA.localeCompare(timeB);
    },
  );

  sortedEntries.forEach(([sectionTitle, items]) => {
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

    const checklist = document.createElement("div");
    checklist.classList.add("checklist");

    items.forEach((task, index) => {
      const checklistItem = document.createElement("div");
      checklistItem.classList.add("checklist-item");

      const label = document.createElement("div");
      label.classList.add("checklist-label");
      label.innerText = task.detail;

      const responseContainer = document.createElement("div");
      responseContainer.classList.add("response-options");

      const radioGroupName = `${sectionTitle}-${index}`;

      // YES
      const yesLabel = document.createElement("label");
      const yesCheckbox = document.createElement("input");
      yesCheckbox.type = "radio";
      yesCheckbox.name = radioGroupName;
      yesCheckbox.value = "yes";
      yesLabel.appendChild(yesCheckbox);
      yesLabel.appendChild(document.createTextNode("Yes"));

      // NO
      const noLabel = document.createElement("label");
      const noCheckbox = document.createElement("input");
      noCheckbox.type = "radio";
      noCheckbox.name = radioGroupName;
      noCheckbox.value = "no";
      noLabel.appendChild(noCheckbox);
      noLabel.appendChild(document.createTextNode("No"));

      responseContainer.appendChild(yesLabel);
      responseContainer.appendChild(noLabel);

      checklistItem.appendChild(label);
      checklistItem.appendChild(responseContainer);

      checklist.appendChild(checklistItem);
    });

    content.appendChild(checklist);

    // Accordion toggle
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

  const generalBox = document.createElement("div");
  generalBox.classList.add("general-feedback-box");

  generalBox.innerHTML = `
  <div style="margin-top:15px;">
      <label style="font-weight:600;">General Feedback</label>
      <textarea 
        id="generalFeedbackText"
        placeholder="Write any general feedback (optional)..."
        style="width:100%; min-height:80px;">
    </textarea>
  </div>
`;

  accordionContainer.appendChild(generalBox);
}

async function submitUserResponseFeedback() {
  const container = document.getElementById("feedbackCheckList");

  const radios = container.querySelectorAll(
    'input[type="radio"]:not([disabled])',
  );

  const isAnySelected = Array.from(radios).some((radio) => radio.checked);
  if (!isAnySelected) {
    SHOW_ERROR_POPUP(
      "There is nothing to submit. Please select at least one response.",
    );
    return;
  }

  selectedDataFeedback = [];

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

    const accordionHeader =
      item.closest(".accordion-content")?.previousElementSibling;

    const serviceName =
      accordionHeader?.querySelector(".section-title")?.innerText.trim() || "";

    // Only push if selected (optional — if you want all rows then remove this if)
    if (selectedValue) {
      selectedDataFeedback.push({
        devoteeName,
        serviceName: serviceName.split("(")[0].trim(),
        task: label,
        response: selectedValue,
        type: "Feedback",
      });
    }
  });

  const generalFeedback = document
    .getElementById("generalFeedbackText")
    ?.value.trim();
  if (generalFeedback) {
    selectedDataFeedback.push({
      devoteeName,
      serviceName: "General Feedback",
      task: generalFeedback,
      response: "NO",
      type: "Feedback",
      comment: generalFeedback,
      sewaKartaName: devoteeName,
    });
  }

  showNoResponseCommentsFeedback(selectedDataFeedback);
}

function showNoResponseCommentsFeedback(selectedDataFeedback) {
  console.log("selectedDataFeedback ", selectedDataFeedback);
  pendingNoItems = selectedDataFeedback.filter(
    (item) => item.response === "No",
  );

  if (pendingNoItems.length > 0) {
    const containerFields = document.getElementById("commentFieldsFeedback");
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
        option.value = devoteeName;
        option.textContent = devoteeName;
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
          if (name.trim().toLowerCase() === devoteeName.trim().toLowerCase()) {
            option.selected = true;
          }

          dropdown.appendChild(option);
        });
      }
    });

    document.getElementById("feedbackCheckList").style.display = "none";
    document.getElementById("noResponseCommentsFeedback").style.display =
      "block";
  } else {
    callAPISaveUserServiceDataFeedback(pendingNoItems?.length);
  }
}

async function callAPISaveUserServiceDataFeedback() {
  if (selectedDataFeedback?.length > 0) {
    const response = await CALL_API(
      API_TYPE_CONSTANT.SAVE_USER_SERVICE_DATA,
      selectedDataFeedback,
    );

    if (response?.status) {
      SHOW_SUCCESS_POPUP("Saved ! Hare Krishna");
      userServiceResponse = null;
      serviceResponse = null;
      await populateDataFeedback();
      goToServiceCheckListFeedback();
      const containerFields = document.getElementById("commentFieldsFeedback");
      containerFields.innerHTML = "";
    }
  } else {
    SHOW_ERROR_POPUP("You haven't selected anything!");
  }
}

function goToServiceCheckListFeedback() {
  document.getElementById("feedbackCheckList").style.display = "block";
  document.getElementById("noResponseCommentsFeedback").style.display = "none";
}

function submitServiceCheckListFeedback() {
  const allCommentInputs = document.querySelectorAll(
    '#commentFieldsFeedback input[type="text"]',
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

  selectedDataFeedback.forEach((item, index) => {
    debugger;
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

  callAPISaveUserServiceDataFeedback();
}
