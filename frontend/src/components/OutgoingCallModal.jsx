import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const OutgoingCallModal = ({
    callerName,
    stream,
    videoOn,
    micOn,
    toggleMic,
    toggleVideo,
    endCall,
    myVideoRef
}) => {
    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center incoming-call-bg"
            style={{
                zIndex: 9999
            }}>

            {/* Video Background (if enabled) */}
            {videoOn && stream && (
                <div className="position-absolute top-0 start-0 w-100 h-100 slide-up-in">
                    <video
                        playsInline
                        muted
                        ref={myVideoRef}
                        autoPlay
                        className="w-100 h-100 object-fit-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    {/* Dark Overlay */}
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75"></div>
                </div>
            )}

            {/* Main Content */}
            <div className="d-flex flex-column align-items-center slide-up-in position-relative" style={{ zIndex: 10 }}>

                {/* Avatar Section */}
                <div className="ripple-container mb-5" style={{ width: 140, height: 140 }}>
                    <div className="ripple-ring ripple-ring-premium"></div>
                    <div className="ripple-ring ripple-ring-premium"></div>

                    <div className="avatar-circle avatar-premium-pulse"
                        style={{
                            width: 140,
                            height: 140,
                            fontSize: '3.5rem',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
                            border: '4px solid rgba(255, 255, 255, 0.8)'
                        }}>
                        {callerName ? callerName[0].toUpperCase() : 'U'}
                    </div>
                </div>

                {/* Call Info Card */}
                <div className="glass-info-card text-center mb-5 mx-3" style={{ maxWidth: '400px', width: '90%' }}>
                    <h5 className="text-white-50 mb-3 letter-spacing-2 text-uppercase small fw-bold tracking-wider">
                        Calling...
                    </h5>
                    <h1 className="fw-bolder text-white mb-2 display-5 text-shadow-sm">
                        {callerName}
                    </h1>
                    <span className="text-white-50 small d-block mt-2">Connecting secure line...</span>
                </div>

                {/* Controls */}
                <div className="d-flex align-items-center gap-4">
                    {/* Toggle Mic */}
                    <button
                        className="call-action-btn hover-scale"
                        onClick={toggleMic}
                        style={{
                            width: 65,
                            height: 65,
                            background: micOn ? 'rgba(255,255,255,0.15)' : '#ef4444',
                            border: micOn ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                        title={micOn ? "Mute Mic" : "Unmute Mic"}
                    >
                        {micOn ? <Mic size={28} /> : <MicOff size={28} />}
                    </button>

                    {/* End Call (Highlight) */}
                    <button
                        className="call-action-btn reject hover-scale"
                        onClick={endCall}
                        style={{ width: 90, height: 90, boxShadow: '0 10px 40px rgba(239, 68, 68, 0.6)' }}
                        title="Cancel Call"
                    >
                        <PhoneOff size={40} />
                    </button>

                    {/* Toggle Video */}
                    <button
                        className="call-action-btn hover-scale"
                        onClick={toggleVideo}
                        style={{
                            width: 65,
                            height: 65,
                            background: videoOn ? 'rgba(255,255,255,0.15)' : '#ef4444',
                            border: videoOn ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                        title={videoOn ? "Turn Off Video" : "Turn On Video"}
                    >
                        {videoOn ? <Video size={28} /> : <VideoOff size={28} />}
                    </button>
                </div>

            </div>

            <div className="position-absolute bottom-0 w-100 text-center pb-4 text-white-50 small opacity-50" style={{ zIndex: 2 }}>
                <p className="m-0">End-to-End Encrypted</p>
            </div>

        </div>
    );
};

export default OutgoingCallModal;
