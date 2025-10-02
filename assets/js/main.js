document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // BAGIAN 1: SETUP DAN KONFIGURASI
    // =================================================================================

    const uiElements = {
        backgroundMedia: document.getElementById('background-media'),
        gameBackgroundMedia: document.getElementById('game-background-media'),
        gameContainer: document.getElementById('game-container'),
        playerHand: document.getElementById('player-hand'),
        opponentHand: document.getElementById('opponent-hand'),
        discardPile: document.getElementById('discard-pile'),
        drawPile: document.getElementById('draw-pile'),
        unoButton: document.getElementById('uno-button'),
        callUnoOnOpponentButton: document.getElementById('call-uno-on-opponent-button'),
        turnIndicator: document.getElementById('turn-indicator'),
        balance: document.getElementById('balance'),
        currentBet: document.getElementById('current-bet'),
        multiplier: document.getElementById('multiplier'),
        streak: document.getElementById('streak'),
        startModal: document.getElementById('start-modal'),
        colorPickerModal: document.getElementById('color-picker-modal'),
        gameOverModal: document.getElementById('game-over-modal'),
        modalBalance: document.getElementById('modal-balance'),
        modeSelect: document.getElementById('mode-select'),
        betLevel: document.getElementById('bet-level'),
        difficulty: document.getElementById('difficulty'),
        allInButton: document.getElementById('all-in-button'),
        startGameButton: document.getElementById('start-game-button'),
        restartGameButton: document.getElementById('restart-game-button'),
        opponentLabel: document.getElementById('opponent-label'),
        alertModal: document.getElementById('alert-modal'),
        alertIcon: document.getElementById('alert-icon'),
        alertMessage: document.getElementById('alert-message'),
        alertClose: document.getElementById('alert-close'),
        loadingScreen: document.getElementById('loading-screen'),
        loadingBar: document.getElementById('loading-bar'),
        achievementToast: document.getElementById('achievement-toast'),
        achievementIcon: document.getElementById('achievement-icon'),
        achievementTitle: document.getElementById('achievement-title'),
        achievementDesc: document.getElementById('achievement-desc'),
        statGames: document.getElementById('stat-games'),
        statWins: document.getElementById('stat-wins'),
        statBestStreak: document.getElementById('stat-best-streak'),
        finalGames: document.getElementById('final-games'),
        finalWins: document.getElementById('final-wins')
    };

    // Audio Elements
    const sounds = {
        draw: document.getElementById('sound-draw'),
        play: document.getElementById('sound-play'),
        uno: document.getElementById('sound-uno'),
        win: document.getElementById('sound-win'),
        bg: document.getElementById('sound-bg')
    };

    // Safeguard
    Object.values(uiElements).forEach(el => {
        if (!el) console.error('Missing UI element! Check HTML IDs.');
    });

    const gameState = {
        deck: [],
        playerHand: [],
        opponentHand: [],
        discardPile: [],
        currentPlayer: 'player',
        direction: 'clockwise',
        balance: 5000,
        currentBet: 0,
        multiplier: 1,
        streak: 0,
        gameMode: 'bot',
        difficulty: 'medium',
        playerUnoTimer: null,
        isPlayerUnoCalled: false,
        opponentHasCalledUno: false,
        playerCallUnoTimer: null,
        isAnimating: false,
        // Statistics
        stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            bestStreak: 0,
            totalEarnings: 0
        },
        // Achievements
        achievements: {
            firstWin: { name: "Pemenang Pertama!", desc: "Menang game pertama", unlocked: false, icon: "🏆" },
            richPlayer: { name: "Player Kaya", desc: "Kumpulkan $10,000", unlocked: false, icon: "💰" },
            streakKing: { name: "Raja Streak", desc: "Dapatkan streak 5 wins", unlocked: false, icon: "👑" },
            unoMaster: { name: "Master UNO", desc: "Panggil UNO 10x", unlocked: false, icon: "🎯" }
        },
        achievementCounts: {
            unoCalls: 0,
            totalWins: 0
        }
    };

    // =================================================================================
    // BAGIAN 2: LOADING SYSTEM & INITIALIZATION
    // =================================================================================

    function initializeLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    uiElements.loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        uiElements.loadingScreen.classList.add('hidden');
                        init();
                    }, 500);
                }, 500);
            }
            uiElements.loadingBar.style.width = `${progress}%`;
        }, 200);
    }

    // =================================================================================
    // BAGIAN 3: SOUND SYSTEM
    // =================================================================================

    function playSound(soundName) {
        try {
            const sound = sounds[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Sound play failed:', e));
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    }

    function toggleBackgroundMusic(play = true) {
        try {
            if (play) {
                sounds.bg.volume = 0.3;
                sounds.bg.play().catch(e => console.log('BG music failed'));
            } else {
                sounds.bg.pause();
            }
        } catch (error) {
            console.log('Music error:', error);
        }
    }

    // =================================================================================
    // BAGIAN 4: ACHIEVEMENT SYSTEM
    // =================================================================================

    function checkAchievements() {
        // First Win
        if (gameState.achievementCounts.totalWins >= 1 && !gameState.achievements.firstWin.unlocked) {
            unlockAchievement('firstWin');
        }

        // Rich Player
        if (gameState.stats.totalEarnings >= 10000 && !gameState.achievements.richPlayer.unlocked) {
            unlockAchievement('richPlayer');
        }

        // Streak King
        if (gameState.streak >= 5 && !gameState.achievements.streakKing.unlocked) {
            unlockAchievement('streakKing');
        }

        // UNO Master
        if (gameState.achievementCounts.unoCalls >= 10 && !gameState.achievements.unoMaster.unlocked) {
            unlockAchievement('unoMaster');
        }
    }

    function unlockAchievement(achievementKey) {
        const achievement = gameState.achievements[achievementKey];
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            showAchievementToast(achievement.name, achievement.desc, achievement.icon);
            saveGameData();
        }
    }

    function showAchievementToast(title, description, icon) {
        uiElements.achievementIcon.textContent = icon;
        uiElements.achievementTitle.textContent = title;
        uiElements.achievementDesc.textContent = description;
        
        uiElements.achievementToast.classList.remove('hidden');
        uiElements.achievementToast.classList.add('animate-fade-in');
        
        setTimeout(() => {
            uiElements.achievementToast.classList.remove('animate-fade-in');
            uiElements.achievementToast.classList.add('animate-fade-out');
            setTimeout(() => {
                uiElements.achievementToast.classList.add('hidden');
                uiElements.achievementToast.classList.remove('animate-fade-out');
            }, 500);
        }, 3000);
    }

    // =================================================================================
    // BAGIAN 5: STATISTICS & SAVE SYSTEM
    // =================================================================================

    function loadGameData() {
        try {
            const savedData = localStorage.getItem('unoGameData');
            if (savedData) {
                const data = JSON.parse(savedData);
                gameState.stats = data.stats || gameState.stats;
                gameState.achievements = data.achievements || gameState.achievements;
                gameState.achievementCounts = data.achievementCounts || gameState.achievementCounts;
                gameState.balance = data.balance || gameState.balance;
            }
        } catch (error) {
            console.log('Error loading game data:', error);
        }
    }

    function saveGameData() {
        try {
            const gameData = {
                stats: gameState.stats,
                achievements: gameState.achievements,
                achievementCounts: gameState.achievementCounts,
                balance: gameState.balance,
                lastSave: new Date().toISOString()
            };
            localStorage.setItem('unoGameData', JSON.stringify(gameData));
        } catch (error) {
            console.log('Error saving game data:', error);
        }
    }

    function updateStatistics() {
        uiElements.statGames.textContent = gameState.stats.gamesPlayed;
        uiElements.statWins.textContent = gameState.stats.gamesWon;
        uiElements.statBestStreak.textContent = gameState.stats.bestStreak;
        
        uiElements.finalGames.textContent = gameState.stats.gamesPlayed;
        uiElements.finalWins.textContent = gameState.stats.gamesWon;
    }

    // =================================================================================
    // BAGIAN 6: VIEW MANAGEMENT
    // =================================================================================

    function updateView(viewName) {
        uiElements.backgroundMedia.classList.add('hidden');
        uiElements.gameBackgroundMedia.classList.add('hidden');
        uiElements.gameContainer.classList.add('opacity-0');
        uiElements.startModal.classList.add('hidden');
        uiElements.gameOverModal.classList.add('hidden');
        uiElements.colorPickerModal.classList.add('hidden');

        switch (viewName) {
            case 'startScreen':
                uiElements.backgroundMedia.classList.remove('hidden');
                uiElements.startModal.classList.remove('hidden');
                toggleBackgroundMusic(true);
                updateStartModal();
                updateStatistics();
                break;
            case 'gameScreen':
                uiElements.gameBackgroundMedia.classList.remove('hidden');
                uiElements.gameContainer.classList.remove('opacity-0');
                toggleBackgroundMusic(false);
                break;
            case 'gameOverScreen':
                uiElements.gameBackgroundMedia.classList.remove('hidden');
                uiElements.gameContainer.classList.remove('opacity-0');
                uiElements.gameOverModal.classList.remove('hidden');
                toggleBackgroundMusic(true);
                break;
            case 'colorPicker':
                uiElements.gameBackgroundMedia.classList.remove('hidden');
                uiElements.gameContainer.classList.remove('opacity-0');
                uiElements.colorPickerModal.classList.remove('hidden');
                break;
        }
        clearTimeout(gameState.playerUnoTimer);
        clearTimeout(gameState.playerCallUnoTimer);
    }

    function updateStartModal() {
        uiElements.modalBalance.textContent = gameState.balance;
        const level = uiElements.betLevel.value;
        let minBet = 100;
        if (level === 'medium') minBet = 500;
        else if (level === 'high') minBet = 1000;
        
        uiElements.allInButton.classList.toggle('hidden', gameState.balance >= minBet);
        uiElements.startGameButton.disabled = gameState.balance < 50;
        if (gameState.balance < 50) {
            uiElements.startGameButton.textContent = 'Saldo Habis - Restart!';
        } else {
            uiElements.startGameButton.textContent = 'Mulai Ronde';
        }
    }

    // =================================================================================
    // BAGIAN 7: CORE GAME LOGIC - PERBAIKAN UTAMA
    // =================================================================================

    function createDeck() {
        const colors = ['red', 'green', 'blue', 'yellow'];
        const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'drawTwo'];
        const wildCards = ['wild', 'wildDrawFour'];
        let newDeck = [];
        
        // Add colored cards
        for (const color of colors) {
            // One zero card
            newDeck.push({ color, value: '0' });
            
            // Two of each other card
            for (const value of values.slice(1)) { // Skip '0'
                newDeck.push({ color, value });
                newDeck.push({ color, value });
            }
        }
        
        // Add wild cards (4 of each)
        for (let i = 0; i < 4; i++) {
            for (const wild of wildCards) {
                newDeck.push({ color: 'black', value: wild });
            }
        }
        
        console.log("Deck created with", newDeck.length, "cards");
        return newDeck;
    }

    function shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    function startGame() {
        console.log("=== STARTING GAME ===");
        
        if (gameState.balance < 50) {
            showModernAlert('error', 'Saldo terlalu rendah! Mulai ulang dulu.');
            return;
        }

        const mode = uiElements.modeSelect.value;
        const level = uiElements.betLevel.value;
        const difficulty = uiElements.difficulty.value;
        
        let betAmount, mult = 1;
        switch (level) {
            case 'low': betAmount = 100; mult = 1; break;
            case 'medium': betAmount = 500; mult = 1.5; break;
            case 'high': betAmount = 1000; mult = 2; break;
            default: showModernAlert('error', 'Pilih level taruhan!'); return;
        }

        if (betAmount > gameState.balance) {
            betAmount = Math.max(50, gameState.balance);
            mult = 1;
            showModernAlert('warning', `All-in otomatis: $${betAmount}`);
        }

        if (betAmount < 50) {
            showModernAlert('error', 'Taruhan minimal $50!');
            return;
        }

        gameState.currentBet = betAmount;
        gameState.multiplier = mult;
        gameState.balance -= gameState.currentBet;
        gameState.difficulty = difficulty;
        
        updateView('gameScreen');
        
        // Reset game state
        gameState.deck = createDeck();
        shuffle(gameState.deck);
        gameState.playerHand = [];
        gameState.opponentHand = [];
        gameState.discardPile = [];
        gameState.isPlayerUnoCalled = false;
        gameState.opponentHasCalledUno = false;
        gameState.gameMode = mode;
        gameState.direction = 'clockwise';
        gameState.streak = 0;
        gameState.isAnimating = false;
        uiElements.callUnoOnOpponentButton.classList.add('hidden');
        
        // Update statistics
        gameState.stats.gamesPlayed++;
        
        console.log("Deck size after creation:", gameState.deck.length);
        
        // PERBAIKAN: Deal kartu dengan cara yang lebih reliable
        dealInitialCards();
        
        // Set first card
        let firstCard = getValidFirstCard();
        gameState.discardPile.push(firstCard);
        
        gameState.currentPlayer = 'player';
        uiElements.opponentLabel.textContent = mode === 'bot' ? 'Tangan Bot' : 'Tangan Player 2';
        
        // PERBAIKAN: Render final setelah semua kartu siap
        setTimeout(() => {
            renderGame();
            console.log("=== GAME STARTED ===");
            console.log("Player cards:", gameState.playerHand.length);
            console.log("Opponent cards:", gameState.opponentHand.length);
            console.log("First card:", gameState.discardPile[0]);
            console.log("Deck remaining:", gameState.deck.length);
        }, 200);
        
        saveGameData();
    }

    // FUNGSI BARU: Deal kartu awal dengan cara yang lebih reliable
    function dealInitialCards() {
        console.log("Dealing initial cards...");
        
        // Clear hands first
        gameState.playerHand = [];
        gameState.opponentHand = [];
        
        // Deal 7 kartu untuk setiap pemain
        for (let i = 0; i < 7; i++) {
            // Player card
            if (gameState.deck.length > 0) {
                const playerCard = gameState.deck.pop();
                gameState.playerHand.push(playerCard);
                console.log(`Dealt to player: ${playerCard.color} ${playerCard.value}`);
            }
            
            // Opponent card  
            if (gameState.deck.length > 0) {
                const opponentCard = gameState.deck.pop();
                gameState.opponentHand.push(opponentCard);
                console.log(`Dealt to opponent: ${opponentCard.color} ${opponentCard.value}`);
            }
        }
        
        console.log("Dealing complete - Player:", gameState.playerHand.length, "Opponent:", gameState.opponentHand.length);
        
        // Render immediately setelah deal
        renderHand(gameState.playerHand, uiElements.playerHand, true);
        renderHand(gameState.opponentHand, uiElements.opponentHand, gameState.gameMode === 'player2');
    }

    // FUNGSI BARU: Dapatkan kartu pertama yang valid
    function getValidFirstCard() {
        if (gameState.deck.length === 0) {
            console.error("No cards in deck!");
            return { color: 'red', value: '0' }; // Fallback
        }
        
        let firstCard = gameState.deck.pop();
        let attempts = 0;
        
        // Cari kartu pertama yang bukan wild card
        while (firstCard.color === 'black' && attempts < 10 && gameState.deck.length > 0) {
            console.log("First card is wild, searching for non-wild...");
            gameState.deck.unshift(firstCard); // Kembalikan ke deck
            shuffle(gameState.deck);
            firstCard = gameState.deck.pop();
            attempts++;
        }
        
        if (firstCard.color === 'black') {
            console.warn("Using wild card as first card after", attempts, "attempts");
        } else {
            console.log("Valid first card found:", firstCard.color, firstCard.value);
        }
        
        return firstCard;
    }

    function isCardPlayable(card, topCard) {
        if (!topCard) return true; // Jika tidak ada kartu di discard pile
        if (card.color === 'black') return true;
        return card.color === topCard.color || card.value === topCard.value;
    }

    function drawCards(hand, amount, animate = true) {
        if (gameState.isAnimating && animate) {
            setTimeout(() => drawCards(hand, amount, animate), 100);
            return;
        }

        const drawnCards = [];
        
        for (let i = 0; i < amount; i++) {
            if (gameState.deck.length === 0) {
                reshuffleDeck();
            }
            if (gameState.deck.length > 0) {
                const newCard = gameState.deck.pop();
                hand.push(newCard);
                drawnCards.push(newCard);
                console.log(`Drew card: ${newCard.color} ${newCard.value}`);
            }
        }

        // PERBAIKAN: Pastikan render terjadi bahkan tanpa animasi
        if (animate && drawnCards.length > 0) {
            gameState.isAnimating = true;
            playSound('draw');
            animateMultipleDraws(drawnCards, hand === gameState.playerHand ? 'player' : 'opponent');
            
            setTimeout(() => {
                renderGame();
                gameState.isAnimating = false;
                
                if (hand === gameState.playerHand && gameState.currentPlayer === 'player') {
                    checkAutoPlayAfterDraw();
                }
            }, drawnCards.length * 200 + 100);
        } else {
            // PERBAIKAN: Langsung render tanpa delay
            renderGame();
            gameState.isAnimating = false;
            
            if (hand === gameState.playerHand && gameState.currentPlayer === 'player') {
                setTimeout(() => checkAutoPlayAfterDraw(), 100);
            }
        }
    }

    function animateMultipleDraws(cards, player) {
        cards.forEach((card, index) => {
            setTimeout(() => {
                animateDrawSingle(card, player);
            }, index * 200);
        });
    }

    function checkAutoPlayAfterDraw() {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const newCard = gameState.playerHand[gameState.playerHand.length - 1];
        
        if (!newCard || !isCardPlayable(newCard, topCard)) {
            setTimeout(() => {
                switchTurn(getNextPlayer('player'));
            }, 300);
        }
    }

    function animateDrawSingle(card, player) {
        const tempCard = createCardElement(card);
        tempCard.style.position = 'fixed';
        tempCard.style.zIndex = '1000';
        tempCard.style.transform = 'scale(0.8)';
        
        const drawPileRect = uiElements.drawPile.getBoundingClientRect();
        tempCard.style.left = `${drawPileRect.left}px`;
        tempCard.style.top = `${drawPileRect.top}px`;
        
        document.body.appendChild(tempCard);
        
        const handArea = player === 'player' ? uiElements.playerHand : uiElements.opponentHand;
        const handRect = handArea.getBoundingClientRect();
        
        setTimeout(() => {
            tempCard.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tempCard.style.left = `${handRect.left + handRect.width/2}px`;
            tempCard.style.top = `${handRect.top + handRect.height/2}px`;
            tempCard.style.transform = 'scale(0.1) rotate(360deg)';
            tempCard.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            if (tempCard.parentNode) {
                document.body.removeChild(tempCard);
            }
        }, 500);
        
        uiElements.drawPile.classList.add('animate-pulse');
        setTimeout(() => uiElements.drawPile.classList.remove('animate-pulse'), 300);
    }

    function reshuffleDeck() {
        if (gameState.discardPile.length <= 1) {
            console.error("Cannot reshuffle - not enough cards in discard pile");
            return;
        }
        
        const topCard = gameState.discardPile.pop();
        gameState.deck = [...gameState.discardPile];
        gameState.discardPile = [topCard];
        
        shuffle(gameState.deck);
        showModernAlert('info', 'Deck diacak ulang!');
        console.log("Deck reshuffled. New size:", gameState.deck.length);
    }

    function getSmartColor(hand, opponentHand, isWildDrawFour = false) {
        const colorCounts = { red: 0, green: 0, blue: 0, yellow: 0 };
        hand.forEach(card => {
            if (card.color !== 'black') colorCounts[card.color]++;
        });
        let bestColor = 'red';
        let bestScore = isWildDrawFour ? -Infinity : Infinity;
        
        for (const [color, count] of Object.entries(colorCounts)) {
            const score = isWildDrawFour ? count : -count;
            if ((isWildDrawFour && score > bestScore) || (!isWildDrawFour && score < bestScore)) {
                bestScore = score;
                bestColor = color;
            }
        }
        return bestColor;
    }

    function getBotDifficultySettings() {
        const strategies = {
            easy: { unoCallChance: 0.3, smartPlay: 0.4, thinkTime: 1500 },
            medium: { unoCallChance: 0.7, smartPlay: 0.6, thinkTime: 1000 },
            hard: { unoCallChance: 0.9, smartPlay: 0.9, thinkTime: 800 }
        };
        return strategies[gameState.difficulty] || strategies.medium;
    }

    function handleCardEffect(card, playedBy) {
        if (checkForWinner()) return;
        
        let nextPlayer = getNextPlayer(playedBy);
        
        switch (card.value) {
            case 'skip':
                nextPlayer = getNextPlayer(nextPlayer);
                break;
            case 'reverse':
                gameState.direction = gameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise';
                if (gameState.playerHand.length + gameState.opponentHand.length === 2) {
                    nextPlayer = getNextPlayer(nextPlayer);
                } else {
                    nextPlayer = playedBy;
                }
                break;
            case 'drawTwo':
                const targetHand = playedBy === 'player' ? gameState.opponentHand : gameState.playerHand;
                drawCards(targetHand, 2);
                nextPlayer = getNextPlayer(nextPlayer);
                break;
            case 'wild':
                if (playedBy === 'player') {
                    updateView('colorPicker');
                    return;
                } else {
                    const chosenColor = getSmartColor(gameState.opponentHand, gameState.playerHand);
                    gameState.discardPile[gameState.discardPile.length - 1].color = chosenColor;
                }
                break;
            case 'wildDrawFour':
                const targetHandWild = playedBy === 'player' ? gameState.opponentHand : gameState.playerHand;
                drawCards(targetHandWild, 4);
                if (playedBy === 'player') {
                    updateView('colorPicker');
                    return;
                } else {
                    const chosenColor = getSmartColor(gameState.opponentHand, gameState.playerHand, true);
                    gameState.discardPile[gameState.discardPile.length - 1].color = chosenColor;
                }
                nextPlayer = getNextPlayer(nextPlayer);
                break;
        }
        
        setTimeout(() => switchTurn(nextPlayer), 600);
    }

    function getNextPlayer(currentPlayer) {
        if (gameState.direction === 'clockwise') {
            return currentPlayer === 'player' ? 'opponent' : 'player';
        } else {
            return currentPlayer === 'player' ? 'opponent' : 'player';
        }
    }
    
    function opponentTurn() {
        if (gameState.gameMode === 'player2') return;
        
        const settings = getBotDifficultySettings();
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const playableCards = gameState.opponentHand.filter(card => isCardPlayable(card, topCard));
        
        if (playableCards.length === 0) {
            drawCards(gameState.opponentHand, 1);
            setTimeout(() => {
                const newCard = gameState.opponentHand[gameState.opponentHand.length - 1];
                if (newCard && isCardPlayable(newCard, topCard)) {
                    const cardIndex = gameState.opponentHand.length - 1;
                    const card = gameState.opponentHand.splice(cardIndex, 1)[0];
                    gameState.discardPile.push(card);
                    animateCardPlay(card, 'opponent');
                    handleCardEffect(card, 'opponent');
                } else {
                    switchTurn('player');
                }
            }, settings.thinkTime);
            return;
        }
        
        const cardToPlay = selectBestCardToPlay(playableCards, gameState.opponentHand, settings);
        const cardIndex = gameState.opponentHand.findIndex(card => 
            card.color === cardToPlay.color && card.value === cardToPlay.value
        );
        
        if (cardIndex !== -1) {
            const card = gameState.opponentHand.splice(cardIndex, 1)[0];
            gameState.discardPile.push(card);
            animateCardPlay(card, 'opponent');

            if (gameState.opponentHand.length === 1) {
                const settings = getBotDifficultySettings();
                gameState.opponentHasCalledUno = Math.random() < settings.unoCallChance;
                if (!gameState.opponentHasCalledUno) {
                    startPlayerCallUnoTimer();
                }
            }

            setTimeout(() => handleCardEffect(card, 'opponent'), 500);
        }
    }

    function selectBestCardToPlay(playableCards, hand, settings) {
        // Prioritaskan kartu spesial berdasarkan difficulty
        const specialCards = playableCards.filter(card => 
            ['skip', 'reverse', 'drawTwo', 'wild', 'wildDrawFour'].includes(card.value)
        );
        
        if (specialCards.length > 0 && Math.random() < settings.smartPlay) {
            const wild4 = specialCards.find(card => card.value === 'wildDrawFour');
            if (wild4) return wild4;
            
            const draw2 = specialCards.find(card => card.value === 'drawTwo');
            if (draw2) return draw2;
            
            return specialCards[0];
        }
        
        const colorCounts = {};
        hand.forEach(card => {
            if (card.color !== 'black') {
                colorCounts[card.color] = (colorCounts[card.color] || 0) + 1;
            }
        });
        
        let bestCard = playableCards[0];
        let maxCount = 0;
        
        playableCards.forEach(card => {
            const count = colorCounts[card.color] || 0;
            if (count > maxCount) {
                maxCount = count;
                bestCard = card;
            }
        });
        
        return bestCard;
    }

    function switchTurn(nextPlayer) {
        gameState.currentPlayer = nextPlayer;
        clearTimeout(gameState.playerUnoTimer);
        clearTimeout(gameState.playerCallUnoTimer);
        
        if (gameState.currentPlayer === 'opponent') {
            uiElements.callUnoOnOpponentButton.classList.add('hidden');
            renderGame();
            if (gameState.gameMode === 'bot') {
                const settings = getBotDifficultySettings();
                setTimeout(opponentTurn, settings.thinkTime);
            }
        } else {
            renderGame();
        }
        updateInfoBar();
    }

    function playerPlayCard(cardIndex) {
        if (gameState.currentPlayer !== 'player') {
            showModernAlert('error', 'Bukan giliran Anda!');
            return;
        }
        
        if (gameState.isAnimating) {
            showModernAlert('warning', 'Tunggu animasi selesai!');
            return;
        }

        const card = gameState.playerHand[cardIndex];
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        
        if (card.value === 'wildDrawFour') {
            const hasOtherPlayableCard = gameState.playerHand.some(c => c.value !== 'wildDrawFour' && isCardPlayable(c, topCard));
            if (hasOtherPlayableCard) {
                showModernAlert('error', 'Tidak bisa main +4 jika ada kartu valid lain!');
                return;
            }
        }

        if (isCardPlayable(card, topCard)) {
            gameState.isAnimating = true;
            gameState.playerHand.splice(cardIndex, 1);
            gameState.discardPile.push(card);
            playSound('play');
            animateCardPlay(card, 'player');
            
            if (gameState.playerHand.length === 1) {
                startPlayerUnoTimer();
            } else {
                clearTimeout(gameState.playerUnoTimer);
            }
            gameState.isPlayerUnoCalled = false;
            
            setTimeout(() => {
                handleCardEffect(card, 'player');
                gameState.isAnimating = false;
            }, 600);
        } else {
            showModernAlert('error', 'Kartu tidak valid!');
        }
    }

    function checkForWinner() {
        let winner = null;
        if (gameState.playerHand.length === 0) winner = 'Pemain';
        if (gameState.opponentHand.length === 0) winner = 'Opponent';

        if (winner) {
            setTimeout(() => {
                if (winner === 'Pemain') {
                    const winAmount = Math.floor(gameState.currentBet * gameState.multiplier);
                    gameState.balance += winAmount;
                    gameState.streak++;
                    gameState.stats.gamesWon++;
                    gameState.stats.totalEarnings += winAmount;
                    gameState.achievementCounts.totalWins++;
                    
                    if (gameState.streak > gameState.stats.bestStreak) {
                        gameState.stats.bestStreak = gameState.streak;
                    }
                    
                    playSound('win');
                    showModernAlert('success', `Selamat! +$${winAmount} (Streak: ${gameState.streak})`);
                } else {
                    gameState.streak = 0;
                    showModernAlert('error', 'Lawan menang ronde ini.');
                }
                
                checkAchievements();
                saveGameData();
                
                if (gameState.balance <= 0) {
                    updateView('gameOverScreen');
                } else {
                    updateView('startScreen');
                }
                updateInfoBar();
            }, 500);
            return true;
        }
        return false;
    }

    function startPlayerUnoTimer() {
        clearTimeout(gameState.playerUnoTimer);
        gameState.playerUnoTimer = setTimeout(() => {
            if (gameState.playerHand.length === 1 && !gameState.isPlayerUnoCalled) {
                showModernAlert('error', "Lupa UNO! +2 kartu penalti.");
                drawCards(gameState.playerHand, 2);
                gameState.isPlayerUnoCalled = false;
            }
        }, 5000);
    }

    function startPlayerCallUnoTimer() {
        uiElements.callUnoOnOpponentButton.classList.remove('hidden');
        gameState.playerCallUnoTimer = setTimeout(() => {
            uiElements.callUnoOnOpponentButton.classList.add('hidden');
        }, 3000);
    }
    
    function animateCardPlay(card, player) {
        const tempCard = createCardElement(card);
        tempCard.style.position = 'fixed';
        tempCard.style.zIndex = '1000';
        
        const handArea = player === 'player' ? uiElements.playerHand : uiElements.opponentHand;
        const handRect = handArea.getBoundingClientRect();
        tempCard.style.left = `${handRect.left + handRect.width/2}px`;
        tempCard.style.top = `${handRect.top + handRect.height/2}px`;
        tempCard.style.transform = 'scale(0.8)';
        
        document.body.appendChild(tempCard);
        
        const discardRect = uiElements.discardPile.getBoundingClientRect();
        
        setTimeout(() => {
            tempCard.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tempCard.style.left = `${discardRect.left + discardRect.width/2}px`;
            tempCard.style.top = `${discardRect.top + discardRect.height/2}px`;
            tempCard.style.transform = 'scale(1) rotate(5deg)';
        }, 50);
        
        setTimeout(() => {
            if (tempCard.parentNode) {
                document.body.removeChild(tempCard);
            }
            renderGame();
        }, 600);
    }

    // =================================================================================
    // BAGIAN 8: RENDERING SYSTEM - PERBAIKAN UTAMA
    // =================================================================================

    function renderGame() {
        console.log("Rendering game...");
        console.log("Player hand:", gameState.playerHand.length, "cards");
        console.log("Opponent hand:", gameState.opponentHand.length, "cards");
        
        renderHand(gameState.playerHand, uiElements.playerHand, true);
        renderHand(gameState.opponentHand, uiElements.opponentHand, gameState.gameMode === 'player2');
        renderDiscardPile();
        updateInfoBar();
        toggleUnoButton();
        
        // PERBAIKAN: Force visibility
        uiElements.playerHand.style.display = 'flex';
        uiElements.opponentHand.style.display = 'flex';
        uiElements.discardPile.style.display = 'block';
    }

    function renderHand(hand, container, visible = false) {
        console.log(`Rendering ${hand.length} cards for ${visible ? 'player' : 'opponent'}`);
        
        // PERBAIKAN: Clear container terlebih dahulu
        container.innerHTML = '';
        
        // PERBAIKAN: Jika tidak ada kartu, tampilkan placeholder untuk debugging
        if (hand.length === 0) {
            console.warn(`No cards in ${visible ? 'player' : 'opponent'} hand!`);
            const placeholder = document.createElement('div');
            placeholder.className = 'text-gray-500 text-sm';
            placeholder.textContent = 'No cards';
            container.appendChild(placeholder);
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        hand.forEach((card, index) => {
            const cardEl = createCardElement(visible ? card : { back: true });
            
            if (visible) {
                const topCard = gameState.discardPile[gameState.discardPile.length - 1];
                const isPlayable = topCard && isCardPlayable(card, topCard) && 
                                 gameState.currentPlayer === 'player' && 
                                 !gameState.isAnimating;
                
                if (isPlayable) {
                    cardEl.classList.add('playable-card');
                    cardEl.style.cursor = 'pointer';
                    cardEl.addEventListener('click', () => playerPlayCard(index));
                } else {
                    cardEl.style.cursor = 'default';
                }
                
                cardEl.classList.add('card-hover');
            } else {
                cardEl.style.cursor = 'default';
            }
            
            fragment.appendChild(cardEl);
        });
        
        container.appendChild(fragment);
        console.log(`Successfully rendered ${hand.length} cards`);
    }

    function renderDiscardPile() {
        uiElements.discardPile.innerHTML = '';
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        
        if (topCard) {
            const cardEl = createCardElement(topCard);
            cardEl.classList.add('shadow-lg');
            uiElements.discardPile.appendChild(cardEl);
            
            const ringColorMap = {
                red: 'ring-red-500', 
                green: 'ring-green-500', 
                blue: 'ring-blue-500', 
                yellow: 'ring-yellow-500', 
                black: 'ring-gray-700'
            };
            
            const colorClasses = ['ring-red-500', 'ring-green-500', 'ring-blue-500', 'ring-yellow-500', 'ring-gray-700'];
            uiElements.discardPile.classList.remove(...colorClasses, 'ring-4', 'rounded-lg');
            
            const activeColorClass = ringColorMap[topCard.color];
            if (activeColorClass) {
                uiElements.discardPile.classList.add('ring-4', 'rounded-lg', activeColorClass);
            }
            
            console.log("Discard pile rendered with:", topCard.color, topCard.value);
        } else {
            console.warn("No card in discard pile!");
        }
    }

    function updateInfoBar() {
        uiElements.balance.textContent = gameState.balance;
        uiElements.currentBet.textContent = gameState.currentBet;
        uiElements.turnIndicator.textContent = gameState.currentPlayer === 'player' ? 'Anda' : 'Lawan';
        uiElements.multiplier.textContent = gameState.multiplier;
        uiElements.streak.textContent = gameState.streak;
        uiElements.modalBalance.textContent = gameState.balance;
    }

    function toggleUnoButton() {
        const isVisible = gameState.playerHand.length === 1 && !gameState.isAnimating;
        uiElements.unoButton.classList.toggle('hidden', !isVisible);
    }

    function createCardElement(card) {
        const cardClasses = "w-16 sm:w-20 md:w-24 lg:w-28 h-22 sm:h-28 md:h-36 lg:h-40 rounded-lg shadow-md transition-all duration-200";
        const imgEl = document.createElement('img');
        imgEl.className = cardClasses;
        
        // PERBAIKAN: Better error handling untuk images
        imgEl.onerror = function() {
            console.warn(`Failed to load card image: ${this.src}`);
            this.src = 'assets/cards/back.png';
            this.alt = 'Card back (fallback)';
            this.style.border = '2px solid red'; // Debug border
        };
        
        imgEl.onload = function() {
            console.log(`Successfully loaded: ${this.src}`);
        };
        
        if (card.back) {
            imgEl.src = 'assets/cards/back.png';
            imgEl.alt = 'Kartu UNO belakang';
        } else {
            let fileName;
            const isWild = card.value === 'wild' || card.value === 'wildDrawFour';
            if (isWild) {
                fileName = `${card.value}.png`;
            } else {
                fileName = `${card.color}_${card.value}.png`;
            }
            imgEl.src = `assets/cards/${fileName}`;
            imgEl.alt = `Kartu ${card.color} ${card.value}`;
        }
        
        // PERBAIKAN: Ensure card is visible
        imgEl.style.display = 'block';
        imgEl.style.visibility = 'visible';
        imgEl.style.opacity = '1';
        
        return imgEl;
    }

    // =================================================================================
    // BAGIAN 9: ALERT SYSTEM
    // =================================================================================
    function showModernAlert(type, message) {
        uiElements.alertModal.style.visibility = 'hidden';
        uiElements.alertModal.classList.remove('animate-fade-in', 'animate-fade-out');
        
        uiElements.alertMessage.textContent = message;
        
        const iconClass = type === 'success' ? 'bg-green-500' : 
                         type === 'error' ? 'bg-red-500' : 
                         type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
        
        uiElements.alertIcon.className = `w-6 h-6 rounded-full ${iconClass}`;
        
        setTimeout(() => {
            uiElements.alertModal.style.visibility = 'visible';
            uiElements.alertModal.classList.remove('hidden');
            uiElements.alertModal.classList.add('animate-fade-in');
        }, 10);
        
        setTimeout(() => {
            uiElements.alertModal.classList.remove('animate-fade-in');
            uiElements.alertModal.classList.add('animate-fade-out');
            setTimeout(() => {
                uiElements.alertModal.classList.add('hidden');
                uiElements.alertModal.classList.remove('animate-fade-out');
            }, 300);
        }, 3000);
    }

    // =================================================================================
    // BAGIAN 10: EVENT LISTENERS & INITIALIZATION
    // =================================================================================
    
    function initializeEventListeners() {
        uiElements.startGameButton.addEventListener('click', startGame);

        uiElements.allInButton.addEventListener('click', () => {
            uiElements.betLevel.value = gameState.balance < 500 ? 'low' : (gameState.balance < 1000 ? 'medium' : 'high');
            startGame();
        });

        uiElements.betLevel.addEventListener('change', updateStartModal);
        uiElements.difficulty.addEventListener('change', updateStartModal);

        uiElements.restartGameButton.addEventListener('click', () => {
            gameState.balance = 5000;
            gameState.streak = 0;
            updateView('startScreen');
            updateInfoBar();
        });

        uiElements.drawPile.addEventListener('click', () => {
            if (gameState.currentPlayer !== 'player') {
                showModernAlert('error', 'Tunggu giliran Anda!');
                return;
            }
            if (gameState.isAnimating) {
                showModernAlert('warning', 'Tunggu animasi selesai!');
                return;
            }
            drawCards(gameState.playerHand, 1);
        });

        document.querySelectorAll('.color-choice').forEach(button => {
            button.addEventListener('click', (e) => {
                const chosenColor = e.target.dataset.color;
                gameState.discardPile[gameState.discardPile.length - 1].color = chosenColor;
                updateView('gameScreen');
                const lastCard = gameState.discardPile[gameState.discardPile.length - 1];
                if (lastCard.value === 'wildDrawFour' || lastCard.value === 'drawTwo') {
                    switchTurn('player');
                } else {
                    switchTurn(getNextPlayer('player'));
                }
            });
        });

        uiElements.unoButton.addEventListener('click', () => {
            if (gameState.playerHand.length === 1 && gameState.playerUnoTimer && !gameState.isAnimating) {
                gameState.isPlayerUnoCalled = true;
                gameState.achievementCounts.unoCalls++;
                clearTimeout(gameState.playerUnoTimer);
                playSound('uno');
                uiElements.unoButton.classList.add('animate-pulse');
                setTimeout(() => uiElements.unoButton.classList.remove('animate-pulse'), 500);
                showModernAlert('success', "UNO! Dipanggil tepat waktu.");
                checkAchievements();
            }
        });

        uiElements.callUnoOnOpponentButton.addEventListener('click', () => {
            if (gameState.opponentHand.length === 1 && !gameState.opponentHasCalledUno && !gameState.isAnimating) {
                showModernAlert('success', "Berhasil! Lawan lupa UNO. +2 kartu penalti.");
                drawCards(gameState.opponentHand, 2);
                renderGame();
            } else if (gameState.opponentHand.length === 1 && gameState.opponentHasCalledUno) {
                showModernAlert('error', "Gagal! Lawan sudah panggil UNO.");
            }
            uiElements.callUnoOnOpponentButton.classList.add('hidden');
            clearTimeout(gameState.playerCallUnoTimer);
        });

        uiElements.alertClose.addEventListener('click', () => {
            uiElements.alertModal.classList.add('hidden');
            uiElements.alertModal.classList.remove('animate-fade-out', 'animate-fade-in');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && gameState.currentPlayer === 'player' && !gameState.isAnimating) {
                e.preventDefault();
                uiElements.drawPile.click();
            }
            if (e.code === 'KeyU' && !uiElements.unoButton.classList.contains('hidden')) {
                uiElements.unoButton.click();
            }
        });
    }

    function init() {
        loadGameData();
        uiElements.alertModal.classList.add('hidden');
        uiElements.alertModal.style.visibility = 'hidden';
        
        gameState.balance = 5000;
        gameState.streak = 0;
        gameState.isAnimating = false;
        
        initializeEventListeners();
        updateView('startScreen');
        updateInfoBar();
        updateStartModal();
        updateStatistics();
        
        console.log("🎮 UNO Game initialized successfully!");
    }

    // Start loading process
    initializeLoading();
});