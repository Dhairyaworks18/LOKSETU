"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "../../lib/authHelpers";

export default function LoginPage() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            setError("");
            await signInWithGoogle();
            router.push("/");
        } catch (err) {
            setError(err.message || "Failed to sign in with Google.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isSignIn) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password, name);
            }
            router.push("/");
        } catch (err) {
            setError(err.message || "Authentication failed. Please check your credentials.");
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f0e8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"DM Sans", sans-serif',
            backgroundImage: 'radial-gradient(#e2ddd5 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '3rem 2rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '430px',
                boxSizing: 'border-box'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <p style={{
                        color: '#e8521a',
                        fontSize: '14px',
                        fontWeight: '800',
                        letterSpacing: '0.1em',
                        margin: '0 0 4px 0',
                        fontFamily: '"Syne", sans-serif'
                    }}>
                        लोक से तु
                    </p>
                    <h1 style={{
                        color: '#0f4a35',
                        fontSize: '36px',
                        fontWeight: '800',
                        margin: '0 0 12px 0',
                        fontFamily: '"Syne", sans-serif',
                        letterSpacing: '-0.5px'
                    }}>
                        LokSetu
                    </h1>
                    <p style={{
                        color: '#64748B',
                        fontSize: '15px',
                        margin: '0',
                        lineHeight: '1.5',
                        fontWeight: '500'
                    }}>
                        Report civic issues. Track progress.<br />Make India better.
                    </p>
                </div>

                <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9' }}>
                    <button
                        onClick={() => { setIsSignIn(true); setError(""); }}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: isSignIn ? '2px solid #0f4a35' : '2px solid transparent',
                            color: isSignIn ? '#0f4a35' : '#94a3b8',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginBottom: '-2px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setIsSignIn(false); setError(""); }}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: !isSignIn ? '2px solid #0f4a35' : '2px solid transparent',
                            color: !isSignIn ? '#0f4a35' : '#94a3b8',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginBottom: '-2px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        marginBottom: '1.5rem',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isSignIn && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                fontSize: '15px',
                                backgroundColor: '#f8fafc',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0f4a35'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '15px',
                            backgroundColor: '#f8fafc',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#0f4a35'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '15px',
                            backgroundColor: '#f8fafc',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#0f4a35'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#0f4a35',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontFamily: '"Syne", sans-serif',
                            marginTop: '0.5rem',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0c3a2a'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#0f4a35'}
                    >
                        {isSignIn ? "Sign In" : "Sign Up"}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0 1.5rem', opacity: 0.8 }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <p style={{ margin: '0 1rem', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>or</p>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
                >
                    <svg width="22" height="22" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    Google Sign In
                </button>
            </div>
        </div>
    );
}
