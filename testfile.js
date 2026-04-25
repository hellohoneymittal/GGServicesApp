function logWhatsappMessages() {
  const START_TIME = Date.now();
  const MAX_RUNTIME = 5.5 * 60 * 1000; // 5.5 minutes

  const creditSS = SpreadsheetApp.openById(
    "1gQ7VYdkUFbur38wCXqLcJBwSbOyVQu0apK7_QPg3M78",
  );
  const sheet = creditSS.getSheetByName("CreditNameMaster");
  const creditData = sheet.getDataRange().getValues();

  const userSS = SpreadsheetApp.openById(
    "1Lgl9QLwqmaCIAyOJAJ_StUH_H0BHIf0jNgaGFcFgpzo",
  );
  const nkdData = userSS
    .getSheetByName("NKD Master")
    .getDataRange()
    .getValues();
  const otherData = userSS
    .getSheetByName("Other User Master")
    .getDataRange()
    .getValues();

  const today = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy");

  for (let i = 1; i < creditData.length; i++) {
    if (Date.now() - START_TIME > MAX_RUNTIME) {
      createNextTrigger(); // resume later
      return;
    }

    const userName = creditData[i][1];
    const sheetId = creditData[i][2];
    const totalBalance = Number(creditData[i][3]);

    if (!sheetId || totalBalance <= 500) continue;

    const fontColor = sheet.getRange(i + 1, 3).getFontColor();

    // ✔️ Process only NEW (black) or FAILED (red)
    if (fontColor && fontColor !== "#000000" && fontColor !== "#ff0000") {
      continue;
    }

    try {
      let mobile = "";

      for (let j = 1; j < nkdData.length; j++) {
        if (nkdData[j][6] === userName) {
          mobile = nkdData[j][9];
          break;
        }
      }

      if (!mobile) {
        for (let k = 1; k < otherData.length; k++) {
          if (otherData[k][1] === userName) {
            mobile = otherData[k][10];
            break;
          }
        }
      }

      if (!mobile) throw new Error("Mobile not found");

      // ---------- LEDGER READ ----------
      const ledgerSS = SpreadsheetApp.openById(sheetId);
      const ledgerData = ledgerSS.getSheets()[0].getDataRange().getValues();

      let selectedItem = [];
      const MAX_ENTRIES = 30;

      for (let r = 1; r < ledgerData.length; r++) {
        const balance = Number(ledgerData[r][4]);
        if (isNaN(balance)) continue;

        selectedItem.push({
          billDate: ledgerData[r][0],
          billAmount: ledgerData[r][2] || "",
          creditAmount: ledgerData[r][3] || "",
          balance: balance,
        });

        if (Math.abs(balance) <= 490 || selectedItem.length >= MAX_ENTRIES) {
          break;
        }
      }

      if (selectedItem.length === 0) {
        throw new Error("No ledger items");
      }

      // ---------- MESSAGE BUILD ----------
      let finalTotalBalance = Number(selectedItem[0].balance);

      let billMessage = "📜 *Natures Bill Pending Dues Summary* 📜\n\n";
      billMessage += "🗓 Generated On: " + today + "\n";
      billMessage += "*" + userName + "*\n\n";

      selectedItem.forEach((item) => {
        let date = item.billDate
          ? Utilities.formatDate(
              new Date(item.billDate),
              "Asia/Kolkata",
              "dd-MMM-yy",
            )
          : "";

        let billAmount = item.billAmount
          ? "(+) ₹" + Number(item.billAmount).toFixed(2)
          : "";

        let creditAmount = item.creditAmount
          ? "(-) ₹" + Number(item.creditAmount).toFixed(2)
          : "";

        let displayBalance =
          item.balance < 0
            ? "(Adv: (+) ₹" + Math.abs(item.balance).toFixed(2) + ")"
            : "(Due: (-) ₹" + item.balance.toFixed(2) + ")";

        billMessage +=
          "*" +
          date +
          "* : " +
          billAmount +
          " " +
          creditAmount +
          " " +
          displayBalance +
          "\n";
      });

      if (finalTotalBalance > 0) {
        billMessage +=
          "\n💰 *Total Balance: ₹(-)" +
          finalTotalBalance.toFixed(2) +
          "* 🔴 *(You Need to Pay)*";
      } else if (finalTotalBalance < 0) {
        billMessage +=
          "\n💰 *Total Balance: ₹(+)" +
          Math.abs(finalTotalBalance).toFixed(2) +
          "* 🟢 *(You Will Receive)*";
      } else {
        billMessage += "\n💰 *Total Balance: ₹0* ✅ *(No amount due)*";
      }

      billMessage +=
        "\n\n📞 For any queries, contact us. 9205581666\n" +
        "💳 Pay Now:\n" +
        "upi://pay?pa=vyapar.173204529590@hdfcbank&am=" +
        Math.abs(finalTotalBalance).toFixed(2) +
        "&cu=INR\n\n" +
        "Hare Krishna 🙏";

      // ---------- SEND ----------
      DevHelpLib.sendWhatsapp(mobile, billMessage);

      // ✅ SUCCESS → BLUE
      sheet.getRange(i + 1, 3).setFontColor("blue");
    } catch (e) {
      Logger.log("❌ Failed row " + (i + 1) + ": " + e.message);

      // ❌ ERROR → RED
      sheet.getRange(i + 1, 3).setFontColor("red");
    }

    Utilities.sleep(5000);
  }

  // ✅ FINAL COMPLETION ONLY
  createOrReplaceResetTrigger();
}

function createOrReplaceResetTrigger() {
  const triggers = ScriptApp.getProjectTriggers();

  // 🔥 Pehle purane reset triggers hatao
  triggers.forEach((t) => {
    if (t.getHandlerFunction() === "resetSheetIdFontColor") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // ✅ Ab sirf 1 naya trigger
  ScriptApp.newTrigger("resetSheetIdFontColor")
    .timeBased()
    .at(new Date(Date.now() + 24 * 60 * 60 * 1000))
    .create();
}

function createNextTrigger() {
  // Purane same triggers hatao
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === "logWhatsappMessages") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // ⏳ 2 min baad next run
  ScriptApp.newTrigger("logWhatsappMessages")
    .timeBased()
    .after(2 * 60 * 1000)
    .create();
}

function resetSheetIdFontColor() {
  const sheet = SpreadsheetApp.openById(
    "1gQ7VYdkUFbur38wCXqLcJBwSbOyVQu0apK7_QPg3M78",
  ).getSheetByName("CreditNameMaster");

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  sheet.getRange(2, 3, lastRow - 1).setFontColor("black");
}
