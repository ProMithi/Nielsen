function setupTerminal() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const notepadWindow = document.getElementById('notepad-window');
    const notepadContent = document.getElementById('notepad-content');
    const notepadClose = document.getElementById('notepad-close');
  
    // Command responses
    const commands = {
      'ls': 'professional_experience.txt  skills.txt  certifications.txt',
      'pwd': '/home/user',
      'ifconfig': 'eth0      Link encap:Ethernet  HWaddr 00:1C:42:2E:60:4A\n' +
                  '          inet addr:192.168.0.100  Bcast:192.168.0.255  Mask:255.255.255.0\n' +
                  '          inet6 addr: fe80::21c:42ff:fe2e:604a/64 Scope:Link',
      'uname -a': 'Linux user-PC 5.4.0-73-generic #82-Ubuntu SMP x86_64 GNU/Linux',
      'clear': 'clear',
      'help': 'Available commands: ls, pwd, ifconfig, uname -a, cat, clear, help',
      'cat skills.txt': 'Opening skills.txt in Notepad window...',
    };
  
    // Handle terminal input
    terminalInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const input = terminalInput.value.trim();
        terminalInput.value = '';
  
        if (input in commands) {
          if (input === 'clear') {
            terminalOutput.textContent = '';
          } else if (input === 'cat skills.txt') {
            openNotepad();
          } else {
            terminalOutput.textContent += `\nuser@system:~$ ${input}\n${commands[input]}`;
          }
        } else {
          terminalOutput.textContent += `\nuser@system:~$ ${input}\nCommand not found: ${input}`;
        }
  
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });
  
    // Open Notepad window
    function openNotepad() {
      notepadWindow.style.display = 'block';
      terminalOutput.textContent += `\nuser@system:~$ cat skills.txt\n${commands['cat skills.txt']}`;
    }
  
    // Close Notepad window
    notepadClose.addEventListener('click', () => {
      notepadWindow.style.display = 'none';
    });
  }
  
  // Initialize the terminal after the page loads
  window.onload = setupTerminal;