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

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/1.png?raw=true" width="400" alt="Screenshot 1"/><br><sub>Register</sub></td>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/2.png?raw=true" width="400" alt="Screenshot 2"/><br><sub>Login</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/3.png?raw=true" width="400" alt="Screenshot 3"/><br><sub>Call Area</sub></td>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/4.png?raw=true" width="400" alt="Screenshot 4"/><br><sub>Call</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/6.png?raw=true" width="400" alt="Screenshot 6"/><br><sub>Call Area</sub></td>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/7.png?raw=true" width="400" alt="Screenshot 7"/><br><sub>Call</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/8.png?raw=true" width="400" alt="Screenshot 8"/><br><sub>Call Area</sub></td>
      <td align="center"><img src="https://github.com/pradeepku123/my-airwire-app/blob/main/frontend/assets/9.png?raw=true" width="400" alt="Screenshot 9"/><br><sub>Call</sub></td>
    </tr>
  </table>
</div>

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
