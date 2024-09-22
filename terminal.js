$(document).ready(function() {
    const notepadWindow = $('#notepad-window');
    const notepadContent = $('#notepad-content');
    const notepadClose = $('#notepad-close');

    // State variables to track command progress
    let sudoLExecuted = false;
    let sudoVimExecuted = false;
    let bashExecuted = false;
    let whoamiExecuted = false;
    let secretFileVisible = false;

    // Fetch all .txt files in the GitHub repo (excluding secret.txt initially)
    function fetchRepoFiles(callback) {
        const repoApiUrl = "https://api.github.com/repos/promithi/promithi.github.io/contents/";

        fetch(repoApiUrl)
            .then(response => response.json())
            .then(files => {
                // Filter out 'secret.txt' if the commands haven't been executed
                let availableTxtFiles = files
                    .filter(file => file.name.endsWith('.txt') && (secretFileVisible || file.name !== 'secret.txt'))
                    .map(file => file.name);

                callback(availableTxtFiles);
            })
            .catch(error => {
                callback([], error.message);
            });
    }

    // Display formatted ls output with columns
    function displayLsOutput(files) {
        let output = '';
        const columnWidth = 20; // Define a fixed column width
        const columns = 3; // Adjust number of columns

        for (let i = 0; i < files.length; i++) {
            output += files[i].padEnd(columnWidth, ' '); // Align columns
            if ((i + 1) % columns === 0) {
                output += '\n'; // New line after every set of columns
            }
        }

        if (files.length % columns !== 0) {
            output += '\n'; // Final line break
        }

        return output;
    }

    // Open Notepad window with content
    function openNotepad(fileName, content) {
        notepadWindow.show();
        notepadContent.html(`<strong>${fileName}</strong><pre>${content}</pre>`);

        // Adjust the notepad window height based on content
        notepadWindow.height('auto');
        const contentHeight = notepadContent[0].scrollHeight + 40; // Adjust size
        notepadWindow.height(contentHeight);
    }

    // Close notepad
    notepadClose.click(function() {
        notepadWindow.hide();
    });

    // Terminal logic using JQuery Terminal
    $('#terminal').terminal(function(command) {
        const cmd = command.trim();

        // Sequence of commands to unlock secret.txt
        if (cmd === 'sudo -l') {
            sudoLExecuted = true;
            this.echo('(ALL) NOPASSWD: /usr/bin/vim');
        } else if (cmd === 'sudo vim' && sudoLExecuted) {
            sudoVimExecuted = true;
            this.echo('Entering vim...');
        } else if (cmd === ':!bash' && sudoVimExecuted) {
            bashExecuted = true;
            this.echo('Opening bash shell...');
        } else if (cmd === 'whoami' && bashExecuted) {
            whoamiExecuted = true;
            this.echo('root');
        } else if (cmd === 'exit' && whoamiExecuted) {
            secretFileVisible = true;
            this.echo('Exiting bash... secret.txt is now accessible.');

        // Handle 'ls' command, only show secret.txt after sequence completion
        } else if (cmd === 'ls') {
            fetchRepoFiles((files, error) => {
                if (error) {
                    this.echo(`Error fetching files: ${error}`);
                } else if (files.length === 0) {
                    this.echo('No .txt files found in the repository.');
                } else {
                    this.echo(displayLsOutput(files));
                }
            });

        // Handle 'cat secret.txt' command after the correct sequence
        } else if (cmd === 'cat secret.txt' && secretFileVisible) {
            openNotepad('secret.txt', 'Congrats on gaining access to the secret file! Send a mail to NmQ2OTZiNmI2YzYxNzI0MDcwNzI2Zjc0NmY2ZTIuNmQ2NQ== - You know what to do.');

        // Handle 'cat' for other .txt files
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

        // Handle 'clear' command
        } else if (cmd === 'clear') {
            this.clear();

        // Command not found handling
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
});