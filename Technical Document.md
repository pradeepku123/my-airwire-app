# AirWire - Project Technical Documentation

## 1. Project Overview
**AirWire** is a premium, real-time video and audio calling web application designed to provide seamless peer-to-peer (P2P) communication. It features a modern, glassmorphism-inspired user interface, secure user authentication, and robust handling of call states (incoming, outgoing, active).

The application is built using a **MERN stack** (MongoDB, Express, React, Node.js) and utilizes **WebRTC** for direct media streaming between clients, with **Socket.io** serving as the signaling mechanism.

## 2. Technology Stack

### Frontend
*   **Framework:** React 18+ (using Vite for build tooling)
*   **Styling:**
    *   **Bootstrap 5:** For grid system and core components.
    *   **Custom CSS:** Extensive implementations of Glassmorphism (backdrop-filters, translucent borders), gradients, and animations.
*   **State Management:** React `useState`, `useEffect`, `useRef` hooks.
*   **Real-time Communication:**
    *   `socket.io-client`: For real-time signaling (handshakes) and user status updates.
    *   `simple-peer`: A wrapper around native WebRTC `RTCPeerConnection` for handling media streams (video/audio).
*   **Icons:** `lucide-react` for modern, SVG-based iconography.
*   **Routing:** `react-router-dom` for navigation (Login, Dashboard).

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js (REST API for Auth, middleware integration)
*   **Database:** MongoDB (via Mongoose ODM)
*   **Signaling:** `socket.io` (Handles `call_user`, `answer_call`, `ice_candidate` events).
*   **Authentication:**
    *   `jsonwebtoken` (JWT) for secure session management.
    *   `bcryptjs` for password hashing.
*   **Security:**
    *   `helmet`: Sets various HTTP headers for security.
    *   `cors`: Cross-Origin Resource Sharing configuration.
    *   `express-rate-limit`: Basic rate limiting to prevent abuse.
    *   `express-validator`: Request data validation.

### DevOps / Infrastructure
*   **Docker:** Containerization of both Backend and Frontend services.
*   **Docker Compose:** Orchestration of the multi-container application (Frontend, Backend, MongoDB).
*   **Volume Mapping:** Source code is mounted into containers for hot-reloading (Developer Experience).

## 3. Architecture & Core Workflows

### 3.1 Signaling Flow (Socket.io)
Before a P2P connection (video) can be established, peers must exchange "signals" via the server:
1.  **Caller** initiates call -> Emits `call_user` to Server.
2.  **Server** forwards event -> To **Receiver's** socket (`call_user_incoming`).
3.  **Receiver** accepts call -> Emits `answer_call` to Server.
4.  **Server** forwards answer -> To **Caller**.
5.  **Peers** exchange ICE Candidates -> Direct P2P connection established via WebRTC.

### 3.2 Media Handling (WebRTC)
*   **Stream Acquisition:** Uses `navigator.mediaDevices.getUserMedia()` to access Camera and Microphone.
*   **Track Replacement (Camera Switch):** Implements `RTCRtpSender.replaceTrack()` to seamlessly switch between Front and Back cameras during an active call without renegotiating the connection.
*   **Draggable PiP:** The local user's video preview is rendered in a custom draggable container (`DraggablePiP`) allowing it to be moved anywhere on the screen (touch and mouse supported).

## 4. Key Features

### 4.1 Authentication & User Management
*   Secure Registration and Login.
*   Real-time "Online Users" list.
*   Secure storage of JWT tokens.

### 4.2 Interactive Call UI
*   **Incoming Call Modal:** An animated, full-screen overlay with a pulsating avatar and "Slide to Answer" aesthetics.
*   **Outgoing Call Modal:** Simulates a dialing interface with canceling capabilities.
*   **Active Video Stage:** Prominent remote video, gradient overlays for readability, and a floating glass control dock.

### 4.3 Advanced Video Controls
*   **Glass Control Dock:** Floating bar with Mic, Video, and End Call buttons.
*   **Camera Switching:** Logic to cycle available video input devices (critical for mobile users).
*   **Draggable Preview:** Local video window (Picture-in-Picture) floats above the UI and can be repositioned.

## 5. Directory Structure
```
my-airwire-app/
├── backend/                # Node.js/Express Server
│   ├── src/
│   │   ├── controllers/    # Auth & logic controllers
│   │   ├── models/         # Mongoose Schemas (User, etc.)
│   │   ├── routes/         # API Routes
│   │   └── socket/         # Socket.io handlers
│   ├── index.js            # Entry point
│   └── package.json
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # UI Components (VideoStage, Modals, etc.)
│   │   ├── hooks/          # Custom Hooks (useWebRTC.js)
│   │   ├── utils/          # Helpers (ringtone.js)
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global Styles (Glassmorphism, Animations)
│   └── package.json
└── docker-compose.yml      # Container Orchestration
```

## 6. Limitations & Future Improvements

### 6.1 Scalability (Mesh Network)
*   **Current State:** Optimized for **1-to-1** calls.
*   **Limitation:** `simple-peer` creates a full Peer object for every connection. In a multi-party mesh (N*N connections), client bandwidth and CPU usage scale poorly.
*   **Solution:** For group calls (>3 users), moving to an SFU (Selective Forwarding Unit) architecture (like Mediasoup or Jitsi) would be necessary.

### 6.2 NAT Traversal (STUN/TURN)
*   **Current State:** Uses public Google STUN servers.
*   **Limitation:** Will fail on restrictive corporate firewalls or symmetric NATs that block direct P2P connections.
*   **Solution:** Deploy a dedicated TURN server (e.g., coturn) to relay traffic when direct connection fails.

### 6.3 Browser Compatibility
*   **Current State:** Uses modern WebRTC APIs (`getSenders`, `replaceTrack`).
*   **Limitation:** Minimal support for very old browsers (Internet Explorer, legacy Safari).
*   **Requirement:** Users must use updated Chrome, Firefox, Safari, or Edge.

### 6.4 Mobile Experience
*   **Current State:** Responsive design and Touch event handling (for dragging).
*   **Limitation:** Mobile web browsers (iOS Safari in particular) have strict auto-play policies. The app currently handles `playsInline`, but user interaction is strictly required to start audio/video (handled by the "Answer" button click).

## 7. Setup & Run

### Prerequisites
*   Docker & Docker Compose installed.

### Commands
1.  **Build and Start:**
    ```bash
    docker-compose up --build
    ```
2.  **Access Application:**
    *   Frontend: `https://localhost:8443` (Accept self-signed cert warning)
    *   Backend API: `http://localhost:5000`

### Development
*   **Hot Reload:** Enabled for both Frontend (Vite HMR) and Backend (Nodemon) via Docker volumes.
