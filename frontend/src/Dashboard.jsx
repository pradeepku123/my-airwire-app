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
    const [callDuration, setCallDuration] = useState(0);
    const [idToCall, setIdToCall] = useState('');
    const [callTargetSocketId, setCallTargetSocketId] = useState(null); // Store socket ID for cancellation
    const [outgoingCall, setOutgoingCall] = useState(false);
    const [incomingCallType, setIncomingCallType] = useState('video'); // 'video' or 'audio'
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

    // Keep Local Video Stream Attached to Ref (Video Element)
    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [stream, videoOn, callAccepted, outgoingCall]); // Re-run when view changes

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
            setCaller(data.fromSocket); // Use Socket ID for signaling responses
            setCallerName(data.name);
            setIncomingCallType(data.callType || 'video');
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
            leaveCall(); // Clean up local peer without reload
        });

        socket.on("call_ended_signal", () => {
            leaveCall();
        });

    }, [socket, user]);


    const callUser = (socketId) => {
        // Redundant fn, but kept for logic consistency if needed.
    };

    // ... callUserObj ...

    const rejectCall = () => {
        socket.emit('reject_call', { to: caller });
        leaveCall();
    };

    const endCall = () => {
        const target = callTargetSocketId || caller;
        if (target) {
            socket.emit('end_call', { to: target });
        }
        leaveCall();
    };

    // ... (rest of methods)

    const callUserObj = (targetUser, type = 'video') => {
        if (!stream) return alert(`No media stream. Status: ${mediaStatus}`);

        // Configure local tracks based on call type
        const isVideo = type === 'video';
        setVideoOn(isVideo);
        stream.getVideoTracks().forEach(track => track.enabled = isVideo);

        setCallTargetSocketId(targetUser.socketId);
        setOutgoingCall(true);
        setCallerName(targetUser.username);

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
                name: user.username,
                callType: type
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

        // Match the incoming call type for our local stream
        const isVideo = incomingCallType === 'video';
        setVideoOn(isVideo);
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = isVideo);
        }

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

    const leaveCall = () => {
        stopRingtone();

        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }

        setCallAccepted(false);
        setReceivingCall(false);
        setOutgoingCall(false);
        setCallEnded(false);
        setCallDuration(0);

        setCaller("");
        setCallerName("");
        setCallerSignal(null);

        // Reset media state for next call
        setMicOn(true);
        setVideoOn(true);
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = true);
            stream.getVideoTracks().forEach(track => track.enabled = true);
        }

        setUserStream(null);
    };

    const toggleMic = () => {
        if (stream) {
            setMicOn(!micOn);
            stream.getAudioTracks()[0].enabled = !micOn;
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (!videoTrack) {
                // Should not happen if permissions were granted, but handle 'Audio Only' fallback case
                alert("No camera detected or permission was denied. Cannot switch to video.");
                return;
            }
            setVideoOn(!videoOn);
            videoTrack.enabled = !videoOn;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };

    // Timer Logic
    useEffect(() => {
        let interval;
        if (callAccepted && !callEnded) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [callAccepted, callEnded]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            {/* Navbar - Hide when in call/calling */}
            {(!callAccepted && !receivingCall && !outgoingCall) && (
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
            )}


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
            <Container
                fluid={!!(callAccepted || receivingCall || outgoingCall)}
                className={`flex-grow-1 d-flex flex-column justify-content-center ${callAccepted || receivingCall || outgoingCall ? 'p-0 m-0' : 'py-4 px-4'}`}
            >
                {!callAccepted && !receivingCall && !outgoingCall ? (
                    <>
                        <Container>
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
                                            <div className="glass-panel user-card p-3 d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar-circle">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h5 className={`mb-0 fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>{u.username}</h5>
                                                        <small className="text-success">● Online</small>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        className="btn-icon btn-secondary"
                                                        onClick={() => callUserObj(u, 'audio')}
                                                        title="Voice Call"
                                                    >
                                                        <Phone size={20} />
                                                    </Button>
                                                    <Button
                                                        className="btn-icon btn-premium-primary"
                                                        onClick={() => callUserObj(u, 'video')}
                                                        title="Video Call"
                                                    >
                                                        <Video size={20} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Container>
                    </>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 m-0 p-0">
                        {/* Video Area */}
                        <div
                            className="video-wrapper w-100 d-flex justify-content-center align-items-center position-relative m-0 p-0"
                            style={{
                                height: '100vh',
                                width: '100vw',
                                background: '#000',
                                borderRadius: 0,
                                border: 'none',
                                maxWidth: 'none'
                            }}
                        >
                            {callAccepted && !callEnded ? (
                                <>
                                    <video playsInline ref={userVideo} autoPlay className="w-100 h-100 object-fit-cover" />
                                    <div className="position-absolute top-0 start-50 translate-middle-x mt-4 px-4 py-2 rounded-pill bg-dark bg-opacity-50 text-white backdrop-blur z-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="pulse-status bg-danger rounded-circle" style={{ width: 8, height: 8 }}></div>
                                            <span className="fw-bold font-monospace">{formatTime(callDuration)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-white d-flex flex-column align-items-center justify-content-center w-100 h-100 p-4 position-relative overflow-hidden">
                                    {outgoingCall && videoOn && stream ? (
                                        <video
                                            playsInline
                                            muted
                                            ref={myVideo}
                                            autoPlay
                                            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                                            style={{ transform: 'scaleX(-1)', zIndex: 0 }} // Mirror effect
                                        />
                                    ) : (
                                        <div className="mb-4 floating position-relative" style={{ zIndex: 1 }}>
                                            <div className="p-4 rounded-circle bg-white bg-opacity-10 d-inline-block">
                                                <UserIcon size={64} className="text-primary" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay content */}
                                    <div className="position-relative d-flex flex-column align-items-center w-100" style={{ zIndex: 2 }}>
                                        <h3 className="mb-2 text-shadow">{receivingCall && !callAccepted ? 'Incoming Call...' : 'Calling...'}</h3>
                                        <h5 className="text-muted mb-4 text-shadow">{callerName}</h5>

                                        {!receivingCall && outgoingCall && (
                                            <div className="d-flex flex-column align-items-center gap-4 mt-2">
                                                {/* Pre-call controls */}
                                                <div className="d-flex gap-3">
                                                    <Button
                                                        className={`btn-icon ${micOn ? 'btn-secondary' : 'btn-danger'}`}
                                                        onClick={toggleMic}
                                                        title={micOn ? "Mute Mic" : "Unmute Mic"}
                                                    >
                                                        {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                                                    </Button>
                                                    <Button
                                                        className={`btn-icon ${videoOn ? 'btn-secondary' : 'btn-danger'}`}
                                                        onClick={toggleVideo}
                                                        title={videoOn ? "Turn Off Video" : "Turn On Video"}
                                                    >
                                                        {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
                                                    </Button>
                                                </div>

                                                <Button variant="danger" size="lg" className="rounded-pill px-5 py-2 fw-bold shadow-lg" onClick={endCall}>
                                                    <PhoneOff size={24} className="me-2" /> Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Dark overlay for readability if video is on */}
                                    {outgoingCall && videoOn && <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50" style={{ zIndex: 1 }}></div>}
                                </div>
                            )}

                            {/* Local Video PiP - Only show if videoOn and we have stream AND Call is Accepted */}
                            {stream && videoOn && callAccepted && !callEnded && (
                                <div className="local-video-pip">
                                    <video playsInline muted ref={myVideo} autoPlay className="w-100 h-100 object-fit-cover" />
                                </div>
                            )}

                            {/* Controls Bar - HIDE if we are just "Calling..." (outgoing non-accepted call) because we show inline controls above */}
                            {(!outgoingCall || callAccepted) && (
                                <div className="controls-bar position-absolute bottom-0 start-50 translate-middle-x mb-4 bg-dark bg-opacity-75 backdrop-blur rounded-pill px-4 py-3 d-flex justify-content-center gap-3 shadow-lg" style={{ zIndex: 20 }}>
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
                                        onClick={endCall}
                                    >
                                        <PhoneOff size={20} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Incoming Call Modal Overlay */}
                        {receivingCall && !callAccepted && (
                            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
                                <div className="glass-panel p-5 text-center floating" style={{ maxWidth: '400px', width: '90%' }}>
                                    <div className="avatar-circle mx-auto mb-4" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                        {callerName ? callerName[0].toUpperCase() : 'U'}
                                    </div>
                                    <h3 className="fw-bold mb-2 text-white">{callerName}</h3>
                                    <p className="text-muted mb-4">is requesting a {incomingCallType === 'video' ? 'Video' : 'Voice'} call...</p>
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
