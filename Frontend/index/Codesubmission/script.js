// ==== Access control check (Developer only) ====
    const roles = TokenManager.getRoles();
    if (!roles.includes('ROLE_DEVELOPER')) {
        alert("Access denied. Developer privileges required.");
        window.location.href = '/index/sign_in/sign_in.html';
    }
    
    // Tab switching
    function switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(navTab => {
            navTab.classList.remove('active');
        });
        
        // Show selected tab
        if (tabName === 'submit') {
            document.getElementById('submitTab').classList.add('active');
            document.querySelector('.nav-tab').classList.add('active');
        } else if (tabName === 'manage') {
            document.getElementById('manageTab').classList.add('active');
            document.querySelectorAll('.nav-tab')[1].classList.add('active');
        }
    }
    
    // Background animation
    function createFloatingCode() {
        const codes = [
            'function review(code)',
            'if (bugs.length > 0)',
            'class CodeAnalyzer',
            'import java.util.*',
            'def analyze_code():',
            'console.log("review")',
            '{} => analysis',
            'String result = ""',
            'return feedback;',
            'catch (Exception e)'
        ];
        
        const container = document.getElementById('backgroundAnimation');
        
        setInterval(() => {
            const code = document.createElement('div');
            code.className = 'floating-code';
            code.textContent = codes[Math.floor(Math.random() * codes.length)];
            code.style.left = Math.random() * 100 + '%';
            code.style.animationDuration = (Math.random() * 10 + 15) + 's';
            container.appendChild(code);
            
            setTimeout(() => {
                if (code.parentNode) {
                    code.parentNode.removeChild(code);
                }
            }, 25000);
        }, 3000);
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Show loading state
    function showLoading(btn) {
        btn.disabled = true;
        btn.querySelector('.btn-text').style.opacity = '0';
        btn.querySelector('.btn-loading').style.display = 'block';
    }

    // Hide loading state
    function hideLoading(btn) {
        btn.disabled = false;
        btn.querySelector('.btn-text').style.opacity = '1';
        btn.querySelector('.btn-loading').style.display = 'none';
    }

    // Show message
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    element.className = isError ? 'error-message' : 'success-message';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// File upload handlers
function setupFileUpload(uploadAreaId, inputId, selectedFileId, fileNameId, fileSizeId, removeFileId, submitBtnId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = document.getElementById(inputId);
    const selectedFile = document.getElementById(selectedFileId);
    const fileName = document.getElementById(fileNameId);
    const fileSize = document.getElementById(fileSizeId);
    const removeFile = document.getElementById(removeFileId);
    const submitBtn = document.getElementById(submitBtnId);

    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    removeFile.addEventListener('click', () => {
        fileInput.value = '';
        selectedFile.style.display = 'none';
        submitBtn.disabled = true;
    });

    function handleFileSelect(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        selectedFile.style.display = 'flex';
        submitBtn.disabled = false;
    }
}

// Text submission form handler
document.getElementById('textSubmissionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('textSubmitBtn');
    const codeTextarea = document.getElementById('codeTextarea');
    const selectedLanguage = document.querySelector('input[name="textLanguage"]:checked').value;
    
    if (!codeTextarea.value.trim()) {
        showMessage('textError', 'Please enter some code to submit.', true);
        return;
    }

    showLoading(submitBtn);

    try {
        const token = TokenManager.getToken();
        const response = await fetch('http://localhost:8080/api/submissions/upload/body', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                submittedCode: codeTextarea.value,
                language: selectedLanguage
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('textSuccess', data.message || 'Code submitted successfully!');
            codeTextarea.value = '';
        } else {
            showMessage('textError', data.message || 'Failed to submit code.', true);
        }
    } catch (error) {
        showMessage('textError', 'Network error: ' + error.message, true);
    } finally {
        hideLoading(submitBtn);
    }
});

// File submission form handler
document.getElementById('fileSubmissionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('fileSubmitBtn');
    const fileInput = document.getElementById('fileInput');
    const languageSelect = document.getElementById('fileLanguage');
    
    if (!fileInput.files.length) {
        showMessage('fileError', 'Please select a file to upload.', true);
        return;
    }

    showLoading(submitBtn);

    try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('language', languageSelect.value);

        const token = TokenManager.getToken();
        const response = await fetch('http://localhost:8080/api/submissions/upload/file', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('fileSuccess', data.message || 'File uploaded successfully!');
            fileInput.value = '';
            document.getElementById('selectedFile').style.display = 'none';
            submitBtn.disabled = true;
        } else {
            showMessage('fileError', data.message || 'Failed to upload file.', true);
        }
    } catch (error) {
        showMessage('fileError', 'Network error: ' + error.message, true);
    } finally {
        hideLoading(submitBtn);
    }
});

// ZIP submission form handler
document.getElementById('zipSubmissionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('zipSubmitBtn');
    const zipInput = document.getElementById('zipInput');
    
    if (!zipInput.files.length) {
        showMessage('zipError', 'Please select a ZIP file to upload.', true);
        return;
    }

    const file = zipInput.files[0];
    if (!file.name.toLowerCase().endsWith('.zip')) {
        showMessage('zipError', 'Please select a valid ZIP file.', true);
        return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        showMessage('zipError', 'File size exceeds 50MB limit.', true);
        return;
    }

    showLoading(submitBtn);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const token = TokenManager.getToken();
        const response = await fetch('http://localhost:8080/api/submissions/upload/zip', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('zipSuccess', data.message || 'ZIP file uploaded successfully!');
            zipInput.value = '';
            document.getElementById('selectedZip').style.display = 'none';
            submitBtn.disabled = true;
        } else {
            showMessage('zipError', data.message || 'Failed to upload ZIP file.', true);
        }
    } catch (error) {
        showMessage('zipError', 'Network error: ' + error.message, true);
    } finally {
        hideLoading(submitBtn);
    }
});

// Load all submissions
async function loadAllSubmissions() {
    const btn = event.target;
    showLoading(btn);

    try {
        const token = TokenManager.getToken();
        const response = await fetch('http://localhost:8080/api/submissions/getAllCodeSub', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const submissions = await response.json();
            displaySubmissions(submissions);
            showMessage('manageSuccess', `Loaded ${submissions.length} submissions.`);
        } else {
            showMessage('manageError', 'Failed to load submissions.', true);
        }
    } catch (error) {
        showMessage('manageError', 'Network error: ' + error.message, true);
    } finally {
        hideLoading(btn);
    }
}

// Display submissions
function displaySubmissions(submissions) {
    const submissionsList = document.getElementById('submissionsList');
    
    if (submissions.length === 0) {
        submissionsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">No submissions found.</div>';
        return;
    }

    submissionsList.innerHTML = submissions.map(submission => `
        <div class="submission-item">
            <div class="submission-info">
                <div class="submission-id">ID: ${submission.id}</div>
                <div class="submission-details">
                    Language: ${submission.language || 'N/A'} | 
                    Submitted: ${new Date(submission.createdAt || Date.now()).toLocaleString()}
                </div>
            </div>
            <div class="submission-actions">
                <button class="btn-small btn-view" onclick="viewSubmission(${submission.id})">View</button>
                <button class="btn-small btn-delete" onclick="deleteSubmission(${submission.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// View submission by ID
async function viewSubmission(id) {
    try {
        const token = TokenManager.getToken();
        const response = await fetch(`http://localhost:8080/api/submissions/getCodeSubById/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const submission = await response.json();
            displaySubmissionDetails(submission);
        } else {
            showMessage('manageError', 'Failed to load submission details.', true);
        }
    } catch (error) {
        showMessage('manageError', 'Network error: ' + error.message, true);
    }
}

// Get submission by ID (from input)
async function getSubmissionById() {
    const idInput = document.getElementById('submissionIdInput');
    const id = idInput.value.trim();
    
    if (!id) {
        showMessage('manageError', 'Please enter a submission ID.', true);
        return;
    }

    await viewSubmission(parseInt(id));
}

// Display submission details
function displaySubmissionDetails(submission) {
    const detailsDiv = document.getElementById('submissionDetails');
    const contentDiv = document.getElementById('submissionContent');
    
    contentDiv.innerHTML = `
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <strong>ID:</strong> ${submission.id}<br>
            <strong>Language:</strong> ${submission.language || 'N/A'}<br>
            <strong>User ID:</strong> ${submission.userId}<br>
            <strong>Created:</strong> ${new Date(submission.createdAt || Date.now()).toLocaleString()}
        </div>
        ${submission.submittedCode ? `
            <div class="code-display">${escapeHtml(submission.submittedCode)}</div>
        ` : '<div style="color: #6b7280; font-style: italic;">No code content available (might be a file upload)</div>'}
    `;
    
    detailsDiv.style.display = 'block';
}

// Delete submission
async function deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission?')) {
        return;
    }

    try {
        const token = TokenManager.getToken();
        const response = await fetch(`http://localhost:8080/api/submissions/deleteCodeSubById/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showMessage('manageSuccess', 'Submission deleted successfully.');
            loadAllSubmissions();
        } else {
            showMessage('manageError', 'Failed to delete submission.', true);
        }
    } catch (error) {
        showMessage('manageError', 'Network error: ' + error.message, true);
    }
}

// Get review by ID
async function getReviewById() {
    const idInput = document.getElementById('reviewIdInput');
    const id = idInput.value.trim();
    
    if (!id) {
        showMessage('manageError', 'Please enter a review ID.', true);
        return;
    }

    try {
        const token = TokenManager.getToken();
        const response = await fetch(`http://localhost:8080/api/submissions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const review = await response.json();
            displayReviewDetails(review);
            showMessage('manageSuccess', 'Review loaded successfully.');
        } else {
            showMessage('manageError', 'Failed to load review details.', true);
        }
    } catch (error) {
        showMessage('manageError', 'Network error: ' + error.message, true);
    }
}

// Display review details
function displayReviewDetails(review) {
    const detailsDiv = document.getElementById('reviewDetails');
    const contentDiv = document.getElementById('reviewContent');

    contentDiv.innerHTML = `
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <strong>Review ID:</strong> ${review.id || 'N/A'}<br>
            <strong>Language:</strong> ${review.submission?.language || 'N/A'}<br>
            <strong>Submitted Date:</strong> ${review.submission?.submittedDate ? new Date(review.submission.submittedDate).toLocaleString() : 'N/A'}<br>
            <strong>Review Date:</strong> ${review.reviewDate ? new Date(review.reviewDate).toLocaleString() : 'N/A'}
        </div>
        ${review.issuesFound ? `
            <div class="review-display">
                <h4>Issues Found:</h4>
                <pre>${escapeHtml(review.issuesFound)}</pre>
            </div>
        ` : ''}
        ${review.suggestionSummary ? `
            <div class="review-display">
                <h4>Suggestion Summary:</h4>
                <pre>${escapeHtml(review.suggestionSummary)}</pre>
            </div>
        ` : ''}
        ${review.submission?.submittedCode ? `
            <div class="review-display">
                <h4>Submitted Code:</h4>
                <pre>${escapeHtml(review.submission.submittedCode)}</pre>
            </div>
        ` : ''}
    `;

    detailsDiv.style.display = 'block';
}


// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Setup file upload handlers
    setupFileUpload('fileUploadArea', 'fileInput', 'selectedFile', 'fileName', 'fileSize', 'removeFile', 'fileSubmitBtn');
    setupFileUpload('zipUploadArea', 'zipInput', 'selectedZip', 'zipName', 'zipSize', 'removeZip', 'zipSubmitBtn');
    
    // Start background animation
    createFloatingCode();
    
    // Load submissions if on manage tab
    if (document.getElementById('manageTab').classList.contains('active')) {
        loadAllSubmissions();
    }
});