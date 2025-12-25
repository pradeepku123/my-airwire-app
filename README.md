# AirWire 📡

**AirWire** is a premium, real-time video calling application designed for local network (LAN) communication. It allows users on the same WiFi network to discover each other instantly and establish high-quality video and audio calls using WebRTC.

## ✨ Updates (Auth & Persistence)

*   **User Registration**: Secure account creation with username and password.
*   **Persist Data**: User profiles are stored in a **MongoDB** database managed by Docker.
*   **Smart Discovery**: Logs users in with their current IP address, allowing you to switch devices but keep your identity (if you login on them).
*   **Mobile First**: Optimized UI for smartphones and tablets.

---

## 🛠 Technology Stack

*   **Frontend**: React, Vite, Tailwind-like Custom CSS.
*   **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB).
*   **Database**: MongoDB (Dockerized).
*   **Security**: JWT Authentication, Bcrypt password hashing.
*   **DevOps**: Docker, Docker Compose, Nginx.

---

## 🚀 Getting Started

### Prerequisites

*   [Docker](https://www.docker.com/) and Docker Compose installed on your machine.

### Run with Docker

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd my-airwire-app
    ```

2.  **Start the application**:
    ```bash
    docker compose up --build
    ```

3.  **Access the App**:
    *   Open your browser and visit: `http://localhost:8080` (or your LAN IP: `http://192.168.x.x:8080`)
    *   **Register** a new account.
    *   **Login** to see online peers.

---

## 📱 Mobile Usage

AirWire is designed with a **Mobile-First** approach.
To use on your phone:
1.  Connect phone to same WiFi.
2.  Navigate to `http://<COMPUTER_IP>:8080`.
3.  Login and tap the **Phone Icon** to call your computer or other devices!

---

## 📄 License

MIT License.
