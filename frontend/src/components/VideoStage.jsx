import React from 'react';
import VideoControls from './VideoControls';
import DraggablePiP from './DraggablePiP';
import { SwitchCamera } from 'lucide-react';

const VideoStage = ({
    callAccepted,
    callEnded,
    userVideoRef,
    myVideoRef,
    stream,
    videoOn,
    micOn,
    toggleMic,
    toggleVideo,
    endCall,
    outgoingCall,
    receivingCall,
    callerName,
    callDuration,
    formatTime,
    switchCamera
}) => {
    return (
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
            {/* ACTIVE CALL VIEW ONLY */}
            <video playsInline ref={userVideoRef} autoPlay className="w-100 h-100 object-fit-cover" />

            {/* Gradient Overlay for Controls Readability */}
            <div className="position-absolute bottom-0 w-100 h-50 video-overlay-gradient" style={{ zIndex: 10 }}></div>

            {/* Timer / Status Pill */}
            <div className="position-absolute top-0 start-50 translate-middle-x mt-5 z-3">
                <div className="d-flex align-items-center gap-3 px-4 py-2 rounded-pill shadow-sm"
                    style={{
                        background: 'rgba(20, 20, 20, 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                    <div className="d-flex align-items-center gap-2">
                        <div className="pulse-status bg-danger rounded-circle" style={{ width: 8, height: 8 }}></div>
                        <span className="text-white-50 small fw-bold text-uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>Live</span>
                    </div>
                    <div className="vr bg-white opacity-25"></div>
                    <span className="fw-bold font-monospace text-white fs-5" style={{ letterSpacing: '1px' }}>{formatTime(callDuration)}</span>
                </div>
            </div>

            {/* Local Video PiP (Picture in Picture) - Draggable */}
            {stream && videoOn && callAccepted && !callEnded && (
                <DraggablePiP>
                    <div className="local-video-pip-content shadow-lg position-relative group">
                        <video playsInline muted ref={myVideoRef} autoPlay className="w-100 h-100 object-fit-cover" />

                        {/* Camera Switch Button */}
                        <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-center"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); switchCamera(); }} // Stop drag propagation
                                onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                                onTouchStart={(e) => e.stopPropagation()} // Prevent drag start
                                className="btn btn-sm btn-dark rounded-circle d-flex align-items-center justify-content-center border-0"
                                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
                                title="Switch Camera"
                            >
                                <SwitchCamera size={16} className="text-white" />
                            </button>
                        </div>
                    </div>
                </DraggablePiP>
            )}

            {/* In-Call Controls Bar */}
            {(!outgoingCall || callAccepted) && (
                <VideoControls
                    micOn={micOn}
                    videoOn={videoOn}
                    toggleMic={toggleMic}
                    toggleVideo={toggleVideo}
                    endCall={endCall}
                />
            )}
        </div>
    );
};

export default VideoStage;
