document.addEventListener('DOMContentLoaded', function() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const notepadWindow = document.getElementById('notepad-window');
  const notepadContent = document.getElementById('notepad-content');
  const notepadClose = document.getElementById('notepad-close');

  // Base API URL for fetching the repo contents (Replace 'your-username' and 'your-repo')
  const repoApiUrl = "https://api.github.com/repos/promithi/promithi.github.io/contents/";

  const commands = {
      'pwd': '/home/user',
      'ifconfig': 'eth0      Link encap:Ethernet  HWaddr 00:1C:42:2E:60:4A\n' +
                  '          inet addr:192.168.0.100  Bcast:192.168.0.255  Mask:255.255.255.0',
      'uname -a': 'Linux user-PC 5.4.0-73-generic #82-Ubuntu SMP x86_64 GNU/Linux',
      'clear': 'clear',
      'help': 'Available commands: ls, pwd, ifconfig, uname -a, cat, clear, help',
  };

  // Handle terminal input
  terminalInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
          e.preventDefault();
          const input = terminalInput.value.trim();
          terminalInput.value = ''; // Clear input field

          const inputCommand = input.split(" ")[0];
          const fileName = input.split(" ")[1];

          if (inputCommand === 'cat' && fileName) {
              fetchFile(fileName); // Handle fetching file content
          } else if (input === 'ls') {
              fetchRepoFiles(); // Fetch and display the .txt files
          } else if (input === 'clear') {
              terminalOutput.textContent = '';
          } else if (commands[input]) {
              terminalOutput.textContent += `\nuser@system:~$ ${input}\n${commands[input]}`;
          } else {
              terminalOutput.textContent += `\nuser@system:~$ ${input}\nCommand not found: ${input}`;
          }

          terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll to bottom
      }
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

  // Function to open the notepad window with file content
  function openNotepad(fileName, content) {
      notepadWindow.style.display = 'block';  // Show the notepad window
      notepadContent.innerHTML = `<strong>${fileName}</strong><pre>${content}</pre>`;  // Populate notepad with file content
      terminalOutput.textContent += `\nuser@system:~$ cat ${fileName}\nOpening ${fileName} in notepad window...`;
  }

  // Close notepad when 'x' button is clicked
  notepadClose.addEventListener('click', function() {
      notepadWindow.style.display = 'none';  // Hide the notepad window
  });

  // Fetch all files in the GitHub repo and filter for .txt files
  function fetchRepoFiles() {
      fetch(repoApiUrl)
          .then(response => response.json())
          .then(files => {
              const txtFiles = files
                  .filter(file => file.name.endsWith('.txt')) // Filter .txt files
                  .map(file => file.name) // Extract the file names
                  .join('  '); // Join the names into a single string

              if (txtFiles) {
                  terminalOutput.textContent += `\nuser@system:~$ ls\n${txtFiles}`;
              } else {
                  terminalOutput.textContent += `\nuser@system:~$ ls\nNo .txt files found in the repository.`;
              }
          })
          .catch(error => {
              terminalOutput.textContent += `\nuser@system:~$ ls\nError fetching files: ${error.message}`;
          });
  }
});