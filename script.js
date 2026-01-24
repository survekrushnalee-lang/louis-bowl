const questions = [
  {
    id: "outfit",
    question: "What outfit will she wear tonight?",
    options: [
      "Gold Bodysuit",
      "Black Bodysuit",
      "Blue Bodysuit"
    ],
    points: 10
  },
  {
    id: "surpriseSong",
    question: "Which era will the surprise song be from?",
    options: [
      "Fearless",
      "Red",
      "1989",
      "Midnights"
    ],
    points: 5
  }
];

const quizEl = document.getElementById("quiz");
const submitBtn = document.getElementById("submit");

const answers = {};

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

function checkIfComplete() {
  const allAnswered = questions.every(q => answers[q.id]);
  submitBtn.disabled = !allAnswered;
}

renderQuiz();

submitBtn.addEventListener("click", () => {
  submitBtn.disabled = true;

  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => input.disabled = true);

  alert("Predictions locked 🔒");
  console.log("User answers:", answers);
});
