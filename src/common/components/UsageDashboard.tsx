import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface UsageRecord {
  quantity: number;
  timestamp: number;
  createdAt: FirebaseFirestore.Timestamp;
}

interface UsageDashboardProps {
  email: string;
}

const UsageDashboard: React.FC<UsageDashboardProps> = ({ email }) => {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await axios.get('/api/get-usage', {
          params: { email },
        });

        if (response.data.usageRecords) {
          setUsageRecords(response.data.usageRecords);
        } else {
          setError('No usage records found.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch usage records.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [email]);

  if (loading) return <p>Loading usage records...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (usageRecords.length === 0) return <p>No usage records available.</p>;

  return (
    <div style={dashboardStyle}>
      <h2>Usage Dashboard</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {usageRecords.map((record, index) => (
            <tr key={index}>
              <td>{new Date(record.timestamp * 1000).toLocaleString()}</td>
              <td>{record.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const dashboardStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '2em auto',
  padding: '1em',
  border: '1px solid #ccc',
  borderRadius: '1em',
  backgroundColor: '#f0f0f0',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

export default UsageDashboard;