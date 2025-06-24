        // ==== Access control check (Tester only) ====
        const roles = TokenManager.getRoles();
        if (!roles.includes('ROLE_TESTER')) {
            alert("Access denied. Tester privileges required.");
            window.location.href = '/index/sign_in/sign_in.html';
        }

        let selectedSubmissionId = null;
        let submissions = [];


        // Floating Code Animation
        function createFloatingCode() {
            const codeSnippets = [
                'public class Review {}', 'if (condition) { }', 'for (int i = 0; i < n; i++)',
                'try { } catch (Exception e) {}', 'return result;', 'private void method()',
                '@Override', '@Service', '@Autowired', 'String[] args',
                'System.out.println();', 'new ArrayList<>();', 'HashMap<String, Object>',
                'throws Exception', 'final static', 'package com.example;'
            ];

            const background = document.getElementById('backgroundAnimation');

            setInterval(() => {
                const code = document.createElement('div');
                code.className = 'floating-code';
                code.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
                code.style.left = Math.random() * 100 + '%';
                code.style.animationDuration = (15 + Math.random() * 10) + 's';

                background.appendChild(code);

                setTimeout(() => {
                    if (code.parentNode) {
                        code.parentNode.removeChild(code);
                    }
                }, 25000);
            }, 2000);
        }

        document.addEventListener('DOMContentLoaded', function () {
            createFloatingCode();
            loadSubmissions();
            updateStats();
        });

        function loadSubmissions() {
            fetch(`http://localhost:8080/api/review/submissions`, {
                headers: {
                    "Authorization": `Bearer ${TokenManager.getToken()}`,
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    submissions = data;
                    renderSubmissions();
                    updateStats();
                })
                .catch(error => {
                    showError("Failed to load submissions.");
                    console.error("Error fetching submissions:", error);
                });
        }

        async function updateStats() {
            try {
                // Get total submissions from already loaded `submissions` array
                const total = submissions.length;

                // Fetch reviews from backend
                const response = await fetch('http://localhost:8080/api/review/getAllReviews', {
                    headers: {
                        "Authorization": `Bearer ${TokenManager.getToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }

                const reviews = await response.json();
                const reviewed = reviews.length;
                const pending = total - reviewed;

                // Update DOM
                document.getElementById('totalSubmissions').textContent = total;
                document.getElementById('reviewedCount').textContent = reviewed;
                document.getElementById('pendingCount').textContent = pending;

            } catch (error) {
                console.error("Error in updateStats:", error);
                document.getElementById('reviewedCount').textContent = '—';
                document.getElementById('pendingCount').textContent = '—';
            }
        }


        function renderSubmissions() {
            const grid = document.getElementById('submissionsGrid');

            if (submissions.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <p>No submissions found</p>
                        <small>Load submissions to start reviewing code</small>
                    </div>
                `;
                return;
            }

            grid.innerHTML = submissions.map(sub => `
                <div class="submission-item" onclick="selectSubmission(${sub.id}, event)">
                    <div class="submission-header">
                        <div class="submission-id">ID: ${sub.id}</div>
                        <div class="submission-type">${sub.language}</div>
                    </div>
                    <div class="submission-title">${sub.title}</div>
                </div>
            `).join('');
        }

        function selectSubmission(id, event) {
            selectedSubmissionId = id;
            const submission = submissions.find(s => s.id === id);

            document.querySelectorAll('.submission-item').forEach(item => {
                item.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');

            document.getElementById('selectedSubmission').value =
                `${submission.title} (ID: ${id})`;

            document.getElementById('runReviewBtn').disabled = false;
            document.getElementById('viewReviewBtn').disabled = !submission.hasReview;
            document.getElementById('deleteReviewBtn').disabled = !submission.hasReview;
        }

        function runReview() {
            if (!selectedSubmissionId) return;

            showReviewResults();
            showLoading(true);

            fetch(`http://localhost:8080/api/review/run/${selectedSubmissionId}`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${TokenManager.getToken()}`,
                    "Content-Type": "application/json"
                }

            })
                .then(response => response.json())
                .then(result => {
                    showLoading(false);
                    displayReviewResult(result);
                    showSuccess('Review completed successfully!');

                    const submission = submissions.find(s => s.id === selectedSubmissionId);
                    if (submission) {
                        submission.hasReview = true;
                        renderSubmissions();
                        updateStats();
                    }
                })
                .catch(error => {
                    showLoading(false);
                    showError("Review failed.");
                    console.error(error);
                });
        }

        function refreshSubmissions() {
            showSuccess('Refreshing submissions...');
            loadSubmissions();
        }

        function showReviewResults() {
            document.getElementById('reviewResults').style.display = 'block';
            document.getElementById('reviewResults').scrollIntoView({ behavior: 'smooth' });
        }

        function closeReviewResults() {
            document.getElementById('reviewResults').style.display = 'none';
            document.getElementById('reviewContent').innerHTML = '';
            document.getElementById('issuesFound').textContent = '—'; // ⬅️ Reset here
        }

        function showLoading(show) {
            document.getElementById('reviewLoading').style.display = show ? 'block' : 'none';
            document.getElementById('reviewContent').style.display = show ? 'none' : 'block';
        }

        function displayReviewResult(result) {
            const content = document.getElementById('reviewContent');
            const reviewDate = new Date(result.reviewDate).toLocaleString();

            const issuesArray = result.issuesFound
                ? result.issuesFound.split('\n').filter(issue => issue.trim() !== '')
                : [];

            const issueCount = issuesArray.length / 4;

            // Update the issues found stat box
            document.getElementById('issuesFound').textContent = issueCount;

            content.innerHTML = `
    <span style="color: #60a5fa; font-weight: bold;">═══════════════════════════════════════════════════════════════
                        PMD CODE REVIEW RESULTS
    ═══════════════════════════════════════════════════════════════</span>

    <span style="color: #34d399;">📅 Review Date:</span> ${reviewDate}
    <span style="color: #34d399;">📋 Summary:</span> ${result.suggestionSummary}

    <span style="color: #fbbf24; font-weight: bold;">🔍 DETECTED ISSUES:</span>
    ${result.issuesFound || 'No issues found. Great job! 🎉'}

    <span style="color: #60a5fa; font-weight: bold;">═══════════════════════════════════════════════════════════════
                        END OF REPORT
    ═══════════════════════════════════════════════════════════════</span>
            `;
        }

        function fetchReviewedCountFromBackend() {
            fetch('http://localhost:8080/api/review/getAllReviews', {
                headers: {
                    "Authorization": `Bearer ${TokenManager.getToken()}`,
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch reviews");
                    }
                    return response.json();
                })
                .then(reviews => {
                    const reviewed = reviews.length;
                    const total = submissions.length;
                    const pending = total - reviewed;

                    document.getElementById('reviewedCount').textContent = reviewed;
                    document.getElementById('pendingCount').textContent = pending;
                })
                .catch(error => {
                    console.error("Error fetching reviews:", error);
                    document.getElementById('reviewedCount').textContent = '—';
                    document.getElementById('pendingCount').textContent = '—';
                });
        }


        function showSuccess(message) {
            const element = document.getElementById('successMessage');
            element.textContent = message;
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }

        function showError(message) {
            const element = document.getElementById('errorMessage');
            element.textContent = message;
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }