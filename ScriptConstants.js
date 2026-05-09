//api constant

const APPLICATION_URL =
  "https://script.google.com/macros/s/AKfycbxV_ORvmxii08sHXnY3_c7DquK12TCjdMoEOhIuOiRXM1FIgTFUyX4F0pwBqUgiNHQc/exec";

const IMAGE_CONSTANT = {
  clickHere: "https://i.postimg.cc/g0LSdBpL/Click-Here.jpg",
  addUserIcon: "https://imghost.net/ib/E5PegaLvH4xfUED_1729512954.png",
  confirmationIcon: "https://i.ibb.co/BsvQsfb/Confirmation-icon.png",
  deleteIcon: "https://i.postimg.cc/cJZRzYzT/delete-Icon.png",
};
const API_TYPE_CONSTANT = {
  CHECK_PASSWORD: "CHECK_PASSWORD",
  USER_SERVICE_DATA_LIST: "USER_SERVICE_DATA_LIST",
  SERVICES_LIST: "SERVICES_LIST",
  SAVE_USER_SERVICE_DATA: "SAVE_USER_SERVICE_DATA",
  GET_TODAY_SERVICE_FOR_USER: "GET_TODAY_SERVICE_FOR_USER",
  GET_TODAY_SERVICE_FOR_USER_NEW: "GET_TODAY_SERVICE_FOR_USER_NEW",
  GET_PENDING_GATE_PASSES: "GET_PENDING_GATE_PASSES",
  SUBMIT_GATE_PASS_APPROVALS: "SUBMIT_GATE_PASS_APPROVALS",
  GET_STUDENT_LIST: "GET_STUDENT_LIST",
  SUBMIT_STUDENT_ATTENDANCE: "SUBMIT_STUDENT_ATTENDANCE",
};
const DATE_FORMAT_CONSTANT = {
  grid: "DD MMM YYYY",
  database: "yyyy-MM-dd",
  gridWithDate: "DD MMM YYYY hh:mm A",
};

const PASSWORD_ERROR_STR = "Please enter a correct password";
const DATE_UTC = new Date().toISOString();

const CONTROL_TYPE_CONSTAINT = {
  input: "input",
  button: "button",
  checkbox: "checkbox",
};

//page constant
const PASSWORD_CONTAINER = "passwordContainer";
const HM_CONTANER = "homeContainer";
const DM_CONTAINER = "donorMasterContainer";

const bheeshmUserNameLSKey = "bheeshmUserName";
const bheeshmUserFacilitatorLSKey = "bheeshmUserFacilitator";

const POPUP_CONSTANT = {
  error: "errorPopup",
  success: "successPopup",
};

const ICON_CONSTANT = {
  downloadIcon: "https://cdn-thumbs.imagevenue.com/85/09/8b/ME196HF8_t.png",
};

const ROLE_CONSTANT = {
  admin: "Admin",
  superAdmin: "Super Admin",
};

const ERROR_MESSAGE_CONSTANT = {
  general: "Something Went Wrong",
};

function getFormattedDateForDownload() {
  const today = new Date();
  const day = today.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[today.getMonth()];
  return `${day}${daySuffix(day)}${month}`;
}

const ExcelDate = getFormattedDateForDownload();

const VALIDATION_CONSTANT = {
  numberWithDecimal: "^d*.?d*$",
};

const INDEX_DB = {
  storeKey: "hostelAppLogin",
  dbName: "HostelAppDB",
  storeName: "loginStore",
};
