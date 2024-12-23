document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('playerName');
    const displayName = document.getElementById('displayName');
    const choiceButtons = document.querySelectorAll('.choice-btn');
    const playerChoiceDisplay = document.getElementById('playerChoice');
    const computerChoiceDisplay = document.getElementById('computerChoice');
    const resultDisplay = document.getElementById('result');
    const restartBtn = document.getElementById('restartBtn');
    const soundToggle = document.getElementById('soundToggle');
    const streakDisplay = document.getElementById('streak');
    const playerScoreDisplay = document.getElementById('playerScore');
    const computerScoreDisplay = document.getElementById('computerScore');

    // Game state
    let soundEnabled = true;
    let playerScore = 0;
    let computerScore = 0;
    let currentStreak = 0;

    const icons = {
        rock: '<i class="fas fa-hand-rock fa-3x"></i>',
        paper: '<i class="fas fa-hand-paper fa-3x"></i>',
        scissors: '<i class="fas fa-hand-scissors fa-3x"></i>'
    };

    const sounds = {
        click: document.getElementById('clickSound'),
        win: document.getElementById('winSound'),
        lose: document.getElementById('loseSound'),
        tie: document.getElementById('tieSound')
    };

    // Name input handler with localStorage
    playerNameInput.value = localStorage.getItem('playerName') || '';
    if (playerNameInput.value) {
        displayName.textContent = `Player: ${playerNameInput.value}`;
    }

    playerNameInput.addEventListener('input', (e) => {
        const name = e.target.value;
        displayName.textContent = name ? `Player: ${name}` : '';
        localStorage.setItem('playerName', name);
    });

    // Sound toggle handler
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
        soundToggle.classList.toggle('muted', !soundEnabled);
    });

    // Play sound function
    function playSound(soundName) {
        if (soundEnabled && sounds[soundName]) {
            sounds[soundName].currentTime = 0;
            sounds[soundName].play().catch(() => {});
        }
    }

    // Choice button handlers with animations
    choiceButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!playerNameInput.value) {
                alert('Please enter your name first!');
                return;
            }

            playSound('click');
            
            // Add click animation
            button.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                button.classList.remove('animate__animated', 'animate__pulse');
            }, 500);

            const choice = button.dataset.choice;
            playGame(choice);
        });

        // Add hover animation
        button.addEventListener('mouseenter', () => {
            button.classList.add('animate__animated', 'animate__headShake');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('animate__animated', 'animate__headShake');
        });
    });

    // Restart button handler
    restartBtn.addEventListener('click', () => {
        playSound('click');
        resetGame();
    });

    function resetGame() {
        playerScore = 0;
        computerScore = 0;
        currentStreak = 0;
        playerChoiceDisplay.innerHTML = '';
        computerChoiceDisplay.innerHTML = '';
        resultDisplay.textContent = '';
        streakDisplay.textContent = '';
        resultDisplay.className = 'result-text';
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        playerScoreDisplay.textContent = playerScore;
        computerScoreDisplay.textContent = computerScore;
    }

    function updateStreak(result) {
        if (result === 'win') {
            currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
        } else if (result === 'lose') {
            currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
        } else {
            currentStreak = 0;
        }

        if (currentStreak !== 0) {
            streakDisplay.textContent = `${Math.abs(currentStreak)} ${currentStreak > 0 ? 'Wins' : 'Losses'} in a row!`;
        } else {
            streakDisplay.textContent = '';
        }
    }

    async function playGame(playerChoice) {
        try {
            const response = await fetch('/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    choice: playerChoice,
                    playerName: playerNameInput.value
                })
            });

            const data = await response.json();
            
            // Update displays with animations
            playerChoiceDisplay.innerHTML = icons[playerChoice];
            computerChoiceDisplay.innerHTML = icons[data.computerChoice];
            
            // Show result with appropriate styling
            let resultText = '';
            let resultClass = '';
            const playerName = playerNameInput.value;
            
            if (data.result === 'win') {
                resultText = `${playerName} Wins! 🎉`;
                resultClass = 'win';
                playerScore++;
                playSound('win');
            } else if (data.result === 'lose') {
                resultText = 'Computer Wins! 😢';
                resultClass = 'lose';
                computerScore++;
                playSound('lose');
            } else {
                resultText = "It's a Tie! 🤝";
                resultClass = 'tie';
                playSound('tie');
            }
            
            resultDisplay.textContent = resultText;
            resultDisplay.className = 'result-text ' + resultClass;
            
            updateScoreDisplay();
            updateStreak(data.result);
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong! Please try again.');
        }
    }
});
