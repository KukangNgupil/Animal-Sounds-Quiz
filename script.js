// --- Play Audio File ---
let currentAudio = null;

function playSoundFile(file) {
    // Stop audio sebelumnya kalau ada
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const audio = new Audio(`sounds/${file}`);
    currentAudio = audio;

    audio.play();

    // Stop otomatis setelah 5 detik
    setTimeout(() => {
        if (currentAudio === audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, 5000);
}

// Animal data (SUDAH DISAMBUNG KE FILE MP3)
const animals = [
    { name: "Dog", emoji: "🐕", sound: "Woof!", synthFn: () => playSoundFile("Dog.mp3") },
    { name: "Cat", emoji: "🐱", sound: "Meow!", synthFn: () => playSoundFile("Cat.mp3") },
    { name: "Cow", emoji: "🐄", sound: "Moo!", synthFn: () => playSoundFile("Cow.mp3") },
    { name: "Rooster", emoji: "🐓", sound: "Cock-a-doodle-doo!", synthFn: () => playSoundFile("Rooster.mp3") },
    { name: "Duck", emoji: "🦆", sound: "Quack!", synthFn: () => playSoundFile("Duck.mp3") },
    { name: "Frog", emoji: "🐸", sound: "Ribbit!", synthFn: () => playSoundFile("Frog.mp3") },
    { name: "Lion", emoji: "🦁", sound: "Roar!", synthFn: () => playSoundFile("Lion.mp3") },
    { name: "Owl", emoji: "🦉", sound: "Hoot!", synthFn: () => playSoundFile("Owl.mp3") },
    { name: "Pig", emoji: "🐷", sound: "Oink!", synthFn: () => playSoundFile("Pig.mp3") },
    { name: "Sheep", emoji: "🐑", sound: "Baa!", synthFn: () => playSoundFile("Sheep.mp3") },
    { name: "Horse", emoji: "🐴", sound: "Neigh!", synthFn: () => playSoundFile("Horse.mp3") },
    { name: "Bird", emoji: "🐦", sound: "Tweet!", synthFn: () => playSoundFile("Bird.mp3") }
];

let heardAnimals = new Set();
let gameQuestions = [];
let currentQ = 0;
let score = 0;
let currentAnimal = null;
const TOTAL_QUESTIONS = 8;

// --- Screen Navigation ---
function showScreen(id) {
    ['screen-welcome', 'screen-learn', 'screen-game', 'screen-results'].forEach(s => {
        const el = document.getElementById(s);
        el.classList.add('hidden');
        el.classList.remove('flex');
    });
    const target = document.getElementById(id);
    target.classList.remove('hidden');
    target.classList.add('flex');
}

function goToLearn() {
    showScreen('screen-learn');
    buildAnimalGrid();
    updateLearnProgress();
}

function goToGame() {
    score = 0;
    currentQ = 0;
    gameQuestions = generateQuestions();
    showScreen('screen-game');
    showQuestion();
    lucide.createIcons();
}

// --- Learn Screen ---
function buildAnimalGrid() {
    const grid = document.getElementById('animal-grid');
    if (grid.children.length > 0) return;
    animals.forEach((a, i) => {
        const card = document.createElement('div');
        card.className = 'animal-card bg-white/90 backdrop-blur rounded-2xl p-4 flex flex-col items-center text-center shadow-md pop-in';
        card.style.animationDelay = `${i * 0.06}s`;
        card.style.opacity = '0';
        card.innerHTML = `
        <div class="text-5xl mb-2">${a.emoji}</div>
        <div class="font-bold text-gray-800 text-lg">${a.name}</div>
        <div class="text-emerald-600 font-medium text-sm mt-1">"${a.sound}"</div>
        <div class="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <i data-lucide="volume-2" style="width:12px;height:12px"></i> Tap to hear
        </div>
      `;
        card.onclick = () => {
            a.synthFn();
            heardAnimals.add(a.name);
            card.classList.add('wiggle');
            setTimeout(() => card.classList.remove('wiggle'), 500);
            updateLearnProgress();
        };
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function updateLearnProgress() {
    const prog = document.getElementById('learn-progress');
    const btn = document.getElementById('btn-start-game');
    const count = heardAnimals.size;
    prog.textContent = `${count} / ${animals.length} animals discovered`;
    if (count >= 4) {
        btn.disabled = false;
        btn.textContent = '🎮 Play the Game!';
    } else {
        btn.disabled = true;
        btn.textContent = `🎮 Hear ${4 - count} more to unlock!`;
    }
}

// --- Game ---
function generateQuestions() {
    const shuffled = [...animals].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_QUESTIONS);
}

function showQuestion() {
    if (currentQ >= gameQuestions.length) { showResults(); return; }
    currentAnimal = gameQuestions[currentQ];

    const feedback = document.getElementById('game-feedback');
    feedback.classList.add('hidden');
    feedback.textContent = '';
    feedback.style.color = '';

    document.getElementById('score-display').textContent = `⭐ ${score}`;
    document.getElementById('round-display').textContent = `${currentQ + 1} / ${TOTAL_QUESTIONS}`;
    document.getElementById('game-sound-text').textContent = `"${currentAnimal.sound}"`;

    currentAnimal.synthFn();

    const options = [currentAnimal];
    const others = animals.filter(a => a.name !== currentAnimal.name).sort(() => Math.random() - 0.5);
    options.push(...others.slice(0, 3));
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('game-options');
    container.innerHTML = '';

    options.forEach((o) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn bg-gray-50 border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center';
        btn.innerHTML = `<span class="text-3xl">${o.emoji}</span><span>${o.name}</span>`;
        btn.onclick = () => checkAnswer(o, btn, container);
        container.appendChild(btn);
    });
}

function checkAnswer(selected, btn, container) {
    const feedback = document.getElementById('game-feedback');
    feedback.classList.remove('hidden');

    if (selected.name === currentAnimal.name) {
        score++;
        feedback.textContent = '✅ Correct!';
        feedback.style.color = 'green';
        currentAnimal.synthFn(); // efek benar
    } else {
        feedback.textContent = `❌ It was ${currentAnimal.name}`;
        feedback.style.color = 'red';
    }

    currentQ++;
    setTimeout(showQuestion, 3500);
}

function showResults() {
    showScreen('screen-results');
    document.getElementById('result-text').textContent =
        `You got ${score} out of ${TOTAL_QUESTIONS}`;
}

function replaySound() {
    if (currentAnimal) currentAnimal.synthFn();
}

document.addEventListener("DOMContentLoaded", () => {
  showScreen('screen-welcome');
  lucide.createIcons();
});