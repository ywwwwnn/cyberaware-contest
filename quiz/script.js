let questions = [];
let current = 0;
let score = 0;
let timerInterval;
let imagePath = "";

function startTimer(callback) {
  clearInterval(timerInterval);
  let timeLeft = 20;
  const timerBar = document.getElementById("timer-bar");

  if (!timerBar) {
    console.error("⛔ timer-bar 요소를 찾을 수 없습니다.");
    return;
  }

  timerBar.style.width = "100%";
  timerBar.textContent = timeLeft + "초";

  timerInterval = setInterval(() => {
    timeLeft--;
    const percent = (timeLeft / 20) * 100;
    timerBar.style.width = percent + "%";
    timerBar.textContent = timeLeft + "초";

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      callback();
    }
  }, 1000);
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }
  return array;
}

function updateProgressBar() {
  const progress = document.getElementById("progress-bar");
  const percent = Math.floor((current / questions.length) * 100);
  progress.style.width = percent + "%";
  progress.textContent = `${current}/${questions.length}`;
}

function showQuestion() {
  const quiz = document.getElementById("quiz");
  quiz.innerHTML = "";
  const q = questions[current];
  const block = document.createElement("div");
  block.className = "question-block";

  const qText = document.createElement("h2");
  qText.textContent = q.text;
  block.appendChild(qText);

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  const shuffledOptions = shuffle([...q.options]);

  shuffledOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.onclick = () => {
      clearInterval(timerInterval);

      const maxScoreOption = q.options.reduce((prev, current) =>
        current.score > prev.score ? current : prev
      );

      score += opt.score;
      alert(`💡 정답은 "${maxScoreOption.text}" 입니다!\n\n${opt.reaction}`);
      current++;
      if (current < questions.length) {
        showQuestion();
      } else {
        showResult();
      }
      updateProgressBar();
    };
    optionsDiv.appendChild(btn);
  });

  block.appendChild(optionsDiv);
  quiz.appendChild(block);
  updateProgressBar();
  startTimer(() => {
    alert("시간 초과로 자동 무응답 처리됨!");
    current++;
    if (current < questions.length) showQuestion();
    else showResult();
    updateProgressBar();
  });
}

function showResult() {
  updateProgressBar();  // 마지막 문제까지 완료 표시

  document.getElementById("quiz").style.display = "none";
  const result = document.getElementById("result");
  result.style.display = "block";

  let tier = "", emoji = "", description = "", recommendations = [];

  if (score >= 20) {
    tier = "Diamond (D)";
    emoji = "💠";
    description = "보안 만렙 유저!";
    recommendations = ["2단계 인증 유지", "보안 습관 공유"];
    imagePath = "image/다이아.png";
  } else if (score >= 18) {
    tier = "Gold (G)";
    emoji = "🟡";
    description = "보안 인식은 좋지만 약간의 허점이 있을 수 있습니다.";
    recommendations = ["VPN 사용 고려", "비밀번호 정기 변경"];
    imagePath = "image/골드.png";
  } else if (score >= 14) {
    tier = "Silver (S)";
    emoji = "⚪";
    description = "기초 보안 개념은 있지만 실천이 부족합니다.";
    recommendations = ["피싱 링크 구별 훈련", "2단계 인증 적용"];
    imagePath = "image/실버.png";
  } else {
    tier = "Bronze (B)";
    emoji = "🪵";
    description = "보안 습관이 부족합니다.";
    recommendations = ["보안 설정 점검", "기초 가이드 읽기"];
    imagePath = "image/브론즈.png";
  }

result.innerHTML = `
  <h2>${emoji} 당신의 보안 티어는 [${tier}]입니다!</h2>
  <img src="${imagePath}" alt="${tier} 이미지" style="width: 150px; height: auto; margin: 10px 0;">
  <p>${description}</p>
  <div class="recommendation">
    <p><strong>✅ 추천 실천 행동</strong></p>
    <ul>
      ${recommendations.map(r => `<li>${r}</li>`).join("")}
    </ul>
  </div>
`;

const nextAction = document.createElement("div");
nextAction.className = "next-action";

nextAction.innerHTML = `
  <h3>🔎 <span class="highlight">보안 더 알아보기</span></h3>
  <p>아래 버튼을 눌러 생활 속 보안 개념을 깊이 있게 배워보세요!</p>
  <a href="../mainhompage/overview2.html" class="action-button">
    📘 보안 안내 페이지로 이동하기
  </a>
`;

result.appendChild(nextAction);


result.appendChild(resultInfo);

}

// 문제 불러오기
fetch("questions_cleaned.json?t=" + new Date().getTime())
  .then(res => res.json())
  .then(data => {
    questions = shuffle(data).slice(0, 10);
    showQuestion();
  })
  .catch(err => {
    document.getElementById("quiz").innerHTML = "문제를 불러오는 데 실패했습니다.";
    console.error(err);
  });
