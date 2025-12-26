import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, Wifi, PhoneOff, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Badge, Button, Toast, ToastContainer } from 'react-bootstrap';
import UserList from './UserList';
import VideoStage from './VideoStage';
import IncomingCallModal from './IncomingCallModal';
import useWebRTC from '../hooks/useWebRTC';

function Dashboard({ setAuth }) {
    const navigate = useNavigate();
    const myVideo = useRef();
    const userVideo = useRef();

    // Theme State
    const [theme, setTheme] = useState('light');

    // Use Custom Hook for Logic
    const {
        user,
        onlineUsers,
        mediaStatus,
        stream,
        userStream,
        micOn,
        videoOn,
        receivingCall,
        callerName,
        callAccepted,
        callEnded,
        outgoingCall,
        incomingCallType,
        callDuration,
        showToast,
        toastMessage,
        setShowToast,
        callUserObj,
        answerCall,
        rejectCall,
        endCall,
        toggleMic,
        toggleVideo,
        handleLogout,
        formatTime
    } = useWebRTC(navigate, setAuth);

    // Toggle Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Attach Streams to Video Elements
    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [stream, videoOn, callAccepted, outgoingCall]);

    useEffect(() => {
        if (userVideo.current && userStream) {
            userVideo.current.srcObject = userStream;
        }
    }, [userStream, callAccepted]);

    return (
        <div className="d-flex flex-column min-vh-100">
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
                                    {user.role === 'admin' && (
                                        <Button
                                            variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
                                            size="sm"
                                            className="d-flex align-items-center gap-2 text-nowrap"
                                            onClick={() => navigate('/admin')}
                                        >
                                            <Wifi size={16} /> <span className="d-none d-md-inline">Admin Panel</span>
                                        </Button>
                                    )}
                                    <div className="d-flex flex-column align-items-end d-none d-lg-flex">
                                        <span className={`fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`} style={{ lineHeight: '1.2' }}>{user.username}</span>
                                        <small className={`${theme === 'dark' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>IP: {user.ipAddress}</small>
                                    </div>
                                    <div className="d-lg-none">
                                        <span className={`fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>{user.username}</span>
                                    </div>
                                    <div className="pulse-status rounded-circle bg-success" style={{ width: 10, height: 10 }}></div>

                                    <Button variant="link" className="text-danger p-0 ms-2" onClick={handleLogout}>
                                        <LogOut size={22} />
                                    </Button>
                                </div>
                            )}
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
                                <UserList
                                    onlineUsers={onlineUsers}
                                    callUserObj={callUserObj}
                                    theme={theme}
                                />
                            )}
                        </Container>
                    </>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 m-0 p-0">

                        <VideoStage
                            callAccepted={callAccepted}
                            callEnded={callEnded}
                            userVideoRef={userVideo}
                            myVideoRef={myVideo}
                            stream={stream}
                            videoOn={videoOn}
                            micOn={micOn}
                            toggleMic={toggleMic}
                            toggleVideo={toggleVideo}
                            endCall={endCall}
                            outgoingCall={outgoingCall}
                            receivingCall={receivingCall}
                            callerName={callerName}
                            callDuration={callDuration}
                            formatTime={formatTime}
                        />

                        {/* Incoming Call Modal Overlay */}
                        {receivingCall && !callAccepted && (
                            <IncomingCallModal
                                callerName={callerName}
                                incomingCallType={incomingCallType}
                                answerCall={answerCall}
                                rejectCall={rejectCall}
                            />
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default Dashboard;
