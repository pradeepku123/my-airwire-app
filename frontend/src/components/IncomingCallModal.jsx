import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

const IncomingCallModal = ({ callerName, incomingCallType, answerCall, rejectCall }) => {
    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
            style={{
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(15px)',
                zIndex: 9999
            }}>

            <div className="text-center mb-5">
                <div className="ripple-container mb-4 mx-auto" style={{ width: 120, height: 120 }}>
                    <div className="ripple-ring"></div>
                    <div className="ripple-ring"></div>
                    <div className="ripple-ring"></div>

                    <div className="avatar-circle ripple-avatar shadow-lg"
                        style={{
                            width: 120,
                            height: 120,
                            fontSize: '3rem',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
                            border: '4px solid white'
                        }}>
                        {callerName ? callerName[0].toUpperCase() : 'U'}
                    </div>
                </div>

                <h5 className="text-white-50 mb-2 letter-spacing-2 text-uppercase small fw-bold">Incoming Call</h5>
                <h1 className="fw-bold text-white mb-2 display-4">{callerName}</h1>
                <p className="text-white-50 d-flex align-items-center justify-content-center gap-2">
                    {incomingCallType === 'video' ? <Video size={18} /> : <Phone size={18} />}
                    {incomingCallType === 'video' ? 'AirWire Video Call' : 'AirWire Audio Call'}
                </p>
            </div>

            <div className="d-flex gap-5 align-items-center mt-4">
                <div className="d-flex flex-column align-items-center gap-2">
                    <button className="call-action-btn reject" onClick={rejectCall}>
                        <PhoneOff size={28} />
                    </button>
                    <span className="text-white-50 small fw-medium">Decline</span>
                </div>

                <div className="d-flex flex-column align-items-center gap-2">
                    <button className="call-action-btn answer" onClick={answerCall}>
                        {incomingCallType === 'video' ? <Video size={28} /> : <Phone size={28} />}
                    </button>
                    <span className="text-white-50 small fw-medium">Answer</span>
                </div>
            </div>

        </div>
    );
};

export default IncomingCallModal;
