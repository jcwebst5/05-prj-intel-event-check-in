// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// Track attendance
let count = 0;
const maxCount = 50;
const teamIds = ["water", "zero", "power"];
let attendees = [];

// Add one attendee to the list on the page
function showAttendee(attendee) {
  const item = document.createElement("li");
  item.className = attendee.team;

  const nameSpan = document.createElement("span");
  nameSpan.textContent = attendee.name;
  const teamSpan = document.createElement("span");
  teamSpan.textContent = attendee.teamName;

  item.appendChild(nameSpan);
  item.appendChild(teamSpan);
  document.getElementById("attendeeList").appendChild(item);
}

// Restore saved counts and attendees when the page loads
function loadCounts() {
  attendees = JSON.parse(localStorage.getItem("attendees")) || [];
  for (let i = 0; i < attendees.length; i++) {
    showAttendee(attendees[i]);
  }

  count = parseInt(localStorage.getItem("attendeeCount")) || 0;
  document.getElementById("attendeeCount").textContent = count;
  document.getElementById("progressBar").style.width =
    `${Math.round((count / maxCount) * 100)}%`;

  for (let i = 0; i < teamIds.length; i++) {
    const savedCount =
      parseInt(localStorage.getItem(`${teamIds[i]}Count`)) || 0;
    document.getElementById(`${teamIds[i]}Count`).textContent = savedCount;
  }
}

// Save the current counts
function saveCounts() {
  localStorage.setItem("attendeeCount", count);
  localStorage.setItem("attendees", JSON.stringify(attendees));

  for (let i = 0; i < teamIds.length; i++) {
    const teamCount = document.getElementById(`${teamIds[i]}Count`).textContent;
    localStorage.setItem(`${teamIds[i]}Count`, teamCount);
  }
}

loadCounts();

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(name, team, teamName);

  // Increment count
  count++;
  console.log("Total check-ins", count);

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log(`Progress: ${percentage}`);
  document.getElementById("progressBar").style.width = percentage;
  document.getElementById("attendeeCount").textContent = count;

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // Add attendee to the list
  const attendee = { name: name, team: team, teamName: teamName };
  attendees.push(attendee);
  showAttendee(attendee);

  saveCounts();

  // Show welcome message
  const message = `Welcome, ${name} from ${teamName}`;
  console.log(message);

  showCelebration(message, teamName, team);

  form.reset();
});

// Show popup with confetti and a sound
function showCelebration(message, teamName, team) {
  const popup = document.getElementById("celebration");
  const messageElement = document.getElementById("celebrationMessage");

  // The message ends with the team name, so split it off to color it
  const beforeTeam = message.slice(0, message.length - teamName.length);
  const teamSpan = document.createElement("span");
  teamSpan.className = `team-text ${team}`;
  teamSpan.textContent = teamName;

  messageElement.textContent = beforeTeam;
  messageElement.appendChild(teamSpan);
  popup.classList.add("show");

  playSound();

  const colors = ["#0071c5", "#00c7fd", "#7ac143", "#ffd700", "#ff6b6b"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random()}s`;
    popup.appendChild(piece);
  }
}

// Play a short happy tune
function playSound() {
  const audioContext = new AudioContext();
  const notes = [392, 494, 587, 784];

  for (let i = 0; i < notes.length; i++) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + i * 0.2;

    oscillator.type = "sine";
    oscillator.frequency.value = notes[i];

    // Low volume with a gentle fade in and out
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.05);
    gain.gain.linearRampToValueAtTime(0, start + 0.35);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.35);
  }
}

// Close popup and remove confetti
document
  .getElementById("closeCelebration")
  .addEventListener("click", function () {
    const popup = document.getElementById("celebration");
    popup.classList.remove("show");

    const pieces = popup.querySelectorAll(".confetti");
    for (let i = 0; i < pieces.length; i++) {
      pieces[i].remove();
    }

    // Goal popup follows the last welcome popup
    if (count === maxCount) {
      showGoalPopup();
    }
  });

// Show the winning team when the attendance goal is met
function showGoalPopup() {
  const teams = [
    { id: "water", name: "Team Water Wise" },
    { id: "zero", name: "Team Net Zero" },
    { id: "power", name: "Team Renewables" },
  ];

  // Find the highest team count
  let highest = 0;
  for (let i = 0; i < teams.length; i++) {
    const teamCount = parseInt(
      document.getElementById(teams[i].id + "Count").textContent,
    );
    teams[i].count = teamCount;
    if (teamCount > highest) {
      highest = teamCount;
    }
  }

  // Collect every team that has the highest count
  const winners = [];
  for (let i = 0; i < teams.length; i++) {
    if (teams[i].count === highest) {
      winners.push(teams[i]);
    }
  }

  const goalMessage = document.getElementById("goalMessage");
  if (winners.length === 1) {
    const teamSpan = document.createElement("span");
    teamSpan.className = `team-text ${winners[0].id}`;
    teamSpan.textContent = winners[0].name;
    goalMessage.textContent = "Goal reached! Winning team: ";
    goalMessage.appendChild(teamSpan);
  } else {
    goalMessage.textContent = "Goal reached! It's a tie!";
  }

  document.getElementById("goalPopup").classList.add("show");
  playSound();
}

// Close goal popup
document.getElementById("closeGoal").addEventListener("click", function () {
  document.getElementById("goalPopup").classList.remove("show");
});
