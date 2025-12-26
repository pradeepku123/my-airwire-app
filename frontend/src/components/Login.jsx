import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Wifi } from 'lucide-react';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/login', { username, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setAuth(true); // Update parent state
            navigate('/');
        } catch (err) {
            console.error("Login Error: ", err);
            setError(err.response?.data?.msg || 'Login failed. Check credentials or network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <Card className="glass-panel p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <Card.Body className="text-center">
                    <div className="mb-4 d-inline-block p-3 rounded-circle bg-primary bg-opacity-25 text-primary-glow">
                        <Wifi size={48} />
                    </div>
                    <Card.Title as="h2" className="fw-bold mb-4">Welcome Back</Card.Title>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <Form onSubmit={handleLogin}>
                        <div className="mb-3 text-start">
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0 border-secondary">
                                    <User size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-transparent border-start-0 border-secondary shadow-none input-theme-text"
                                    style={{ color: 'var(--text-main)' }}
                                />
                            </InputGroup>
                        </div>
                        <div className="mb-4 text-start">
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0 border-secondary">
                                    <Lock size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-transparent border-start-0 border-secondary shadow-none input-theme-text"
                                    style={{ color: 'var(--text-main)' }}
                                />
                            </InputGroup>
                        </div>

                        <Button type="submit" className="w-100 btn-premium-primary py-2" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                        </Button>
                    </Form>

                    <div className="mt-4 text-muted">
                        Don't have an account? <Link to="/register" className="text-primary-glow text-decoration-none fw-bold">Register</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
