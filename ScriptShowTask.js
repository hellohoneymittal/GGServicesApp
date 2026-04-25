const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let allTaskData = [];

async function taskTracker() {
  const response = await CALL_API("GET_ALL_SERVICES_DATA", {});
  if (response.status && response.data) {
    allTaskData = response.data;
  }
  SHOW_SPECIFIC_DIV("showTaskListPopup");
  render();
}

function render() {
  const app = document.getElementById("showTaskListDiv");
  app.innerHTML = "";

  days.forEach((day) => {
    const dayDiv = document.createElement("div");
    const dayHeader = document.createElement("div");
    const dayContent = document.createElement("div");

    dayHeader.className = "task-day";
    dayHeader.innerHTML = `${day} <span>▶</span>`;
    dayContent.className = "task-hidden";

    allTaskData.forEach((row) => {
      const owner = row[`Service Owner - ${day}`];
      const reviewer = row[`Reviewer - ${day}`] || row[`Reviewer- ${day}`];

      if (!owner) return;

      const partDiv = document.createElement("div");
      const partHeader = document.createElement("div");
      const partContent = document.createElement("div");

      partHeader.className = "task-particular";
      partHeader.innerHTML = `${row.Particular} <span>▶</span>`;
      partContent.className = "task-hidden";

      const card = document.createElement("div");
      card.className = "task-card";

      card.innerHTML = `
                <div><b>Service Owner:</b> ${owner}</div>
                <div><b>Reviewer:</b> ${reviewer}</div>
                <div><b>Enable Time:</b> ${row["Enable Time"]}</div>
                <div><b>Trigger Time:</b> ${row["Trigger Time"]}</div>
              `;

      partContent.appendChild(card);

      partHeader.onclick = () => {
        partContent.classList.toggle("task-hidden");

        const isHidden = partContent.classList.contains("task-hidden");
        partHeader.querySelector("span").innerText = isHidden ? "▶" : "▼";
      };

      partDiv.appendChild(partHeader);
      partDiv.appendChild(partContent);

      partDiv.className = "task-particular-container";
      partContent.classList.add("task-card-container");
      dayContent.appendChild(partDiv);
    });

    dayHeader.onclick = () => {
      dayContent.classList.toggle("task-hidden");

      const isHidden = dayContent.classList.contains("task-hidden");
      dayHeader.querySelector("span").innerText = isHidden ? "▶" : "▼";
    };

    dayDiv.appendChild(dayHeader);
    dayDiv.appendChild(dayContent);
    app.appendChild(dayDiv);
  });
}
