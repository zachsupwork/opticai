import React, { useState } from 'react';
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useRouter } from 'next/router';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';
import '~/common/styles/Auth.css';


const VerifyEmail = () => {

    const auth = getAuth();

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Verify Email</h2>
                <p>Please check your email to verify your account</p>
                <h4>Don&apost receive email?</h4>
                <button onClick={() => {
                    if (auth.currentUser) {
                        sendEmailVerification(auth.currentUser);
                        addSnackbar({ key: 'email-sent', message: 'Email sent!', type: 'success' });
                    }
                }}>Resend Email</button>
            </div>
        </div>
    );
};

export default VerifyEmail;
