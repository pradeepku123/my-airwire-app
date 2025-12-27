import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const VideoControls = ({ micOn, videoOn, toggleMic, toggleVideo, endCall }) => {
    return (
        <div className="controls-bar-container position-absolute bottom-0 start-50 translate-middle-x mb-5" style={{ zIndex: 50, width: 'auto' }}>
            <div className="glass-control-dock px-5 py-3 rounded-pill d-flex align-items-center gap-4 shadow-lg border-white-10">
                {/* Mic Toggle */}
                <button
                    className={`control-btn ${micOn ? 'active-glass' : 'inactive-red'} hover-scale`}
                    onClick={toggleMic}
                    title={micOn ? "Mute Mic" : "Unmute Mic"}
                >
                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                {/* End Call */}
                <button
                    className="control-btn hangup-red hover-scale-lg"
                    onClick={endCall}
                    title="End Call"
                >
                    <PhoneOff size={32} fill="currentColor" />
                </button>

                {/* Video Toggle */}
                <button
                    className={`control-btn ${videoOn ? 'active-glass' : 'inactive-red'} hover-scale`}
                    onClick={toggleVideo}
                    title={videoOn ? "Turn Off Video" : "Turn On Video"}
                >
                    {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
            </div>
        </div>
    );
};

export default VideoControls;
