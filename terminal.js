$(document).ready(function() {
    const notepadWindow = $('#notepad-window');
    const notepadContent = $('#notepad-content');
    const notepadClose = $('#notepad-close');

    // State variables to track prerequisite commands
    let findCommandExecuted = false;
    let crontabCommandExecuted = false;
    let sudoCrontabCommandExecuted = false;

    // Fetch all .txt files in the GitHub repo
    function fetchRepoFiles(callback) {
        const repoApiUrl = "https://api.github.com/repos/promithi/promithi.github.io/contents/";

        fetch(repoApiUrl)
            .then(response => response.json())
            .then(files => {
                const availableTxtFiles = files
                    .filter(file => file.name.endsWith('.txt'))
                    .map(file => file.name);

                if (availableTxtFiles.length > 0) {
                    callback(availableTxtFiles);
                } else {
                    callback([]);
                }
            })
            .catch(error => {
                callback([], error.message);
            });
    }

    // Display formatted ls output with columns
    function displayLsOutput(files) {
        let output = '';
        const columnWidth = 20; 
        const columns = 3; 

        for (let i = 0; i < files.length; i++) {
            output += files[i].padEnd(columnWidth, ' '); 
            if ((i + 1) % columns === 0) {
                output += '\n'; 
            }
        }

        if (files.length % columns !== 0) {
            output += '\n'; 
        }

        return output;
    }

    // Open Notepad window with content
    function openNotepad(fileName, content) {
        notepadWindow.show();
        notepadContent.html(`<strong>${fileName}</strong><pre>${content}</pre>`);

        notepadWindow.height('auto');
        const contentHeight = notepadContent[0].scrollHeight + 40; 
        notepadWindow.height(contentHeight);
    }

    // Terminal logic
    $('#terminal').terminal(function(command) {
        const cmd = command.trim();
        
        if (cmd === 'ls') {
            fetchRepoFiles((files, error) => {
                if (error) {
                    this.echo(`Error fetching files: ${error}`);
                } else if (files.length === 0) {
                    this.echo('No .txt files found in the repository.');
                } else {
                    this.echo(displayLsOutput(files));
                }
            });
        } else if (cmd === 'pwd') {
            this.echo('/home/user');
        } else if (cmd === 'find / -perm -u=s -type f 2>/dev/null') {
            findCommandExecuted = true;
            this.echo('Searching for files...');
        } else if (cmd === 'crontab -l') {
            if (findCommandExecuted) {
                crontabCommandExecuted = true;
                this.echo('Listing user crontabs...');
            } else {
                this.echo('Prerequisite command not executed.');
            }
        } else if (cmd === 'sudo crontab -l') {
            if (findCommandExecuted && crontabCommandExecuted) {
                sudoCrontabCommandExecuted = true;
                this.echo('Listing root crontabs...');
            } else {
                this.echo('Prerequisite command not executed.');
            }
        } else if (cmd === 'cat secret.txt') {
            if (findCommandExecuted && crontabCommandExecuted && sudoCrontabCommandExecuted) {
                openNotepad('secret.txt', 'Congrats on gaining access to the secret file! Send a mail to NmQ2OTZiNmI2YzYxNzI0MDcwNzI2Zjc0NmY2ZTIuNmQ2NQ== - You know what to do.');
            } else {
                this.echo('Error: You need to execute the correct sequence of commands first.');
            }
        } else if (cmd.startsWith('cat ')) {
            const fileName = cmd.split(' ')[1];
            fetch(`https://raw.githubusercontent.com/promithi/promithi.github.io/main/${fileName}`)
                .then(response => {
                    if (!response.ok) throw new Error("File not found");
                    return response.text();
                })
                .then(data => {
                    openNotepad(fileName, data);
                })
                .catch(error => {
                    this.echo(`Error: ${fileName} not found.`);
                });
        } else if (cmd === 'clear') {
            this.clear();
        } else {
            this.echo(`Command not found: ${cmd}`);
        }
    }, {
        greetings: 'Welcome to the interactive terminal.',
        name: 'js_terminal',
        height: '100%', 
        width: '100%', 
        prompt: 'user@system:~$ ',
        completion: true
    });

    notepadClose.click(function() {
        notepadWindow.hide();
    });

});