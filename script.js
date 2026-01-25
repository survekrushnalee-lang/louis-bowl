// ==============================
// QUIZ CONFIG
// ==============================
const questions = [
  {
    id: "outfit",
    question: "What outfit will she wear tonight?",
    options: ["Gold Bodysuit", "Black Bodysuit", "Blue Bodysuit"],
    points: 10
  },
  {
    id: "surpriseSong",
    question: "Which era will the surprise song be from?",
    options: ["Fearless", "Red", "1989", "Midnights"],
    points: 5
  }
];

// ==============================
// CORRECT ANSWERS (UPDATE AFTER SHOW)
// ==============================
const correctAnswers = {
  outfit: "Gold Bodysuit",
  surpriseSong: "1989"
};

// ==============================
// DOM ELEMENTS
// ==============================
const quizEl = document.getElementById("quiz");
const submitBtn = document.getElementById("submit");

// RESULTS & LEADERBOARD
const resultsEl = document.getElementById("results");
const leaderboardEl = document.getElementById("leaderboard");

// ==============================
// STATE
// ==============================
const answers = {};
const isLocked = localStorage.getItem("mastermindLocked");

// Load saved answers if they exist
const savedAnswers = JSON.parse(localStorage.getItem("mastermindAnswers"));
if (savedAnswers) Object.assign(answers, savedAnswers);

// ==============================
// SUPABASE CLIENT (NO DUPLICATES)
// ==============================
// Only create the client once
if (!window.supabaseClient) {
  const supabaseUrl = "https://bjlbgrtfkreeztajlptf.supabase.co";
  const supabaseKey = "sb_publishable_1LiENTEoXK9d4LwAzucnZQ_tZ46Aebg";

  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

const supabase = window.supabaseClient;

// ==============================
// GET USERNAME
// ==============================
let username = localStorage.getItem("mastermindUsername");
if (!username) {
  username = prompt("Enter a username for the leaderboard:");
  localStorage.setItem("mastermindUsername", username);
}

// ==============================
// RENDER QUIZ
// ==============================
function renderQuiz() {
  quizEl.innerHTML = "";

  questions.forEach((q) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    const title = document.createElement("h3");
    title.textContent = q.question;
    questionDiv.appendChild(title);

    q.options.forEach((option) => {
      const label = document.createElement("label");
      label.classList.add("option");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = q.id;
      input.value = option;

      // Restore previous answer
      if (answers[q.id] === option) input.checked = true;

      // Disable if locked
      if (isLocked) input.disabled = true;

      input.addEventListener("change", () => {
        answers[q.id] = option;
        checkIfComplete();
      });

      label.appendChild(input);
      label.append(option);
      questionDiv.appendChild(label);
    });

    quizEl.appendChild(questionDiv);
  });
}

// ==============================
// CHECK IF ALL ANSWERS ARE SELECTED
// ==============================
function checkIfComplete() {
  const allAnswered = questions.every(q => answers[q.id]);
  submitBtn.disabled = !allAnswered;
}

// ==============================
// CALCULATE SCORE
// ==============================
function calculateScore() {
  let score = 0;
  const breakdown = [];

  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const correct = correctAnswers[q.id];

    if (!correct) return;

    if (userAnswer === correct) {
      score += q.points;
      breakdown.push({ question: q.question, result: "correct", points: q.points });
    } else {
      breakdown.push({ question: q.question, result: "wrong", points: 0 });
    }
  });

  return { score, breakdown };
}

// ==============================
// SHOW RESULTS
// ==============================
function showResults() {
  const { score, breakdown } = calculateScore();

  quizEl.style.display = "none";
  submitBtn.style.display = "none";
  resultsEl.style.display = "block";

  let html = `<h2>Your Score: ${score}</h2>`;
  breakdown.forEach((item) => {
    html += `<p>${item.question} — <strong>${item.result === "correct" ? "✅" : "❌"}</strong></p>`;
  });

  resultsEl.innerHTML = html;
}

// ==============================
// LEADERBOARD
// ==============================
async function loadLeaderboard() {
  const { data, error } = await supabase
    .from("predictions")
    .select("username, score")
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  leaderboardEl.innerHTML = "<h3>Leaderboard</h3>";
  data.forEach((entry, index) => {
    leaderboardEl.innerHTML += `<p>${index + 1}. ${entry.username} — ${entry.score}</p>`;
  });
}

// ==============================
// SUBMIT HANDLER
// ==============================
submitBtn.addEventListener("click", async () => {
  submitBtn.disabled = true;

  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => input.disabled = true);

  localStorage.setItem("mastermindAnswers", JSON.stringify(answers));
  localStorage.setItem("mastermindLocked", "true");

  const { score } = calculateScore();

  // Save to Supabase
  const { error } = await supabase.from("predictions").insert([
    { username, score, answers }
  ]);

  if (error) {
    console.error("Supabase error:", error);
    alert("Error saving score 😭");
  } else {
    alert("Predictions locked 🔒");
    showResults();
    loadLeaderboard();
  }
});

// ==============================
// INITIAL RENDER
// ==============================
renderQuiz();

if (isLocked) {
  submitBtn.textContent = "Predictions Locked 🔒";
  submitBtn.disabled = true;

  if (Object.keys(correctAnswers).length) {
    showResults();
    loadLeaderboard();
  }
} else {
  checkIfComplete();
}
