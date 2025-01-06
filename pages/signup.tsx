import React, { useState } from 'react';
import { useAuth } from '~/common/auth/AuthContext';
import { useRouter } from 'next/router';
import '~/common/styles/Auth.css';

const Signup = () => {
    const { signup } = useAuth();
    const router = useRouter();
    const [data, setData] = useState({
        email: '',
        password: '',
    });

    interface SignupData {
        email: string;
        password: string;
    }

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signup(data.email, data.password);
            router.push('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Join Us</h2>
                <form onSubmit={handleSignup}>
                    <label>Email address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        value={data.email}
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Create a password"
                        required
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        value={data.password}
                    />
                    <button type="submit">Sign Up</button>
                </form>
                <div className="link-text">
                    Already have an account? <span onClick={() => router.push('/login')}>Log In</span>
                </div>
            </div>
        </div>
    );
};

export default Signup;
