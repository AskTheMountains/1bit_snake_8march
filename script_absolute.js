// Создание или получение объекта canvas
let canvas = document.getElementById('game-canvas');
if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    canvas.width = 450;
    canvas.height = 450;
    document.body.appendChild(canvas);
}

const ctx = canvas.getContext('2d');

// Размеры поля
const tileSize = 20;
const tileCount = canvas.width / tileSize;

// Текстуры
const snakeHeadImg = new Image();
const snakeBodyImg = new Image();
const foodImg = new Image();
snakeHeadImg.src = './src/images/snake_head.png';
snakeBodyImg.src = './src/images/snake_texture_4.png';
foodImg.src = './src/images/food.png';

// Змейка и параметры игры
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let speed = 20;

// Загружаем звуки поедания еды
const eatingSounds = [
  new Audio('./src/sounds/eat1.wav'),
  new Audio('./src/sounds/eat3.wav'),
  new Audio('./src/sounds/eat4.wav'),
  new Audio('./src/sounds/eat5.wav'),
  new Audio('./src/sounds/eat6.wav'),
  new Audio('./src/sounds/eat7.wav'),
  new Audio('./src/sounds/eat8.wav'),
  new Audio('./src/sounds/eat9.wav')
];


// Звук кнопки
const buttonSound = new Audio('./src/sounds/button.wav');
// Звук при клике на изображение подарка
const giftSound = new Audio('./src/sounds/eat8.wav'); 
// Звук при проигрыше
const gameOverSound = new Audio('./src/sounds/game_over1.wav'); 

// Логика для выигрыша
const victoryLength = 15;

// Счётчик времени
let frame = 0;

// Список пользователей и соответствующих им ссылок
const userLinks = {
  "Mariya_Marchenko_1": "https://ga.gift/ru/88680378815545b184c826580e62f550", // https://goldapple.ru/cards/receive/88680378815545b184c826580e62f550?from=whatsapp
  "Annaakasymova": "https://ga.gift/ru/701dc4eb9b5a442685b3ff17d81c804a",  // https://goldapple.ru/cards/receive/701dc4eb9b5a442685b3ff17d81c804a?from=whatsapp 
  "happiness_easy": "https://ga.gift/ru/fd86f44d86884e46bffaf4d9aeb4853e"
};

// Переменная для хранения текущего имени пользователя
let currentUsername = '';


// Функция для воспроизведения случайного звука поедания еды
function playRandomEatingSound() {
    const randomIndex = Math.floor(Math.random() * eatingSounds.length);
    const sound = new Audio(eatingSounds[randomIndex].src); // Создаём новый объект Audio для параллельного воспроизведения
    sound.play();
}

// Функция старта игры
function gameLoop() {
  if (++frame % speed === 0) {
    if (!update()) {
      showGameOver();
      return;
    }
  }

  if (snake.length >= victoryLength) {
    showVictory();
    return;
  }

  render();
  requestAnimationFrame(gameLoop);
}

// Движение змеи и обновление состояния игры
function update() {
  direction = newDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Проверка выхода за границы
  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
	gameOverSound.play()
    return false; 
  }

  // Проверка столкновения с телом
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
	  gameOverSound.play()
      return false;
    }
  }

  // Движение змейки
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    placeFood();
	playRandomEatingSound(); // Воспроизведение звука поедания
  } else {
    snake.pop();
  }

  return true;
}

// Отображение игры
function render() {
  // Фон
  ctx.fillStyle = '#eaeaea'; // Новый светлый цвет
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем сетку
  ctx.strokeStyle = '#444'; // Светлые линии для сетки
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0); // Вертикальные линии
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.moveTo(0, i * tileSize); // Горизонтальные линии
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }

  // Еда
  ctx.drawImage(foodImg, food.x * tileSize, food.y * tileSize, tileSize, tileSize);

  // Рисуем змею
  snake.forEach((segment, index) => {
    if (index === 0) {
	  // Голову змейки не вращаем, рисуем обычным методом
      ctx.drawImage(snakeHeadImg, segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    } else {
	   // Вычисляем направление текущего сегмента относительно следующего
      let angle = 0; // Угол по умолчанию

      const prevSegment = snake[index - 1];  //Предыдущий сегмент
      if (prevSegment) {
        const dx = segment.x - prevSegment.x; // Разница по x
        const dy = segment.y - prevSegment.y; // Разница по y
        // Вычисляем угол вращения на основе направления
        if (dx === 1) angle = Math.PI / 2; // Сегмент идет вправо
        else if (dx === -1) angle = -Math.PI / 2; // Сегмент идет влево
        else if (dy === 1) angle = Math.PI; // Сегмент идет вниз
        else if (dy === -1) angle = 0; // Сегмент идет вверх
      }

      // Поворачиваем и рисуем текстуру для этого сегмента
      ctx.save(); // Сохраняем состояние холста
      ctx.translate(segment.x * tileSize + tileSize / 2, segment.y * tileSize + tileSize / 2); // Перемещаем в центр сегмента
      ctx.rotate(angle); // Поворачиваем холст
      ctx.drawImage(snakeBodyImg, -tileSize / 2, -tileSize / 2, tileSize, tileSize); // Рисуем тело
      ctx.restore(); // Восстанавливаем состояние холста
    }
  });
}

// Генерация еды
function placeFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

// Управление с клавиатуры
window.addEventListener('keydown', (e) => {
  if (!e.key) return; // Если e.key отсутствует, то просто возвращаемся

  const key = e.key.toLowerCase();
  
  switch (key) {
    case 'arrowup':
    case 'w':
    case 'ц':  // Русская клавиша для "w"
      if (direction.y === 0) newDirection = { x: 0, y: -1 };
      break;
    case 'arrowdown':
    case 's':
    case 'ы':  // Русская клавиша для "s"
      if (direction.y === 0) newDirection = { x: 0, y: 1 };
      break;
    case 'arrowleft':
    case 'a':
    case 'ф':  // Русская клавиша для "a"
      if (direction.x === 0) newDirection = { x: -1, y: 0 };
      break;
    case 'arrowright':
    case 'd':  
    case 'в':  // Русская клавиша для "d"
      if (direction.x === 0) newDirection = { x: 1, y: 0 };
      break;
  }
});


// Управление с помощью сенсорного экрана
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0 && direction.x === 0) {
      newDirection = { x: 1, y: 0 }; 
    } else if (deltaX < 0 && direction.x === 0) {
      newDirection = { x: -1, y: 0 }; 
    }
  } else {
    if (deltaY > 0 && direction.y === 0) {
      newDirection = { x: 0, y: 1 };
    } else if (deltaY < 0 && direction.y === 0) {
      newDirection = { x: 0, y: -1 }; 
    }
  }
  e.preventDefault();
});

// Инициализация игры после ввода имени
function initializeGame() {
  const usernameInput = document.getElementById('username-input');
  if (usernameInput) {
    currentUsername = usernameInput.value.trim() || currentUsername;
    if (currentUsername) {
      setupCanvas();
      document.getElementById('controls').classList.remove('hidden'); // Показываем инструкции
      requestAnimationFrame(gameLoop);
    } else {
      alert('Пожалуйста, введите ваш никнейм, чтобы продолжить');
    }
  }
}

// Установка холста
function setupCanvas() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = '';
  gameContainer.appendChild(canvas);
  resetGame();
}


// Экран ввода имени
function showEnterName() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `
    <div id="name-entry-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center;
      position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #444444; color: white;">
      <h1 style="font-family: 'PixelFont'; font-size: 2em; color: #ffffff; text-shadow: 3px 3px 3px black; margin-bottom: 20px;">
        Введите ваше имя пользователя Telegramm (без @)
      </h1>
      <input id="username-input" type="text" style="font-size: 1em; padding: 10px; width: 300px; margin-bottom: 20px;" placeholder="Имя пользователя Telegramm">
      <button id="start-game-button" style="font-family: 'PixelFont'; font-size: 1.2em; padding: 10px 20px;
        background-color: #ff4d4d; color: white; border: none; cursor: pointer; border-radius: 5px;">
        Начать игру
      </button>
      <img src="./src/images/snake_title5.gif" alt="Змейка при вводе никнейма"
        style="position: absolute; top: 50px; left: 50%; transform: translateX(-50%) scaleX(-1); width: 300px; opacity: 0.8;">
    </div>
  `;
  document.getElementById('controls').classList.add('hidden'); // Скрываем инструкции по управлению
  const startGameButton = document.getElementById('start-game-button');
  startGameButton.addEventListener('click', () => {
    buttonSound.play(); // Воспроизведение звука
    initializeGame(); // Запуск игры
  });
}



// Сброс игры
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  newDirection = { x: 0, y: 0 };
  placeFood();
}

// Экран победы
function showVictory() {
  let victoryContent;

  if (userLinks[currentUsername]) {
    victoryContent = `
      <a href="${userLinks[currentUsername]}" target="_blank">
        <img id="gift-image" src="./src/images/food.png" alt="Подарок" style="width: 100px; height: 100px;"/>
      </a>
    `;
  } else {
    victoryContent = `
      <p style="font-family: 'PixelFont'; color: #333; font-size: 18px;">
        Упс, похоже, что вашего имени нет в списке пользователей :(<br>
        Напишите в телеграм Артёму
      </p>
    `;
  }

  document.body.innerHTML = `
    <div id="victory-screen" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; background-color: #add8e6; width: 100vw; height: 100vh; overflow: hidden; position: relative;">
      <div style="position: relative; width: 100%; flex-grow: 1; margin-top: 20px;">
        <img src="./src/images/sun1.gif" alt="Солнышко" style="position: absolute; top: 10px; right: 10px; width: 150px; height: 150px; z-index: 1;">
        <h1 style="font-family: 'PixelFont'; color: pink; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px  1px 0 #000, 1px  1px 0 #000; margin: 0; padding-top: 200px;">
          Дорогие девушки, поздравляем с 8 марта <3
        </h1>
        <p style="font-family: 'PixelFont'; color: #333; font-size: 18px; margin: 10px 0;">
          Ваш подарок ждёт вас по ссылке:
        </p>
        ${victoryContent}
      </div>
      <div style="position: relative; width: 100%; height: 130px; flex-shrink: 0;">
        <img src="./src/images/grass.png" alt="Трава" style="width: 100%; height: 100%; position: absolute; bottom: 0; left: 0; z-index: 1">
        <img src="./src/images/rose.png" alt="Роза" style="position: absolute; bottom: -260%; left: 50%; transform: translateX(-50%) scale(0.25); z-index: 0;">
        <img src="./src/images/flower1.gif" alt="Цветы1" style="position: absolute; bottom: 0.5%; left: 10%; transform: translateX(-50%) scale(0.6); z-index: 2;">
        <img src="./src/images/flower3.gif" alt="Цветы3" style="position: absolute; bottom: 15%; left: 33%; transform: translateX(-50%) scale(0.6); z-index: 0;">
        <img src="./src/images/flower3.gif" alt="Цветы3" style="position: absolute; bottom: 15%; left: 65%; transform: translateX(-50%) scale(0.6); z-index: 0;">
        <img src="./src/images/flower2.gif" alt="Цветы2" style="position: absolute; bottom: 0.0%; left: 78%; transform: translateX(-50%) scale(0.57); z-index:0;">
        <img src="./src/images/tree1.gif" alt="Деревце1" style="position: absolute; bottom: 145%; left: 95%; transform: translateX(-50%) scale(3); z-index: 0;">
      </div>
    </div>
  `;
  
  document.getElementById('controls').classList.add('hidden'); // Скрываем инструкции по управению
  // Воспроизведение звука при нажатии на кнопку подарка
  const giftImage = document.getElementById('gift-image');
  if (giftImage) {
    giftImage.addEventListener('click', () => { // Событие по клику
      giftSound.play(); // Воспроизводим звук
    });
  }


// Контейнер для облаков
const cloudContainer = document.getElementById('victory-screen');

let lastCloudType = null; // Последний использованный тип облака

// Генерируем облака
for (let i = 0; i < 10; i++) {
  const cloud = document.createElement('div');

  // Выбираем случайный тип облака
  let cloudType;
  do {
    cloudType = `cloud${Math.floor(Math.random() * 3) + 1}`;
  } while (cloudType === lastCloudType);
  lastCloudType = cloudType;

  // Присваиваем случайно выбранный тип облака
  cloud.className = `cloud ${cloudType}`;

  // Добавляем случайные параметры
  cloud.style.top = `${Math.random() * 80 + 20}px`; // Высота 20-100px
  cloud.style.animationDelay = `${Math.random() * 5}s`; // Задержка 0-5s
  cloud.style.animationDuration = `${Math.random() * 5 + 15}s`; // Длительность 15-20s
  const randomScale = Math.random() * 0.4 + 0.8; // 0.8 <= scale < 1.2
  cloud.style.transform = `scale(${randomScale})`;
  cloud.style.zIndex = 10; 
  cloudContainer.appendChild(cloud);
}

const style = document.createElement('style');
style.innerHTML = `
  .cloud {
    position: absolute;
    background-repeat: no-repeat;
    background-size: contain;
    animation: moveClouds linear infinite;
    left: -300px;
    opacity: 0;
  }

  .cloud1 {
    width: 150px;
    height: 75px;
    background-image: url('./src/images/cloud1.png');
  }

  .cloud2 {
    width: 150px;
    height: 75px;
    background-image: url('./src/images/cloud2.png');
  }

  .cloud3 {
    width: 400px;
    height: 200px;
    background-image: url('./src/images/cloud3.gif');
  }

  @keyframes moveClouds {
    0% {
	left: -300px;
		  opacity: 0;
		}
	10% {
		  opacity: 1;
		}
	50% {
		  opacity: 1;
		}
	100% {
		  left: 100vw;
		  opacity: 0;
		}
	  }
	`;
document.head.appendChild(style);

}

// Экран поражения с возможностью изменения имени пользователя
function showGameOver() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `
    <div id="game-over-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; 
    position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #333333; color: white;">
      <h1 style="font-family: 'PixelFont'; font-size: 1.7em; color: #ff4d4d; text-shadow: 3px 3px 3px black; margin-bottom: 20px;">
        Попробуйте ещё раз :)
      </h1>
      <p style="font-family: 'PixelFont'; color: #ccc; font-size: 1.5em;">
        Я в вас верю, у вас обязательно получится!
      </p>
      <input id="new-username-input" type="text" value="${currentUsername}" style="font-size: 1.5em; padding: 10px; width: 300px; margin-top: 20px;" placeholder="Введите ваше имя">
      <button id="restart-game-button" style="font-family: 'PixelFont'; font-size: 1.2em; padding: 10px 20px; 
        background-color: #ff4d4d; color: white; border: none; cursor: pointer; border-radius: 5px; margin-top: 20px;">
        Играть снова
      </button>
      <img src="./src/images/defeat_cloud2.gif" alt="Грустное облако" 
        style="position: absolute; top: 50px; left: 50%; transform: translateX(-50%); width: 200px; opacity: 0.8;">
    </div>
  `;
  
  document.getElementById('controls').classList.add('hidden'); // Скрываем инструкции по управлению
  const restartGameButton = document.getElementById('restart-game-button');
  restartGameButton.addEventListener('click', () => {
    buttonSound.play(); // Воспроизведение звука
    restartGame(); // Запуск игры
  });
}

function restartGame() {
  const newUsernameInput = document.getElementById('new-username-input').value.trim();
  currentUsername = newUsernameInput || currentUsername; // Обновляем имя пользователя, если введено новое
  setupCanvas();
  document.getElementById('controls').classList.remove('hidden'); // Показываем инструкции снова
  requestAnimationFrame(gameLoop); // Запуск игрового цикла
}


// Запуск игры с экрана ввода имени
showEnterName();