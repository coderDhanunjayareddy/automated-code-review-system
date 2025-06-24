const API_BASE = 'http://localhost:8080/api/users';

    function checkAdminAccess() {
        const token = TokenManager.getToken();
        if (!token) {
            alert('Please login first');
            redirectToLogin();
            return false;   
        }

        try {
            const roles = TokenManager.getRoles();
            if (!roles.includes('ROLE_ADMIN'))  {
            alert('Access denied. Admin privileges required.');
            redirectToLogin();
            return false;
        }
            return true;
        } catch (error) {
            alert('Invalid token. Please login again.');
            redirectToLogin();
            return false;
        }
    }

    function redirectToLogin() {
        TokenManager.clearToken();
        window.location.href = 'http://127.0.0.1:5501/index/sign_in/sign_in.html';
    }

    function showMessage(message, type = 'loading') {
        const messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = `<div class="message ${type}">${message}</div>`;

        if (type !== 'loading') {
            setTimeout(() => {
                messageArea.innerHTML = '';
            }, 5000);
        }
    }

    async function makeAPICall(url, options = {}) {
        const token = TokenManager.getToken();

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);

            if (response.status === 401 || response.status === 403) {
                throw new Error('Access denied. Admin privileges required.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async function loadAllUsers() {
        if (!checkAdminAccess()) return;

        showMessage('Loading all employees...', 'loading');

        try {
            const users = await makeAPICall(`${API_BASE}/getAllemp`);
            displayUsers(users);
            showMessage(`Successfully loaded ${users.length} employees`, 'success');
        } catch (error) {
            showMessage(`Error loading users: ${error.message}`, 'error');
        }
    }

    async function searchById() {
        const id = document.getElementById('searchId').value.trim();
        if (!id) {
            alert('Please enter a User ID');
            return;
        }

        if (!checkAdminAccess()) return;

        showMessage('Searching user by ID...', 'loading');

        try {
            const user = await makeAPICall(`${API_BASE}/getById/${id}`);
            displayUsers([user]);
            showMessage('User found successfully', 'success');
        } catch (error) {
            showMessage(`Error finding user: ${error.message}`, 'error');
        }
    }

    async function searchByEmail() {
        const email = document.getElementById('searchEmail').value.trim();
        if (!email) {
            alert('Please enter an email address');
            return;
        }

        if (!checkAdminAccess()) return;

        showMessage('Searching user by email...', 'loading');

        try {
            const user = await makeAPICall(`${API_BASE}/getByemail/${email}`);
            displayUsers([user]);
            showMessage('User found successfully', 'success');
        } catch (error) {
            showMessage(`Error finding user: ${error.message}`, 'error');
        }
    }

    function displayUsers(users) {
        const tableBody = document.getElementById('usersTableBody');

        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No users found</td></tr>';
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span>
                </td>
                <td>
                    <button class="table-btn btn-view" onclick="viewUser(${user.id})">View</button>
                    <button class="table-btn btn-delete" onclick="deleteUser(${user.id}, '${user.name}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async function viewUser(userId) {
        if (!checkAdminAccess()) return;

        try {
            const user = await makeAPICall(`${API_BASE}/getById/${userId}`);
            showUserDetails(user);
        } catch (error) {
            showMessage(`Error loading user details: ${error.message}`, 'error');
        }
    }

    function showUserDetails(user) {
        const userDetails = document.getElementById('userDetails');
        userDetails.innerHTML = `
            <div class="user-detail"><label>User ID:</label><span>${user.id}</span></div>
            <div class="user-detail"><label>Full Name:</label><span>${user.name}</span></div>
            <div class="user-detail"><label>Email Address:</label><span>${user.email}</span></div>
            <div class="user-detail"><label>Role:</label>
                <span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span>
            </div>
        `;

        document.getElementById('userModal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('userModal').style.display = 'none';
    }

    async function deleteUser(userId, userName) {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
        if (!checkAdminAccess()) return;

        showMessage('Deleting user...', 'loading');

        try {
            await makeAPICall(`${API_BASE}/deleteById/${userId}`, { method: 'DELETE' });
            showMessage(`User "${userName}" deleted successfully`, 'success');
            loadAllUsers();
        } catch (error) {
            showMessage(`Error deleting user: ${error.message}`, 'error');
        }
    }

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            TokenManager.clearToken();
            window.location.href = 'http://127.0.0.1:5501/index/sign_in/sign_in.html';
        }
    }

    window.onclick = function (event) {
        const modal = document.getElementById('userModal');
        if (event.target === modal) {
            closeModal();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!checkAdminAccess()) return;
        loadAllUsers();
    });