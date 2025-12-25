import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Phone, Video, Mic, MicOff, VideoOff, Wifi, PhoneOff, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Badge, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { startRingtone, stopRingtone } from './utils/ringtone';

function Dashboard({ setAuth }) {
    const [socket, setSocket] = useState(null);
    const [me, setMe] = useState('');
    const [user, setUser] = useState(null);
    // Default to Light Mode
    const [theme, setTheme] = useState('light');
    const [onlineUsers, setOnlineUsers] = useState([]);

    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerName, setCallerName] = useState('');
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [idToCall, setIdToCall] = useState('');
    const [mediaStatus, setMediaStatus] = useState('Initializing...');
    const [userStream, setUserStream] = useState(null); // Remote stream state

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const navigate = useNavigate();

    // Toggle Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Attach remote stream to video element when it becomes available
    useEffect(() => {
        if (userVideo.current && userStream) {
            userVideo.current.srcObject = userStream;
        }
    }, [userStream, callAccepted]);

    // Manage Ringtone
    useEffect(() => {
        if (receivingCall && !callAccepted && !callEnded) {
            startRingtone();
        } else {
            stopRingtone();
        }
        return () => stopRingtone();
    }, [receivingCall, callAccepted, callEnded]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!token || !storedUser) {
            setAuth(false);
            navigate('/login');
            return;
        }
        setUser(storedUser);

        // Initialize Socket with Token
        const newSocket = io({
            path: '/socket.io',
            auth: { token }
        });

        setSocket(newSocket);

        // Get Media
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setMediaStatus('Requesting permissions...');
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((currentStream) => {
                    setStream(currentStream);
                    setMediaStatus('Ready');
                    if (myVideo.current) {
                        myVideo.current.srcObject = currentStream;
                    }
                }).catch(err => {
                    console.error("Failed to get media (Video+Audio)", err);
                    // Fallback: Try Audio Only if Video fails (e.g. no webcam)
                    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        setMediaStatus('Retrying (Audio Only)...');
                        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                            .then((audioStream) => {
                                setStream(audioStream);
                                setMediaStatus('Ready (Audio Only)');
                                setVideoOn(false);
                            })
                            .catch(audioErr => {
                                setMediaStatus(`Failed: ${audioErr.name}`);
                                console.error("Failed to get audio", audioErr);
                                alert("No Camera or Microphone found. Please connect a device.");
                            });
                    } else {
                        setMediaStatus(`Failed: ${err.name}`);
                        alert("Could not access Camera/Microphone. Check permissions or ensure you are using HTTPS (or localhost). Error: " + err.name + ": " + err.message);
                    }
                });
        } else {
            setMediaStatus('API Not Available (HTTPS required)');
            console.error("navigator.mediaDevices is undefined");
            alert("Camera access is blocked by your browser because this connection is not HTTPS.\n\nTo fix on Android/Chrome:\n1. Go to chrome://flags\n2. Search 'Insecure origins treated as secure'\n3. Add this IP address\n4. Relaunch Chrome");
        }

        return () => {
            if (newSocket) newSocket.disconnect();
            if (stream) stream.getTracks().forEach(track => track.stop());
            stopRingtone();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            // ...
        });

        socket.on('update_user_list', (userList) => {
            if (user) {
                const others = userList.filter(u => u._id !== user.id);
                setOnlineUsers(others);
            }
        });

        socket.on('call_user_incoming', (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setCaller(data.fromSocket);
            setCallerName(data.name);
            setCallerSignal(data.signal);
        });

        socket.on("call_accepted", (signal) => {
            setCallAccepted(true);
            stopRingtone();
            if (connectionRef.current)
                connectionRef.current.signal(signal);
        });

        socket.on("ice_candidate_incoming", (candidate) => {
            if (connectionRef.current) {
                connectionRef.current.addIceCandidate(candidate);
            }
        });

        socket.on('call_rejected', () => {
            setToastMessage('User declined the call');
            setShowToast(true);
            leaveCall(false); // Clean up local peer without reload
        });

        socket.on("call_ended_signal", () => {
            leaveCall(false);
        });

    }, [socket, user]);


    const callUser = (socketId) => {
        // Redundant fn, but kept for logic consistency if needed.
    };

    // ... callUserObj ...

    const rejectCall = () => {
        socket.emit('reject_call', { to: caller });
        leaveCall(false);
    };

    const cancelCall = () => {
        // Optionally notify server to stop ringing the other user, for now mostly local cleanup
        // Ideally emit 'end_call' or similar if we had a proper handshake tracked
        if (idToCall) {
            // If we tracked who we called, we could emit cancellation. 
            // For simple-peer, destroying peer stops the signal.
        }
        leaveCall(false);
    };

    // ... (rest of methods)

    const callUserObj = (targetUser) => {
        if (!stream) return alert(`No media stream. Status: ${mediaStatus}`);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            socket.emit('call_user', {
                userToCall: targetUser._id,
                signalData: data,
                from: user.id,
                name: user.username
            });
        });

        peer.on('stream', (currentStream) => {
            setUserStream(currentStream);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        stopRingtone();
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            socket.emit('answer_call', { signal: data, to: caller });
        });

        peer.on('stream', (currentStream) => {
            setUserStream(currentStream);
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = (reload = true) => {
        stopRingtone();
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        setCallAccepted(false);
        setReceivingCall(false);
        setCaller("");
        setCallerName("");
        setCallerSignal(null);
        setCallEnded(false);
        setUserStream(null);
        if (reload) window.location.reload();
    };

    const toggleMic = () => {
        if (stream) {
            setMicOn(!micOn);
            stream.getAudioTracks()[0].enabled = !micOn;
        }
    };

    const toggleVideo = () => {
        if (stream) {
            setVideoOn(!videoOn);
            stream.getVideoTracks()[0].enabled = !videoOn;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <Navbar className="navbar-custom sticky-top">
                <Container>
                    <Navbar.Brand className="brand-text d-flex align-items-center gap-2">
                        <Wifi size={24} className="text-primary-glow" />
                        AirWire
                    </Navbar.Brand>
                    <div className="d-flex align-items-center gap-3">
                        <Badge bg={mediaStatus.includes('Ready') ? "success" : "danger"} className="d-none d-sm-block">
                            Camera: {mediaStatus}
                        </Badge>
                        <Button variant="link" onClick={toggleTheme} className={theme === 'dark' ? 'text-white' : 'text-dark'}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </Button>

                        {user && (
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex flex-column align-items-end d-none d-sm-flex">
                                    <span className={`fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`} style={{ lineHeight: '1.2' }}>{user.username}</span>
                                    <small className={`${theme === 'dark' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>IP: {user.ipAddress}</small>
                                </div>
                                <div className="d-sm-none">
                                    <span className={`fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>{user.username}</span>
                                </div>
                                <div className="pulse-status rounded-circle bg-success" style={{ width: 10, height: 10 }}></div>
                            </div>
                        )}
                        <Button variant="link" className="text-danger p-0 ms-2" onClick={handleLogout}>
                            <LogOut size={22} />
                        </Button>

                    </div>
                </Container>
            </Navbar>


            {/* Toast Notification */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="danger">
                    <Toast.Header>
                        <strong className="me-auto text-dark">Notification</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Main Content */}
            <Container className="flex-grow-1 d-flex flex-column justify-content-center py-4 px-4">
                {!callAccepted && !receivingCall ? (
                    <>
                        <div className="mb-4">
                            <h2 className={`fw-light mb-2 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Online Users</h2>
                            <p className={theme === 'dark' ? 'text-white-50 small' : 'text-muted small'}>Select a user to start a secure video call.</p>
                        </div>

                        {onlineUsers.length === 0 ? (
                            <div className="text-center py-5 glass-panel">
                                <div className={`mb-3 d-inline-block p-4 rounded-circle ${theme === 'dark' ? 'bg-white bg-opacity-10' : 'bg-dark bg-opacity-10'}`}>
                                    <UserIcon size={48} className={theme === 'dark' ? 'text-white-50' : 'text-muted'} />
                                </div>
                                <h5 className={`mb-2 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>No one else is here...</h5>
                                <p className={`small mb-0 ${theme === 'dark' ? 'text-white-50' : 'text-muted'}`}>Open this URL on another device/browser to test.</p>
                            </div>
                        ) : (
                            <Row>
                                {onlineUsers.map((u) => (
                                    <Col xs={12} md={6} lg={4} key={u._id} className="mb-3">
                                        <div className="glass-panel user-card p-3 d-flex align-items-center justify-content-between" onClick={() => callUserObj(u)}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-circle">
                                                    {u.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h5 className={`mb-0 fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>{u.username}</h5>
                                                    <small className="text-success">● Online</small>
                                                </div>
                                            </div>
                                            <Button className="btn-icon btn-premium-primary">
                                                <Phone size={20} />
                                            </Button>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100">
                        {/* Video Area */}
                        <div className="video-wrapper w-100 h-100 d-flex justify-content-center align-items-center" style={{ maxWidth: '1000px', aspectRatio: '16/9', background: '#000' }}>
                            {callAccepted && !callEnded ? (
                                <video playsInline ref={userVideo} autoPlay className="w-100 h-100 object-fit-cover" />
                            ) : (
                                <div className="text-center text-white">
                                    <div className="mb-4 floating">
                                        <div className="p-4 rounded-circle bg-white bg-opacity-10 d-inline-block">
                                            <UserIcon size={64} className="text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2">{receivingCall && !callAccepted ? 'Incoming Call...' : 'Calling...'}</h3>
                                    <h5 className="text-muted">{callerName}</h5>
                                    {!receivingCall && (
                                        <div className="mt-4">
                                            <Button variant="danger" className="rounded-pill px-4" onClick={cancelCall}>
                                                <PhoneOff size={20} className="me-2" /> Cancel Call
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Local Video PiP - Only show if videoOn and we have stream */}
                            {stream && videoOn && (
                                <div className="local-video-pip">
                                    <video playsInline muted ref={myVideo} autoPlay className="w-100 h-100 object-fit-cover" />
                                </div>
                            )}

                            {/* Controls Bar */}
                            <div className="controls-bar position-absolute bottom-0 mb-4 bg-dark bg-opacity-75 backdrop-blur rounded-pill px-4 py-3 d-flex gap-3 shadow-lg">
                                <Button
                                    className={`btn-icon ${micOn ? 'btn-secondary' : 'btn-danger'}`}
                                    onClick={toggleMic}
                                >
                                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </Button>
                                <Button
                                    className={`btn-icon ${videoOn ? 'btn-secondary' : 'btn-danger'}`}
                                    onClick={toggleVideo}
                                >
                                    {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
                                </Button>
                                <Button
                                    className="btn-icon btn-danger"
                                    onClick={() => leaveCall(true)}
                                >
                                    <PhoneOff size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Incoming Call Modal Overlay */}
                        {receivingCall && !callAccepted && (
                            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
                                <div className="glass-panel p-5 text-center floating" style={{ maxWidth: '400px', width: '90%' }}>
                                    <div className="avatar-circle mx-auto mb-4" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                        {callerName ? callerName[0].toUpperCase() : 'U'}
                                    </div>
                                    <h3 className="fw-bold mb-2 text-white">{callerName}</h3>
                                    <p className="text-muted mb-4">is requesting a video call...</p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <Button variant="success" size="lg" className="px-4 py-2 rounded-pill fw-bold" onClick={answerCall}>
                                            <Video size={20} className="me-2" /> Answer
                                        </Button>
                                        <Button variant="danger" size="lg" className="px-4 py-2 rounded-pill fw-bold" onClick={rejectCall}>
                                            <PhoneOff size={20} className="me-2" /> Decline
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default Dashboard;
