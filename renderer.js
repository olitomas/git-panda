const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const spawn = require('child_process').spawn;
var fs = require('fs');
var main = remote.require('./main.js');
var CronJob = require('cron').CronJob;
const path = require('path');
const app = remote.app;
var userPath = app.getPath('userData');

var cronTask = null;

let data = {
    gitPaths: [],
    allClean: true,
    isPaid: false,
    waitHours: 4
};

const init = () => {
    getData().then((data) => {
        rivets.bind(document.getElementById('body'), {
            data: data,
            refreshRepos: refreshRepos,
            removeItem: removeItem,
            changeCronJob: changeCronJob,
        });

        startCronJob(data.waitHours);
    });
    setEvents();
};

const checkGitStatus = (path, name) => {
    return new Promise((resolve, reject) => {

        var fs = require('fs');
        if (!fs.existsSync(path)) {
            new Alert('Something is wrong with this directory: ' + name);
            resolve({error: true});
            return;
        }

        const command = spawn('git status', {
            cwd: path,
            shell: true
        });

        // Gets called when the bash script is successfull
        command.stdout.on('data', data => {
            let workingTreeClean = false;
            let branchIsAhead = false;

            if (`${data}`.indexOf('working tree clean') > -1) {
                workingTreeClean = true;
            }

            if (`${data}`.indexOf('branch is ahead of') > -1) {
                branchIsAhead = true;
            }

            const pathSplit = path.split(/[\\\/]/);
            const projectName = pathSplit[pathSplit.length - 1];

            resolve({
                name: projectName,
                path: path,
                workingTreeClean: workingTreeClean,
                branchIsAhead: branchIsAhead,
                error: null
            });
        });

        // Gets called when the bash script returns an error
        command.stderr.on('data', err => {
            resolve({ error: true });
        });

        // ls.on('close', (code) => {
        //   console.log(`child process exited with code ${code}`);
        // });
    });
};

const setEvents = () => {
    const selectDirBtn = document.getElementById('btn');

    selectDirBtn.addEventListener('click', function(event) {
        ipc.send('open-file-dialog');
    });

    ipc.on('selected-directory', function(event, path) {
        // document.getElementById('selected-file').innerHTML = `${path}`
        const url = path[0];
        const status = checkGitStatus(url).then(rsp => {
            if (rsp.error) {
                new Alert('danger', {
                    title: 'Something went terribly wrong',
                    message: 'Well, maybe not terribly....are you sure this is a Git directory ?',
                    timer: 10
                });
                return;
            }

            saveDirectory(rsp).then(() => {
                refreshRepos();
                new Alert('success', {
                    title: 'Success',
                    message: 'Well done! Your repo has been added to the list'
                });
            });
        });
    });

    ipc.on('ping', function(event, message) {
        if (message === 'refresh') {
            refreshRepos();
        }
    });
};

const changeCronJob = (a,b) => {
    var value = a.target.value;

    if(value && !isNaN(value)){
        startCronJob(value);
        document.getElementById('reminderInput').classList.remove('error');
        saveData();
    }else{
        document.getElementById('reminderInput').classList.add('error');
    }
};

const startCronJob = (cronTime) => {

    cronTime = cronTime || 4;

    if(cronTask) cronTask.stop();

    //Cron job
    cronTask = new CronJob({
      cronTime: '* * */' + cronTime + ' * * * ',
      onTick: function() {
        refreshRepos().then(rsp => {
            if (!rsp.allClean) {
                notifyUser(
                    'You have git repos that need love <3',
                    rsp.unclean.join(',')
                );
            }
        });
      },
      start: false,
      timeZone: 'America/Los_Angeles'
    });

    cronTask.start();
};

const getData = () => {
    return new Promise((resolve) => {
        fs.readFile(userPath + '/data.json', 'utf8', (err, d) => {
            data = d ? JSON.parse(d) : data;
            resolve(data);
        });
    });
};

const checkIfPathExists = (arr, path) => {
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
};

const saveDirectory = obj => {
    return new Promise((resolve, reject) => {
        const pathTest = checkIfPathExists(data.gitPaths, obj.path);

        if (!pathTest.exists) {
            data.gitPaths.push(obj);
            saveData().then(() => {
                resolve({ success: true });
            });
        } else {
            data.gitPaths[pathTest.index] = obj;
            saveData().then(() => {
                resolve({ success: true });
            });
        }
    });
};

const saveData = () => {
    return new Promise((resolve, reject) => {
        fs.writeFile(userPath + '/data.json', JSON.stringify(data), 'utf8', rsp => {
            resolve({ success: true });
        });
    });
};

const removeItem = (a, b) => {
    const index = b.$index;
    b.$parent.data.gitPaths.splice(index, 1);
    saveData().then(() => {
        refreshRepos();
    });
};

const notifyUser = (title, message) => {
    // Do this from the renderer process
    var notif = new window.Notification(title, {
      body: message
    });

    // If the user clicks in the Notifications Center, show the app
    notif.onclick = function () {
      main.showMainWindow();
    };
};

const refreshRepos = () => {
    return new Promise((resolve, reject) => {
        let allClean = true;
        let unclean = [];
        let counter = 0;
        let len = data.gitPaths.length;

        if (len) {
            document.getElementById('refreshIcon').classList.add('loading');
        } else {
            data.allClean = true;
            saveData();
        }

        data.gitPaths.forEach((obj, key) => {
            checkGitStatus(obj.path, obj.name).then(statusObj => {
                if (!statusObj.workingTreeClean){
                    allClean = false;
                    const name = statusObj.name;
                    unclean.push(name);
                }
                saveDirectory(statusObj).then(() => {
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
};

init();
