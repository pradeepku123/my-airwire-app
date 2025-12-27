import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { startRingtone, stopRingtone } from '../utils/ringtone';

const useWebRTC = (navigate, setAuth) => {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Media State
    const [stream, setStream] = useState(null);
    const [userStream, setUserStream] = useState(null);
    const [mediaStatus, setMediaStatus] = useState('Initializing...');
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    // Call State
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerName, setCallerName] = useState('');
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [outgoingCall, setOutgoingCall] = useState(false);
    const [incomingCallType, setIncomingCallType] = useState('video');
    const [callTargetSocketId, setCallTargetSocketId] = useState(null);

    // Toast State (UI related but triggered by socket events)
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const connectionRef = useRef();

    // Initialize User & Socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!token || !storedUser) {
            if (setAuth) setAuth(false);
            if (navigate) navigate('/login');
            return;
        }
        setUser(storedUser);

        const newSocket = io({
            path: '/socket.io',
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5
        });
        setSocket(newSocket);

        // Get Media
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setMediaStatus('Requesting permissions...');
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((currentStream) => {
                    setStream(currentStream);
                    setMediaStatus('Ready');
                }).catch(err => {
                    console.error("Failed to get media (Video+Audio)", err);
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
                                alert("No Camera or Microphone found. Please connect a device.");
                            });
                    } else {
                        setMediaStatus(`Failed: ${err.name}`);
                        alert("Could not access Camera/Microphone. Check permissions or ensure you are using HTTPS. " + err.message);
                    }
                });
        } else {
            setMediaStatus('API Not Available (HTTPS required)');
            alert("Camera access is blocked by your browser because this connection is not HTTPS.");
        }

        return () => {
            if (newSocket) newSocket.disconnect();
            if (stream) stream.getTracks().forEach(track => track.stop());
            stopRingtone();
        };
    }, []); // Empty dependency array as this is init logic

    // Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('update_user_list', (userList) => {
            if (user) {
                const others = userList.filter(u => u._id !== user.id);
                setOnlineUsers(others);
            }
        });

        socket.on('call_user_incoming', (data) => {
            setReceivingCall(true);
            setCaller(data.fromSocket);
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
            leaveCall();
        });

        socket.on("call_ended_signal", () => {
            leaveCall();
        });

        socket.on('connect_error', (err) => {
            console.error("Socket connection error:", err.message);
            if (err.message === "Authentication error") {
                handleLogout();
            }
        });

    }, [socket, user]);

    // Ringtone Management
    useEffect(() => {
        if (receivingCall && !callAccepted && !callEnded) {
            startRingtone();
        } else {
            stopRingtone();
        }
        return () => stopRingtone();
    }, [receivingCall, callAccepted, callEnded]);

    // Call Duration Timer
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

    // Actions
    const callUserObj = (targetUser, type = 'video') => {
        if (!stream) return alert(`No media stream. Status: ${mediaStatus}`);

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

        setMicOn(true);
        setVideoOn(true);
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = true);
            stream.getVideoTracks().forEach(track => track.enabled = true);
        }
        setUserStream(null);
    };

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

    const toggleMic = () => {
        if (stream) {
            const newStatus = !micOn;
            setMicOn(newStatus);
            stream.getAudioTracks()[0].enabled = newStatus;
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (!videoTrack) {
                alert("No camera detected or permission was denied.");
                return;
            }
            const newStatus = !videoOn;
            setVideoOn(newStatus);
            videoTrack.enabled = newStatus;
        }
    };

    const switchCamera = async () => {
        if (!stream) return;
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
            console.log("No local video track to switch.");
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');

            if (videoDevices.length < 2) {
                console.log("Only one video device found.");
                return;
            }

            const currentVideoTrack = videoTracks[0];
            const currentDeviceId = currentVideoTrack.getSettings().deviceId;

            const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            const nextDevice = videoDevices[nextIndex];

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: nextDevice.deviceId } },
                audio: false
            });
            const newVideoTrack = newStream.getVideoTracks()[0];

            if (connectionRef.current) {
                const peer = connectionRef.current;
                // Robustness: Directly look up the Sender for video
                // This bypasses 'simple-peer' tracking issues by going to the native WebRTC connection
                if (peer._pc) {
                    const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        await sender.replaceTrack(newVideoTrack);
                    } else {
                        console.warn("No video sender found in active connection to replace.");
                    }
                }
            }

            // Update Local Stream
            stream.removeTrack(currentVideoTrack);
            stream.addTrack(newVideoTrack);

            // Updates to state triggers re-render
            setStream(new MediaStream([...stream.getTracks()]));

            // Stop old track
            currentVideoTrack.stop();

        } catch (err) {
            console.error("Error switching camera:", err);
            alert("Unable to switch camera: " + err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (setAuth) setAuth(false);
        if (navigate) navigate('/login');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
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
        switchCamera,
        handleLogout,
        formatTime
    };
};

export default useWebRTC;
