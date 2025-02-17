// Холст для рисования
const canvas = document.getElementById('game-canvas');
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

// Змейка
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let speed = 20;

// Логика для выигрыша
const victoryLength = 15;

// Счётчик времени
let frame = 0;

// Функция старта игры
function gameLoop() {
  if (++frame % speed === 0) {
    if (!update()) {
      showGameOver(); // Завершаем игру, если произошёл проигрыш
      return; // Прекращаем выполнение игрового цикла
    }
  }

  if (snake.length >= victoryLength) {
    showVictory(); // Завершаем игру при победе
    return; // Прекращаем выполнение игрового цикла
  }

  render();
  requestAnimationFrame(gameLoop);
}

// Движение змейки и обновление состояния
function update() {
  direction = newDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Проверка выхода за границы
  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
    return false; // Сигнал, что игра завершена
  }

  // Проверка столкновения с телом
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return false; // Сигнал, что игра завершена
    }
  }

  // Проверка на победу
  if (snake.length >= victoryLength) {
    return true; // Условие для победы, заставляем продолжать
  }

  // Движение змейки
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    placeFood();
  } else {
    snake.pop();
  }

  return true; // Змейка продолжает движение
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
      
      const prevSegment = snake[index - 1]; // Предыдущий сегмент
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

// Проверка конца игры
function isGameOver() {
  const head = snake[0];

  // Проверка: выход за границы поля
  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
    return true;
  }

  // Проверка: столкновение с телом змейки
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

// Показ экрана победы
function showVictory() {
  document.body.innerHTML = `
    <div id="victory-screen" style="position: relative; text-align: center; background-color: #add8e6; 
	width: 100vw; max-width: 100%; height: 100vh; overflow: hidden;">
      <!-- Изображение солнышка -->
      <img src="./src/images/sun1.gif" alt="Солнышко" style="position: absolute; top: 10px; right: 10px; width: 150px; height: 150px; z-index: 1;">
	  <h1 style="font-family: 'PixelFont'; color: pink; text-shadow: 2px 2px 2px black; margin-top: 180px;">
        Дорогие девушки, поздравляем с 8 марта <3
      </h1>
      <p style="font-family: 'PixelFont'; color: #333; font-size: 18px;">
        Ваш подарок ждёт вас по ссылкам:
      </p>
      <ul style="list-style-type: none; padding: 0; margin-bottom: 30px;">
        <li><a href="https://example1.com" target="_blank" style="font-family: 'PixelFont'; color: blue; text-decoration: underline;">1. Ссылка1</a></li>
        <li><a href="https://example2.com" target="_blank" style="font-family: 'PixelFont'; color: blue; text-decoration: underline;">2. Ссылка2</a></li>
        <li><a href="https://example3.com" target="_blank" style="font-family: 'PixelFont'; color: blue; text-decoration: underline;">3. Ссылка3</a></li>
      </ul>
      <img src="./src/images/grass.png" alt="Трава" style="width: 100%; height: auto; max-height: 130px; position: absolute; bottom: 0; left: 0; z-index: 1">
      <img src="./src/images/rose.png" alt="Роза" style="position: absolute; top: 79%; left: 50%; transform: translate(-50%, -50%) scale(0.3); z-index: 0">

	  <img src="./src/images/flower1.gif" alt="Цветы1" style="position: absolute; bottom: 0.5%; left: 10%; transform: translateX(-50%) scale(0.6); z-index: 2">
	  <img src="./src/images/flower3.gif" alt="Цветы3" style="position: absolute; bottom: 2.5%; left: 30%; transform: translateX(-50%) scale(0.6); z-index: 0">
	  <img src="./src/images/flower3.gif" alt="Цветы3" style="position: absolute; bottom: 2.5%; left: 65%; transform: translateX(-50%) scale(0.6); z-index: 0">
	  <img src="./src/images/flower2.gif" alt="Цветы2" style="position: absolute; bottom: 0.0%; left: 78%; transform: translateX(-50%) scale(0.57); z-index:0;">
	  <img src="./src/images/tree1.gif" alt="Деревце1" style="position: absolute; bottom: 23%; left: 96%; transform: translateX(-50%) scale(3); z-index: 0">

  `;

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
    // Рандомный масштаб: от 0.8 до 1.2 (уменьшение или увеличение)
    const randomScale = Math.random() * 0.4 + 0.8; // 0.8 <= scale < 1.2
    cloud.style.transform = `scale(${randomScale})`;
	cloud.style.zIndex = 10; // Устанавливаем облакам более высокий z-index, чтобы они перекывали солнышко
    cloudContainer.appendChild(cloud);
  }

  // Добавляем CSS
  const style = document.createElement('style');
  style.innerHTML = `
    /* Общее для всех облаков */
    .cloud {
      position: absolute;
      background-repeat: no-repeat;
      background-size: contain;
      animation: moveClouds linear infinite;
      left: -300px;
      opacity: 0; /* Для плавного появления */
    }

    /* Облако 1 */
    .cloud1 {
      width: 150px;
      height: 75px;
      background-image: url('./src/images/cloud1.png');
    }

    /* Облако 2 */
    .cloud2 {
      width: 150px;
      height: 75px;
      background-image: url('./src/images/cloud2.png');
    }

    /* Облако 3 */
    .cloud3 {
      width: 400px;
      height: 200px;
      background-image: url('./src/images/cloud3.gif');
    }

    /* Анимация движения облаков */
    @keyframes moveClouds {
       0% {
        left: -300px; / Начало за пределами экрана /
        opacity: 0; / Полупрозрачность /
      }
      10% {
        opacity: 1; / Постепенно становятся видимыми /
      }
      50% {
        opacity: 1; / Полностью видимы перед исчезновением /
      }
      100% {
        left: 100vw; / Движение за правый край экрана /
        opacity: 0; / Постепенно исчезают /
	  }
    }
  `;
  document.head.appendChild(style);
}


// Показ экрана поражения
function showGameOver() {
  document.body.innerHTML = `
    <div id="game-over-container" style="position: relative; text-align: center; background-color: #1e1e1e; 
      width: 100vw; max-width: 100%; height: 100vh; overflow: hidden; color: white;">
      <h1 style="font-family: 'PixelFont'; font-size: 3em; color: #ff4d4d; text-shadow: 3px 3px 3px black; margin-top: 300px;">
        Попробуйте ещё раз :)
      </h1>
      <p style="font-family: 'PixelFont'; color: #ccc; font-size: 1.5em; margin: 20px;">
        Я в вас верю, у вас обязательно получится!
      </p>
      <button onclick="location.reload()" style="font-family: 'PixelFont'; font-size: 1.2em; padding: 10px 20px; 
        background-color: #555; color: white; border: none; cursor: pointer; margin-top: 40px;">
        Играть снова
      </button>
      <img src="./src/images/defeat_cloud2.gif" alt="Грустное облако" 
        style="position: absolute; top: 50px; left: 50%; transform: translateX(-50%); width: 200px; opacity: 0.8;">
    </div>
  `;
}

// Управление
window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowUp':
      if (direction.y === 0) newDirection = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y === 0) newDirection = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x === 0) newDirection = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === 0) newDirection = { x: 1, y: 0 };
      break;
  }
});

// Сенсорное управление
let touchStartX = 0; // Начальная координата X касания
let touchStartY = 0; // Начальная координата Y касания
let touchEndX = 0;   // Конечная координата X касания
let touchEndY = 0;   // Конечная координата Y касания

// Функция для фиксации начала свайпа
function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX; // Сохраняем начальную координату X
  touchStartY = event.touches[0].clientY; // Сохраняем начальную координату Y
}

// Функция для фиксации конца свайпа
function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX; // Записываем конечную координату X
  touchEndY = event.changedTouches[0].clientY; // Записываем конечную координату Y

  // Вычисляем разницу по X и Y
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Проверяем направление свайпа
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Горизонтальный свайп
    if (deltaX > 0 && direction.x === 0) {
      newDirection = { x: 1, y: 0 }; // Вправо
    } else if (deltaX < 0 && direction.x === 0) {
      newDirection = { x: -1, y: 0 }; // Влево
    }
  } else {
    // Вертикальный свайп
    if (deltaY > 0 && direction.y === 0) {
      newDirection = { x: 0, y: 1 }; // Вниз
    } else if (deltaY < 0 && direction.y === 0) {
      newDirection = { x: 0, y: -1 }; // Вверх
    }
  }
}

// Привязываем события сенсорного управления
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

// Старт игры
placeFood();
requestAnimationFrame(gameLoop);
