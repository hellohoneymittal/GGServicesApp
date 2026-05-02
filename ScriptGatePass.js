let gatePassData = {};

async function openGatePassWindow() {
  let i;
  const outputData = await CALL_API(
    API_TYPE_CONSTANT.GET_PENDING_GATE_PASSES,
    "",
  );

  if (outputData?.status && outputData.data) {
    if (
      typeof outputData.data === "string" &&
      outputData.data.includes("ERR")
    ) {
      SHOW_ERROR_POPUP(outputData.data.split("ERR: ")[1]);
      return;
    }

    if (Object.keys(outputData.data.data).length == 0) {
      SHOW_INFO_POPUP(`No pending gate pass requests!`);
      return;
    }

    const teacherLeavesDiv = document.getElementById("gatePassHeading_div");
    const teacherLeavesLabel = document.getElementById("gatePassHeading_lbl");
    let nextButton = document.getElementById("gatePassNextBtn");
    const checkboxList = document.getElementById("gatePassWindow");

    nextButton.disabled = true;
    checkboxList.innerHTML = "";

    nextButton.onclick = function () {
      moveNextStepGatePass();
    };

    teacherLeavesDiv.style.display = "block";
    teacherLeavesLabel.innerHTML = `${selectedDevoteeName}`;

    checkboxList.addEventListener("change", function (e) {
      if (e.target.type === "radio") {
        const anyChecked = checkboxList.querySelector(
          'input[type="radio"]:checked',
        );

        nextButton.disabled = !anyChecked;
      }
    });

    const grid = document.createElement("div");
    grid.classList.add("question-grid");

    const checkboxContent = document.createElement("div");
    checkboxContent.className = "radio-content-without-flex";
    checkboxContent.id = "dynamic-feedback-list";

    const headerRow = document.createElement("div");
    headerRow.classList.add("radio-content-box-head-GP");
    headerRow.innerHTML = `
    <div class="radio-content-inbox">
        Student Name - Reason
    </div>

    <div class="radio-content-inbox">
        Accept
    </div>

    <div class="radio-content-inbox">
        Reject
    </div>
    `;

    grid.appendChild(headerRow);

    Object.entries(outputData.data.data).forEach(([student, details]) => {
      // 🔹 Pending Entries

      const row = document.createElement("div");
      row.classList.add("radio-content-box-GP");
      row.innerHTML = `
        <label>${student} - ${details["reason"]}</label>
        <div class="radio-content-inbox">
        <input type="radio" name="${student}_${details["reason"]}_${details["row_num"]}" id="${details["row_num"]}_${details["phone_num"]}_${details["otp"]}_Approved" value="${student} - ${details["reason"]}">
        </div>
        <div class="radio-content-inbox">
        <input type="radio" name="${student}_${details["reason"]}_${details["row_num"]}" id="${details["row_num"]}_${details["phone_num"]}_${details["otp"]}_Rejected" value="${student} - ${details["reason"]}">
        </div>
        `;

      grid.appendChild(row);
    });

    checkboxList.appendChild(grid);
  } else {
    SHOW_ERROR_POPUP("Problem in fetching details from Backend!");
    return;
  }

  SHOW_SPECIFIC_DIV("gatePassContainer");
}

function validateGPSelection() {
  let result = { rows: [] };
  let work_map = {};
  let i;
  let check_type = "radio";
  const parent_container = document.getElementById("gatePassContainer");

  const selected = parent_container.querySelectorAll(
    `input[type="${check_type}"]:checked`,
  );

  selected.forEach((el) => {
    const input_arr = el.id.split("_");
    const type = input_arr[3];
    const phone_num = input_arr[1];
    const row_num = input_arr[0];
    const text = el.value;

    if (!result[type]) result[type] = {};
    if (!result[type][phone_num]) result[type][phone_num] = "";
    if (!work_map[type + "_" + phone_num])
      work_map[type + "_" + phone_num] = [];

    result["rows"].push(type + " : " + row_num);
    work_map[type + "_" + phone_num].push(text);
  });

  for (i in work_map) {
    let index_split_arr = i.split("_");
    let question_arr = work_map[i];
    let out_text = "";

    for (let j = 0; j < question_arr.length; j++)
      out_text += question_arr[j] + "\n";

    result[index_split_arr[0]][index_split_arr[1]] = out_text.substring(
      0,
      out_text.length - 1,
    );
  }

  return result;
}

function moveNextStepGatePass() {
  gatePassData = validateGPSelection();
  if (gatePassData["ERR"] != null) {
    SHOW_ERROR_POPUP(gatePassData["ERR"]);
    return;
  }
  console.log("Selected Values:");
  console.log(gatePassData);

  let outGrid = {};
  let header_arr = [];

  for (let header in gatePassData) {
    if (header == "rows") continue;

    outGrid[header] = {};

    header_arr.push(header);
    for (let phone_num in gatePassData[header]) {
      let student_str = gatePassData[header][phone_num];
      let type_map = { Approved: "", Rejected: "" };

      type_map[header] += student_str + "\n";

      for (j in type_map)
        if (type_map[j] != "") {
          let map_key = `${phone_num}_${j}`;
          outGrid[header][map_key] = {};
          outGrid[header][map_key]["Phone Number"] = phone_num;
          outGrid[header][map_key]["Student - Reason"] = type_map[j];
        }
    }
  }

  openVerifyDetailsWindow(
    ["Phone Number", "Student - Reason"],
    header_arr,
    outGrid,
    submitGatePass,
    "gatePassContainer",
  );
}

async function submitGatePass() {
  const inputData = {
    teacher: selectedDevoteeName,
    rowArr: gatePassData["rows"],
  };
  const outputData = await CALL_API("SUBMIT_GATE_PASS_APPROVALS", inputData);

  if (
    outputData?.status &&
    outputData.data &&
    typeof outputData.data === "string"
  ) {
    console.log(outputData.data);
    if (outputData.data == "ok")
      SHOW_SUCCESS_POPUP("Gatepass approvals submitted Successfully!", () => {
        SHOW_SPECIFIC_DIV("menuPopup");
      });
    else
      SHOW_ERROR_POPUP(
        "Unable to submit gatepass approvals !!\n\n" +
          outputData.data.split("ERR: ")[1],
      );
  } else SHOW_ERROR_POPUP("Unable to submit gatepass approvals !!");

  return;
}

function resetGPForm() {
  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.checked = false;
  });

  return;
}

//Populate Grid for verification
function openVerifyDetailsWindow(
  columnNames = [],
  headerArr = [],
  inputMap,
  submitClassBack,
  returnId = "",
  gridHeading = "Verify Details",
  buttonLables = ["Submit", "Back"],
) {
  const parent_popup = document.getElementById("verificationGridPopup");
  const popup = document.getElementById("verificationGridSubPopup");
  const verifySubmitButton = document.getElementById("verificationSubmitBtn");
  const returnSubmitButton = document.getElementById("verificationBackButton");
  const buttonRow = popup.querySelector(".button-row");
  const gridheadingelement = document.getElementById("gridHeading");

  if (gridHeading == "") gridheadingelement.hidden = true;
  else gridheadingelement.innerHTML = gridHeading;

  let cntr = 0;

  verifySubmitButton.onclick = function () {
    submitClassBack();
  };

  returnSubmitButton.hidden = true;

  verifySubmitButton.innerHTML = buttonLables[0];

  if (buttonLables.length == 2) {
    returnSubmitButton.innerHTML = buttonLables[1];
    returnSubmitButton.onclick = function () {
      SHOW_SPECIFIC_DIV(returnId);
    };

    returnSubmitButton.hidden = false;
  }

  //Removing all elements or cleanup
  const heading = popup.querySelector(".heading");

  let current = heading.nextElementSibling;

  while (current && current !== buttonRow) {
    const next = current.nextElementSibling;
    current.remove();
    current = next;
  }

  for (cntr = 0; cntr < headerArr.length; cntr++) {
    // Add Header element
    const header = document.createElement("div");
    header.className = "heading";
    header.id = `verifyDetailsGridStatusText_${cntr}`;
    header.style.marginTop = "10px";
    popup.insertBefore(header, buttonRow);

    // Add Table

    const container = document.createElement("div");
    console.log(
      `Creating container with ID verifyDetailsGridContainer_${cntr}`,
    );

    container.id = `verifyDetailsGridContainer_${cntr}`;

    container.classList.add(
      "collection-table-container",
      "scrollable-content-table",
    );

    // Avoid style string
    container.style.marginTop = "10px";

    // TABLE
    const table = document.createElement("table");
    table.id = `verifyDetailsGridTable_${cntr}`;

    // THEAD
    const thead = document.createElement("thead");
    thead.id = `verifyDetailsGridTHead_${cntr}`;
    thead.classList.add("table-header");

    // TBODY
    const tbody = document.createElement("tbody");
    tbody.id = `verifyDetailsGridTBody_${cntr}`;
    tbody.innerHTML = "";

    // Build hierarchy
    table.appendChild(thead);
    table.appendChild(tbody);

    container.appendChild(table);

    popup.insertBefore(container, buttonRow);

    populateActionGrid(
      `verifyDetails`,
      headerArr[cntr],
      columnNames,
      inputMap[headerArr[cntr]],
      cntr,
    );
  }

  // Show the parent popup
  SHOW_SPECIFIC_DIV(parent_popup.id);
}

function populateActionGrid(
  inputType,
  inputMsg,
  columnNames,
  gridData,
  instance = 0,
) {
  const gridContainer = document.getElementById(
    inputType + "GridContainer_" + instance,
  );
  const statusTextElement = document.getElementById(
    inputType + "GridStatusText_" + instance,
  );
  let totalRows = 0;

  // Clear any existing content in the grid container
  statusTextElement.textContent = inputMsg;

  // Create the table element and headers dynamically
  let table = document.getElementById(inputType + "GridTable_" + instance);

  const thead = document.getElementById(`${inputType}GridTHead_${instance}`);
  thead.replaceChildren();

  const headerRow = document.createElement("tr");
  headerRow.id = `${inputType}GridTHRow_${instance}`;

  // Add table headers dynamically from columnNames array
  columnNames.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column; // Use displayName for the header
    th.style.textAlign = "center";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.getElementById(`${inputType}GridTBody_${instance}`);
  tbody.replaceChildren();

  console.info(gridData);

  // Populate table rows dynamically from gridData
  for (let key in gridData) {
    const row = document.createElement("tr");
    let spiritualFlag = gridData[key]["Spiritual Mentor's Name"] == "" ? 0 : 1;
    row.id = `${inputType}GridTRow_${instance}_${totalRows}`;
    row.dataset.name = `TableRow_${gridData[key]["row"]}_${gridData[key]["Student Name"]}_${spiritualFlag}_${key}`;

    if (gridData[key]["red"] != null && gridData[key]["red"] == 1) {
      row.style.backgroundColor = "#b81414";
      row.style.color = "white";
    }

    // Add each data field into a new table cell (td)
    columnNames.forEach((column) => {
      if (gridData[key][column] == null) return;
      const td = document.createElement("td");
      td.textContent = gridData[key][column];
      row.appendChild(td);
    });

    totalRows++;

    tbody.appendChild(row);
  }
  table.appendChild(tbody);

  // Append the table to the grid container
  gridContainer.appendChild(table);
  return totalRows;
}
