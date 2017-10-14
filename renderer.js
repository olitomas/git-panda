const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const shell = require('electron').shell;
const fs = require('fs');
const main = remote.require('./main.js');
const path = require('path');
const app = remote.app;
const userPath = app.getPath('userData');
const exec = require('child_process').exec;


let cronTask = null;

let data = {
    gitPaths: [],
    allClean: true,
    isPaid: false,
    waitHours: 4
};


class GitPanda{

    constructor() {
        this.getData().then((response) => {
            this.data = response;

            rivets.bind(document.getElementById('body'), {
                app: this
            });

            this.startCronJob(this.data.waitHours || data.waitHours);
            this.openAtLogin(this.data.openAtLogin || false);
        });

        this.setEvents();
    }

    ipcEvents() {
        // Add new repo
        const selectDirBtn = document.getElementById('btn');

        selectDirBtn.addEventListener('click', (event) => {
            ipc.send('open-file-dialog');
        });

        ipc.on('selected-directory', (event, path) => {
            // document.getElementById('selected-file').innerHTML = `${path}`
            const url = path[0];
            const status = this.checkGitStatus({path: url}).then(rsp => {
                if (rsp.error) {
                    new Alert('danger', {
                        title: 'Something went terribly wrong',
                        message: 'Well, maybe not terribly....are you sure this is a Git directory ?',
                        timer: 10
                    });
                    return;
                }

                this.saveDirectory(rsp).then(() => {
                    this.refreshRepos();
                    new Alert('success', {
                        title: 'Success',
                        message: 'Well done! Your repo has been added to the list'
                    });
                });
            });
        });

        ipc.on('ping', (event, message) => {
            if (message.name === 'refresh') {
                this.refreshRepos();
            }

            if(message.name === 'log') {
                console.log('main.js log:', message.data);
            }

            if(message.name === 'close') {
                this.closeOrMinimize();
            }
        });
    }

    openAtLogin(value) {
        app.setLoginItemSettings({
          openAtLogin: value,
        });
    }

    onOpenAtLoginChange(a, b) {
        const value = a.target.checked;
        b.app.openAtLogin(value);
        b.app.saveData();
    }

    setEvents() {

        this.ipcEvents();

        // Link to olitomas.com

        const olitomas = document.getElementById('olitomas');
        olitomas.addEventListener('click', (event) => {
            shell.openExternal('https://olitomas.com/');
        });

        // Link to Github

        const github = document.getElementById('github');
        github.addEventListener('click', (event) => {
            shell.openExternal('https://github.com/olitomas/git-panda');
        });


        // Register

        const registerBtn = document.getElementById('registerBtn');
        const registeredBtn = document.getElementById('registeredBtn');
        registerBtn.addEventListener('click', (event) => {
            this.registerDialog();
        });

        registeredBtn.addEventListener('click', (event) => {
            this.registerDialog();
        });

    }

    registerDialog(a, b) {
        let bind;
        new Modal({
            title: 'Register',
            message: `
                <div id="registerModal">
                    <div class="ui text-container center">
                        <p>
                            Registering is pretty simple, I use the honor system.
                        </p>
                         
                         <p>
                            If you intend to use Git Panda then please donate $5 by clicking the button below.
                         </p>

                         <p>
                            Once you have donated you are free to check the "I have registered" checkbox.
                        </p>
                    </div>
                    <br>
                    <div class="row">
                      <div class="center aligned column">
                        <a id="donate" class="ui huge button">Donate</a>
                      </div>
                    </div>

                    <br>

                    <div class="ui middle aligned container">
                        <div class="row">
                            <div class="ui checkbox"> 
                              <input id="isPaid" type="checkbox" rv-checked="app.data.isPaid">
                              <label>I have registered</label>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            onOpen: () => {

                document.getElementById('donate').addEventListener('click', () => {
                    shell.openExternal('https://paypal.me/olitomas/5');
                });

                bind = rivets.bind(document.getElementById('registerModal'), {
                    app: this
                });

            },
            onClose: () => {
                this.saveData();
                bind.unbind();
            }
        });
    }

    closeGitPanda() {
        main.closeGitPanda();
    }

    minimizeGitPanda(a, b) {
        b.app.closeOrMinimizeModal.close();
        const w = remote.getCurrentWindow();
        w.minimize();
    }

    closeOrMinimize(a, b) {
        let bind;
        this.closeOrMinimizeModal = new Modal({
            title: 'Close Git Panda or minimize ?',
            message: `
                <div id="closeOrMinimize">

                    <div class="ui text-container center">
                        <button rv-on-click="app.closeGitPanda" class="ui secondary button">
                          Close
                        </button>

                        <button rv-on-click="app.minimizeGitPanda" class="ui button">
                          Minimize
                        </button>
                    </div>

                </div>
            `,
            onOpen: () => {

                bind = rivets.bind(document.getElementById('closeOrMinimize'), {
                    app: this
                });

            },
            onClose: () => {
                bind.unbind();
            }
        });
    }

    checkGitStatus(obj, index) {
        const path = obj.path;
        const name = obj.name;

        return new Promise((resolve, reject) => {
            const fs = require('fs');

            if (!fs.existsSync(path)) {
                new Modal('danger', {
                    title: 'Something is wrong with this directory: ' + name,
                    message: 'Path for project cant be found, so it was removed from git-panda...did you move or rename your project ?'
                });

                if(index){
                    // Deleting from data since nothing was found in path
                    console.log('yep');
                    this.data.gitPaths.splice(index, 1);
                    this.saveData().then(() => {
                        this.refreshRepos();
                    });
                }

                resolve({error: true});
                return;
            }

            const command = 'cd ' + path + '; git status --porcelain';

            exec(command, (error, stdout, stderr) => {
                if(error){
                    resolve({ error: true });
                }else{
                    const pathSplit = path.split(/[\\\/]/);
                    const projectName = pathSplit[pathSplit.length - 1];

                    let workingTreeClean = stdout ? false : true;

                    resolve({
                        name: projectName,
                        path: path,
                        workingTreeClean: workingTreeClean,
                        error: null
                    });
                }
            });
        });

    }

    changeCronJob(a,b) {
        const value = a.target.value;

        if(value && !isNaN(value)){
            b.app.startCronJob(value);
            document.getElementById('reminderInput').classList.remove('error');
            b.app.saveData();
        }else{
            document.getElementById('reminderInput').classList.add('error');
        }
    }

    startCronJob (cronTime) {

        cronTime = cronTime || 4;
        const millisec = 3600000 * cronTime;

        if(cronTask) clearInterval(cronTask);

        cronTask = setInterval(() => {
            this.refreshRepos().then(rsp => {
                if (!rsp.allClean) {
                    this.notifyUser(
                        'You have git repos that need love <3',
                        rsp.unclean.join(',')
                    );
                }
            });
        }, millisec);
    }

    getData() {
        return new Promise((resolve) => {
            fs.readFile(userPath + '/data.json', 'utf8', (err, d) => {
                if(err) new Alert('danger', err);
                data = d ? JSON.parse(d) : data;
                resolve(data);
            });
        });
    }

    checkIfPathExists (arr, path) {
        let exists = false;
        let index = false;

        arr.forEach((value, i) => {
            const oldPath = value.path;

            if (path === oldPath) {
                exists = true;
                index = i;
            }
        });

        return { exists: exists, index: index };
    }

    saveDirectory(obj) {
        return new Promise((resolve, reject) => {
            const pathTest = this.checkIfPathExists(data.gitPaths, obj.path);

            if (!pathTest.exists) {
                data.gitPaths.push(obj);
                this.saveData().then(() => {
                    resolve({ success: true });
                });
            } else {
                data.gitPaths[pathTest.index] = obj;
                this.saveData().then(() => {
                    resolve({ success: true });
                });
            }
        });
    }

    saveData() {
        return new Promise((resolve, reject) => {
            fs.writeFile((userPath + '/data.json'), JSON.stringify(this.data), 'utf8', (rsp, error) => {
                resolve({ success: true });
            });
        });
    }

    removeItem (a, b) {
        const self = b ? b.$parent.app : this;
        const index = b.$index;
        self.data.gitPaths.splice(index, 1);
        self.saveData().then(() => {
            self.refreshRepos();
        });
    }

    openItemFolder (a, b) {
        const self = b ? b.$parent.app : this;
        const index = b.$index;
        const path = self.data.gitPaths[index].path;

        shell.showItemInFolder(path);
    }
    
    notifyUser (title, message) {
        // Do this from the renderer process
        const notif = new window.Notification(title, {
          body: message
        });

        // If the user clicks in the Notifications Center, show the app
        notif.onclick = () => {
          main.showMainWindow();
        };
    }

    refreshRepos(a, b) {
        const self = b ? b.app : this;
        return new Promise((resolve, reject) => {
            let allClean = true;
            let unclean = [];
            let counter = 0;
            let len = data.gitPaths.length;

            if (len) {
                document.getElementById('refreshIcon').classList.add('loading');
            } else {
                data.allClean = true;
            }

            data.gitPaths.forEach((obj, key) => {

                self.checkGitStatus(obj, key).then(statusObj => {

                    if (!statusObj.workingTreeClean){
                        allClean = false;
                        const name = statusObj.name;
                        unclean.push(name);
                    }

                    self.saveDirectory(statusObj).then(() => {
                        counter++;
                        if (counter === len) {
                            //Hack to update rivets view
                            data.allClean = allClean;
                            data.gitPaths.reverse();
                            data.gitPaths.reverse();
                            setTimeout(() => {
                                document
                                    .getElementById('refreshIcon')
                                    .classList.remove('loading');
                            }, 500);

                            resolve({ allClean: allClean, unclean: unclean });
                        }
                    });
                });
            });
        });
    }
}

new GitPanda();