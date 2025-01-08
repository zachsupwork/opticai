// pages/usage-dashboard.tsx

import React, { useState } from 'react';
import UsageDashboard from '~/common/components/UsageDashboard';

const UsageDashboardPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedEmail(email);
  };

  return (
    <div style={pageStyle}>
      <h1>View Usage Dashboard</h1>
      {!submittedEmail ? (
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            View Usage
          </button>
        </form>
      ) : (
        <UsageDashboard email={submittedEmail} />
      )}
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  padding: '2em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const formStyle: React.CSSProperties = {
  maxWidth: '400px',
  width: '100%',
  padding: '1em',
  border: '1px solid #ccc',
  borderRadius: '1em',
  backgroundColor: '#fff',
  marginBottom: '2em',
};

const fieldStyle: React.CSSProperties = {
  margin: '1em 0',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle: React.CSSProperties = {
  padding: '0.5em',
  fontSize: '1em',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75em 1.5em',
  fontSize: '1em',
  color: '#fff',
  backgroundColor: '#6772e5',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default UsageDashboardPage;