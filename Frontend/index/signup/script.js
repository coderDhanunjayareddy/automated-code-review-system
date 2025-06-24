 // Background animation
        function createFloatingCode() {
            const bgAnimation = document.getElementById('bgAnimation');
            const codeSnippets = [
                'function review(code) {',
                'const bugs = findBugs(code);',
                'if (quality > 80) {',
                'return approved;',
                '}',
                'class CodeReviewer {',
                'async analyze() {',
                'const result = await...',
                'git commit -m "fix"',
                'npm install',
                'docker build .',
                'kubectl apply -f',
                'SELECT * FROM reviews',
                'WHERE status = "pending"'
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

        // Form validation and submission
        class FormValidator {
            constructor() {
                this.form = document.getElementById('signupForm');
                this.setupEventListeners();
            }

            setupEventListeners() {
                this.form.addEventListener('submit', this.handleSubmit.bind(this));
                
                // Real-time validation
                ['name', 'email', 'password'].forEach(field => {
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

                switch(fieldName) {
                    case 'name':
                        if (field.value.trim().length < 2) {
                            isValid = false;
                            errorMessage = 'Name must be at least 2 characters long';
                        }
                        break;
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(field.value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid email address';
                        }
                        break;
                    case 'password':
                        if (field.value.length < 6) {
                            isValid = false;
                            errorMessage = 'Password must be at least 6 characters long';
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

            validateRole() {
                const roleInputs = document.querySelectorAll('input[name="role"]');
                const roleError = document.getElementById('roleError');
                const isSelected = Array.from(roleInputs).some(input => input.checked);
                
                if (!isSelected) {
                    roleError.textContent = 'Please select a role';
                    roleError.style.display = 'block';
                    return false;
                } else {
                    roleError.style.display = 'none';
                    return true;
                }
            }

            async handleSubmit(e) {
                e.preventDefault();

                // Validate all fields
                const nameValid = this.validateField('name');
                const emailValid = this.validateField('email');
                const passwordValid = this.validateField('password');
                const roleValid = this.validateRole();

                if (!nameValid || !emailValid || !passwordValid || !roleValid) {
                    return;
                }

                // Prepare data
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    password: document.getElementById('password').value,
                    role: document.querySelector('input[name="role"]:checked').value
                };

                // Show loading state
                this.setLoadingState(true);

                try {
                    const response = await fetch('http://localhost:8080/api/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    const result = await response.text();

                    if (response.ok) {
                        this.showSuccess(result);
                        this.form.reset();
                        // Redirect to login page after 2 seconds
                        setTimeout(() => {
                            window.location.href = 'http://127.0.0.1:5501/index/sign_in/sign_in.html';
                        }, 2000);
                    } else {
                        throw new Error(result);
                    }
                } catch (error) {
                    this.showError(error.message || 'Registration failed. Please try again.');
                } finally {
                    this.setLoadingState(false);
                }
            }

            setLoadingState(loading) {
                const btn = document.getElementById('signupBtn');
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

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            createFloatingCode();
            new FormValidator();
        });