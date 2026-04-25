function formatDuration(startTimestamp, endTimestamp) {
  // Calculate the difference in milliseconds
  const durationMs = endTimestamp - startTimestamp;

  // Convert milliseconds to hours and minutes
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format the duration
  return `${hours} Hr ${minutes} Min`;
}

async function checkPassword(password) {
  const pass = password.toString().toLowerCase().trim();
  return new Promise((resolve, reject) => {
    fetch(CHECK_PASSWORD_API + pass)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok. Status: ${response.status} - ${response.statusText}`,
          );
        }
        return response.json();
      })
      .then((data) => {
        resolve(data); // Resolve the promise with the data
      })
      .catch((error) => {
        reject(error); // Reject the promise with the error
      });
  });
}

function convertDateToFormat(inputDate) {
  const date = new Date(inputDate);

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short", // Short month name (e.g., Jan, Feb)
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour format with AM/PM
  };

  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

function convertDate(dateString) {
  // Parse the input date string using moment.js
  const date = moment(dateString, "DD-MM-YYYY HH:mm:ss");

  // Get the formatted date and time
  const formattedDate = date.format("DD MMM YYYY HH:mm A");

  return formattedDate;
}

function ShowPopup(id) {
  document.getElementById(id).style.display = "flex";
}

function HidePopup(id) {
  document.getElementById(id).style.display = "none";
}

function ClearTextBoxValue(id) {
  document.getElementById(id).value = "";
}

function ClearDropdownValue(id) {
  document.getElementById(id).selectedIndex = 0;
}

function ClearDivValue(id) {
  document.getElementById(id).innerText = "";
}

function IsLoading(status) {
  if (status) {
    document.getElementById("loadingSpinner").style.display = "flex";
  } else {
    document.getElementById("loadingSpinner").style.display = "none";
  }
}

function adjustTextAreaRows(textarea) {
  // Set the number of rows based on the scroll height to accommodate the text
  textarea.rows = 1; // Reset to 1 row to shrink when necessary
  const lineBreaks = (textarea.value.match(/\n/g) || []).length;
  const minRows = 1;
  textarea.rows = Math.max(minRows, lineBreaks + 1);
}

function disabledButtonState(containerId, buttonId) {
  const container = document.getElementById(containerId);
  const btnControl = container ? container.querySelector(`#${buttonId}`) : null;

  if (container && btnControl) {
    const contentEditableDiv = container.querySelector(
      '[contenteditable="true"]',
    );

    const requiredFields = container.querySelectorAll(
      "input[required], textarea[required], select[required]",
    );
    let allFilled = true;
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        allFilled = false;
      }
      // Special validation for the mobile number field
      if (field.id === "mobileTxtBox") {
        const mobileRegex = /^\d{10}$/; // Using \d for digits
        const mobileIsValid = mobileRegex.test(field.value);
        if (!mobileIsValid) {
          allFilled = false; // Invalid mobile number
        }
      }
    });

    // Check contenteditable div
    if (contentEditableDiv && !contentEditableDiv.textContent.trim()) {
      allFilled = false;
    }
    btnControl.disabled = !allFilled;
  }
}

function resetFormByFormId(formId) {
  // Select the form element by its ID
  const form = document.getElementById(formId);

  // If the form exists, proceed to clear its elements
  if (form) {
    // Select all input, textarea, and select elements within the form
    const elements = form.querySelectorAll(
      "input, textarea, select, [contenteditable='true']",
    );

    // Loop through each element and clear its value
    elements.forEach((element) => {
      if (element.type === "checkbox" || element.type === "radio") {
        // For checkboxes and radio buttons, uncheck them
        element.checked = false;
      } else if (element.hasAttribute("contenteditable")) {
        // Clear the content of contenteditable div
        element.innerHTML = "";
      } else {
        // For other inputs and textareas, clear their values
        element.value = "";
      }
    });

    // Find the submit button within the specific form container
    const submitBtn = form.querySelector("#submitBtn");

    if (submitBtn) {
      // Update the disabled state of the submit button
      disabledButtonState(formId, submitBtn.id);
    }
  }
}

function generatePassword(name) {
  const specialChars = "@#$%";

  const firstTwoLetters = name.substring(0, 2).toLowerCase(); // 2 letters
  const special = specialChars.charAt(
    Math.floor(Math.random() * specialChars.length),
  ); // 1 special char
  const timePart = Date.now().toString().slice(-4); // Last 4 digits for high uniqueness

  // Total: 2 (letters) + 1 (symbol) + 4 (timestamp) = 7 characters
  const password = `${firstTwoLetters}${special}${timePart}`;

  return password;
}

function UpdateButtonLabel(id, label) {
  document.getElementById(id).textContent = label;
}

function formatDurationByDurationTime(durationMs) {
  try {
    const totalMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hr ${minutes} min`;
  } catch (ex) {
    return "0 min";
  }
}

function convertTimeStampToDate(timestamp) {
  let savedDate = null;
  try {
    savedDate = new Date(Number(timestamp));
  } catch (ex) {
    console.log("Error - convertTimeStampToDate - ", ex);
  }

  return savedDate;
}

function GetControlValue(id, type = "input") {
  if (type.toString().toLowerCase() == "checkbox") {
    return document.getElementById(id)?.checked ?? "false";
  }
  return document.getElementById(id)?.value ?? "";
}

//#region Common Method
function timeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - ss) * 1000;
  let ms = Math.floor(diffInMs);

  let formattedHH = hh.toString().padStart(2, "0");
  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(3, "0").substring(0, 2); // Showing only 2 digits for milliseconds

  return `${formattedHH}:${formattedMM}:${formattedSS}.${formattedMS}`;
}

function timeToStringWithouMilliSecond(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let formattedHH = hh.toString().padStart(2, "0");
  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");

  return `${formattedHH}:${formattedMM}:${formattedSS}`;
}

function formatTimeToDate(timestamp) {
  if (!timestamp) return "";

  const date = new Date(Number(timestamp)); // Convert timestamp to Date object

  // Extract date components
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-based, so add 1
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Convert each component to a string
  const dayStr = day < 10 ? "0" + day : day;
  const monthStr = month < 10 ? "0" + month : month;
  const yearStr = year; // No change needed for year
  const hoursStr = hours < 10 ? "0" + hours : hours;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  const secondsStr = seconds < 10 ? "0" + seconds : seconds;

  // Format the date and time in "dd-mm-yyyy hh:mm:ss"
  return `${dayStr}-${monthStr}-${yearStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
}

function formatTimeToAMPM(timestamp) {
  if (!timestamp) return "";

  const date = new Date(Number(timestamp)); // Convert timestamp to Date object

  // Formatting options for 12-hour clock with AM/PM in IST
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 12-hour clock format
    timeZone: "Asia/Kolkata", // Set the time zone to IST
  };

  return new Intl.DateTimeFormat("en-IN", options).format(date);
}
//#endregion common method

// Function to generate table rows based on server data
function fillDynamicTableRows(data, headerId, bodyId) {
  const tableHead = document.getElementById(headerId);
  const tableBody = document.getElementById(bodyId);

  // Clear any existing content
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  // Check if data is not empty
  if (data.length === 0) return;

  // Generate the table header
  const headerRow = document.createElement("tr");
  // Use the keys from the first object as headers
  const headers = Object.keys(data[0]);
  headers.forEach((headerCell) => {
    const th = document.createElement("th");
    th.textContent = headerCell;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // Generate the table rows
  data.forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((headerCell) => {
      const td = document.createElement("td");
      td.textContent = row[headerCell];
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function SHOW_SUCCESS_POPUP(message) {
  document.getElementById("successMessage").innerHTML = message;
  document.getElementById("successPopup").style.display = "flex";
}

// Function to show the error popup
function SHOW_ERROR_POPUP(message) {
  document.getElementById("errorMessage").innerHTML = message;
  document.getElementById("errorPopup").style.display = "flex";
}

function SHOW_INFO_POPUP(message) {
  document.getElementById("infoMessage").innerHTML = message;
  document.getElementById("infoPopup").style.display = "flex";
}

function CLOSE_INFO_POPUP(popupId) {
  document.getElementById(popupId).style.display = "none";
}

function SHOW_CONFIRMATION_POPUP(
  message,
  yesCallback,
  noCallback = CLOSE_CONFIRMATION_POPUP,
) {
  const popup = document.getElementById("confirmationPopup");
  const popupMessage = document.getElementById("confirmationMessage");
  const yesButton = document.getElementById("confirmationYesButton");
  const noButton = document.getElementById("confirmationNoButton");

  // Set the message dynamically
  popupMessage.textContent = message;

  // Assign event handlers dynamically
  yesButton.onclick = () => {
    yesCallback();
    CLOSE_CONFIRMATION_POPUP();
  };
  noButton.onclick = () => {
    noCallback();
  };

  // Show the popup
  popup.style.display = "flex";
}

function CLOSE_CONFIRMATION_POPUP() {
  document.getElementById("confirmationPopup").style.display = "none";
}

// Example YES and NO callbacks
function handleYes() {
  alert("You clicked YES");
}

function handleNo() {
  alert("You clicked NO");
}

function sortObjectByValue(data, columnName) {
  return data.sort((a, b) => {
    return Number(b[columnName]) - Number(a[columnName]);
  });
}

function exportTableToExcel(tableId, filename = "data.xlsx") {
  // Get the table
  var table = document.getElementById(tableId);

  // Check if table exists
  if (!table) {
    console.error(`Table with ID ${tableId} not found.`);
    return;
  }

  // Extract data from the table
  var data = [];
  var rows = table.querySelectorAll("tr");

  // Loop through each row and collect the cell data
  rows.forEach(function (row) {
    var rowData = [];
    row.querySelectorAll("th, td").forEach(function (cell) {
      // Convert number-like strings to numbers
      const cellValue = cell.innerText.trim();
      if (!isNaN(cellValue) && cellValue !== "") {
        rowData.push(parseFloat(cellValue)); // Store as number
      } else {
        rowData.push(cellValue); // Store as string
      }
    });
    data.push(rowData);
  });

  // Create a worksheet and workbook
  var ws = XLSX.utils.aoa_to_sheet(data); // aoa_to_sheet converts 2D array to sheet
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  // Set column widths for better display
  const colWidths = [];
  for (let i = 0; i < data[0].length; i++) {
    colWidths.push({
      wch: Math.max(...data.map((row) => (row[i] || "").toString().length)) + 2, // +2 for padding
    });
  }
  ws["!cols"] = colWidths;

  // Export the file
  XLSX.writeFile(wb, filename);
}

function daySuffix(day) {
  if (day >= 11 && day <= 13) return "th"; // Special case for 11th, 12th, and 13th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

async function API_HANDLER_AXIOS(request) {
  try {
    const url = APPLICATION_URL;
    IsLoading(true); // Start loading

    const jsonReq = JSON.stringify(request);
    const response = await axios.post(url, jsonReq);
    const data = response?.data;
    IsLoading(false); // Stop loading

    if (data?.status) {
      return data; // Resolve the data to be used by the caller
    } else {
      console.log("Error - ", data);
      SHOW_ERROR_POPUP(
        "Something went wrong, please contact any NKD Servants.",
      );
    }
  } catch (error) {
    IsLoading(false); // Stop loading on error
    console.log(error);
    SHOW_ERROR_POPUP(error.message);
  } finally {
    IsLoading(false); // Stop loading regardless of success or error
  }
}

async function API_HANDLER_WITHOUT_LOADING_AXIOS(request) {
  try {
    const url = APPLICATION_URL;

    const jsonReq = JSON.stringify(request);
    const response = await axios.post(url, jsonReq);
    const data = response?.data;

    if (data?.status) {
      return data; // Resolve the data to be used by the caller
    } else {
      console.log("Error - ", data);
      SHOW_ERROR_POPUP(
        "Something went wrong, please contact any NKD Servants.",
      );
    }
  } catch (error) {
    console.log(error);
    SHOW_ERROR_POPUP(error.message);
  }
}

async function API_HANDLER(request) {
  try {
    const url = APPLICATION_URL;
    IsLoading(true); // Start loading

    const fetchOptions = {
      method: "POST",
      //headers: { "Content-Type": "application/json" },
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // Specify content type
      },
      body: JSON.stringify(request),
      redirect: "follow",
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    IsLoading(false); // Stop loading

    if (data?.status) {
      return data; // Resolve the data to be used by the caller
    } else {
      console.log("Error - ", data);
      SHOW_ERROR_POPUP(
        "Something went wrong, please contact any NKD Servants.",
      );
    }
  } catch (error) {
    IsLoading(false); // Stop loading on error
    console.log(error);
    SHOW_ERROR_POPUP(error.message);
  } finally {
    IsLoading(false); // Stop loading regardless of success or error
  }
}

async function API_HANDLER_WITH_APPLICATION_JSON_TYPE(request) {
  try {
    const url = APPLICATION_URL;
    IsLoading(true); // Start loading

    const fetchOptions = {
      redirect: "follow",
      method: "POST",
      //headers: { "Content-Type": "application/json" },
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // Specify content type
      },
      body: JSON.stringify(request),
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    IsLoading(false); // Stop loading

    if (data?.status) {
      return data; // Resolve the data to be used by the caller
    } else {
      console.log("Error - ", data);
      SHOW_ERROR_POPUP(
        "Something went wrong, please contact any NKD Servants.",
      );
    }
  } catch (error) {
    IsLoading(false); // Stop loading on error
    console.log(error);
    SHOW_ERROR_POPUP(error.message);
  } finally {
    IsLoading(false); // Stop loading regardless of success or error
  }
}

async function API_HANDLER_WITHOUT_LOADING(request) {
  try {
    const url = APPLICATION_URL;

    const fetchOptions = {
      method: "POST",
      //headers: { "Content-Type": "application/json" },
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // Specify content type
      },
      body: JSON.stringify(request),
      redirect: "follow",
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (data?.status) {
      return data; // Resolve the data to be used by the caller
    } else {
      console.log("Error - ", data);
      SHOW_ERROR_POPUP(
        "Something went wrong, please contact any NKD Servants.",
      );
    }
  } catch (error) {
    console.log(error);
    SHOW_ERROR_POPUP(error.message);
  }
}

async function API_HANDLER_GET(request) {
  try {
    const url = APPLICATION_URL;
    IsLoading(true); // Start loading

    const queryString = new URLSearchParams(request).toString();
    const fullUrl = `${url}?${queryString}`;
    const response = await fetch(fullUrl);
    const data = await response.json();
    IsLoading(false);

    if (data?.status) {
      return data; // Resolve the data to be used by the caller
    } else {
      console.log("Error - ", data);
      SHOW_ERROR_POPUP(
        "Something went wrong, please contact any NKD Servants.",
      );
    }
  } catch (error) {
    IsLoading(false); // Stop loading on error
    console.log(error);
    SHOW_ERROR_POPUP(error.message);
  } finally {
    IsLoading(false); // Stop loading regardless of success or error
  }
}

function SHOW_SPECIFIC_DIV(divId) {
  // Select all divs with class 'popup'
  const allPopups = document.querySelectorAll(".popup");

  // Hide all popups by setting display to 'none'
  allPopups.forEach((popup) => {
    popup.style.display = "none";
  });

  // Show the specific div with the provided divId
  const targetDiv = document.getElementById(divId);
  if (targetDiv) {
    targetDiv.style.display = "flex"; // Adjust display style as per need
  } else {
    console.error(`Div with id '${divId}' not found.`);
  }
}

function SHOW_SPECIFIC_DIV_WITH_BLOCK(divId) {
  // Select all divs with class 'popup'
  const allPopups = document.querySelectorAll(".popup");

  // Hide all popups by setting display to 'none'
  allPopups.forEach((popup) => {
    popup.style.display = "none";
  });

  // Show the specific div with the provided divId
  const targetDiv = document.getElementById(divId);
  if (targetDiv) {
    targetDiv.style.display = "block"; // Adjust display style as per need
  } else {
    console.error(`Div with id '${divId}' not found.`);
  }
}

function filterLiveSearchList(inputCtrlId, ulListId, callback) {
  const inputCtrl = document.getElementById(inputCtrlId);
  const ulList = document.getElementById(ulListId);
  const input = inputCtrl.value.toLowerCase();
  const items = ulList.getElementsByTagName("li");
  let hasVisibleItems = false;

  for (const item of items) {
    const liveSearchValue = item.textContent.toLowerCase();
    if (liveSearchValue.includes(input)) {
      item.style.display = ""; // Show the item
      hasVisibleItems = true;
      item.onclick = function () {
        inputCtrl.value = item.textContent; // Set input value to selected item
        ulList.style.display = "none"; // Hide list after selection
        hasVisibleItems = false;
        if (callback) callback(item.textContent); // Call the callback with the selected text
      };
    } else {
      item.style.display = "none"; // Hide the item
    }
  }

  ulList.style.display = hasVisibleItems ? "block" : "none"; // Show/hide the list based on visible items
}

function hideLiveSearchOnClick(inputCtrlId, ulListId) {
  document.addEventListener("click", function (event) {
    const ulList = document.getElementById(ulListId);
    const inputCtrl = document.getElementById(inputCtrlId);

    // Check if the click is outside the input and list
    if (event.target !== inputCtrl && !ulList.contains(event.target)) {
      ulList.style.display = "none"; // Hide the list
    }
  });
}

function setupLiveSearch(inputCtrlId, ulListId, callback) {
  const inputCtrl = document.getElementById(inputCtrlId);

  inputCtrl.addEventListener("keyup", function () {
    filterLiveSearchList(inputCtrlId, ulListId, function (selectedText) {
      // Call the callback to handle the selected text based on input type
      if (callback) callback(selectedText);
    });
  });

  // Click event to toggle the dropdown list
  inputCtrl.addEventListener("click", function () {
    filterLiveSearchList(inputCtrlId, ulListId, function (selectedText) {
      // Call the callback to handle the selected text based on input type
      if (callback) callback(selectedText);
    });
  });

  // Call the generic function to handle hiding the dropdown
  hideLiveSearchOnClick(inputCtrlId, ulListId);
}

function initializedLiveSearchControl(inputCtrlId, ulListId, responseArray) {
  const inputCtrl = document.getElementById(inputCtrlId);
  const ulList = document.getElementById(ulListId);

  ulList.innerHTML = "";
  responseArray?.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => {
      inputCtrl.value = item;
      ulList.style.display = "none";
    };
    ulList.appendChild(li);
  });
}

function showNavBarSection(event, sectionId, containerId, navbarId) {
  event.preventDefault(); // Prevent default link behavior

  // Hide all sections within the specified container
  const sections = document.querySelectorAll(`#${containerId} .section`);
  sections.forEach((section) => (section.style.display = "none"));

  // Show the selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = "block";
  }

  // Remove 'active' class from all links within the specified navbar
  const links = document.querySelectorAll(`#${navbarId} a`);
  links.forEach((link) => link.classList.remove("active"));

  // Add 'active' class to the clicked link
  event.target.classList.add("active");
}

function editTableRow(button) {
  const row = button.parentElement.parentElement;
  const cells = row.querySelectorAll("td");

  // If button text is "Edit", convert cells into input fields
  if (button.textContent === "Edit") {
    for (let i = 0; i < cells.length - 1; i++) {
      const currentValue = cells[i].textContent;
      cells[i].innerHTML = `<input type="text" value="${currentValue}" />`;
    }
    button.textContent = "Save";
  }
  // If button text is "Save", update the cells with new values
  else if (button.textContent === "Save") {
    for (let i = 0; i < cells.length - 1; i++) {
      const inputField = cells[i].querySelector("input");
      cells[i].textContent = inputField.value;
    }
    button.textContent = "Edit";
  }
}

function restrictToNumberWithDecimal(input) {
  const invalidCharacters = input.value.match(/[^0-9.]/g); // Find invalid characters

  if (invalidCharacters) {
    SHOW_ERROR_POPUP(`Invalid input: ${invalidCharacters.join("")}`); // Show alert with invalid characters
  }

  // Remove all characters that are not digits or a single decimal point
  input.value = input.value.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point is allowed
  if ((input.value.match(/\./g) || []).length > 1) {
    input.value = input.value.slice(0, -1); // Remove the extra decimal point
  }
}

function restrictToNumberWithDecimalAndNegative(input) {
  const invalidCharacters = input.value.match(/[^0-9.-]/g); // Allow digits, a decimal, and a minus sign

  if (invalidCharacters) {
    SHOW_ERROR_POPUP(`Invalid input: ${invalidCharacters.join("")}`); // Show alert with invalid characters
  }

  // Remove all characters that are not digits, a single decimal point, or a leading minus sign
  input.value = input.value.replace(/[^0-9.-]/g, "");

  // Ensure only one decimal point is allowed
  let parts = input.value.split(".");
  if (parts.length > 2) {
    input.value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, ""); // Keep only the first decimal point
  }

  // Ensure only one leading minus sign is allowed
  if (input.value.includes("-")) {
    input.value = "-" + input.value.replace(/-/g, ""); // Keep minus sign only at the start
  }
}

function setupKeyPressHandler(
  containerId,
  buttonId,
  validKeys,
  modifiers = {},
) {
  document.addEventListener("keydown", function (event) {
    const key = event.key === " " ? "Space" : event.key;

    // Check if the container is visible
    const container = document.getElementById(containerId);
    if (container && container.style.display !== "none") {
      // Check if the pressed key is in the list of valid keys
      if (validKeys.includes(key)) {
        // Check for modifier keys (Ctrl, Shift, Alt)
        const isCtrlPressed = event.ctrlKey;
        const isShiftPressed = event.shiftKey;
        const isAltPressed = event.altKey;

        // If modifiers are required, ensure they are pressed
        const ctrlRequired = modifiers.ctrl === true;
        const shiftRequired = modifiers.shift === true;
        const altRequired = modifiers.alt === true;

        // Check if the modifiers are correctly pressed
        const isModifierValid =
          (ctrlRequired === false || isCtrlPressed) &&
          (shiftRequired === false || isShiftPressed) &&
          (altRequired === false || isAltPressed);

        // Trigger action only if modifiers match
        if (isModifierValid) {
          event.preventDefault(); // Prevent default behavior for the key
          const button = document.getElementById(buttonId);
          if (button && button.style.display !== "none") {
            button.click(); // Trigger the button click
          }
        }
      }
    }
  });
}

function SHOW_CONFIRMATION_GRID_POPUP(
  gridData,
  columnNames, // Array of objects containing both display name and actual name [ { displayName: "Item", actualName: "Item" },]
  yesCallback,
  yesLabel = "Yes",
  noLabel = "No",
  statusText = "",
  noCallback = CLOSE_CONFIRMATION_GRID_POPUP,
) {
  const popup = document.getElementById("confirmationGridPopup");
  const gridContainer = document.getElementById("confirmationGridContainer");
  const yesButton = document.getElementById("confirmationGridYesButton");
  const noButton = document.getElementById("confirmationGridNoButton");
  const statusTextElement = document.getElementById(
    "confirmationGridStatusText",
  );

  // Set custom button labels
  yesButton.textContent = yesLabel;
  noButton.textContent = noLabel;

  // Clear any existing content in the grid container
  gridContainer.innerHTML = "";
  statusTextElement.textContent = statusText;

  // Create the table element and headers dynamically
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const thead = document.createElement("thead");
  thead.id = "confirmationGridTHead";
  const headerRow = document.createElement("tr");

  // Add table headers dynamically from columnNames array
  columnNames.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.displayName; // Use displayName for the header
    th.style.border = "1px solid #ddd";
    th.style.padding = "8px";
    th.style.textAlign = "left";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tbody.id = "confirmationGridTBody";

  // Populate table rows dynamically from gridData
  gridData.forEach((item) => {
    const row = document.createElement("tr");

    // Add each data field into a new table cell (td)
    columnNames.forEach((column) => {
      const td = document.createElement("td");
      td.textContent = item[column.actualName] ? item[column.actualName] : ""; // Use actualName to access the data
      td.style.border = "1px solid #ddd";
      td.style.padding = "8px";
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  // Append the table to the grid container
  gridContainer.appendChild(table);

  // Assign event handlers dynamically
  yesButton.onclick = () => {
    yesCallback();
    CLOSE_CONFIRMATION_GRID_POPUP();
  };
  noButton.onclick = () => {
    noCallback();
  };

  // Show the popup
  popup.style.display = "flex";
}

function CLOSE_CONFIRMATION_GRID_POPUP() {
  document.getElementById("confirmationGridPopup").style.display = "none";
}

function PARSE_STRING_TO_DATE_FORMAT(stringDate, desireFormat = "DD-MMM-YYYY") {
  const parsedDate = moment(
    stringDate,
    ["YYYY-MM-DD", "DD/MM/YYYY", "MM-DD-YYYY", "DD-MMM-YYYY", "D-MMM-YYYY"],
    true,
  );

  if (parsedDate.isValid()) {
    const formattedDate = parsedDate.format(desireFormat);
    return formattedDate;
  } else {
    console.error("Invalid date format:", stringDate);
    return null;
  }
}

async function IS_ONLINE() {
  try {
    IsLoading(true); // Start loading indicator

    const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
      cache: "no-store",
    });

    IsLoading(false); // Stop loading indicator
    return response.ok;
  } catch (error) {
    IsLoading(false);
    SHOW_ERROR_POPUP(
      "Please check your internet connection, it is not working.",
    );
    return false;
  }
}

function formatNumber(value) {
  if (!isNaN(value) && value !== null && value !== "") {
    const num = parseFloat(value);
    return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
  }

  return null;
}

function CREATE_MULTI_SELECT_DROPDOWN_OLD({
  containerId,
  title,
  options,
  callback,
}) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error("Container not found!");
    return;
  }

  // Create dropdown elements
  const dropdown = document.createElement("div");
  dropdown.classList.add("dynamic-dropdown");

  const dropdownBtn = document.createElement("div");
  dropdownBtn.classList.add("dynamic-dropdown-btn");
  dropdownBtn.innerText = title;
  dropdownBtn.onclick = () => {
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  };

  const dropdownContent = document.createElement("div");
  dropdownContent.classList.add("dynamic-dropdown-content");

  options.forEach((item) => {
    let label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${item}"> ${item}`;
    dropdownContent.appendChild(label);
  });

  dropdown.appendChild(dropdownBtn);
  dropdown.appendChild(dropdownContent);
  container.appendChild(dropdown);

  // Handle selection update
  function updateSelection() {
    let selected = [];
    dropdownContent
      .querySelectorAll("input[type='checkbox']")
      .forEach((checkbox) => {
        if (checkbox.checked) {
          selected.push(checkbox.value);
        }
      });
    dropdownBtn.innerText = selected.length ? selected.join(", ") : title;
    callback(selected);
  }

  // Event listeners
  dropdownContent.addEventListener("click", (event) => {
    if (event.target.tagName === "INPUT") {
      updateSelection();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdownContent.style.display = "none";
    }
  });
}

function CREATE_MULTI_SELECT_DROPDOWN({
  containerId,
  title,
  options,
  callback,
}) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error("Container not found!");
    return;
  }

  // Create dropdown elements
  const dropdown = document.createElement("div");
  dropdown.classList.add("dynamic-dropdown");

  const dropdownBtn = document.createElement("div");
  dropdownBtn.classList.add("dynamic-dropdown-btn");
  dropdownBtn.innerText = title;
  dropdownBtn.onclick = () => {
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  };

  const dropdownContent = document.createElement("div");
  dropdownContent.classList.add("dynamic-dropdown-content");

  options.forEach((item) => {
    let label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${item}"> ${item}`;
    dropdownContent.appendChild(label);
  });

  dropdown.appendChild(dropdownBtn);
  dropdown.appendChild(dropdownContent);
  container.appendChild(dropdown);

  // Handle selection update
  function updateSelection() {
    let selected = [];
    dropdownContent
      .querySelectorAll("input[type='checkbox']")
      .forEach((checkbox) => {
        if (checkbox.checked) {
          selected.push(checkbox.value);
        }
      });
    dropdownBtn.innerText = selected.length
      ? `Selected Item - ${selected.length}`
      : title;
    callback(selected);
  }

  // Event listeners
  dropdownContent.addEventListener("click", (event) => {
    if (event.target.tagName === "INPUT") {
      updateSelection();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdownContent.style.display = "none";
    }
  });
}

function UPDATE_MULTI_SELECT_DROPDOWN(containerId, newOptions, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dropdownContent = container.querySelector(".dynamic-dropdown-content");
  const dropdownBtn = container.querySelector(".dynamic-dropdown-btn");

  if (!dropdownContent || !dropdownBtn) return;

  // Clear existing options
  dropdownContent.innerHTML = "";

  // Add new options dynamically
  newOptions.forEach((item) => {
    let label = document.createElement("label");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = item;

    checkbox.onclick = function () {
      let selected = [];
      container
        .querySelectorAll("input[type='checkbox']:checked")
        .forEach((cb) => {
          selected.push(cb.value);
        });

      dropdownBtn.innerText = selected.length
        ? `Selected Item - ${selected.length}`
        : "Select Chapter";

      if (callback) callback(selected);
    };

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${item}`));
    dropdownContent.appendChild(label);
  });
}

function DISABLED_OLD_DATES(controlId) {
  let today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  document.getElementById(controlId).setAttribute("min", today);
}

async function CALL_API(apiType, data) {
  const onlineRes = await IS_ONLINE();
  if (onlineRes) {
    const request = {
      apiType: apiType,
      inputData: data,
    };
    try {
      const response = await API_HANDLER_AXIOS(request);
      if (response) {
        return response;
        //
      } else {
        SHOW_ERROR_POPUP("Something Went Wrong");
      }
    } catch (ex) {
      SHOW_ERROR_POPUP("Error :- " + ex);
    }
  }
}

async function CALL_API_WITHOUT_LOADING(apiType, data) {
  const onlineRes = await IS_ONLINE();
  if (onlineRes) {
    const request = {
      apiType: apiType,
      inputData: data,
    };
    try {
      const response = await API_HANDLER_WITHOUT_LOADING_AXIOS(request);
      if (response) {
        return response;
        //
      } else {
        SHOW_ERROR_POPUP("Something Went Wrong");
      }
    } catch (ex) {
      SHOW_ERROR_POPUP("Error :- " + ex);
    }
  }
}

function POPULATE_CHECK_BOX_ON_PAGE(
  containerId,
  itemsArray,
  isTwoOption,
  yesOptionLabel,
  noOptionLabel,
  sectionTitle,
) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`No element found with ID "${containerId}"`);
    return;
  }
  container.innerHTML = "";

  const checklist = document.createElement("div");
  checklist.classList.add("checklist");

  itemsArray.forEach((item, idx) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("checklist-item");
    itemDiv.style.cursor = "pointer";

    if (!isTwoOption) {
      // Single‑checkbox mode:
      const wrapper = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.name = `${sectionTitle}-${idx}`;
      const txtSpan = document.createElement("span");
      txtSpan.innerText = " " + item;

      wrapper.appendChild(cb);

      if (yesOptionLabel)
        wrapper.appendChild(document.createTextNode(yesOptionLabel));
      wrapper.appendChild(txtSpan);

      txtSpan.addEventListener("click", () => {
        cb.checked = !cb.checked;
      });

      // row‑click toggles
      itemDiv.addEventListener("click", (e) => {
        if (e.target !== cb) cb.checked = !cb.checked;
      });
      cb.addEventListener("click", (e) => e.stopPropagation());

      itemDiv.appendChild(wrapper);
    } else {
      // Two‑radio mode:
      const textLabel = document.createElement("div");
      textLabel.classList.add("checklist-label");
      textLabel.innerText = item;
      itemDiv.appendChild(textLabel);

      const respDiv = document.createElement("div");
      respDiv.classList.add("response-options");

      const groupName = `${sectionTitle}-${idx}`;

      // Yes radio
      const yesWrapper = document.createElement("label");
      yesWrapper.classList.add("yes-label");
      const yesRb = document.createElement("input");
      yesRb.type = "radio";
      yesRb.name = groupName;
      yesRb.value = "yes";
      yesWrapper.appendChild(yesRb);
      if (yesOptionLabel)
        yesWrapper.appendChild(document.createTextNode(yesOptionLabel));

      // No radio
      const noWrapper = document.createElement("label");
      noWrapper.classList.add("no-label");
      const noRb = document.createElement("input");
      noRb.type = "radio";
      noRb.name = groupName;
      noRb.value = "no";
      noWrapper.appendChild(noRb);
      if (noOptionLabel)
        noWrapper.appendChild(document.createTextNode(noOptionLabel));

      // Row‑click toggles “yes”
      itemDiv.addEventListener("click", (e) => {
        if (e.target === noRb) return; // if user clicked “no” itself, let it happen
        if (e.target === yesRb) return; // allow normal radio click
      });
      yesRb.addEventListener("click", (e) => e.stopPropagation());
      noRb.addEventListener("click", (e) => e.stopPropagation());

      respDiv.appendChild(yesWrapper);
      respDiv.appendChild(noWrapper);
      itemDiv.appendChild(respDiv);
    }

    checklist.appendChild(itemDiv);
  });

  container.appendChild(checklist);
}

function formatDateToDDMMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, "0"); // Ensures two-digit day
  const month = date.toLocaleString("en-US", { month: "short" }); // Gets abbreviated month name
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function convertToAMPMFormat(time24) {
  const [hourStr, minute] = time24.toString().split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert '0' to '12'
  const hourFormatted = hour.toString().padStart(2, "0");
  return `${hourFormatted}:${minute} ${ampm}`;
}

//Nab bar method start
function openLeftNavBar(leftSideNavId, menuLabel) {
  let nav = document.getElementById(leftSideNavId);
  let menuBtn = document.querySelector(".leftSideNav-menuBtn");

  if (nav) {
    nav.style.display = "block";

    // Screen width ke hisaab se sidebar ka width set karein
    if (window.innerWidth <= 768) {
      // Mobile devices ke liye (width 768px ya usse kam ho)
      nav.style.width = "30%";
    } else {
      // Laptop ya bade screens ke liye
      nav.style.width = "13%";
    }

    menuBtn.innerHTML = "× NKD Community"; // Text ko update karo
    menuBtn.setAttribute(
      "onclick",
      `closeLeftNavBar('${leftSideNavId}', '${menuLabel}')`,
    );
  }
}

function closeLeftNavBar(leftSideNavId, menuLabel) {
  let nav = document.getElementById(leftSideNavId);
  let menuBtn = document.querySelector(".leftSideNav-menuBtn");

  if (nav) {
    nav.style.width = "0"; // Sidebar ko close karo
    nav.style.display = "none";
    menuBtn.innerHTML = `☰ ${menuLabel}`; // Wapas original text me badlo
    menuBtn.setAttribute(
      "onclick",
      `openLeftNavBar('${leftSideNavId}', '${menuLabel}')`,
    );
  }
}

function showLeftNavBarItemContainer(
  formId,
  leftSideNavId,
  leftSideNavItemContainerId,
  menuLabel,
  callBack,
) {
  document
    .querySelectorAll(`.${leftSideNavItemContainerId}`)
    .forEach((form) => {
      form.style.display = "none";
    });

  document.getElementById(formId).style.display = "block";
  closeLeftNavBar(leftSideNavId, menuLabel);

  if (typeof callBack === "function") {
    callBack(formId);
  }
}

function toggleLeftNavBarSubMenu(submenuId) {
  let leftSideNavSubMenu = document.getElementById(submenuId);
  let parentLink = document.querySelector(`a[href="#${submenuId}"]`);

  if (leftSideNavSubMenu.style.display === "block") {
    leftSideNavSubMenu.style.display = "none";
    parentLink.innerHTML = parentLink.innerHTML.replace("▲", "▼");
  } else {
    leftSideNavSubMenu.style.display = "block";
    parentLink.innerHTML = parentLink.innerHTML.replace("▼", "▲");
  }
}
//nav bar method end

function getTodayDayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getCurrentTimeString() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Open (or create) database and object store
function DB_OPEN_INTERNAL(dbName = "AppDB", storeName = "store") {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function () {
      reject("IndexedDB error");
    };
  });
}

// Save or update data in given store
async function DB_SET(storeKey, data, dbName = "AppDB", storeName = "store") {
  const db = await DB_OPEN_INTERNAL(dbName, storeName);
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  store.put({ id: storeKey, data: data });
  return tx.complete;
}

// Get data from store by key
async function DB_GET(storeKey, dbName = "AppDB", storeName = "store") {
  const db = await DB_OPEN_INTERNAL(dbName, storeName);

  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(storeKey);

    request.onsuccess = function () {
      resolve(request.result ? request.result.data : null);
    };

    request.onerror = function () {
      resolve(null);
    };
  });
}

// Delete data from store by key
async function DB_DELETE(storeKey, dbName = "AppDB", storeName = "store") {
  const db = await DB_OPEN_INTERNAL(dbName, storeName);
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.delete(storeKey);
  return tx.complete;
}

function SHOW_BUTTON_BY_ADMIN_ROLE(buttonId, roleKey, roleObj) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  const userRoleValue = roleObj?.[roleKey]?.toString().trim().toLowerCase();

  if (userRoleValue && userRoleValue.includes("admin")) {
    button.style.display = "inline-block";
  } else {
    button.style.display = "none";
  }
}
