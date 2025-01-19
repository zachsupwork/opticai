import { getAuth, applyActionCode, sendEmailVerification } from "firebase/auth";  
import '~/common/styles/Auth.css';  
import { useState, useEffect, useRef } from 'react';  
import { useRouter } from 'next/router';  
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';  

const EmailVerificationCheck: React.FC = () => {  
    const auth = getAuth();  
    const router = useRouter();  

    const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null); // Use null for loading state  
    const effectRan = useRef(false);


    function getParameterByName(name: string): string | null {  
        const url = new URL(window.location.href);  
        return url.searchParams.get(name);  
    }  

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const actionCode = getParameterByName('oobCode');  

        if (actionCode) {  
            applyActionCode(auth, actionCode)  
                .then(() => {
                    console.log('Email verification succeeded');
                    addSnackbar({ key: 'email-verification', message: 'Your email verified successfully', type: 'success' });  
                    setVerificationStatus(true);  
                })  
                .catch((error) => {
                    console.log('Email verification failed', error);
                    addSnackbar({ key: 'email-verification', message: 'Email verification failed', type: 'warning' });  
                    setVerificationStatus(false);  
                });  
        }  
    }, []);  

    const handleResendEmail = (e: React.FormEvent) => {  
        e.preventDefault();  
        if (auth.currentUser) {  
            sendEmailVerification(auth.currentUser)
                .then(() => {  
                    addSnackbar({ key: 'email-sent', message: 'Verification email sent!', type: 'success' });  
                })  
                .catch(() => {  
                    addSnackbar({ key: 'email-sent-error', message: 'Failed to send verification email', type: 'warning' });  
                });  
        }  
    };  

    return (  
        <div className="signup-container">  
            <div className="signup-card">  
                {verificationStatus === null && <h2>Loading...</h2>} {/* Loading state */}  
                {verificationStatus && (  
                    <form onSubmit={(e) => e.preventDefault()}>  
                        <h2>Your email is verified successfully</h2>  
                        <div className="continue-text">  
                            <span onClick={() => router.push('/index')}>Continue</span>  
                        </div>  
                    </form>  
                )}  
                {verificationStatus === false && (  
                    <form onSubmit={handleResendEmail}>  
                        <h2>Email verification failed</h2>  
                        <button type="submit">Resend Email</button>  
                    </form>  
                )}  
            </div>
        </div>  
    );  
};  

export default EmailVerificationCheck;