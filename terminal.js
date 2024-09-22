// Define terminalOutput globally
let terminalOutput;

document.addEventListener('DOMContentLoaded', function() {
    const terminalInput = document.getElementById('terminal-input');
    terminalOutput = document.getElementById('terminal-output');  // Set terminalOutput globally here
    const notepadWindow = document.getElementById('notepad-window');
    const notepadContent = document.getElementById('notepad-content');
    const notepadClose = document.getElementById('notepad-close');

    // Command history array
    let commandHistory = [];
    let historyIndex = -1;  // Tracks current position in history

    // State variables to track prerequisite commands
    let findCommandExecuted = false;
    let crontabCommandExecuted = false;
    let sudoCrontabCommandExecuted = false;

    let availableTxtFiles = []; // List of available .txt files

    

    // Function to scroll the terminal to the bottom
    function scrollToBottom() {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // Prevent form submission or default behavior

            const input = terminalInput.value.trim();  // Get the user input
            terminalInput.value = '';  // Clear the input field

            // Store the command in history and reset the history index
            if (input) {
                commandHistory.push(input);
                historyIndex = commandHistory.length;
            }

            // Display the command in the output (except for the 'clear' command)
            if (input !== 'clear') {
                terminalOutput.textContent += `\nuser@system:~$ ${input}\n`;
            }

            // Handling different commands
            if (input === 'ls') {
                fetchRepoFiles(); // Fetch .txt files and list them
            } else if (input === 'pwd') {
                terminalOutput.textContent += '/home/user\n';
            } else if (input === 'find / -perm -u=s -type f 2>/dev/null') {
                findCommandExecuted = true;
                terminalOutput.textContent += 'Searching for files...\n';
            } else if (input === 'crontab -l') {
                if (findCommandExecuted) {
                    crontabCommandExecuted = true;
                    terminalOutput.textContent += 'Listing user crontabs...\n';
                } else {
                    terminalOutput.textContent += 'Prerequisite command not executed.\n';
                }
            } else if (input === 'sudo crontab -l') {
                if (findCommandExecuted && crontabCommandExecuted) {
                    sudoCrontabCommandExecuted = true;
                    terminalOutput.textContent += 'Listing root crontabs...\n';
                } else {
                    terminalOutput.textContent += 'Prerequisite command not executed.\n';
                }
            } else if (input === 'cat secret') {
                // Only allow this command if the prerequisites have been executed
                if (findCommandExecuted && crontabCommandExecuted && sudoCrontabCommandExecuted) {
                    openNotepad('secret', 'Congrats on gaining access to the secret file! If you got this through the commands well done. If you did it with dark magic, then i think we will be a good fit! Send a mail to NmQ2OTZiNmI2YzYxNzI0MDcwNzI2Zjc0NmY2ZTIuNmQ2NQ== - You know what to do');
                } else {
                    terminalOutput.textContent += 'Error: You need to execute the correct sequence of commands first.\n';
                }
            } else if (input.startsWith('cat')) {
                const fileName = input.split(' ')[1]; // Get the filename from the command
                if (availableTxtFiles.includes(fileName)) {
                    fetchFile(fileName);
                } else {
                    terminalOutput.textContent += `Error: ${fileName} not found or not accessible.\n`;
                }
            } else if (input === 'clear') {
                // Clear the terminal output
                terminalOutput.textContent = '';
            } else if (input) {
                terminalOutput.textContent += `Command not found: ${input}\n`;
            }

            // Scroll to the bottom of the terminal output
            scrollToBottom();
        }

        // Handle up and down arrow keys for command history navigation
        if (e.key === 'ArrowUp') {
            // Navigate backward in history
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];  // Show the previous command
            }
        } else if (e.key === 'ArrowDown') {
            // Navigate forward in history
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];  // Show the next command
            } else {
                // Clear the input if we're at the end of the history
                terminalInput.value = '';
                historyIndex = commandHistory.length;  // Reset to the most recent position
            }
        }
    });

    // Call scrollToBottom whenever the page loads to ensure the input is visible
    scrollToBottom();

    // Close notepad when 'x' button is clicked
    notepadClose.addEventListener('click', function() {
        notepadWindow.style.display = 'none';  // Hide the notepad window
    });
});

// Fetch file content from GitHub repository
function fetchFile(fileName) {
    const fileUrl = `https://raw.githubusercontent.com/promithi/promithi.github.io/main/${fileName}`;

    fetch(fileUrl)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("File not found");
            }
        })
        .then(data => {
            openNotepad(fileName, data);  // Open the notepad with the file content
        })
        .catch(error => {
            terminalOutput.textContent += `\nuser@system:~$ cat ${fileName}\nError: ${error.message}`;
        });
}

// Function to open the notepad window with file content or custom info

function openNotepad(fileName, content) {
    const notepadWindow = document.getElementById('notepad-window');
    const notepadContent = document.getElementById('notepad-content');

    notepadWindow.style.display = 'block';  // Show the notepad window
    notepadContent.innerHTML = `<strong>${fileName}</strong><pre>${content}</pre>`;  // Populate notepad with file content

    // Adjust the notepad size based on content
    notepadWindow.style.height = 'auto';  // Remove fixed height
    const contentHeight = notepadContent.scrollHeight + 40;  // Add some padding
    notepadWindow.style.height = `${contentHeight}px`;  // Adjust notepad window to fit content

    terminalOutput.textContent += `\nuser@system:~$ cat ${fileName}\nOpening ${fileName} in notepad window...`;
}

// Fetch all .txt files in the GitHub repo
function fetchRepoFiles() {
    const repoApiUrl = "https://api.github.com/repos/promithi/promithi.github.io/contents/";

    fetch(repoApiUrl)
        .then(response => response.json())
        .then(files => {
            availableTxtFiles = files
                .filter(file => file.name.endsWith('.txt')) // Filter .txt files
                .map(file => file.name); // Extract the file names

            if (availableTxtFiles.length > 0) {
                const txtFilesList = availableTxtFiles.join('  '); // Join the names into a single string
                terminalOutput.textContent += `\nuser@system:~$ ls\n${txtFilesList}`;
            } else {
                terminalOutput.textContent += `\nuser@system:~$ ls\nNo .txt files found in the repository.`;
            }
        })
        .catch(error => {
            terminalOutput.textContent += `\nuser@system:~$ ls\nError fetching files: ${error.message}`;
        });
}