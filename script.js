// Начальные данные
let playerData = {
    level: 1,
    xp: 0,
    totalXp: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    endurance: 0,
    totalActivities: 0,
    streakDays: 0,
    lastActive: null,
    // Данные для ежедневных заданий
    dailyQuest: {
        xp: 0,
        pushups: 0,
        crunches: 0,
        pullups: 0,
        completed: false,
        lastReset: new Date().toDateString()
    }
};

// Загрузка данных из localStorage при запуске
function loadProgress() {
    try {
        const saved = localStorage.getItem('rpgFitnessData');
        if (saved) {
            playerData = JSON.parse(saved);
            // Проверяем, нужно ли сбросить ежедневные задания
            checkDailyReset();
            updateUI();
        } else {
            // Если данных нет, создаем начальные
            saveProgress();
        }
    } catch (e) {
        console.error("Ошибка при загрузке данных:", e);
        // Если ошибка, создаем начальные данные
        saveProgress();
    }
}

// Проверка сброса ежедневных заданий
function checkDailyReset() {
    const today = new Date().toDateString();
    if (playerData.dailyQuest.lastReset !== today) {
        playerData.dailyQuest = {
            xp: 0,
            pushups: 0,
            crunches: 0,
            pullups: 0,
            completed: false,
            lastReset: today
        };
        saveProgress();
        showNotification('Ежедневные задания обновлены!');
    }
}

// Сохранение данных в localStorage
function saveProgress() {
    try {
        localStorage.setItem('rpgFitnessData', JSON.stringify(playerData));
    } catch (e) {
        console.error("Ошибка при сохранении данных:", e);
        showNotification('Ошибка сохранения данных');
    }
}

// Выполнение упражнения
function doActivity(activity, amount, xp) {
    // Добавляем XP
    playerData.xp += xp;
    playerData.totalXp += xp;
    playerData.totalActivities += 1;
    
    // Увеличиваем соответствующую характеристику
    switch(activity) {
        case 'pushups':
            playerData.strength += 1;
            playerData.dailyQuest.pushups += amount;
            break;
        case 'pullups':
            playerData.strength += 1;
            playerData.dailyQuest.pullups += amount;
            break;
        case 'crunches':
            playerData.endurance += 1;
            playerData.dailyQuest.crunches += amount;
            break;
        case 'steps':
            playerData.agility += 1;
            break;
        case 'programming':
            playerData.intelligence += 1;
            break;
    }
    
    // Добавляем XP к ежедневному заданию
    playerData.dailyQuest.xp += xp;
    
    // Проверяем повышение уровня
    if (playerData.xp >= 100) {
        playerData.level += 1;
        playerData.xp = playerData.xp - 100;
        
        // Анимация повышения уровня
        document.querySelector('.avatar').classList.add('level-up');
        setTimeout(() => {
            document.querySelector('.avatar').classList.remove('level-up');
        }, 800);
        
        showNotification(`Поздравляем! Вы достигли уровня ${playerData.level}!`);
    }
    
    saveProgress();
    updateUI();
    
    // Проверяем выполнение заданий
    checkDailyQuests();
    
    // Показываем уведомление
    let activityName = '';
    switch(activity) {
        case 'pushups': activityName = 'Отжимания'; break;
        case 'pullups': activityName = 'Подтягивания'; break;
        case 'crunches': activityName = 'Пресс'; break;
        case 'steps': activityName = 'Шаги'; break;
        case 'programming': activityName = 'Программирование'; break;
    }
    
    showNotification(`Выполнено: ${amount} ${activityName}. Получено ${xp} XP!`);
}

// Проверка выполнения ежедневных заданий
function checkDailyQuests() {
    const quest = playerData.dailyQuest;
    if (quest.xp >= 50 && quest.pushups >= 100 && quest.crunches >= 100 && quest.pullups >= 10) {
        quest.completed = true;
    }
}

// Получение награды за ежедневные задания
function claimDailyReward() {
    const rewardBtn = document.getElementById('rewardBtn');
    
    if (playerData.dailyQuest.completed && !rewardBtn.disabled) {
        playerData.xp += 50;
        playerData.totalXp += 50;
        
        if (playerData.xp >= 100) {
            playerData.level += 1;
            playerData.xp = playerData.xp - 100;
            
            // Анимация повышения уровня
            document.querySelector('.avatar').classList.add('level-up');
            setTimeout(() => {
                document.querySelector('.avatar').classList.remove('level-up');
            }, 800);
        }
        
        saveProgress();
        updateUI();
        showNotification('Награда за ежедневные задания получена! +50 XP');
        
        // Блокируем кнопку после получения награды
        rewardBtn.disabled = true;
        rewardBtn.textContent = 'Награда получена!';
        rewardBtn.style.background = 'linear-gradient(to right, #00a896, #00c9a7)';
    } else if (rewardBtn.disabled) {
        showNotification('Награда уже получена сегодня!');
    } else {
        showNotification('Выполните все задания для получения награды!');
    }
}

// Обновление ежедневных заданий
function resetDailyQuests() {
    if (confirm('Вы уверены, что хотите обновить ежедневные задания?')) {
        const today = new Date().toDateString();
        playerData.dailyQuest = {
            xp: 0,
            pushups: 0,
            crunches: 0,
            pullups: 0,
            completed: false,
            lastReset: today
        };
        saveProgress();
        updateUI();
        showNotification('Ежедневные задания обновлены!');
    }
}

// Обновление интерфейса
function updateUI() {
    // Обновляем уровень и XP
    document.getElementById('currentLevel').textContent = playerData.level;
    document.getElementById('currentLevel2').textContent = playerData.level;
    document.getElementById('totalXp').textContent = playerData.totalXp;
    document.getElementById('totalActivities').textContent = playerData.totalActivities;
    document.getElementById('streakDays').textContent = playerData.streakDays;
    
    // Обновляем XP бар
    const xpPercent = (playerData.xp / 100) * 100;
    document.getElementById('xpBar').style.width = `${xpPercent}%`;
    document.getElementById('xpText').textContent = `${playerData.xp}/100 XP`;
    
    // Обновляем статистику
    document.getElementById('statsContainer').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon strength">
                <i class="fas fa-dumbbell"></i>
            </div>
            <div class="stat-name">Сила</div>
            <div class="stat-value">${playerData.strength}</div>
            <div class="stat-bar">
                <div class="stat-progress" style="width: ${Math.min(100, playerData.strength)}%;"></div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon agility">
                <i class="fas fa-running"></i>
            </div>
            <div class="stat-name">Ловкость</div>
            <div class="stat-value">${playerData.agility}</div>
            <div class="stat-bar">
                <div class="stat-progress" style="width: ${Math.min(100, playerData.agility)}%;"></div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon intelligence">
                <i class="fas fa-brain"></i>
            </div>
            <div class="stat-name">Интеллект</div>
            <div class="stat-value">${playerData.intelligence}</div>
            <div class="stat-bar">
                <div class="stat-progress" style="width: ${Math.min(100, playerData.intelligence)}%;"></div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon endurance">
                <i class="fas fa-heartbeat"></i>
            </div>
            <div class="stat-name">Выносливость</div>
            <div class="stat-value">${playerData.endurance}</div>
            <div class="stat-bar">
                <div class="stat-progress" style="width: ${Math.min(100, playerData.endurance)}%;"></div>
            </div>
        </div>
    `;
    
    // Обновляем ежедневные задания
    document.getElementById('questXpStatus').textContent = `${playerData.dailyQuest.xp}/50`;
    document.getElementById('questPushupsStatus').textContent = `${playerData.dailyQuest.pushups}/100`;
    document.getElementById('questCrunchesStatus').textContent = `${playerData.dailyQuest.crunches}/100`;
    document.getElementById('questPullupsStatus').textContent = `${playerData.dailyQuest.pullups}/10`;
    
    // Обновляем статус заданий
    const xpStatus = document.getElementById('questXpStatus');
    const pushupsStatus = document.getElementById('questPushupsStatus');
    const crunchesStatus = document.getElementById('questCrunchesStatus');
    const pullupsStatus = document.getElementById('questPullupsStatus');
    
    xpStatus.className = playerData.dailyQuest.xp >= 50 ? 'quest-status' : 'quest-status pending';
    pushupsStatus.className = playerData.dailyQuest.pushups >= 100 ? 'quest-status' : 'quest-status pending';
    crunchesStatus.className = playerData.dailyQuest.crunches >= 100 ? 'quest-status' : 'quest-status pending';
    pullupsStatus.className = playerData.dailyQuest.pullups >= 10 ? 'quest-status' : 'quest-status pending';
    
    // Обновляем кнопку награды
    const rewardBtn = document.getElementById('rewardBtn');
    if (playerData.dailyQuest.completed) {
        rewardBtn.disabled = false;
        rewardBtn.textContent = 'Получить награду';
        rewardBtn.style.background = 'linear-gradient(to right, #00c9a7, #00a896)';
    } else {
        rewardBtn.disabled = false;
        rewardBtn.textContent = 'Получить награду';
        rewardBtn.style.background = 'linear-gradient(to right, #00c9a7, #00a896)';
    }
}

// Показ уведомления
function showNotification(message) {
    const notification = document.getElementById('notification');
    document.getElementById('notificationText').textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Сброс прогресса
function resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
        playerData = {
            level: 1,
            xp: 0,
            totalXp: 0,
            strength: 0,
            agility: 0,
            intelligence: 0,
            endurance: 0,
            totalActivities: 0,
            streakDays: 0,
            lastActive: null,
            dailyQuest: {
                xp: 0,
                pushups: 0,
                crunches: 0,
                pullups: 0,
                completed: false,
                lastReset: new Date().toDateString()
            }
        };
        saveProgress();
        updateUI();
        showNotification('Прогресс сброшен!');
    }
}

// Скачивание сохранения
function downloadSave() {
    const dataStr = JSON.stringify(playerData, null, 2);
    const dataUri = 'application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'rpg-fitness-save.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Сохранение скачано!');
}

// Загрузка сохранения
function uploadSave() {
    document.getElementById('fileInput').click();
}

// Загрузка файла
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // Проверяем, что это валидный файл сохранения
            if (data.hasOwnProperty('level')) {
                playerData = data;
                // Проверяем, нужно ли сбросить ежедневные задания
                checkDailyReset();
                saveProgress();
                updateUI();
                showNotification('Сохранение загружено!');
            } else {
                showNotification('Неверный формат файла сохранения!');
            }
        } catch (error) {
            console.error("Ошибка при загрузке файла:", error);
            showNotification('Ошибка загрузки файла сохранения!');
        }
    };
    reader.readAsText(file);
}

// Загружаем данные при старте
loadProgress();
updateUI();