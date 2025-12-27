import React from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';

const IncomingCallModal = ({ callerName, incomingCallType, answerCall, rejectCall }) => {
    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center incoming-call-bg"
            style={{
                zIndex: 9999
            }}>

            {/* Main Content Card */}
            <div className="d-flex flex-column align-items-center slide-up-in">

                {/* Avatar Section */}
                <div className="ripple-container mb-5" style={{ width: 140, height: 140 }}>
                    <div className="ripple-ring ripple-ring-premium"></div>
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

                {/* Call Info Glass Card */}
                <div className="glass-info-card text-center mb-5 mx-3" style={{ maxWidth: '400px', width: '90%' }}>
                    <h5 className="text-white-50 mb-3 letter-spacing-2 text-uppercase small fw-bold tracking-wider">
                        Incoming {incomingCallType === 'video' ? 'Video' : 'Audio'} Call...
                    </h5>
                    <h1 className="fw-bolder text-white mb-3 display-5 text-shadow-sm">
                        {callerName}
                    </h1>
                    <div className="d-flex align-items-center justify-content-center gap-2 text-white-50 bg-white bg-opacity-10 px-3 py-1 rounded-pill d-inline-flex">
                        {incomingCallType === 'video' ? <Video size={16} /> : <Phone size={16} />}
                        <span className="small fw-medium">AirWire Secure Line</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-5 align-items-center mt-2">
                    <div className="d-flex flex-column align-items-center gap-2 transition-transform hover-scale">
                        <button
                            className="call-action-btn reject"
                            onClick={rejectCall}
                            style={{ width: 75, height: 75 }}
                        >
                            <PhoneOff size={32} />
                        </button>
                        <span className="text-white-50 small fw-medium mt-1">Decline</span>
                    </div>

                    <div className="d-flex flex-column align-items-center gap-2 transition-transform hover-scale">
                        <button
                            className="call-action-btn answer"
                            onClick={answerCall}
                            style={{ width: 75, height: 75 }}
                        >
                            <span className="phone-shake">
                                {incomingCallType === 'video' ? <Video size={32} /> : <Phone size={32} />}
                            </span>
                        </button>
                        <span className="text-white small fw-bold mt-1 text-uppercase letter-spacing-1">Answer</span>
                    </div>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="position-absolute bottom-0 w-100 text-center pb-4 text-white-50 small opacity-50">
                <p className="m-0">End-to-End Encrypted</p>
            </div>

        </div>
    );
};

export default IncomingCallModal;
