import React from 'react';
import { Button } from 'react-bootstrap';
import { Video, PhoneOff } from 'lucide-react';

const IncomingCallModal = ({ callerName, incomingCallType, answerCall, rejectCall }) => {
    return (
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
    );
};

export default IncomingCallModal;
