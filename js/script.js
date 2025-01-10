const socket = io();

// DOM elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const adminSection = document.getElementById('admin-section');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const logDisplay = document.getElementById('log-display');
const commandInput = document.getElementById('command-input');
const sendButton = document.getElementById('send-command');
const getUsersBtn = document.getElementById('get-users-btn');
const userList = document.getElementById('user-list');
const userIdInput = document.getElementById('user-id-input');
const loginInterface = document.getElementById('login-interface');
const listBtn = document.getElementById('list-btn');
const clearBtn = document.getElementById('clear-btn');
const restartBtn = document.getElementById('restart-btn');
const serverRuntime = document.getElementById('server-runtime');
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordStrength = document.getElementById('password-strength');
const passwordRequirements = document.getElementById('password-requirements');
const searchUsersInput = document.getElementById('search-users');
const paginationContainer = document.getElementById('pagination');
const actionSelect = document.getElementById('action-select');
const executeActionBtn = document.getElementById('execute-action-btn');
const spaceUsage = document.getElementById('space-usage');
const activeUsers = document.getElementById('active-users');
const fileList = document.getElementById('file-list');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const cpuUsage = document.getElementById('cpu-usage');
const memoryUsage = document.getElementById('memory-usage');
const diskUsage = document.getElementById('disk-usage');
const totalUsers = document.getElementById('total-users');
const activeSessions = document.getElementById('active-sessions');
const bannedUsers = document.getElementById('banned-users');

let currentUserId = null;
let isAdmin = false;
let allUsers = [];
let currentPage = 1;
const usersPerPage = 10;

function appendLog(message, target = logDisplay) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logEntry.classList.add('log-entry', 'fade-in');
    target.appendChild(logEntry);
    target.scrollTop = target.scrollHeight;
}

function showAppSection() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = Object.keys(users).find(name => users[name].id === currentUserId) || 'BLUExTOHID TECH 🌹';
    
    authSection.classList.add('hidden');
    loginInterface.classList.add('hidden');
    appSection.classList.remove('hidden');
    if (isAdmin) {
        adminSection.classList.remove('hidden');
    }
    
    // Add username display above terminal
    const usernameDisplay = document.createElement('div');
    usernameDisplay.textContent = `Terminal - ${username}`;
    usernameDisplay.classList.add('text-lg', 'font-bold', 'mb-2', 'text-green-500');
    logDisplay.parentNode.insertBefore(usernameDisplay, logDisplay);
    
    // Display BLUE ID message and user's UID
    appendLog("This is your ID👇");
    appendLog(`${currentUserId}`);
    
    setTimeout(() => {
        socket.emit('start', currentUserId);
        socket.emit('getServerRuntime');
        socket.emit('getFileList', currentUserId);
    }, 500);
}

function logout() {
    currentUserId = null;
    isAdmin = false;
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('users');
    authSection.classList.remove('hidden');
    loginInterface.classList.add('hidden');
    appSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    appendLog('Logged out successfully');
}

function checkExistingSession() {
    currentUserId = localStorage.getItem('currentUserId');
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (currentUserId) {
        showAppSection();
        appendLog(`Welcome back!😊😊`);
    } else {
        authSection.classList.remove('hidden');
        loginInterface.classList.add('hidden');
    }
}

function getClientId() {
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
        clientId = 'client_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('clientId', clientId);
    }
    return clientId;
}

function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' ? 
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>' : 
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>';
}

function checkPasswordStrength() {
    const password = passwordInput.value;
    passwordRequirements.classList.remove('hidden');
    
    if (password.length >= 7) {
        passwordStrength.textContent = 'Password strength: Strong';
        passwordStrength.className = 'mb-2 text-sm text-green-500';
        return true;
    } else {
        passwordStrength.textContent = 'Password strength: Weak';
        passwordStrength.className = 'mb-2 text-sm text-red-500';
        return false;
    }
}

function displayUsers(users) {
  userList.innerHTML = `
    <div class="p-2 border-b border-gray-600 font-bold">Total Users: ${users.length} / 40</div>
    <div class="text-red-500 font-bold p-2">⚠️ Warning: Displaying passwords is a severe security risk!</div>
  `;
  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.textContent = `Username: ${user.username}, ID: ${user.id}, Admin: ${user.isAdmin}, Password: ${user.password}`;
    userElement.classList.add('p-2', 'border-b', 'border-gray-600');
    userList.appendChild(userElement);
  });
}

function filterUsers() {
    const searchTerm = searchUsersInput.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) || 
        user.id.toLowerCase().includes(searchTerm)
    );
    displayUsers(filteredUsers);
    setupPagination(filteredUsers);
}

function setupPagination(users) {
    const pageCount = Math.ceil(users.length / usersPerPage);
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('px-3', 'py-1', 'bg-gray-700', 'hover:bg-gray-600', 'rounded');
        button.addEventListener('click', () => {
            currentPage = i;
            displayUsers(users.slice((i - 1) * usersPerPage, i * usersPerPage));
        });
        paginationContainer.appendChild(button);
    }
}

function updateFileList(files) {
    fileList.innerHTML = '';
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.classList.add(file.type);
        if (file.type === 'folder') {
            li.addEventListener('click', () => {
                socket.emit('getFileList', currentUserId, file.path);
            });
        }
        fileList.appendChild(li);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Event Listeners
registerBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (username && password) {
        if (currentUserId) {
            appendLog('You are already logged in. Please log out to create a new account.', loginInterface);
        } else if (!checkPasswordStrength()) {
            appendLog('Password must be at least 7 characters long.', loginInterface);
        } else {
            loginInterface.classList.remove('hidden');
            loginInterface.innerHTML = '';
            appendLog('Registering...', loginInterface);
            socket.emit('register', { username, password, clientId: getClientId() });
        }
    } else {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Please enter both username and password', loginInterface);
    }
});

loginBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    if (username && password) {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Logging in...', loginInterface);
        socket.emit('login', { username, password, clientId: getClientId() });
    } else {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Please enter both username and password', loginInterface);
    }
});

sendButton.addEventListener('click', () => {
    const command = commandInput.value;

    if (!currentUserId) {
        appendLog('Please log in first');
        return;
    }

    if (!command) {
        appendLog('Please enter a command');
        return;
    }

    socket.emit('command', { userId: currentUserId, message: command });

    commandInput.value = '';
});

listBtn.addEventListener('click', () => {
    if (currentUserId) {
        socket.emit('command', { userId: currentUserId, message: 'list' });
    } else {
        appendLog('Please log in first');
    }
});

clearBtn.addEventListener('click', () => {
    if (currentUserId) {
        socket.emit('command', { userId: currentUserId, message: 'clear' });
    } else {
        appendLog('Please log in first');
    }
});

restartBtn.addEventListener('click', () => {
    if (currentUserId) {
        socket.emit('start', currentUserId);
    } else {
        appendLog('Please log in first');
    }
});

getUsersBtn.addEventListener('click', () => {
    if (isAdmin) {
        socket.emit('adminGetUsers');
    }
});

executeActionBtn.addEventListener('click', () => {
    if (isAdmin) {
        const userId = userIdInput.value;
        const action = actionSelect.value;
        if (userId && action) {
            switch (action) {
                case 'ban':
                    socket.emit('adminBanUser', userId);
                    break;
                case 'unban':
                    socket.emit('adminUnbanUser', userId);
                    break;
                case 'delete':
                    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                        socket.emit('adminDeleteUser', userId);
                    }
                    break;
                default:
                    appendLog('Invalid action selected');
            }
        } else {
            appendLog('Please enter a User ID and select an action');
        }
    }
});

darkModeToggle.addEventListener('click', toggleDarkMode);

// Socket event listeners
socket.on('registerResponse', (response) => {
    if (response.success) {
        currentUserId = response.userId;
        localStorage.setItem('currentUserId', currentUserId);
        localStorage.setItem('isAdmin', 'false');
        appendLog(`Registered successfully. Your user BLUE ID is: ${currentUserId}`, loginInterface);
        showAppSection();
    } else {
        appendLog(`Registration failed: ${response.message}`, loginInterface);
    }
});

socket.on('loginResponse', (response) => {
    if (response.success) {
        currentUserId = response.userId;
        isAdmin = response.isAdmin;
        
        // Store users data in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[usernameInput.value] = { id: response.userId };
        localStorage.setItem('users', JSON.stringify(users));
        
        localStorage.setItem('currentUserId', currentUserId);
        localStorage.setItem('isAdmin', response.isAdmin);
        appendLog(`Logged in successfully. Your user ID is: ${currentUserId}`, loginInterface);
        showAppSection();
    } else {
        appendLog(`Login failed: ${response.message}`, loginInterface);
    }
});

socket.on('message', (message) => {
    if (typeof message === 'object' && message.type === 'spaceUsage') {
        spaceUsage.textContent = `${message.usage}`;
    } else if (message !== "This is your ID") {
        appendLog(message);
    }
    // Automatically scroll to the bottom of the log display
    logDisplay.scrollTop = logDisplay.scrollHeight;
});

socket.on('adminUserList', ({ users, totalUserCount }) => {
    allUsers = users;
    displayUsers(users.slice(0, usersPerPage));
    setupPagination(users);
});

socket.on('adminBanResponse', (response) => {
    appendLog(response.message);
});

socket.on('adminUnbanResponse', (response) => {
    appendLog(response.message);
});

socket.on('adminDeleteUserResponse', (response) => {
    appendLog(response.message);
    if (response.success) {
        // Refresh the user list if the deletion was successful
        socket.emit('adminGetUsers');
    }
});

socket.on('serverRuntime', (runtime) => {
    serverRuntime.textContent = `${runtime}`;
});

socket.on('fileList', (files) => {
    updateFileList(files);
});

socket.on('systemStatus', (status) => {
    cpuUsage.innerHTML = `CPU Usage: <span class="font-bold">${status.cpu}%</span>`;
    memoryUsage.innerHTML = `Memory Usage: <span class="font-bold">${status.memory}%</span>`;
    diskUsage.innerHTML = `Disk Usage: <span class="font-bold">${status.disk}%</span>`;
});

socket.on('userStats', (stats) => {
    totalUsers.innerHTML = `Total Users: <span class="font-bold">${stats.total}</span>`;
    activeSessions.innerHTML = `Active Sessions: <span class="font-bold">${stats.active}</span>`;
    bannedUsers.innerHTML = `Banned Users: <span class="font-bold">${stats.banned}</span>`;
    activeUsers.textContent = stats.active;
});

document.getElementById('logout-btn').addEventListener('click', logout);
togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
passwordInput.addEventListener('input', checkPasswordStrength);
searchUsersInput.addEventListener('input', filterUsers);

// Initialize
checkExistingSession();
if (localStorage.getItem('darkMode') === 'light') {
    toggleDarkMode();
}

// Periodically update server runtime and system status
setInterval(() => {
    socket.emit('getServerRuntime');
    if (isAdmin) {
        socket.emit('getSystemStatus');
        socket.emit('getUserStats');
    }
}, 5000);

