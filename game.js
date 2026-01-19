// JUNGLE QUEST 2026 - HTML5 Game Engine
class JungleQuest {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.loadingFill = document.getElementById('loading-fill');
        this.loadingStatus = document.getElementById('loading-status');
        
        // Game state
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            bananas: 0,
            keys: 0,
            quantumEnergy: 100,
            timeline: 2026,
            player: {
                x: 50,
                y: 300,
                width: 20,
                height: 40,
                velocityX: 0,
                velocityY: 0,
                jumping: false,
                direction: 1
            },
            currentScreen: 'menu'
        };
        
        // Game objects
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.quantumObjects = [];
        
        // Graphics
        this.sprites = {};
        this.backgrounds = {};
        
        // Controls
        this.keys = {};
        this.mobileTouches = {};
        
        // Game loop
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Update loading status
        this.updateLoading('Loading graphics...', 20);
        
        // Load sprites
        await this.loadSprites();
        
        this.updateLoading('Initializing game engine...', 40);
        
        // Load saved game
        this.loadGame();
        
        this.updateLoading('Setting up levels...', 60);
        
        // Initialize first level
        this.initLevel(1);
        
        this.updateLoading('Finalizing quantum systems...', 80);
        
        // Setup controls
        this.setupControls();
        
        this.updateLoading('Ready to play!', 100);
        
        // Hide loading, show menu
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('main-menu').style.display = 'flex';
        }, 500);
        
        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    updateLoading(text, percent) {
        this.loadingStatus.textContent = text;
        this.loadingFill.style.width = `${percent}%`;
    }
    
    async loadSprites() {
        // Create player sprite
        const playerCanvas = document.createElement('canvas');
        playerCanvas.width = 20;
        playerCanvas.height = 40;
        const pCtx = playerCanvas.getContext('2d');
        
        // Draw player (simple character)
        pCtx.fillStyle = '#0ff';
        pCtx.fillRect(0, 0, 20, 40); // Body
        pCtx.fillStyle = '#ff0';
        pCtx.fillRect(5, 5, 10, 10); // Head
        pCtx.fillStyle = '#0f0';
        pCtx.fillRect(2, 15, 16, 20); // Shirt
        
        this.sprites.player = playerCanvas;
        
        // Create platform sprite
        const platformCanvas = document.createElement('canvas');
        platformCanvas.width = 64;
        platformCanvas.height = 16;
        const plCtx = platformCanvas.getContext('2d');
        
        plCtx.fillStyle = '#8B4513';
        plCtx.fillRect(0, 0, 64, 16);
        plCtx.fillStyle = '#654321';
        for(let i = 0; i < 64; i += 4) {
            plCtx.fillRect(i, 0, 2, 16);
        }
        
        this.sprites.platform = platformCanvas;
        
        // Create banana sprite
        const bananaCanvas = document.createElement('canvas');
        bananaCanvas.width = 16;
        bananaCanvas.height = 16;
        const bCtx = bananaCanvas.getContext('2d');
        
        bCtx.fillStyle = '#ff0';
        bCtx.beginPath();
        bCtx.ellipse(8, 8, 8, 4, Math.PI/4, 0, Math.PI * 2);
        bCtx.fill();
        bCtx.strokeStyle = '#ff8000';
        bCtx.lineWidth = 2;
        bCtx.stroke();
        
        this.sprites.banana = bananaCanvas;
        
        // Create enemy sprite
        const enemyCanvas = document.createElement('canvas');
        enemyCanvas.width = 24;
        enemyCanvas.height = 32;
        const eCtx = enemyCanvas.getContext('2d');
        
        eCtx.fillStyle = '#f00';
        eCtx.fillRect(0, 0, 24, 32);
        eCtx.fillStyle = '#000';
        eCtx.fillRect(4, 8, 4, 4);
        eCtx.fillRect(16, 8, 4, 4);
        
        this.sprites.enemy = enemyCanvas;
    }
    
    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Menu navigation
            if (this.gameState.currentScreen === 'menu') {
                if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                    this.navigateMenu(e.code === 'ArrowDown' ? 1 : -1);
                }
                if (e.code === 'Enter') {
                    this.selectMenuOption();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mobile controls
        const mobileBtns = document.querySelectorAll('.mobile-btn');
        mobileBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const key = btn.dataset.key;
                this.mobileTouches[key] = true;
                this.keys[key] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const key = btn.dataset.key;
                this.mobileTouches[key] = false;
                this.keys[key] = false;
            });
        });
        
        // Menu option clicks
        const menuOptions = document.querySelectorAll('.menu-option');
        menuOptions.forEach(option => {
            option.addEventListener('click', () => {
                const action = option.dataset.action;
                this.handleMenuAction(action);
            });
        });
    }
    
    navigateMenu(direction) {
        const options = document.querySelectorAll('.menu-option');
        let currentIndex = 0;
        
        options.forEach((option, index) => {
            if (option.classList.contains('selected')) {
                currentIndex = index;
                option.classList.remove('selected');
            }
        });
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = options.length - 1;
        if (newIndex >= options.length) newIndex = 0;
        
        options[newIndex].classList.add('selected');
    }
    
    selectMenuOption() {
        const selected = document.querySelector('.menu-option.selected');
        if (selected) {
            this.handleMenuAction(selected.dataset.action);
        }
    }
    
    handleMenuAction(action) {
        switch(action) {
            case 'new-game':
                this.startNewGame();
                break;
            case 'continue':
                this.continueGame();
                break;
            case 'level-select':
                this.showLevelSelect();
                break;
            case 'options':
                this.showOptions();
                break;
            case 'credits':
                this.showCredits();
                break;
        }
    }
    
    startNewGame() {
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            bananas: 0,
            keys: 0,
            quantumEnergy: 100,
            timeline: 2026,
            player: {
                x: 50,
                y: 300,
                width: 20,
                height: 40,
                velocityX: 0,
                velocityY: 0,
                jumping: false,
                direction: 1
            },
            currentScreen: 'playing'
        };
        
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        
        this.initLevel(1);
        this.saveGame();
    }
    
    continueGame() {
        if (this.loadGame()) {
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            this.gameState.currentScreen = 'playing';
            this.initLevel(this.gameState.level);
        } else {
            alert('No saved game found! Starting new game.');
            this.startNewGame();
        }
    }
    
    showLevelSelect() {
        // Create level select screen
        const menu = document.getElementById('main-menu');
        menu.innerHTML = `
            <div class="menu-title">SELECT LEVEL</div>
            <div class="menu-option" data-level="1">LEVEL 1 - VINE CANYON</div>
            <div class="menu-option" data-level="2">LEVEL 2 - QUANTUM TEMPLE</div>
            <div class="menu-option" data-level="3">LEVEL 3 - BOSS BATTLE</div>
            <div class="menu-option" data-level="4">LEVEL 4 - FUTURE JUNGLE</div>
            <div class="menu-option" data-action="back">BACK TO MENU</div>
        `;
        
        // Reattach event listeners
        setTimeout(() => {
            const options = document.querySelectorAll('.menu-option');
            options.forEach(option => {
                if (option.dataset.level) {
                    option.addEventListener('click', () => {
                        this.gameState.level = parseInt(option.dataset.level);
                        this.startNewGame();
                    });
                } else if (option.dataset.action === 'back') {
                    option.addEventListener('click', () => {
                        location.reload(); // Reload to show main menu
                    });
                }
            });
        }, 100);
    }
    
    showOptions() {
        const menu = document.getElementById('main-menu');
        menu.innerHTML = `
            <div class="menu-title">OPTIONS</div>
            <div class="menu-option" onclick="toggleSound()">SOUND: ON</div>
            <div class="menu-option" onclick="toggleCRT()">CRT EFFECT: ON</div>
            <div class="menu-option" onclick="toggleMobile()">MOBILE CONTROLS: ON</div>
            <div class="menu-option" data-action="back">BACK TO MENU</div>
        `;
        
        setTimeout(() => {
            document.querySelector('.menu-option[data-action="back"]').addEventListener('click', () => {
                location.reload();
            });
        }, 100);
    }
    
    showCredits() {
        const menu = document.getElementById('main-menu');
        menu.innerHTML = `
            <div class="menu-title">CREDITS</div>
            <div style="color: #0ff; text-align: center; margin: 20px; max-width: 600px;">
                <p>JUNGLE QUEST 2026 - HTML5 EDITION</p>
                <p>Developed with Quantum JavaScript</p>
                <p>Inspired by classic MS-DOS games</p>
                <p>© 2026 Digital Archaeology Labs</p>
                <br>
                <p>Press any key to return...</p>
            </div>
        `;
        
        setTimeout(() => {
            window.addEventListener('keydown', () => {
                location.reload();
            });
        }, 100);
    }
    
    showMenu() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
        this.gameState.currentScreen = 'menu';
    }
    
    initLevel(level) {
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.quantumObjects = [];
        
        // Reset player position
        this.gameState.player.x = 50;
        this.gameState.player.y = 300;
        this.gameState.player.velocityX = 0;
        this.gameState.player.velocityY = 0;
        this.gameState.player.jumping = false;
        
        switch(level) {
            case 1: // Vine Canyon
                this.initLevel1();
                break;
            case 2: // Quantum Temple
                this.initLevel2();
                break;
            case 3: // Boss Battle
                this.initBossLevel();
                break;
            case 4: // Future Jungle
                this.initLevel4();
                break;
        }
        
        // Update UI
        this.updateUI();
    }
    
    initLevel1() {
        // Ground platform
        this.platforms.push({x: 0, y: 380, width: 640, height: 20});
        
        // Floating platforms
        for(let i = 0; i < 5; i++) {
            this.platforms.push({
                x: 100 + i * 100,
                y: 300 - i * 40,
                width: 80,
                height: 16
            });
        }
        
        // Bananas
        for(let i = 0; i < 10; i++) {
            this.collectibles.push({
                x: 120 + i * 50,
                y: 260,
                type: 'banana',
                collected: false
            });
        }
        
        // Keys
        for(let i = 0; i < 3; i++) {
            this.collectibles.push({
                x: 200 + i * 120,
                y: 200,
                type: 'key',
                collected: false
            });
        }
        
        // Enemies
        this.enemies.push({
            x: 300,
            y: 340,
            width: 24,
            height: 32,
            velocityX: 2,
            direction: 1,
            type: 'bandit'
        });
        
        this.enemies.push({
            x: 500,
            y: 280,
            width: 24,
            height: 32,
            velocityX: 1.5,
            direction: -1,
            type: 'bandit'
        });
    }
    
    initLevel2() {
        // Quantum platforms (floating)
        for(let i = 0; i < 8; i++) {
            this.platforms.push({
                x: i * 80,
                y: 350 - Math.sin(i) * 50,
                width: 70,
                height: 16,
                quantum: true,
                phase: i * 0.5
            });
        }
        
        // Quantum fragments
        for(let i = 0; i < 8; i++) {
            this.collectibles.push({
                x: 50 + i * 70,
                y: 300,
                type: 'quantum',
                collected: false,
                glow: 0
            });
        }
        
        // Temporal glitches (enemies)
        for(let i = 0; i < 3; i++) {
            this.enemies.push({
                x: 150 + i * 150,
                y: 200 + Math.sin(i) * 50,
                width: 32,
                height: 32,
                velocityX: Math.sin(i) * 2,
                velocityY: Math.cos(i) * 1,
                type: 'glitch',
                phase: 0
            });
        }
    }
    
    initBossLevel() {
        // Boss platform
        this.platforms.push({x: 0, y: 380, width: 640, height: 20});
        
        // Boss object
        this.enemies.push({
            x: 320,
            y: 100,
            width: 80,
            height: 80,
            health: 100,
            maxHealth: 100,
            phase: 1,
            attackTimer: 0,
            type: 'boss'
        });
    }
    
    initLevel4() {
        // Future platforms (floating with gaps)
        for(let i = 0; i < 10; i++) {
            this.platforms.push({
                x: i * 65,
                y: 350 - (i % 3) * 60,
                width: 60,
                height: 16,
                holographic: true,
                alpha: 0.8
            });
        }
        
        // Holo-keys
        for(let i = 0; i < 6; i++) {
            this.collectibles.push({
                x: 80 + i * 80,
                y: 320 - (i % 2) * 40,
                type: 'holo',
                collected: false,
                pulse: 0
            });
        }
        
        // AI Drones
        for(let i = 0; i < 4; i++) {
            this.enemies.push({
                x: 100 + i * 120,
                y: 150 + Math.sin(i) * 40,
                width: 28,
                height: 28,
                velocityX: Math.cos(i) * 1.5,
                velocityY: Math.sin(i) * 1.5,
                type: 'drone'
            });
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('lives').textContent = this.gameState.lives;
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('bananas').textContent = this.gameState.bananas;
        document.getElementById('keys').textContent = this.gameState.keys;
    }
    
    handleInput() {
        const player = this.gameState.player;
        const GRAVITY = 0.5;
        const JUMP_FORCE = -12;
        const MOVE_SPEED = 5;
        
        // Apply gravity
        player.velocityY += GRAVITY;
        
        // Handle movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            player.velocityX = -MOVE_SPEED;
            player.direction = -1;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            player.velocityX = MOVE_SPEED;
            player.direction = 1;
        } else {
            player.velocityX *= 0.8; // Friction
        }
        
        // Jump
        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && !player.jumping) {
            player.velocityY = JUMP_FORCE;
            player.jumping = true;
            this.playSound('jump');
        }
        
        // Update position
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // Screen bounds
        if (player.x < 0) player.x = 0;
        if (player.x > this.canvas.width - player.width) player.x = this.canvas.width - player.width;
        if (player.y > this.canvas.height - player.height) {
            player.y = this.canvas.height - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
        
        // Quantum abilities
        if (this.keys['Digit1'] && this.gameState.quantumEnergy >= 20) {
            this.quantumScan();
            this.gameState.quantumEnergy -= 20;
        }
        
        if (this.keys['Digit2'] && this.gameState.quantumEnergy >= 30) {
            this.timeJump();
            this.gameState.quantumEnergy -= 30;
        }
        
        if (this.keys['Digit3'] && this.gameState.quantumEnergy >= 40) {
            this.quantumEntangle();
            this.gameState.quantumEnergy -= 40;
        }
        
        // Recharge quantum energy
        this.gameState.quantumEnergy = Math.min(100, this.gameState.quantumEnergy + 0.1);
    }
    
    quantumScan() {
        // Highlight collectibles
        this.collectibles.forEach(item => {
            if (!item.collected) {
                item.highlighted = true;
                setTimeout(() => {
                    item.highlighted = false;
                }, 1000);
            }
        });
    }
    
    timeJump() {
        // Switch timeline
        const timelines = [1994, 2026, 2048];
        let currentIndex = timelines.indexOf(this.gameState.timeline);
        this.gameState.timeline = timelines[(currentIndex + 1) % timelines.length];
    }
    
    quantumEntangle() {
        // Link collectibles for bonus
        let uncollected = this.collectibles.filter(item => !item.collected);
        if (uncollected.length >= 2) {
            this.gameState.score += 200;
            this.updateUI();
        }
    }
    
    checkCollisions() {
        const player = this.gameState.player;
        
        // Platform collisions
        this.platforms.forEach(platform => {
            if (this.rectCollision(player, platform)) {
                if (player.velocityY > 0 && player.y + player.height > platform.y && player.y < platform.y) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.jumping = false;
                }
            }
        });
        
        // Collectible collisions
        this.collectibles.forEach((item, index) => {
            if (!item.collected && this.rectCollision(player, item)) {
                item.collected = true;
                
                switch(item.type) {
                    case 'banana':
                        this.gameState.bananas++;
                        this.gameState.score += 10;
                        break;
                    case 'key':
                        this.gameState.keys++;
                        this.gameState.score += 100;
                        break;
                    case 'quantum':
                        this.gameState.score += 50;
                        break;
                    case 'holo':
                        this.gameState.score += 75;
                        break;
                }
                
                this.playSound('collect');
                this.updateUI();
                
                // Check level completion
                if (this.gameState.level === 1 && this.gameState.keys >= 3) {
                    setTimeout(() => this.completeLevel(), 1000);
                }
            }
        });
        
        // Enemy collisions
        this.enemies.forEach((enemy, index) => {
            if (this.rectCollision(player, enemy)) {
                this.gameState.lives--;
                this.updateUI();
                this.playSound('hit');
                
                // Knockback
                player.velocityY = -8;
                player.velocityX = enemy.direction * 10;
                
                if (this.gameState.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Boss collisions and attacks
        if (this.gameState.level === 3) {
            const boss = this.enemies[0];
            if (boss && this.rectCollision(player, {x: boss.x, y: boss.y + 50, width: boss.width, height: 30})) {
                // Boss stomp attack
                this.gameState.lives -= 20;
                this.updateUI();
                player.velocityY = -15;
                
                if (this.gameState.lives <= 0) {
                    this.gameOver();
                }
            }
            
            // Boss projectile attacks
            boss.attackTimer += this.deltaTime;
            if (boss.attackTimer > 2000) { // Every 2 seconds
                boss.attackTimer = 0;
                this.enemies.push({
                    x: boss.x + boss.width/2,
                    y: boss.y + boss.height,
                    width: 10,
                    height: 10,
                    velocityY: 5,
                    type: 'bossProjectile'
                });
            }
        }
        
        // Projectile collisions
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.type === 'bossProjectile' && this.rectCollision(player, enemy)) {
                this.gameState.lives -= 10;
                this.updateUI();
                this.playSound('hit');
                return false; // Remove projectile
            }
            return true;
        });
    }
    
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // Move enemies based on type
            switch(enemy.type) {
                case 'bandit':
                    enemy.x += enemy.velocityX;
                    if (enemy.x < 100 || enemy.x > 500) {
                        enemy.velocityX *= -1;
                        enemy.direction *= -1;
                    }
                    break;
                    
                case 'glitch':
                    enemy.x += enemy.velocityX;
                    enemy.y += enemy.velocityY;
                    enemy.phase += 0.1;
                    
                    // Bounce off screen edges
                    if (enemy.x < 50 || enemy.x > 550) enemy.velocityX *= -1;
                    if (enemy.y < 50 || enemy.y > 350) enemy.velocityY *= -1;
                    
                    // Phase through platforms (quantum effect)
                    enemy.alpha = 0.5 + Math.sin(enemy.phase) * 0.5;
                    break;
                    
                case 'drone':
                    enemy.x += enemy.velocityX;
                    enemy.y += enemy.velocityY;
                    
                    // Bounce in a larger area
                    if (enemy.x < 0 || enemy.x > 600) enemy.velocityX *= -1;
                    if (enemy.y < 0 || enemy.y > 300) enemy.velocityY *= -1;
                    break;
                    
                case 'bossProjectile':
                    enemy.y += enemy.velocityY;
                    if (enemy.y > this.canvas.height) {
                        return false; // Mark for removal
                    }
                    break;
                    
                case 'boss':
                    // Boss movement pattern
                    enemy.x += Math.sin(Date.now() / 1000) * 2;
                    enemy.phase += 0.01;
                    
                    // Boss phases based on health
                    if (enemy.health < 33) {
                        enemy.phase = 3;
                    } else if (enemy.health < 66) {
                        enemy.phase = 2;
                    }
                    break;
            }
            
            return true;
        });
    }
    
    updateCollectibles() {
        // Update quantum effects
        this.collectibles.forEach(item => {
            if (item.glow !== undefined) item.glow += 0.1;
            if (item.pulse !== undefined) item.pulse += 0.05;
        });
        
        // Update quantum platforms
        this.platforms.forEach(platform => {
            if (platform.quantum) {
                platform.phase += 0.02;
                platform.y = 350 - Math.sin(platform.phase) * 50;
            }
        });
    }
    
    playSound(type) {
        // Simple beep sounds using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'jump':
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    break;
                case 'collect':
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    break;
                case 'hit':
                    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
            }
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }
    
    draw() {
        const ctx = this.ctx;
        const player = this.gameState.player;
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background based on timeline
        this.drawBackground();
        
        // Draw platforms
        this.platforms.forEach(platform => {
            if (platform.quantum) {
                // Quantum platforms (glowing)
                ctx.globalAlpha = 0.7 + Math.sin(platform.phase) * 0.3;
                ctx.fillStyle = '#0ff';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.globalAlpha = 1;
            } else if (platform.holographic) {
                // Holographic platforms
                ctx.globalAlpha = platform.alpha || 0.8;
                ctx.fillStyle = '#00ff80';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.globalAlpha = 1;
            } else {
                // Normal platforms
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        });
        
        // Draw collectibles
        this.collectibles.forEach(item => {
            if (!item.collected) {
                if (item.highlighted) {
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#ff0';
                }
                
                switch(item.type) {
                    case 'banana':
                        ctx.fillStyle = '#ff0';
                        ctx.beginPath();
                        ctx.ellipse(item.x + 8, item.y + 8, 8, 4, Math.PI/4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#ff8000';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        break;
                        
                    case 'key':
                        ctx.fillStyle = '#ff8000';
                        ctx.fillRect(item.x, item.y, 10, 20);
                        ctx.fillRect(item.x - 5, item.y + 15, 20, 5);
                        break;
                        
                    case 'quantum':
                        const glow = Math.sin(item.glow || 0) * 10;
                        ctx.fillStyle = '#0ff';
                        ctx.beginPath();
                        ctx.arc(item.x + 8, item.y + 8, 8 + glow, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'holo':
                        const pulse = Math.sin(item.pulse || 0) * 5;
                        ctx.fillStyle = '#00ff80';
                        ctx.fillRect(item.x, item.y, 12 + pulse, 12 + pulse);
                        break;
                }
                
                ctx.shadowBlur = 0;
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            ctx.save();
            
            if (enemy.type === 'glitch') {
                ctx.globalAlpha = enemy.alpha || 1;
            }
            
            switch(enemy.type) {
                case 'bandit':
                    ctx.fillStyle = '#f00';
                    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(enemy.x + 4, enemy.y + 8, 4, 4);
                    ctx.fillRect(enemy.x + 16, enemy.y + 8, 4, 4);
                    break;
                    
                case 'glitch':
                    ctx.fillStyle = '#f0f';
                    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    break;
                    
                case 'drone':
                    ctx.fillStyle = '#00ff80';
                    ctx.beginPath();
                    ctx.arc(enemy.x + 14, enemy.y + 14, 14, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'boss':
                    // Draw boss
                    ctx.fillStyle = '#ff0';
                    ctx.beginPath();
                    ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw boss health bar
                    ctx.fillStyle = '#f00';
                    ctx.fillRect(enemy.x, enemy.y - 20, enemy.width, 5);
                    ctx.fillStyle = '#0f0';
                    ctx.fillRect(enemy.x, enemy.y - 20, enemy.width * (enemy.health / enemy.maxHealth), 5);
                    break;
                    
                case 'bossProjectile':
                    ctx.fillStyle = '#ff0';
                    ctx.beginPath();
                    ctx.arc(enemy.x, enemy.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        });
        
        // Draw player
        ctx.save();
        if (player.direction === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-this.canvas.width, 0);
            ctx.drawImage(this.sprites.player, this.canvas.width - player.x - player.width, player.y);
        } else {
            ctx.drawImage(this.sprites.player, player.x, player.y);
        }
        ctx.restore();
        
        // Draw timeline indicator
        ctx.fillStyle = '#0ff';
        ctx.font = '16px Courier New';
        ctx.fillText(`TIMELINE: ${this.gameState.timeline}`, 500, 30);
        
        // Draw quantum energy bar
        ctx.fillStyle = '#333';
        ctx.fillRect(10, 30, 104, 14);
        ctx.fillStyle = '#0ff';
        ctx.fillRect(12, 32, this.gameState.quantumEnergy, 10);
        ctx.fillStyle = '#0f0';
        ctx.font = '12px Courier New';
        ctx.fillText('QUANTUM ENERGY', 10, 25);
    }
    
    drawBackground() {
        const ctx = this.ctx;
        
        switch(this.gameState.timeline) {
            case 1994:
                // Classic jungle (pixelated)
                ctx.fillStyle = '#006400';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Simple trees
                for(let i = 0; i < 10; i++) {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(60 * i, 100, 20, 100);
                    ctx.fillStyle = '#228B22';
                    ctx.beginPath();
                    ctx.arc(70 + 60 * i, 80, 40, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 2026:
                // Quantum jungle (neon)
                const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                gradient.addColorStop(0, '#000066');
                gradient.addColorStop(1, '#006600');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Neon vines
                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 3;
                for(let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0, 100 + i * 60);
                    for(let j = 0; j < 10; j++) {
                        ctx.lineTo(j * 70, 100 + i * 60 + Math.sin(Date.now()/1000 + j + i) * 20);
                    }
                    ctx.stroke();
                }
                break;
                
            case 2048:
                // Future jungle (grid)
                ctx.fillStyle = '#001100';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Grid lines
                ctx.strokeStyle = '#00ff80';
                ctx.lineWidth = 1;
                for(let i = 0; i < this.canvas.width; i += 40) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, this.canvas.height);
                    ctx.stroke();
                }
                for(let i = 0; i < this.canvas.height; i += 40) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(this.canvas.width, i);
                    ctx.stroke();
                }
                break;
        }
    }
    
    completeLevel() {
        this.gameState.score += 1000;
        this.gameState.level++;
        
        if (this.gameState.level > 4) {
            this.gameWon();
        } else {
            alert(`Level Complete! Bonus: 1000 points!\nMoving to Level ${this.gameState.level}`);
            this.initLevel(this.gameState.level);
            this.saveGame();
        }
        
        this.updateUI();
    }
    
    gameOver() {
        document.getElementById('final-score').textContent = this.gameState.score;
        document.getElementById('game-over').style.display = 'flex';
        this.gameState.currentScreen = 'gameOver';
    }
    
    gameWon() {
        document.getElementById('main-menu').innerHTML = `
            <div class="menu-title">CONGRATULATIONS!</div>
            <div style="color: #0ff; text-align: center; margin: 20px; max-width: 600px;">
                <p>You completed JUNGLE QUEST 2026!</p>
                <p>Final Score: ${this.gameState.score}</p>
                <p>Total Bananas: ${this.gameState.bananas}</p>
                <br>
                <p>Thank you for playing!</p>
            </div>
            <div class="menu-option" onclick="location.reload()">PLAY AGAIN</div>
        `;
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
    }
    
    saveGame() {
        try {
            localStorage.setItem('jungleQuest2026', JSON.stringify({
                score: this.gameState.score,
                lives: this.gameState.lives,
                level: this.gameState.level,
                bananas: this.gameState.bananas,
                keys: this.gameState.keys
            }));
        } catch (e) {
            console.log('Could not save game:', e);
        }
    }
    
    loadGame() {
        try {
            const saved = localStorage.getItem('jungleQuest2026');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameState.score = data.score || 0;
                this.gameState.lives = data.lives || 3;
                this.gameState.level = data.level || 1;
                this.gameState.bananas = data.bananas || 0;
                this.gameState.keys = data.keys || 0;
                return true;
            }
        } catch (e) {
            console.log('Could not load game:', e);
        }
        return false;
    }
    
    gameLoop(currentTime) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState.currentScreen === 'playing') {
            this.handleInput();
            this.updateEnemies();
            this.updateCollectibles();
            this.checkCollisions();
            this.draw();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Global functions for HTML event handlers
function toggleSound() {
    alert('Sound toggled! (Placeholder)');
}

function toggleCRT() {
    document.body.classList.toggle('crt');
}

function toggleMobile() {
    const controls = document.getElementById('mobile-controls');
    controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
}

function restartGame() {
    location.reload();
}

function showMenu() {
    if (window.game) {
        window.game.showMenu();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    window.game = new JungleQuest();
});