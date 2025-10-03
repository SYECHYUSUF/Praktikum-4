document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // BAGIAN 1: SETUP DAN KONFIGURASI - DIPERBAIKI
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
        playMultipleButton: document.getElementById('play-multiple-button'),
        turnIndicator: document.getElementById('turn-indicator'),
        turnIndicatorBanner: document.getElementById('turn-indicator-banner'),
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
        sideNotification: document.getElementById('side-notification'),
        sideNotificationIcon: document.getElementById('side-notification-icon'),
        sideNotificationMessage: document.getElementById('side-notification-message'),
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

    // Audio Elements - DITAMBAHKAN SOUND BARU
    const sounds = {
        draw: document.getElementById('sound-draw'),
        play: document.getElementById('sound-play'),
        uno: document.getElementById('sound-uno'),
        win: document.getElementById('sound-win'),
        bg: document.getElementById('sound-bg'),
        gameover: document.getElementById('sound-gameover'),
        skip: document.getElementById('sound-skip'),
        shuffle: document.getElementById('sound-shuffle')
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
        // PERBAIKAN: Tambah state untuk multiple cards
        selectedCardsForMultiple: [],
        canPlayMultiple: false,
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
    // BAGIAN 2: LOADING SYSTEM & INITIALIZATION - DIPERBAIKI
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
    // BAGIAN 3: SOUND SYSTEM - DIPERBAIKI
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
    // BAGIAN 4: NOTIFICATION SYSTEM - BARU & DIPERBAIKI
    // =================================================================================

    function showSideNotification(message, type = 'info') {
        const iconMap = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        uiElements.sideNotificationIcon.textContent = iconMap[type] || 'ℹ️';
        uiElements.sideNotificationMessage.textContent = message;
        
        // Set background color based on type
        const colorMap = {
            info: 'bg-blue-600',
            success: 'bg-green-600',
            warning: 'bg-yellow-600',
            error: 'bg-red-600'
        };
        
        // Remove all color classes
        uiElements.sideNotification.classList.remove('bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-red-600');
        uiElements.sideNotification.classList.add(colorMap[type]);
        
        uiElements.sideNotification.classList.remove('hidden', 'animate-notification-slide');
        uiElements.sideNotification.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            uiElements.sideNotification.classList.add('animate-notification-slide');
            uiElements.sideNotification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto hide after animation
        setTimeout(() => {
            uiElements.sideNotification.classList.remove('animate-notification-slide');
            uiElements.sideNotification.classList.add('hidden');
        }, 3000);
    }

    // HAPUS ALERT MODAL YANG LAMA - PERBAIKAN BUG 1
    function showModernAlert(type, message) {
        // Gunakan side notification sebagai pengganti
        showSideNotification(message, type);
    }

    // =================================================================================
    // BAGIAN 5: ACHIEVEMENT SYSTEM - DIPERBAIKI
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
    // BAGIAN 6: STATISTICS & SAVE SYSTEM - DIPERBAIKI
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
    // BAGIAN 7: VIEW MANAGEMENT - DIPERBAIKI
    // =================================================================================

    function updateView(viewName) {
        uiElements.backgroundMedia.classList.add('hidden');
        uiElements.gameBackgroundMedia.classList.add('hidden');
        uiElements.gameContainer.classList.add('opacity-0');
        uiElements.startModal.classList.add('hidden');
        uiElements.gameOverModal.classList.add('hidden');
        uiElements.colorPickerModal.classList.add('hidden');
        
        // Reset turn indicator
        uiElements.turnIndicatorBanner.classList.add('hidden');

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
                playSound('gameover'); // PLAY SOUND GAME OVER
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
    // BAGIAN 8: CORE GAME LOGIC - PERBAIKAN UTAMA
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
        playSound('shuffle'); // PLAY SOUND SHUFFLE
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    // FUNGSI BARU: Animasi deal kartu yang lebih keren
    function animateCardDeal(card, target, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                const cardEl = createCardElement(card);
                cardEl.style.position = 'fixed';
                cardEl.style.zIndex = '1000';
                cardEl.style.transform = 'scale(0) rotate(-180deg)';
                cardEl.style.opacity = '0';
                
                const drawPileRect = uiElements.drawPile.getBoundingClientRect();
                cardEl.style.left = `${drawPileRect.left}px`;
                cardEl.style.top = `${drawPileRect.top}px`;
                
                document.body.appendChild(cardEl);
                
                const targetRect = target.getBoundingClientRect();
                
                setTimeout(() => {
                    cardEl.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    cardEl.style.left = `${targetRect.left + targetRect.width/2}px`;
                    cardEl.style.top = `${targetRect.top + targetRect.height/2}px`;
                    cardEl.style.transform = 'scale(1) rotate(0deg)';
                    cardEl.style.opacity = '1';
                }, 50);
                
                setTimeout(() => {
                    if (cardEl.parentNode) {
                        document.body.removeChild(cardEl);
                    }
                    resolve();
                }, 650);
            }, delay);
        });
    }

 async function startGame() {
    console.log("=== STARTING GAME ===");
    
    if (gameState.balance < 50) {
        showSideNotification('error', 'Saldo terlalu rendah! Mulai ulang dulu.');
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
        default: showSideNotification('error', 'Pilih level taruhan!'); return;
    }

    if (betAmount > gameState.balance) {
        betAmount = Math.max(50, gameState.balance);
        mult = 1;
        showSideNotification('warning', `All-in otomatis: $${betAmount}`);
    }

    if (betAmount < 50) {
        showSideNotification('error', 'Taruhan minimal $50!');
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
    gameState.selectedCardsForMultiple = [];
    gameState.canPlayMultiple = false;
    
    uiElements.callUnoOnOpponentButton.classList.add('hidden');
    uiElements.playMultipleButton.classList.add('hidden');
    
    // Update statistics
    gameState.stats.gamesPlayed++;
    
    console.log("Deck size after creation:", gameState.deck.length);
    
    // ANIMASI DEAL KARTU
    await dealInitialCardsWithAnimation();
    
    // Set first card
    let firstCard = getValidFirstCard();
    gameState.discardPile.push(firstCard);
    
    gameState.currentPlayer = 'player';
    uiElements.opponentLabel.textContent = mode === 'bot' ? 'Tangan Bot' : 'Tangan Player 2';
    
    // PERBAIKAN: Render dan update turn indicator
    setTimeout(() => {
        renderGame();
        updateTurnIndicator(); // Pastikan turn indicator muncul
        console.log("=== GAME STARTED ===");
        console.log("Player cards:", gameState.playerHand.length);
        console.log("Opponent cards:", gameState.opponentHand.length);
        console.log("First card:", gameState.discardPile[0]);
        console.log("Deck remaining:", gameState.deck.length);
        
        // PERBAIKAN: Show welcome message
        showSideNotification('success', 
            `Game dimulai! Kartu pertama: ${firstCard.color} ${firstCard.value}`
        );
    }, 500);
    
    saveGameData();
}
    // FUNGSI BARU: Deal kartu dengan animasi yang keren
    async function dealInitialCardsWithAnimation() {
        console.log("Dealing cards with animation...");
        
        // Clear hands first
        gameState.playerHand = [];
        gameState.opponentHand = [];
        
        const dealPromises = [];
        
        // Deal 7 kartu untuk setiap pemain dengan animasi
        for (let i = 0; i < 7; i++) {
            // Player card
            if (gameState.deck.length > 0) {
                const playerCard = gameState.deck.pop();
                gameState.playerHand.push(playerCard);
                dealPromises.push(
                    animateCardDeal(playerCard, uiElements.playerHand, i * 150)
                );
            }
            
            // Opponent card  
            if (gameState.deck.length > 0) {
                const opponentCard = gameState.deck.pop();
                gameState.opponentHand.push(opponentCard);
                dealPromises.push(
                    animateCardDeal({ back: true }, uiElements.opponentHand, i * 150 + 75)
                );
            }
        }
        
        // Tunggu semua animasi selesai
        await Promise.all(dealPromises);
        
        console.log("Dealing complete - Player:", gameState.playerHand.length, "Opponent:", gameState.opponentHand.length);
        
        // Render hands setelah animasi
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
    if (!topCard) return true;
    
    // PERBAIKAN: Handle wild cards yang sudah ada warna
    if (card.color === 'black') return true;
    
    // PERBAIKAN: Kartu bisa dimainkan jika warna ATAU nilai sama
    // termasuk setelah +2/+4, bisa main kartu warna yang sama
    const colorMatch = card.color === topCard.color;
    const valueMatch = card.value === topCard.value;
    
    // PERBAIKAN: Setelah kartu spesial (+2, +4), bisa main warna yang sama
    const isSpecialCard = ['drawTwo', 'wildDrawFour', 'skip', 'reverse'].includes(topCard.value);
    const canPlaySameColor = isSpecialCard && colorMatch;
    
    return colorMatch || valueMatch || canPlaySameColor;
}

    // FUNGSI BARU: Check untuk multiple cards dengan nilai sama
    function checkMultipleCardsPlayable() {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const playableCards = gameState.playerHand.filter(card => isCardPlayable(card, topCard));
        
        // Cari kartu dengan nilai yang sama yang bisa dimainkan bersamaan
        const valueGroups = {};
        playableCards.forEach(card => {
            if (!valueGroups[card.value]) {
                valueGroups[card.value] = [];
            }
            valueGroups[card.value].push(card);
        });
        
        // Cari grup yang memiliki lebih dari 1 kartu dengan nilai sama
        for (const [value, cards] of Object.entries(valueGroups)) {
            if (cards.length > 1) {
                return true;
            }
        }
        
        return false;
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
            }, drawnCards.length * 300 + 100);
        } else {
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
            }, index * 300);
        });
    }

    // PERBAIKAN: Animasi draw yang lebih smooth
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
            tempCard.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tempCard.style.left = `${handRect.left + handRect.width/2}px`;
            tempCard.style.top = `${handRect.top + handRect.height/2}px`;
            tempCard.style.transform = 'scale(0.1) rotate(360deg)';
            tempCard.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            if (tempCard.parentNode) {
                document.body.removeChild(tempCard);
            }
        }, 600);
        
        // Animasi draw pile yang lebih smooth
        uiElements.drawPile.classList.add('animate-smooth-draw');
        setTimeout(() => uiElements.drawPile.classList.remove('animate-smooth-draw'), 400);
    }

    function checkAutoPlayAfterDraw() {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const newCard = gameState.playerHand[gameState.playerHand.length - 1];
        
        if (!newCard || !isCardPlayable(newCard, topCard)) {
            setTimeout(() => {
                switchTurn(getNextPlayer('player'));
            }, 500);
        }
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
        showSideNotification('info', 'Deck diacak ulang!');
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
    let skipNextPlayer = false;
    
    switch (card.value) {
        case 'skip':
            playSound('skip');
            nextPlayer = getNextPlayer(nextPlayer);
            showSideNotification('info', `${playedBy === 'player' ? 'Anda' : 'Lawan'} skip giliran!`);
            break;
            
        case 'reverse':
            gameState.direction = gameState.direction === 'clockwise' ? 'counterclockwise' : 'clockwise';
            if (gameState.playerHand.length + gameState.opponentHand.length === 2) {
                // PERBAIKAN: Dalam 2 pemain, reverse berfungsi seperti skip
                nextPlayer = getNextPlayer(nextPlayer);
            } else {
                nextPlayer = playedBy;
            }
            showSideNotification('info', 'Arah permainan dibalik!');
            break;
            
        case 'drawTwo':
            const targetHandDrawTwo = playedBy === 'player' ? gameState.opponentHand : gameState.playerHand;
            drawCards(targetHandDrawTwo, 2, true);
            nextPlayer = getNextPlayer(nextPlayer);
            skipNextPlayer = true; // PERBAIKAN: Player yang kena +2 kehilangan giliran
            showSideNotification('warning', 
                `${playedBy === 'player' ? 'Lawan' : 'Anda'} dapat +2 kartu dan kehilangan giliran!`);
            break;
            
        case 'wild':
            if (playedBy === 'player') {
                updateView('colorPicker');
                return; // Jangan switch turn dulu, tunggu pilih warna
            } else {
                const chosenColor = getSmartColor(gameState.opponentHand, gameState.playerHand);
                gameState.discardPile[gameState.discardPile.length - 1].color = chosenColor;
                showSideNotification('info', `Bot memilih warna ${chosenColor}`);
            }
            break;
            
        case 'wildDrawFour':
            const targetHandWildFour = playedBy === 'player' ? gameState.opponentHand : gameState.playerHand;
            drawCards(targetHandWildFour, 4, true);
            nextPlayer = getNextPlayer(nextPlayer);
            skipNextPlayer = true; // PERBAIKAN: Player yang kena +4 kehilangan giliran
            
            if (playedBy === 'player') {
                updateView('colorPicker');
                return; // Jangan switch turn dulu, tunggu pilih warna
            } else {
                const chosenColor = getSmartColor(gameState.opponentHand, gameState.playerHand, true);
                gameState.discardPile[gameState.discardPile.length - 1].color = chosenColor;
                showSideNotification('warning', 
                    `Bot main Wild +4! Anda dapat 4 kartu, kehilangan giliran, dan warna berubah jadi ${chosenColor}`);
            }
            break;
    }
    
    // PERBAIKAN: Handle skip setelah effect
    if (skipNextPlayer) {
        // Player yang kena +2/+4 sudah kehilangan giliran, jadi langsung ke player berikutnya
        setTimeout(() => switchTurn(nextPlayer), 1000);
    } else {
        setTimeout(() => switchTurn(nextPlayer), 800);
    }
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
                    showSideNotification('info', 'Lawan punya 1 kartu! Panggil UNO!');
                }
            }

            setTimeout(() => handleCardEffect(card, 'opponent'), 600);
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

// PERBAIKAN: Update fungsi updateTurnIndicator di JavaScript
function updateTurnIndicator() {
    // PERBAIKAN: Pastikan banner selalu di tengah atas
    const banner = uiElements.turnIndicatorBanner;
    
    // Reset position dan styling
    banner.style.position = 'fixed';
    banner.style.top = '20px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.zIndex = '9999';
    
    if (gameState.currentPlayer === 'player') {
        // PERBAIKAN: Giliran player - warna hijau
        banner.classList.remove('hidden', 'opponent-turn');
        banner.classList.add('animate-turn-glow');
        
        // Styling untuk player
        banner.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        banner.style.border = '3px solid #047857';
        banner.style.color = 'white';
        banner.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.6)';
        
        banner.textContent = '🎮 GILIRAN ANDA!';
        
    } else {
        // PERBAIKAN: Giliran lawan - warna merah
        banner.classList.remove('hidden', 'animate-turn-glow');
        banner.classList.add('opponent-turn');
        
        // Styling untuk lawan
        banner.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        banner.style.border = '3px solid #b91c1c';
        banner.style.color = 'white';
        banner.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.6)';
        
        // Tentukan teks berdasarkan mode game
        const opponentText = gameState.gameMode === 'bot' ? '🤖 GILIRAN BOT' : '👤 GILIRAN PLAYER 2';
        banner.textContent = opponentText;
    }
    
    // PERBAIKAN: Show side notification juga untuk clarity
    showSideNotification('info', 
        gameState.currentPlayer === 'player' 
            ? '🎮 Sekarang giliran ANDA! Mainkan kartu atau draw.' 
            : (gameState.gameMode === 'bot' 
                ? '🤖 Sekarang giliran BOT. Tunggu sebentar...' 
                : '👤 Sekarang giliran PLAYER 2.')
    );
}
function switchTurn(nextPlayer) {
    gameState.currentPlayer = nextPlayer;
    clearTimeout(gameState.playerUnoTimer);
    clearTimeout(gameState.playerCallUnoTimer);
    
    // Reset multiple cards selection
    gameState.selectedCardsForMultiple = [];
    gameState.canPlayMultiple = false;
    uiElements.playMultipleButton.classList.add('hidden');
    
    // PERBAIKAN: Update turn indicator segera
    updateTurnIndicator();
    
    if (gameState.currentPlayer === 'opponent') {
        uiElements.callUnoOnOpponentButton.classList.add('hidden');
        renderGame();
        if (gameState.gameMode === 'bot') {
            const settings = getBotDifficultySettings();
            // PERBAIKAN: Tampilkan notifikasi thinking untuk bot
            showSideNotification('info', `Bot sedang berpikir (${gameState.difficulty})...`);
            setTimeout(opponentTurn, settings.thinkTime);
        }
    } else {
        renderGame();
        // PERBAIKAN: Check untuk multiple cards play hanya di giliran player
        if (checkMultipleCardsPlayable()) {
            gameState.canPlayMultiple = true;
            showSideNotification('info', '💡 Tips: Anda bisa mainkan beberapa kartu dengan nilai sama!');
        }
        
        // PERBAIKAN: Auto-show playable cards hint
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const playableCards = gameState.playerHand.filter(card => isCardPlayable(card, topCard));
        if (playableCards.length > 0) {
            showSideNotification('success', 
                `🎯 Anda punya ${playableCards.length} kartu yang bisa dimainkan`);
        } else {
            showSideNotification('warning', 
                'ℹ️ Tidak ada kartu yang bisa dimainkan. Klik draw pile untuk ambil kartu.');
        }
    }
    updateInfoBar();
}
    // FUNGSI BARU: Handle multiple cards play
    function toggleCardForMultiplePlay(cardIndex) {
        if (!gameState.canPlayMultiple || gameState.currentPlayer !== 'player') return;
        
        const card = gameState.playerHand[cardIndex];
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        
        if (!isCardPlayable(card, topCard)) return;
        
        const existingIndex = gameState.selectedCardsForMultiple.findIndex(
            selected => selected.index === cardIndex
        );
        
        if (existingIndex !== -1) {
            // Remove from selection
            gameState.selectedCardsForMultiple.splice(existingIndex, 1);
        } else {
            // Add to selection, but only if same value
            if (gameState.selectedCardsForMultiple.length === 0) {
                gameState.selectedCardsForMultiple.push({ index: cardIndex, value: card.value });
            } else if (gameState.selectedCardsForMultiple[0].value === card.value) {
                gameState.selectedCardsForMultiple.push({ index: cardIndex, value: card.value });
            } else {
                showSideNotification('warning', 'Hanya bisa pilih kartu dengan nilai yang sama!');
                return;
            }
        }
        
        // Show/hide play multiple button
        if (gameState.selectedCardsForMultiple.length > 1) {
            uiElements.playMultipleButton.classList.remove('hidden');
            uiElements.playMultipleButton.textContent = `Mainkan ${gameState.selectedCardsForMultiple.length} Kartu`;
        } else {
            uiElements.playMultipleButton.classList.add('hidden');
        }
        
        renderGame();
    }

    // FUNGSI BARU: Play multiple cards
    function playMultipleCards() {
        if (gameState.selectedCardsForMultiple.length < 2 || gameState.currentPlayer !== 'player') return;
        
        const cardsToPlay = [...gameState.selectedCardsForMultiple]
            .sort((a, b) => b.index - a.index) // Sort descending untuk menghindari index issues
            .map(selected => ({
                card: gameState.playerHand[selected.index],
                originalIndex: selected.index
            }));
        
        // Remove all selected cards from hand
        cardsToPlay.forEach(({ originalIndex }) => {
            gameState.playerHand.splice(originalIndex, 1);
        });
        
        // Add all cards to discard pile (mainkan kartu pertama saja, sisanya dibuang)
        const firstCard = cardsToPlay[0].card;
        gameState.discardPile.push(firstCard);
        
        // Animate all cards
        animateMultipleCardsPlay(cardsToPlay.map(item => item.card));
        
        playSound('play');
        
        if (gameState.playerHand.length === 1) {
            startPlayerUnoTimer();
        } else {
            clearTimeout(gameState.playerUnoTimer);
        }
        gameState.isPlayerUnoCalled = false;
        
        // Reset selection
        gameState.selectedCardsForMultiple = [];
        gameState.canPlayMultiple = false;
        uiElements.playMultipleButton.classList.add('hidden');
        
        showSideNotification('success', `Mainkan ${cardsToPlay.length} kartu ${firstCard.value}!`);
        
        setTimeout(() => {
            handleCardEffect(firstCard, 'player');
        }, 1000);
    }

function playerPlayCard(cardIndex) {
    if (gameState.currentPlayer !== 'player') {
        showSideNotification('error', 'Bukan giliran Anda!');
        return;
    }
    
    if (gameState.isAnimating) {
        showSideNotification('warning', 'Tunggu animasi selesai!');
        return;
    }

    // PERBAIKAN: Skip jika dalam mode multiple selection
    if (gameState.canPlayMultiple && gameState.selectedCardsForMultiple.length > 0) {
        toggleCardForMultiplePlay(cardIndex);
        return;
    }

    const card = gameState.playerHand[cardIndex];
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    
    // PERBAIKAN: Enhanced validation untuk Wild Draw Four
    if (card.value === 'wildDrawFour') {
        const hasOtherPlayableCard = gameState.playerHand.some((c, idx) => 
            idx !== cardIndex && c.value !== 'wildDrawFour' && isCardPlayable(c, topCard)
        );
        if (hasOtherPlayableCard) {
            showSideNotification('error', 'Tidak bisa main Wild +4 jika ada kartu valid lain!');
            return;
        }
    }

    // PERBAIKAN: Debug info untuk kartu yang tidak bisa dimainkan
    if (!isCardPlayable(card, topCard)) {
        console.log("Card validation failed:", {
            card: card,
            topCard: topCard,
            colorMatch: card.color === topCard.color,
            valueMatch: card.value === topCard.value,
            isSpecialCard: ['drawTwo', 'wildDrawFour', 'skip', 'reverse'].includes(topCard.value),
            canPlaySameColor: ['drawTwo', 'wildDrawFour', 'skip', 'reverse'].includes(topCard.value) && card.color === topCard.color
        });
        showSideNotification('error', `Kartu tidak valid! Harus ${topCard.color} atau ${topCard.value}`);
        return;
    }

    // PERBAIKAN: Jika valid, mainkan kartu
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
    }, 800);
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
                    showSideNotification('success', `Selamat! +$${winAmount} (Streak: ${gameState.streak})`);
                } else {
                    gameState.streak = 0;
                    showSideNotification('error', 'Lawan menang ronde ini.');
                }
                
                checkAchievements();
                saveGameData();
                
                if (gameState.balance <= 0) {
                    updateView('gameOverScreen');
                } else {
                    updateView('startScreen');
                }
                updateInfoBar();
            }, 1000);
            return true;
        }
        return false;
    }

    function startPlayerUnoTimer() {
        clearTimeout(gameState.playerUnoTimer);
        gameState.playerUnoTimer = setTimeout(() => {
            if (gameState.playerHand.length === 1 && !gameState.isPlayerUnoCalled) {
                showSideNotification('error', "Lupa UNO! +2 kartu penalti.");
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
        // PERBAIKAN: Animasi card play yang lebih smooth
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
            tempCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tempCard.style.left = `${discardRect.left + discardRect.width/2}px`;
            tempCard.style.top = `${discardRect.top + discardRect.height/2}px`;
            tempCard.style.transform = 'scale(1) rotate(5deg)';
        }, 50);
        
        setTimeout(() => {
            if (tempCard.parentNode) {
                document.body.removeChild(tempCard);
            }
            renderDiscardPile(); // Render ulang discard pile dengan animasi
        }, 700);
    }

    // FUNGSI BARU: Animasi multiple cards play
    function animateMultipleCardsPlay(cards) {
        cards.forEach((card, index) => {
            setTimeout(() => {
                const tempCard = createCardElement(card);
                tempCard.style.position = 'fixed';
                tempCard.style.zIndex = '1000';
                
                const handRect = uiElements.playerHand.getBoundingClientRect();
                tempCard.style.left = `${handRect.left + handRect.width/2}px`;
                tempCard.style.top = `${handRect.top + handRect.height/2}px`;
                tempCard.style.transform = 'scale(0.8)';
                
                document.body.appendChild(tempCard);
                
                const discardRect = uiElements.discardPile.getBoundingClientRect();
                const offsetX = (index - (cards.length - 1) / 2) * 20; // Spread effect
                
                setTimeout(() => {
                    tempCard.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    tempCard.style.left = `${discardRect.left + discardRect.width/2 + offsetX}px`;
                    tempCard.style.top = `${discardRect.top + discardRect.height/2}px`;
                    tempCard.style.transform = 'scale(1) rotate(5deg)';
                    tempCard.style.opacity = '0.7';
                }, 50);
                
                setTimeout(() => {
                    if (tempCard.parentNode) {
                        document.body.removeChild(tempCard);
                    }
                    if (index === cards.length - 1) {
                        renderDiscardPile();
                    }
                }, 600);
            }, index * 150);
        });
    }

    // =================================================================================
    // BAGIAN 9: RENDERING SYSTEM - PERBAIKAN UTAMA
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
            
            // PERBAIKAN: Check jika kartu ini dipilih untuk multiple play
            const isSelectedForMultiple = gameState.selectedCardsForMultiple.some(
                selected => selected.index === index
            );
            
            if (visible) {
                const topCard = gameState.discardPile[gameState.discardPile.length - 1];
                const isPlayable = topCard && isCardPlayable(card, topCard) && 
                                 gameState.currentPlayer === 'player' && 
                                 !gameState.isAnimating;
                
                if (isPlayable) {
                    cardEl.classList.add('playable-card');
                    cardEl.style.cursor = 'pointer';
                    
                    if (gameState.canPlayMultiple) {
                        // Jika bisa main multiple, gunakan toggle selection
                        cardEl.addEventListener('click', () => toggleCardForMultiplePlay(index));
                        
                        if (isSelectedForMultiple) {
                            cardEl.classList.add('multiple-card-option', 'animate-multiple-glow');
                        }
                    } else {
                        // Normal single card play
                        cardEl.addEventListener('click', () => playerPlayCard(index));
                    }
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

    // PERBAIKAN: Render discard pile dengan animasi
    function renderDiscardPile() {
        uiElements.discardPile.innerHTML = '';
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        
        if (topCard) {
            const cardEl = createCardElement(topCard);
            cardEl.classList.add('shadow-lg', 'animate-discard-pop');
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
        uiElements.multiplier.textContent = gameState.multiplier;
        uiElements.streak.textContent = gameState.streak;
        uiElements.modalBalance.textContent = gameState.balance;
    }

    function toggleUnoButton() {
    const isVisible = gameState.playerHand.length === 1 && 
                     gameState.currentPlayer === 'player' && 
                     !gameState.isAnimating &&
                     !gameState.isPlayerUnoCalled;
    
    // PERBAIKAN: Force show/hide dengan better styling
    if (isVisible) {
        uiElements.unoButton.classList.remove('hidden');
        uiElements.unoButton.style.display = 'block';
        uiElements.unoButton.style.visibility = 'visible';
        uiElements.unoButton.style.opacity = '1';
        uiElements.unoButton.classList.add('animate-pulse');
        
        // PERBAIKAN: Auto-position di mobile
        if (window.innerWidth < 768) {
            uiElements.unoButton.style.position = 'fixed';
            uiElements.unoButton.style.bottom = '80px';
            uiElements.unoButton.style.left = '50%';
            uiElements.unoButton.style.transform = 'translateX(-50%)';
            uiElements.unoButton.style.zIndex = '1000';
        }
    } else {
        uiElements.unoButton.classList.add('hidden');
        uiElements.unoButton.classList.remove('animate-pulse');
    }
}

    function createCardElement(card) {
        const cardClasses = "w-16 sm:w-20 md:w-24 lg:w-28 h-22 sm:h-28 md:h-36 lg:h-40 rounded-lg shadow-md transition-all duration-300 will-change-transform";
        const imgEl = document.createElement('img');
        imgEl.className = cardClasses;
        
        // PERBAIKAN: Better error handling untuk images
        imgEl.onerror = function() {
            console.warn(`Failed to load card image: ${this.src}`);
            // Fallback ke div dengan warna
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = cardClasses + ' flex items-center justify-center text-white font-bold text-xs';
            
            if (card.back) {
                fallbackDiv.className += ' bg-gray-700';
                fallbackDiv.textContent = 'UNO';
            } else {
                const colorClass = card.color === 'black' ? 'bg-gray-800' : 
                                 card.color === 'red' ? 'bg-red-500' :
                                 card.color === 'green' ? 'bg-green-500' :
                                 card.color === 'blue' ? 'bg-blue-500' : 'bg-yellow-400';
                fallbackDiv.className += ' ' + colorClass;
                fallbackDiv.textContent = card.value;
            }
            
            imgEl.replaceWith(fallbackDiv);
            return fallbackDiv;
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
    // BAGIAN 10: EVENT LISTENERS & INITIALIZATION - DIPERBAIKI
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
                showSideNotification('error', 'Tunggu giliran Anda!');
                return;
            }
            if (gameState.isAnimating) {
                showSideNotification('warning', 'Tunggu animasi selesai!');
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
                showSideNotification('info', `Anda memilih warna ${chosenColor}`);
                
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
                showSideNotification('success', "UNO! Dipanggil tepat waktu.");
                checkAchievements();
            }
        });

        uiElements.callUnoOnOpponentButton.addEventListener('click', () => {
            if (gameState.opponentHand.length === 1 && !gameState.opponentHasCalledUno && !gameState.isAnimating) {
                showSideNotification('success', "Berhasil! Lawan lupa UNO. +2 kartu penalti.");
                drawCards(gameState.opponentHand, 2);
                renderGame();
            } else if (gameState.opponentHand.length === 1 && gameState.opponentHasCalledUno) {
                showSideNotification('error', "Gagal! Lawan sudah panggil UNO.");
            }
            uiElements.callUnoOnOpponentButton.classList.add('hidden');
            clearTimeout(gameState.playerCallUnoTimer);
        });

        // FUNGSI BARU: Event listener untuk play multiple button
        uiElements.playMultipleButton.addEventListener('click', playMultipleCards);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && gameState.currentPlayer === 'player' && !gameState.isAnimating) {
                e.preventDefault();
                uiElements.drawPile.click();
            }
            if (e.code === 'KeyU' && !uiElements.unoButton.classList.contains('hidden')) {
                uiElements.unoButton.click();
            }
            if (e.code === 'KeyM' && !uiElements.playMultipleButton.classList.contains('hidden')) {
                uiElements.playMultipleButton.click();
            }
        });

        // PERBAIKAN: Responsive touch events untuk mobile
        document.addEventListener('touchstart', function() {}, {passive: true});
    }

    function init() {
        loadGameData();
        
        // PERBAIKAN: Hapus alert modal yang problematic
        const oldAlertModal = document.getElementById('alert-modal');
        if (oldAlertModal) {
            oldAlertModal.remove();
        }
        
        gameState.balance = 5000;
        gameState.streak = 0;
        gameState.isAnimating = false;
        
        initializeEventListeners();
        updateView('startScreen');
        updateInfoBar();
        updateStartModal();
        updateStatistics();
        
        console.log("🎮 UNO Game initialized successfully!");
        console.log("🆕 Fitur baru: Multiple Cards Play, Side Notifications, Enhanced Animations!");
    }

    // Start loading process
    initializeLoading();
});

// PERBAIKAN: Debug function untuk testing
function debugGameState() {
    console.log("=== DEBUG GAME STATE ===");
    console.log("Current Player:", gameState.currentPlayer);
    console.log("Player Hand:", gameState.playerHand);
    console.log("Opponent Hand:", gameState.opponentHand.length, "cards");
    
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    console.log("Top Card:", topCard);
    
    // Check playable cards
    const playableCards = gameState.playerHand.filter(card => 
        isCardPlayable(card, topCard)
    );
    console.log("Playable Cards:", playableCards);
    
    showSideNotification('info', 
        `Debug: ${playableCards.length} kartu bisa dimainkan dari ${gameState.playerHand.length} kartu`
    );
}

// Tambahkan event listener untuk debug (hapus di production)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD' && e.ctrlKey) {
        e.preventDefault();
        debugGameState();
    }
});

function opponentTurn() {
    if (gameState.gameMode === 'player2') return;
    
    // PERBAIKAN: Tampilkan notifikasi bahwa bot sedang berpikir
    showSideNotification('info', `🤖 Bot (${gameState.difficulty}) sedang berpikir...`);
    
    const settings = getBotDifficultySettings();
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const playableCards = gameState.opponentHand.filter(card => isCardPlayable(card, topCard));
    
    if (playableCards.length === 0) {
        // Bot harus draw kartu
        showSideNotification('info', 'Bot mengambil kartu...');
        drawCards(gameState.opponentHand, 1);
        setTimeout(() => {
            const newCard = gameState.opponentHand[gameState.opponentHand.length - 1];
            if (newCard && isCardPlayable(newCard, topCard)) {
                const cardIndex = gameState.opponentHand.length - 1;
                const card = gameState.opponentHand.splice(cardIndex, 1)[0];
                gameState.discardPile.push(card);
                animateCardPlay(card, 'opponent');
                showSideNotification('info', `Bot main kartu: ${card.color} ${card.value}`);
                handleCardEffect(card, 'opponent');
            } else {
                showSideNotification('info', 'Bot tidak bisa main kartu, giliran kembali ke Anda');
                switchTurn('player');
            }
        }, settings.thinkTime);
        return;
    }
    
    // Bot punya kartu yang bisa dimainkan
    const cardToPlay = selectBestCardToPlay(playableCards, gameState.opponentHand, settings);
    const cardIndex = gameState.opponentHand.findIndex(card => 
        card.color === cardToPlay.color && card.value === cardToPlay.value
    );
    
    if (cardIndex !== -1) {
        const card = gameState.opponentHand.splice(cardIndex, 1)[0];
        gameState.discardPile.push(card);
        animateCardPlay(card, 'opponent');
        
        // PERBAIKAN: Tampilkan notifikasi kartu yang dimainkan bot
        showSideNotification('info', `Bot main: ${card.color} ${card.value}`);

        if (gameState.opponentHand.length === 1) {
            const settings = getBotDifficultySettings();
            gameState.opponentHasCalledUno = Math.random() < settings.unoCallChance;
            if (!gameState.opponentHasCalledUno) {
                startPlayerCallUnoTimer();
                showSideNotification('warning', '⚠️ Lawan punya 1 kartu! Panggil UNO sekarang!');
            } else {
                showSideNotification('info', 'Bot memanggil UNO!');
            }
        }

        setTimeout(() => handleCardEffect(card, 'opponent'), 600);
    }
}