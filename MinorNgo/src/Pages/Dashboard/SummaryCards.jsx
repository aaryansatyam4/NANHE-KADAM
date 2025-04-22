import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SummaryCards = () => {
  const [stats, setStats] = useState({
    totalMissing: 0,
    totalLost: 0,
    casesClosed: 0,
    casesOpen: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const lostRes = await axios.get('http://localhost:3001/api/children/lost');
        const missingRes = await axios.get('http://localhost:3001/api/children/missingchildren/all');
        const closed = lostRes.data.filter(child => child.founded === true).length;
        const open = lostRes.data.filter(child => child.founded === false).length;

        setStats({
          totalMissing: missingRes.data.length,
          totalLost: lostRes.data.length,
          casesClosed: closed,
          casesOpen: open,
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };

    fetchStats();
  }, []);

  const cardStyle = {
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    boxShadow: '0px 3px 10px rgba(0,0,0,0.1)',
    flex: 1,
    margin: '10px',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px',
  };

  const valueStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#007bff',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      <div style={cardStyle}>
        <div style={titleStyle}>Total Missing Children</div>
        <div style={valueStyle}>{stats.totalMissing}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>Total Lost Children</div>
        <div style={valueStyle}>{stats.totalLost}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>Cases Closed</div>
        <div style={valueStyle}>{stats.casesClosed}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>Cases Still Open</div>
        <div style={valueStyle}>{stats.casesOpen}</div>
      </div>
    </div>
  );
};

export default SummaryCards;
