const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Chemin vers le fichier HTML
  const indexPath = path.join(__dirname, 'renderer', 'index.html');
  
  console.log('Tentative de chargement du fichier HTML depuis:', indexPath);
  
  mainWindow.loadFile(indexPath)
    .then(() => {
      console.log('HTML chargé avec succès!');
    })
    .catch((error) => {
      console.error('Erreur lors du chargement du HTML:', error);
    });
  
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});