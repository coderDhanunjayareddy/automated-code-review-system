        // Background animation
        function createFloatingCode() {
            const bgAnimation = document.getElementById('bgAnimation');
            const codeSnippets = [
                'function authenticate() {',
                'const token = jwt.sign(payload);',
                'if (user.isValid()) {',
                'return response.ok();',
                '}',
                'class AuthService {',
                'async login() {',
                'const user = await...',
                'git pull origin main',
                'npm run build',
                'docker-compose up',
                'redis-cli ping',
                'SELECT user FROM auth',
                'WHERE email = ?',
                'bcrypt.compare(password)'
            ];

            setInterval(() => {
                const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
                const floatingCode = document.createElement('div');
                floatingCode.className = 'floating-code';
                floatingCode.textContent = snippet;
                floatingCode.style.left = Math.random() * 100 + '%';
                floatingCode.style.animationDuration = (Math.random() * 10 + 15) + 's';
                floatingCode.style.fontSize = (Math.random() * 8 + 12) + 'px';

                bgAnimation.appendChild(floatingCode);

                setTimeout(() => {
                    floatingCode.remove();
                }, 25000);
            }, 2000);
        }

        // Password visibility toggle
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleBtn = document.querySelector('.password-toggle');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        }

        // Form validation and submission
        class SignInValidator {
            constructor() {
                this.form = document.getElementById('signinForm');
                this.checkExistingAuth();
                this.setupEventListeners();
            }

            checkExistingAuth() {
                if (TokenManager.isLoggedIn()) {
                    const user = TokenManager.getUserInfo();
                    if (user) {
                        this.showUserInfo({
                            email: user.email,
                            role: user.role
                        });
                    }
                }
            }

            setupEventListeners() {
                this.form.addEventListener('submit', this.handleSubmit.bind(this));

                // Real-time validation
                ['email', 'password'].forEach(field => {
                    document.getElementById(field).addEventListener('blur', () => {
                        this.validateField(field);
                    });
                });
            }

            validateField(fieldName) {
                const field = document.getElementById(fieldName);
                const errorElement = document.getElementById(fieldName + 'Error');
                let isValid = true;
                let errorMessage = '';

                switch (fieldName) {
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(field.value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid email address';
                        }
                        break;
                    case 'password':
                        if (field.value.length < 1) {
                            isValid = false;
                            errorMessage = 'Password is required';
                        }
                        break;
                }

                if (isValid) {
                    field.classList.remove('error');
                    errorElement.style.display = 'none';
                } else {
                    field.classList.add('error');
                    errorElement.textContent = errorMessage;
                    errorElement.style.display = 'block';
                }

                return isValid;
            }

            async handleSubmit(e) {
                e.preventDefault();

                // Validate all fields
                const emailValid = this.validateField('email');
                const passwordValid = this.validateField('password');

                if (!emailValid || !passwordValid) {
                    return;
                }

                // Prepare data
                const formData = {
                    email: document.getElementById('email').value.trim(),
                    password: document.getElementById('password').value
                };

                // Show loading state
                this.setLoadingState(true);

                try {
                    const response = await fetch('http://localhost:8080/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    // The handleSubmit method's success block

                    if (response.ok) {
                        const result = await response.json();
                        // ⬇️ Store token in sessionStorage
                        TokenManager.setToken(result.token, 3600);  // 1 hour expiry

                        this.showSuccess('Login successful! Redirecting...');

                        // Show user info
                        this.showUserInfo({
                            email: result.email,
                            role: result.role
                        });

                        // Role-based redirection
                        setTimeout(() => {
                            if (result.role === 'ADMIN') {
                                // Redirect admin to admin dashboard
                                window.location.href = 'http://127.0.0.1:5501/index/userDetails/userDetails.html';
                            } else if (result.role === 'DEVELOPER') {
                                // Redirect employees to their dashboard (you'll need to create this)
                                window.location.href = 'http://127.0.0.1:5501/index/Codesubmission/Codesubmission.html';
                            } else if (result.role === 'TESTER') {
                                // Redirect employees to their dashboard (you'll need to create this)
                                window.location.href = 'http://127.0.0.1:5501/index/CodeReview/CodeReview.html';
                            } else {
                                // Fallback for unknown roles
                                window.location.href = 'http://127.0.0.1:5501/index/signup/signup.html';
                            }
                        }, 1500);   
                    } else {
                        const errorText = await response.text();
                        throw new Error(errorText);
                    }
                } catch (error) {
                    let errorMessage = 'Login failed. Please try again.';

                    if (error.message.includes('User not found')) {
                        errorMessage = 'No account found with this email address.';
                    } else if (error.message.includes('Invalid password')) {
                        errorMessage = 'Incorrect password. Please try again.';
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    this.showError(errorMessage);
                } finally {
                    this.setLoadingState(false);
                }
            }

            showUserInfo(user) {
                const userInfo = document.getElementById('userInfo');
                const userEmail = document.getElementById('userEmail');
                const userRole = document.getElementById('userRole');
                const signinForm = document.getElementById('signinForm');

                userEmail.textContent = user.email;
                userRole.textContent = user.role;
                userInfo.style.display = 'block';
                signinForm.style.display = 'none';
            }

            setLoadingState(loading) {
                const btn = document.getElementById('signinBtn');
                const btnText = document.getElementById('btnText');
                const btnLoading = document.getElementById('btnLoading');

                if (loading) {
                    btn.disabled = true;
                    btnText.style.opacity = '0';
                    btnLoading.style.display = 'block';
                } else {
                    btn.disabled = false;
                    btnText.style.opacity = '1';
                    btnLoading.style.display = 'none';
                }
            }

            showSuccess(message) {
                const successElement = document.getElementById('successMessage');
                const errorElement = document.getElementById('errorAlert');

                errorElement.style.display = 'none';
                successElement.textContent = message;
                successElement.style.display = 'block';

                setTimeout(() => {
                    successElement.style.display = 'none';
                }, 5000);
            }

            showError(message) {
                const errorElement = document.getElementById('errorAlert');
                const successElement = document.getElementById('successMessage');

                successElement.style.display = 'none';
                errorElement.textContent = message;
                errorElement.style.display = 'block';

                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 5000);
            }
        }

        // Logout function
        function logout() {
            TokenManager.removeToken();
            location.reload();
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            createFloatingCode();
            new SignInValidator();
        });