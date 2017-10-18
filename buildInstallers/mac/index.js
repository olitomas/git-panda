const createDMG = require('electron-installer-dmg');
createDMG({
    appPath: '../dist/osx/git-panda-darwin-x64/git-panda.app',
    out: '../dist/osx/',
    name: 'Git Panda',
    overwrite: true,
    debug: true,
    icon: '../icons/mac/icon.icns'
}, (err) => {
    console.log('Error building DMG: ', err);
});