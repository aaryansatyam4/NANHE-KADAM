import React from 'react';
import Sidebar from '../Component/Sidebar/Sidebar';
import Navbar from '../Component/Navbar/CustomNavbar.jsx';
import Piechart from '../Component/Piechart/Piechart.jsx';
import SummaryCards from './Dashboard/SummaryCards.jsx';
import TopReporters from './Dashboard/TopReporters.jsx';
import UpcomingEvents from './Dashboard/UpcomingEvents';
import ReportsOverTime from './Dashboard/ReportsOverTime';
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: 2,
        height: '100vh',
        width: '250px',
        backgroundColor: '#2C3E50',
        boxShadow: '2px 0px 10px rgba(0,0,0,0.1)',
      }}>
        <Sidebar />
      </div>

      {/* Navbar */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '250px',
        right: '0',
        zIndex: 1,
        height: '60px',
        backgroundColor: '#34495E',
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
      }}>
        <Navbar />
      </div>

      {/* Main Dashboard */}
      <div style={{
        marginTop: '60px',
        marginLeft: '250px',
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Summary Cards */}
        <div style={{
          width: '100%',
          padding: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
          borderRadius: '10px'
        }}>
          <h3 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '20px' }}>Quick Overview</h3>
          <SummaryCards />
        </div>

        {/* Piechart */}
        <div style={{
          flex: '1',
          minWidth: '400px',
          maxWidth: '600px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          padding: '20px',
          boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ textAlign: 'center', color: '#2C3E50' }}>Pie Chart</h3>
          <Piechart />
        </div>

        {/* Top Reporters */}
        <div style={{
          flex: '1',
          minWidth: '400px',
          maxWidth: '600px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          padding: '20px',
          boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
        }}>
          <TopReporters />
        </div>
        <div style={{ width: '100%' }}>
  <UpcomingEvents />
</div>
<div style={{ width: '100%' }}>
  <ReportsOverTime />
</div>
      </div>

    </div>
  );
};

export default Dashboard;
