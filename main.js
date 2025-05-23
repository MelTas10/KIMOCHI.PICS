// Конфиг
const CONFIG = {
  API_URL: '/upload', // Относительный путь для GitHub Pages
  MAX_SIZE: 100 * 1024 * 1024 // 100MB
};

// Аниме-девушки (Catbox)
const GIRLS = [
  "https://files.catbox.moe/mc1yub.png",
  "https://files.catbox.moe/q0njjx.png",
  "https://files.catbox.moe/0qbkl3.png",
  "https://files.catbox.moe/e17iyc.png",
  "https://files.catbox.moe/rpcsff.png",
  "https://files.catbox.moe/9tyauh.png",
  "https://files.catbox.moe/fcnus0.png",
  "https://files.catbox.moe/3vnr1x.png"
];

// DOM
const el = {
  animeGirl: document.getElementById('anime-girl'),
  uploadArea: document.getElementById('upload-area'),
  fileInput: document.getElementById('file-input'),
  uploadBtn: document.getElementById('upload-btn'),
  loading: document.getElementById('loading'),
  result: document.getElementById('result'),
  progress: document.getElementById('progress')
};

// --- Инициализация ---
function init() {
  rotateAnimeGirls();
  setupUpload();
  el.uploadBtn.addEventListener('click', uploadFile);
}

// Смена аниме-девушек
function rotateAnimeGirls() {
  let index = 0;
  
  const changeGirl = () => {
    index = (index + 1) % GIRLS.length;
    el.animeGirl.src = GIRLS[index];
    setTimeout(changeGirl, 3000 + Math.random() * 5000);
  };

  el.animeGirl.src = GIRLS[index];
  el.animeGirl.onerror = changeGirl; // Пропуск битых изображений
  setTimeout(changeGirl, 5000);
}

// Настройка загрузки
function setupUpload() {
  // Drag and Drop
  el.uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    el.uploadArea.classList.add('active');
  });

  el.uploadArea.addEventListener('dragleave', () => {
    el.uploadArea.classList.remove('active');
  });

  el.uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    el.uploadArea.classList.remove('active');
    if (e.dataTransfer.files.length) {
      el.fileInput.files = e.dataTransfer.files;
      showFileInfo();
    }
  });

  // Клик по области
  el.uploadArea.addEventListener('click', () => el.fileInput.click());
  el.fileInput.addEventListener('change', showFileInfo);
}

// Показ информации о файле
function showFileInfo() {
  if (!el.fileInput.files.length) return;
  
  const file = el.fileInput.files[0];
  const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  
  el.uploadArea.innerHTML = `
    <p>📄 <strong>${file.name}</strong></p>
    <p>${fileSize}</p>
  `;
}

// Загрузка файла
async function uploadFile() {
  if (!el.fileInput.files.length) {
    showResult('❌ Выберите файл!', 'error');
    return;
  }

  const file = el.fileInput.files[0];
  if (file.size > CONFIG.MAX_SIZE) {
    showResult(`❌ Файл слишком большой (макс. ${CONFIG.MAX_SIZE / (1024 * 1024)} MB)`, 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    el.loading.style.display = 'block';
    el.result.innerHTML = '';

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Ошибка сервера');

    const data = await response.json();
    
    if (data.success) {
      showResult(`
        <p>✅ Файл загружен!</p>
        <a href="${data.url}" target="_blank">${data.url}</a>
        <button onclick="copyToClipboard('${data.url}')">Копировать</button>
      `, 'success');
    } else {
      throw new Error(data.error || 'Неизвестная ошибка');
    }
  } catch (error) {
    showResult(`❌ Ошибка: ${error.message}`, 'error');
    console.error(error);
  } finally {
    el.loading.style.display = 'none';
  }
}

// Показ результата
function showResult(msg, type) {
  el.result.innerHTML = msg;
  el.result.className = type;
}

// Копирование в буфер
window.copyToClipboard = text => {
  navigator.clipboard.writeText(text)
    .then(() => alert('Ссылка скопирована!'))
    .catch(err => console.error(err));
};

// Запуск
document.addEventListener('DOMContentLoaded', init);
