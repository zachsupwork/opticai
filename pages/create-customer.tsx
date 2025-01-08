// pages/create-customer.tsx

import React from 'react';
import CreateCustomerForm from '~/common/components/CreateCustomerForm';

const CreateCustomerPage: React.FC = () => {
  return (
    <div style={containerStyle}>
      <h1>Register Your Stripe Customer</h1>
      <CreateCustomerForm />
    </div>
  );
};

// Optional: Add some basic styling
const containerStyle: React.CSSProperties = {
  padding: '2em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

export default CreateCustomerPage;