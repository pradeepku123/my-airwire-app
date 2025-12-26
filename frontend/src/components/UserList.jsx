import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Phone, Video, User as UserIcon } from 'lucide-react';

const UserList = ({ onlineUsers, callUserObj, theme }) => {
    return (
        <Row>
            {onlineUsers.map((u) => (
                <Col xs={12} md={6} lg={4} key={u._id} className="mb-3">
                    <div className="glass-panel user-card p-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <div className="avatar-circle">
                                {u.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h5 className={`mb-0 fw-bold ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>{u.username}</h5>
                                <small className="text-success">● Online</small>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                className="btn-icon btn-secondary"
                                onClick={() => callUserObj(u, 'audio')}
                                title="Voice Call"
                            >
                                <Phone size={20} />
                            </Button>
                            <Button
                                className="btn-icon btn-premium-primary"
                                onClick={() => callUserObj(u, 'video')}
                                title="Video Call"
                            >
                                <Video size={20} />
                            </Button>
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default UserList;
