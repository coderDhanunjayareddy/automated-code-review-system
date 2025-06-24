# 🛠️ Automated Code Review System

A full-stack application that automates static code analysis and review for Java-based submissions (and experimental Python support). This project is designed for developers, testers, and organizations looking to streamline code quality checks and improve development workflows.

---

## 🔍 Features

- ✨ **Automated Code Review** using PMD
- 🔐 **JWT-based Authentication & Role-based Access** (`DEVELOPER`, `TESTER`)
- 💾 **Spring Boot Backend** with MySQL Database
- 🧑‍💻 Submit Java or ZIP code files for analysis
- 📊 Review Results Dashboard for testers
- 🌐 Angular/Static Landing Page for access and navigation
- 📦 REST API for all interactions

---

## 🧱 Tech Stack

| Layer        | Technology                         |
|--------------|-------------------------------------|
| Backend      | Java 17, Spring Boot, Spring Security |
| Frontend     | Static HTML / Angular (optional)    |
| Database     | MySQL                              |
| Code Analysis| PMD (Java, limited Python support)  |
| Build Tool   | Maven                              |
| Auth         | JWT, Spring Security                |

---

## 🚀 Setup & Run

### Prerequisites

- Java 17+
- Maven
- MySQL
- Node.js (only if Angular is used)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/automated-code-review-system.git
cd automated-code-review-system
