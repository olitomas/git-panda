const electronInstaller = require('electron-winstaller');

const resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './dist/win/git-panda-win32-ia32/',
    outputDirectory: './dist/win/',
    authors: 'Óli Tómas Freysson',
    exe: 'git-panda.exe',
    title: 'Git Panda',
    name: 'git-panda',
    // iconUrl: './icons/win/icon.ico',
    // setupIcon: './icons/win/icon.ico',
    setupExe: 'Git Panda',

  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));