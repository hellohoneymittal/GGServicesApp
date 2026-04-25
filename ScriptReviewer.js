let reviewerCheckListResponse = null;
let selectedDataReview = [];

async function populateDataReview() {
  reviewerCheckListResponse = await CALL_API(
    "GET_TODAY_CHECKLIST_FOR_REVIEWER",
    { devoteeName: selectedDevoteeName },
  );

  if (Object.keys(reviewerCheckListResponse?.data?.services).length === 0) {
    SHOW_ERROR_POPUP("No records available for review.");
    return;
  }

  document.getElementById("userNameReviewerDiv").innerText =
    selectedDevoteeName;
  sewaKartaList = reviewerCheckListResponse?.data?.sewaKartaList;
  console.log("sewaKartaList", sewaKartaList);
  CREATE_ACCORDION_FROM_OBJECT(
    "otherLinkAccordionReviewer",
    reviewerCheckListResponse?.data?.services,
  );
  SHOW_SPECIFIC_DIV("reviewerCheckList");
}

async function submitUserResponseReviewer() {
  const container = document.getElementById("reviewerCheckList");

  const radios = container.querySelectorAll(
    'input[type="radio"]:not([disabled])',
  );

  const isAnySelected = Array.from(radios).some((radio) => radio.checked);
  if (!isAnySelected) {
    alert("Nothing data is there to submit");
    return;
  }

  selectedDataReview = [];
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
    const taskOwner = JSON.parse(item.dataset.taskOwner || "[]");
    selectedDataReview.push({
      selectedDevoteeName,
      serviceName: serviceName.split("(")[0].trim(),
      task: label,
      response: selectedValue || "Not Answered",
      type: "Review",
      taskOwner: taskOwner,
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

  showNoResponseCommentsReview(selectedDataReview);
}

function showNoResponseCommentsReview(selectedDataReview) {
  pendingNoItems = selectedDataReview.filter((item) => item.response === "No");

  if (pendingNoItems.length > 0) {
    const containerFields = document.getElementById("commentFieldsReviewer");
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
        let ownerName = item.taskOwner?.[0] || "";
        sewaKartaList.forEach((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;

          // Default selected (old behavior)
          if (
            name.trim().toLowerCase() ===
            selectedDevoteeName.trim().toLowerCase()
          ) {
            option.selected = true;
          }

          dropdown.appendChild(option);
        });

        // ---------- NEW LOGIC ----------
        if (ownerName) {
          dropdown.value = ownerName; //
          dropdown.disabled = true; //
        }
      }
    });

    document.getElementById("reviewerCheckList").style.display = "none";
    document.getElementById("noResponseCommentsReviewer").style.display =
      "block";
  } else {
    callAPISaveUserServiceDataReview(pendingNoItems?.length);
  }
}

async function callAPISaveUserServiceDataReview() {
  if (selectedDataReview?.length > 0) {
    const cleanedData = selectedDataReview.map(
      ({ taskOwner, ...rest }) => rest,
    );
    const response = await CALL_API(
      API_TYPE_CONSTANT.SAVE_USER_SERVICE_DATA,
      cleanedData,
    );

    if (response?.status) {
      SHOW_SUCCESS_POPUP("Saved ! Hare Krishna");
      userServiceResponse = null;
      serviceResponse = null;
      await populateDataReview();
      goToServiceCheckListReview();
      const containerFields = document.getElementById("commentFieldsReviewer");
      containerFields.innerHTML = "";
    }
  } else {
    SHOW_ERROR_POPUP("You haven't selected anything!");
  }
}

function goToServiceCheckListReview() {
  SHOW_SPECIFIC_DIV("reviewerCheckList");
}

function submitServiceCheckListReview() {
  const allCommentInputs = document.querySelectorAll(
    '#commentFieldsReviewer input[type="text"]',
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

  selectedDataReview.forEach((item, index) => {
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

  callAPISaveUserServiceDataReview();
}
