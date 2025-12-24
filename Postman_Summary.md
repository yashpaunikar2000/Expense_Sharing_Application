
# 💸 Expense Sharing Application


A **Splitwise-like Expense Sharing Application** built with **Node.js, Express, and MongoDB**, designed to handle **group expenses**, **balance tracking**, and **settlement management** using clean and scalable backend architecture.

This project demonstrates **real-world backend system design**, focusing on correct data flow, normalized schemas, and production-ready business logic.

---

## 🚀 Features

* 👤 User registration & authentication-ready structure
* 👥 Group creation and member management
* 💸 Expense splitting with multiple strategies:

  * Equal split
  * Exact split
  * Percentage split
* ⚖️ Automatic balance calculation (who owes whom)
* 🔁 Settlement suggestions to minimize transactions
* ✅ Record settlements and update balances
* 📮 Fully testable via Postman

---

## 🧠 System Design Overview

```txt
User → Group → Expense → Balance → Settlement
```

* **Expenses** trigger balance updates
* **Balances** are stored incrementally (not recalculated every time)
* **Settlements** reduce balances and help users settle up

This design ensures **fast reads**, **data consistency**, and **scalability**.

---

## 🛠 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **API Testing:** Postman
* **Environment Management:** dotenv

---
## 📁 Folder Structure

```
📦 YASH PROJECT/
│
├── ⚙️ config/
│   └── db.js                  # MongoDB connection 
│
├── 🎮 controllers/
│   ├── userController.js      # Create user, get user
│   ├── groupController.js     # Create group, add members
│   ├── expenseController.js   # Add expense, split logic 
│   └── balanceController.js   # Balances & settlements 
│
├── 🧠 models/
│   ├── User.js                # User schema 
│   ├── Group.js               # Group schema 
│   ├── Expense.js             # Expense + splits 
│   ├── Balance.js             # Net balances (who owes whom) 
│   ├── Settlement.js          # Settlement history (optional) 
│   └── index.js               # Model exports 
│
├── 🛣️ routes/
│   ├── userRoutes.js
│   ├── groupRoutes.js
│   ├── expenseRoutes.js
│   └── balanceRoutes.js
│
├── 🛠️ utils/
│   ├── balanceCalculator.js   # Balance simplification logic 
│   └── validators.js          # Split validation (exact / %) 
│
├── 🌱 seed.js                 # Dummy data (optional)
│
├── 🚀 server.js               # App entry point
├── INDEX.js                   # (Optional alias / ignore)
│
├── 🔐 .env
├── 🙈 .gitignore
├── 📦 package.json
├── 📦 package-lock.json
└── 📁 node_modules/

```
---

## 🔌 API ENDPOINTS
```
👥GROUPS (7 endpoints)
  POST   /api/groups                    Create group
  GET    /api/groups                    Get your groups
  GET    /api/groups/:id                Get group details
  PUT    /api/groups/:id                Update group
  DELETE /api/groups/:id                Delete group
  POST   /api/groups/:id/members        Add member
  DELETE /api/groups/:id/members/:mid   Remove member

💸EXPENSES (7 endpoints)
  POST   /api/expenses/:gid/expenses       Add expenses 
  GET    /api/expenses/:gid/expenses       Get expenses
  GET    /api/expenses/expenses/:id        Get details 
  PUT    /api/expenses/expenses/:id        Update
  DELETE /api/expenses/expenses/:id        Delete
  GET    /api/expenses/:gid/expenses/category  Filter
  GET    /api/expenses/:gid/expenses/user    User's expenses

⚖️BALANCE & SETTLEMENT (7 endpoints)
  GET    /api/balance/:gid/balance           Your balance
  GET    /api/balance/:gid/balances          All balances
  GET    /api/balance/:gid/settlements/suggestions 
  POST  /api/balance/:gid/settlements       Record payment
  GET   /api/balance/:gid/settlements       Get settlement
 GET   /api/balance/:gid/settlements/user  Your settlement
 GET   /api/balance/settlements/:id        Get details

```
---
## 💾 DATABASE (MongoDB)
```
📚 Collections:
• Users        (User profiles & group memberships)
• Groups       (Groups with members)
• Expenses     (Expenses with split details)
• Balances     (Balance tracking)
• Settlements  (Payment records)

➗ Split Types Supported:
1. EQUAL       --Divide amount equally.
2. EXACT       --Specify exact amount for each person.
3. PERCENTAGE  --Distribute by percentage.

```
---
## ⚙️ Installation & Setup 
* Node.js (v18+ recommended)
* npm or yarn
* MongoDB (local or Atlas)
* Postman
---

## Clone the Repository

```bash
git clone https://github.com/your-username/expense-splitter-backend.git
cd expense-splitter-backend
```

---

## Install Dependencies

```bash
npm install
```

---

---

## Run the Server

```bash
npm start
```

or (with nodemon):

```bash
npm run dev
```

---

### Health Check

```txt
http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "Server is running",
  "version": "1.0.0"
}
```
---
## 💖 Support the Project

This Expense Sharing Application is an open-source project built to demonstrate real-world backend system design, inspired by applications like Splitwise.
It emphasizes clean architecture, correct data flow, and production-ready logic for expense sharing, balance tracking, and settlements.

Developing and maintaining such systems requires significant effort, especially when handling complex data flows across multiple modules.

If you find this project useful or educational, you can support it by:

⭐ Starring the repository

🔗 Giving proper credit if you reuse the logic or architecture

📢 Sharing it with others

💬 Providing feedback or contributions

## Authors

- [Yash Paunikar](https://github.com/yashpaunikar2000/), NIT Warangal

## ThankYou⭐