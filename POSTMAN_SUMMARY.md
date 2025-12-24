---

# 📮 Postman API Testing Summary

## Expense Sharing Application
### (User • Group • Expense • Balance • Settlement)

This document provides a complete guide to testing all backend APIs of the **Expense Splitter System** using **Postman**, including endpoints, HTTP methods, request/response formats, and explanations.

---

## 🌐 Base URL

```txt
http://localhost:5000/api
```

---

## 🧑‍💻 1️⃣ USER APIs

## ➕ Register User

**Method:** `POST`
**URL:**

```txt
/api/users/register
```

**Body (JSON):**

```json
{
  "name": "Apurba",
  "email": "ab@gmail.com",
  "password": "Password123"
}
```

✅ Creates a new user and returns `userId`.

---

## 🔑 Login User

**Method:** `POST`
**URL:**

```txt
/api/users/login
```

**Body (JSON):**

```json
{
  "email": "ab@gmail.com",
  "password": "Password123"
}
```

✅ Returns auth token (if implemented) and user details.

---

## 👥 2️⃣ GROUP APIs

## ➕ Create Group

**Method:** `POST`
**URL:**

```txt
/api/groups
```

**Body (JSON):**

```json
{
  "name": "Trip to Goa",
  "description": "Goa trip expenses",
  "createdBy": "694af3b645bde52bc58ed8c0",
  "members": [
    { "userId": "694af3b645bde52bc58ed8c0" },
    { "userId": "694b0749488078a22a51b6b6" }
  ]
}
```

📌 Creates a group and initializes members.

---

## 📄 Get Group Details

**Method:** `GET`
**URL:**

```txt
/api/groups/:groupId
```

---

## 💸 3️⃣ EXPENSE APIs (MOST IMPORTANT)

> Expenses trigger **balance creation & updates**

---

## ➕ Add Expense (EQUAL SPLIT)

**Method:** `POST`
**URL:**

```txt
/api/expenses
```

**Body (JSON):**

```json
{
  "group": "694b0189845d28f8f4dbae34",
  "amount": 600,
  "paidBy": "694af3b645bde52bc58ed8c0",
  "splitType": "equal",
  "splitData": [
    { "userId": "694af3b645bde52bc58ed8c0" },
    { "userId": "694b0749488078a22a51b6b6" },
    { "userId": "694b085b488078a22a51b6cb" }
  ],
  "description": "Dinner bill"
}
```

🧠 Split logic:
600 / 3 = 200 each

---

## ➕ Add Expense (EXACT SPLIT)

**Method:** `POST`

```json
{
  "group": "694b0189845d28f8f4dbae34",
  "amount": 500,
  "paidBy": "694b0749488078a22a51b6b6",
  "splitType": "exact",
  "splitData": [
    { "userId": "694af3b645bde52bc58ed8c0", "amount": 200 },
    { "userId": "694b0749488078a22a51b6b6", "amount": 300 }
  ],
  "description": "Cab fare"
}
```

---

## ➕ Add Expense (PERCENTAGE SPLIT)

**Method:** `POST`

```json
{
  "group": "694b0189845d28f8f4dbae34",
  "amount": 1000,
  "paidBy": "694b085b488078a22a51b6cb",
  "splitType": "percentage",
  "splitData": [
    { "userId": "694af3b645bde52bc58ed8c0", "percentage": 40 },
    { "userId": "694b0749488078a22a51b6b6", "percentage": 60 }
  ],
  "description": "Hotel booking"
}
```

📌 Percentages must sum to **100**

---

## ⚖️ 4️⃣ BALANCE APIs

> Used to answer: **Who owes whom**

---

## 👤 Get User Balance in Group

**Method:** `GET`
**URL:**

```txt
/api/balance/:groupId/balance?userId=694af3b645bde52bc58ed8c0
```

**Response:**

```json
{
  "data": {
    "totalOwed": 9000,
    "totalOwes": 400,
    "netBalance": -8600,
    "owedTo": [
      { "userId": "694b0127309a8ca3c9ae051f", "amount": 3000 }
    ],
    "owedBy": [
      { "userId": "694b0749488078a22a51b6b6", "amount": 400 }
    ]
  }
}
```

📌

* `owedTo` → how much **user owes others**
* `owedBy` → how much **others owe user**

---

## 👥 Get All Balances of Group

**Method:** `GET`
**URL:**

```txt
/api/balance/:groupId/balances
```

---

## 🔁 5️⃣ SETTLEMENT APIs

---

## 💰 Settlement Suggestions (Auto)

**Method:** `GET`
**URL:**

```txt
/api/balance/:groupId/settlements/suggestions
```

**Response:**

```json
{
  "from": "ab@gmail.com",
  "fromId": "694af3b645bde52bc58ed8c0",
  "to": "dd@gmail.com",
  "toId": "694b0127309a8ca3c9ae051f",
  "amount": 3000
}
```

---

## ✅ Record a Settlement (Payment Done)

**Method:** `POST`
**URL:**

```txt
/api/balance/:groupId/settlements
```

**Body (JSON):**

```json
{
  "from": {
    "userId": "694af3b645bde52bc58ed8c0",
    "email": "ab@gmail.com"
  },
  "to": {
    "userId": "694b0127309a8ca3c9ae051f",
    "email": "dd@gmail.com"
  },
  "amount": 3000,
  "settlementMethod": "UPI",
  "description": "Settlement as per suggestion"
}
```

📌 Updates balances and marks payment complete.

---

## 📜 Get All Settlements of Group

**Method:** `GET`

```txt
/api/balance/:groupId/settlements
```

---

## 🧪 6️⃣ POSTMAN TESTING FLOW (RECOMMENDED ORDER)
### 1️⃣ Register users
### 2️⃣ Create group
### 3️⃣ Add expenses
### 4️⃣ Get balances
### 5️⃣ Get settlement suggestions
### 6️⃣ Record settlement
### 7️⃣ Re-check balances

---

## 🎯 Final Notes

* Balances are **not calculated on demand**
* They are **incrementally updated** when expenses are added
* Settlement reduces balances to zero
* Design follows **Splitwise-like architecture**

---

# 💖 Support the Project





This Expense Splitter Backend is an open-source project built to demonstrate real-world backend system design, inspired by applications like Splitwise.
It emphasizes clean architecture, correct data flow, and production-ready logic for expense sharing, balance tracking, and settlements.

If you find this project useful for learning, assignments, or reference, you can support it in the following ways:

## ⭐ Star the Repository

Starring the project on GitHub helps increase its visibility and motivates continued improvement.

## 🔗 Give Proper Credit

If you reuse parts of this project, architecture, or logic in your own work, please consider giving proper credit by linking back to this repository.

## 📢 Share the Project

Sharing this project with friends, classmates, or the developer community helps others learn and improves collaboration.

## 💬 Feedback & Contributions

Suggestions, bug reports, and pull requests are always welcome.
Constructive feedback helps make the project better and more robust.

🙏 Thank you for checking out this project and supporting open-source learning.
Your encouragement truly helps keep such projects alive and evolving. ❤️
## Authors

- [Yash Paunikar](https://github.com/yashpaunikar2000/), NIT Warangal
