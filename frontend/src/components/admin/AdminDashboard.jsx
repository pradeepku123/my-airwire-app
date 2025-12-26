import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Users, PhoneCall, Activity, Server } from 'lucide-react';
import api from '../../api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const statsRes = await api.get('/admin/stats');
            const usersRes = await api.get('/admin/users');
            const callsRes = await api.get('/admin/calls');

            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setCalls(callsRes.data.calls);
        } catch (err) {
            console.error("Admin fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 10 seconds for live updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-center p-5 text-white"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="p-4" style={{ color: 'var(--text-main)' }}>
            <h2 className="mb-4 fw-bold">Admin Dashboard</h2>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="glass-panel p-3 mb-3 border-0">
                        <div className="d-flex align-items-center">
                            <div className="p-3 rounded bg-primary bg-opacity-10 text-primary me-3">
                                <Users size={24} />
                            </div>
                            <div>
                                <small className="text-muted">Total Users</small>
                                <h4 className="mb-0 fw-bold">{stats?.totalUsers}</h4>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="glass-panel p-3 mb-3 border-0">
                        <div className="d-flex align-items-center">
                            <div className="p-3 rounded bg-success bg-opacity-10 text-success me-3">
                                <Activity size={24} />
                            </div>
                            <div>
                                <small className="text-muted">Online Users</small>
                                <h4 className="mb-0 fw-bold">{stats?.onlineUsers}</h4>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="glass-panel p-3 mb-3 border-0">
                        <div className="d-flex align-items-center">
                            <div className="p-3 rounded bg-warning bg-opacity-10 text-warning me-3">
                                <PhoneCall size={24} />
                            </div>
                            <div>
                                <small className="text-muted">Active Calls</small>
                                <h4 className="mb-0 fw-bold">{stats?.activeCalls}</h4>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="glass-panel p-3 mb-3 border-0">
                        <div className="d-flex align-items-center">
                            <div className="p-3 rounded bg-info bg-opacity-10 text-info me-3">
                                <Server size={24} />
                            </div>
                            <div>
                                <small className="text-muted">Calls Today</small>
                                <h4 className="mb-0 fw-bold">{stats?.callsToday}</h4>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* User List */}
                <Col lg={6} className="mb-4">
                    <Card className="glass-panel border-0 h-100">
                        <Card.Header className="bg-transparent border-0 pt-4 px-4">
                            <h5 className="fw-bold mb-0">User Monitoring</h5>
                        </Card.Header>
                        <Card.Body className="p-0 table-responsive">
                            <Table hover className="align-middle mb-0" style={{ color: 'inherit' }}>
                                <thead className="bg-light bg-opacity-10">
                                    <tr>
                                        <th className="px-4 border-0">User</th>
                                        <th className="border-0">IP Address</th>
                                        <th className="border-0">Role</th>
                                        <th className="border-0">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}>
                                            <td className="px-4 border-bottom border-light border-opacity-10 py-3">
                                                <div className="fw-bold">{u.username}</div>
                                                <small className="text-muted" style={{ fontSize: '0.7em' }}>{u._id}</small>
                                            </td>
                                            <td className="border-bottom border-light border-opacity-10">{u.ipAddress || 'N/A'}</td>
                                            <td className="border-bottom border-light border-opacity-10 text-capitalize">{u.role}</td>
                                            <td className="border-bottom border-light border-opacity-10">
                                                <Badge bg={u.isOnline ? 'success' : 'secondary'}>
                                                    {u.isOnline ? 'Online' : 'Offline'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Calls */}
                <Col lg={6} className="mb-4">
                    <Card className="glass-panel border-0 h-100">
                        <Card.Header className="bg-transparent border-0 pt-4 px-4">
                            <h5 className="fw-bold mb-0">Recent Activity</h5>
                        </Card.Header>
                        <Card.Body className="p-0 table-responsive">
                            <Table hover className="align-middle mb-0" style={{ color: 'inherit' }}>
                                <thead className="bg-light bg-opacity-10">
                                    <tr>
                                        <th className="px-4 border-0">Caller</th>
                                        <th className="border-0">Receiver</th>
                                        <th className="border-0">Duration</th>
                                        <th className="border-0">Time</th>
                                        <th className="border-0">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calls.map(c => (
                                        <tr key={c._id}>
                                            <td className="px-4 border-bottom border-light border-opacity-10 py-3">
                                                {c.caller?.username || 'Unknown'}
                                            </td>
                                            <td className="border-bottom border-light border-opacity-10">
                                                {c.receiver?.username || 'Unknown'}
                                            </td>
                                            <td className="border-bottom border-light border-opacity-10">
                                                {c.duration ? `${c.duration.toFixed(0)}s` : '-'}
                                            </td>
                                            <td className="border-bottom border-light border-opacity-10 text-muted small">
                                                {new Date(c.startTime).toLocaleTimeString()}
                                            </td>
                                            <td className="border-bottom border-light border-opacity-10">
                                                <Badge bg={
                                                    c.status === 'ongoing' ? 'warning' :
                                                        c.status === 'completed' ? 'success' : 'danger'
                                                }>
                                                    {c.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;
