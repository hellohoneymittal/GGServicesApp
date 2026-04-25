let userServiceResponse = null;

async function serviceOwnerCheckListClick() {
  userServiceResponse = await CALL_API(
    "GET_TODAY_CHECKLIST_FOR_SERVICE_OWNER",
    {
      devoteeName: selectedDevoteeName,
    },
  );

  document.getElementById("userNameDiv").innerText = selectedDevoteeName;
  ((sewaKartaList = userServiceResponse?.data?.sewaKartaList),
    CREATE_ACCORDION_FROM_OBJECT(
      "otherLinkAccordion",
      userServiceResponse?.data?.services,
    ));
  SHOW_SPECIFIC_DIV("serviceOwnerCheckList");
}
