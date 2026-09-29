// ==========================================
// 1. REGISTRO DEL SERVICE WORKER
// ==========================================
const swStatusText = document.getElementById('sw-status');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('Service Worker registrado con éxito:', reg.scope);
       swStatusText.textContent = 'SW Activo (Offline Ready)';
      })
      .catch((error) => {
        console.error('Error al registrar el Service Worker:', error);
       swStatusText.textContent = 'SW Falló registro';
      });
  });
} else {
  swStatusText.textContent = 'Service Worker no soportado en este navegador';
}

// ==========================================
// 2. DETECTOR DE RED (ONLINE / OFFLINE)
// ==========================================
const statusBadge = document.getElementById('network-status');

function updateOnlineStatus() {
  if (navigator.onLine) {
    statusBadge.textContent = 'En línea';
    statusBadge.className = 'status-badge online';
  } else {
    statusBadge.textContent = 'Sin conexión (Offline)';
    statusBadge.className = 'status-badge offline';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// ==========================================
// 3. EVENTO DE INSTALACIÓN DE LA PWA
// ==========================================
let deferredPrompt;
const btnInstall = document.getElementById('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que el navegador muestre el banner por defecto
  e.preventDefault();
  deferredPrompt = e;
  // Mostrar nuestro botón personalizado de instalación
  btnInstall.style.display = 'block';
});

btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  // Muestra la ventana nativa de instalación
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`El usuario respondió a la instalación: ${outcome}`);
  deferredPrompt = null;
  btnInstall.style.display = 'none';
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalada exitosamente');
  btnInstall.style.display = 'none';
});

// ==========================================
// 4. LÓGICA DE LA APP (NOTAS CON LOCALSTORAGE)
// ==========================================
const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('notes-list');

let notes = JSON.parse(localStorage.getItem('pwa_notes')) || [];

function renderNotes() {
  list.innerHTML = '';
  notes.forEach((note, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${note}</span>
      <button onclick="deleteNote(${index})">&times;</button>
    `;
    list.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    notes.push(text);
    localStorage.setItem('pwa_notes', JSON.stringify(notes));
    input.value = '';
    renderNotes();
  }
});

window.deleteNote = (index) => {
  notes.splice(index, 1);
  localStorage.setItem('pwa_notes', JSON.stringify(notes));
  renderNotes();
};

renderNotes();