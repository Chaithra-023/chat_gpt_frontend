import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Creating account...');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Sign up successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMessage(`Error: ${data.detail || 'Signup failed'}`);
            }
        } catch (error) {
            setMessage('Error connecting to server.');
            console.error(error);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: 'Arial, sans-serif',
        },
        formBox: {
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '360px',
        },
        header: {
            textAlign: 'center',
            marginBottom: '25px',
            color: '#333',
        },
        inputGroup: {
            marginBottom: '15px',
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold',
            color: '#555',
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px',
        },
        message: {
            textAlign: 'center',
            marginTop: '15px',
            color: message.includes('Error') ? 'red' : 'green',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.formBox}>
                <h2 style={styles.header}>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Pick a username"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Create a password"
                        />
                    </div>
                    <button type="submit" style={styles.button}>
                        Sign Up
                    </button>
                </form>
                {message && <p style={styles.message}>{message}</p>}
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>

    );
}

export default Signup;