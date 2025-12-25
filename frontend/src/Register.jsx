import React, { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Wifi } from 'lucide-react';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/register', { username, password });
            alert("Registration Successful. Please Login."); // Feedback for mobile user
            navigate('/login');
        } catch (err) {
            console.error("Register Error: ", err);
            setError(err.response?.data?.msg || 'Registration failed. Check network or try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <Card className="glass-panel p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <Card.Body className="text-center">
                    <div className="mb-4 d-inline-block p-3 rounded-circle bg-success bg-opacity-25 text-success">
                        <Wifi size={48} />
                    </div>
                    <Card.Title as="h2" className="fw-bold mb-4 text-white">Create Account</Card.Title>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <Form onSubmit={handleRegister}>
                        <div className="mb-3 text-start">
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0 text-muted border-secondary">
                                    <User size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Choose Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-transparent text-white border-start-0 border-secondary shadow-none"
                                />
                            </InputGroup>
                        </div>
                        <div className="mb-4 text-start">
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0 text-muted border-secondary">
                                    <Lock size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    placeholder="Choose Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-transparent text-white border-start-0 border-secondary shadow-none"
                                />
                            </InputGroup>
                        </div>

                        <Button type="submit" variant="success" className="w-100 py-2 fw-bold shadow-lg" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
                        </Button>
                    </Form>

                    <div className="mt-4 text-muted">
                        Already have an account? <Link to="/login" className="text-success text-decoration-none fw-bold">Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;
