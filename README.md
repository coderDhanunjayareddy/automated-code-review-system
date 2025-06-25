# 🤖 Automated Code Review System

An intelligent tool for analyzing and reviewing source code automatically using PMD. Built with a Java Spring Boot backend and static HTML/CSS frontend.

---

## 🚀 Features

- 🔐 Role-based login (Developer & Tester)
- 📤 Code submission (Snippets or ZIP)
- ⚙️ PMD-based code analysis for Java (and experimental Python support)
- 📄 Detailed review reports
- 🧰 Admin/Testers can run, view, and manage all reviews
- 📚 Documentation & tool usage guide

---

## 🛠️ Tech Stack

| Layer         | Technology Used         |
|---------------|--------------------------|
| Backend       | Java, Spring Boot, Spring Security |
| Code Analyzer | PMD (Java & Experimental Python) |
| Database      | MySQL                    |
| Frontend      | Static HTML, CSS, JS (no Angular) |
| Build Tool    | Maven                    |
| Others        | JWT, REST APIs           |

---

## 📂 Folder Structure

```
automated-code-review-system/
├── backend/
│   ├── src/
│   └── pom.xml
├── frontend/
│   ├── index.html
│   ├── login.html
│   └── styles.css
└── README.md
```

---

## ✅ Prerequisites

- Java 17+
- MySQL 8+
- Maven
- PMD CLI (installed or included in resources)

---

## 👇 1. Clone Repository

```bash
git clone https://github.com/yourusername/automated-code-review-system.git
cd automated-code-review-system
```

---

## ⚙️ 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

- Make sure MySQL is running
- Default port: `8080`
- You can test APIs using Postman or curl

---

## 💻 3. Frontend (Static Pages)

No build tools required. Just open the following pages in browser:

- `frontend/index.html` – Landing Page
- `frontend/login.html` – Login Page
- `frontend/submit.html` – Submit Code Page

---

## 🔐 User Roles & Auth

| Role     | Access                       |
|----------|------------------------------|
| Developer | Can login and submit code |
| Tester    | Can run PMD, view all reviews |

- JWT token used for authentication between frontend and backend.
- Tokens stored in browser localStorage.

---

## 📊 Code Analysis

- **PMD** is used to analyze Java code (also supports Apex, Kotlin, Scala, and more).
- Currently integrated for:
  - Java Snippets
  - Java Projects (.zip)
- Experimental support for Python (limited rules)

---

## 🔍 Sample Violating Code (Java)

```java
public class Example {
    public void test() {
        int a = 1; int b = 2; // multiple statements
        if (true) { System.out.println("Bad style!"); }
    }
}
```

---

## 📄 Useful Links

- 🔧 [PMD Documentation](https://pmd.github.io/)
- 📘 [Spring Boot Docs](https://docs.spring.io/spring-boot/)
- 🌐 [JWT Guide](https://jwt.io/)
- 🧪 [Postman](https://www.postman.com/)

---

## 📬 Contact

Have feedback or issues? Contact the team:

- 📧 Email: codereview@yourmail.com
- 🌐 Website: https://yourdomain.com

---

## 📜 License

This project is licensed under the **MIT License**.

---

## ❤️ Thanks for Visiting!

Made with 💻 & ☕ by passionate developers.
