import React from 'react';
import { Button } from 'react-bootstrap';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const VideoControls = ({ micOn, videoOn, toggleMic, toggleVideo, endCall }) => {
    return (
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
    );
};

export default VideoControls;
