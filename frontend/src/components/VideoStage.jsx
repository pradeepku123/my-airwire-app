import React from 'react';
import { Button } from 'react-bootstrap';
import { User as UserIcon, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import VideoControls from './VideoControls';

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
    formatTime
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
            {callAccepted && !callEnded ? (
                // ACTIVE CALL VIEW
                <>
                    <video playsInline ref={userVideoRef} autoPlay className="w-100 h-100 object-fit-cover" />

                    {/* Timer */}
                    <div className="position-absolute top-0 start-50 translate-middle-x mt-4 px-4 py-2 rounded-pill bg-dark bg-opacity-50 text-white backdrop-blur z-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="pulse-status bg-danger rounded-circle" style={{ width: 8, height: 8 }}></div>
                            <span className="fw-bold font-monospace">{formatTime(callDuration)}</span>
                        </div>
                    </div>
                </>
            ) : (
                // DIALING / INCOMING VIEW
                <div className="text-center text-white d-flex flex-column align-items-center justify-content-center w-100 h-100 p-4 position-relative overflow-hidden">
                    {/* Background: User Avatar OR Mirrored Local Video */}
                    {outgoingCall && videoOn && stream ? (
                        <video
                            playsInline
                            muted
                            ref={myVideoRef}
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

                    {/* Overlay Info */}
                    <div className="position-relative d-flex flex-column align-items-center w-100" style={{ zIndex: 2 }}>
                        <h3 className="mb-2 text-shadow">{receivingCall && !callAccepted ? 'Incoming Call...' : 'Calling...'}</h3>
                        <h5 className="text-muted mb-4 text-shadow">{callerName}</h5>

                        {/* Pre-Call Controls (Only for Caller) */}
                        {!receivingCall && outgoingCall && (
                            <div className="d-flex flex-column align-items-center gap-4 mt-2">
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
                                        {videoOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                                    </Button>
                                </div>

                                <Button variant="danger" size="lg" className="rounded-pill px-5 py-2 fw-bold shadow-lg" onClick={endCall}>
                                    <PhoneOff size={24} className="me-2" /> Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Dark overlay for readability if video background is on */}
                    {outgoingCall && videoOn && <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50" style={{ zIndex: 1 }}></div>}
                </div>
            )}

            {/* Local Video PiP (Picture in Picture) - Only in Active Call */}
            {stream && videoOn && callAccepted && !callEnded && (
                <div className="local-video-pip">
                    <video playsInline muted ref={myVideoRef} autoPlay className="w-100 h-100 object-fit-cover" />
                </div>
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
