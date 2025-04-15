import { app, BrowserWindow } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: join(dirname(fileURLToPath(import.meta.url)), "preload.mjs"),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });

    if (app.isPackaged) {
        win.loadFile(join(dirname(fileURLToPath(import.meta.url)), "../out/renderer/index.html"))
    } else {
        win.loadURL("http://127.0.0.1:3000/ollama-gui");
    }
};

app.whenReady().then(() => {
    createWindow();
});