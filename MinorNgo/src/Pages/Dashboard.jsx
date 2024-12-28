import React from 'react';
import Sidebar from '../Component/Sidebar/Sidebar';
import Navbar from '../Component/Navbar/CustomNavbar.jsx';
import Piechart from '../Component/Piechart/Piechart.jsx';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sticky Sidebar */}
      <div
        className="sidebar-container"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: 2,
          height: '100vh',
          width: '250px',
          backgroundColor: '#2C3E50',
          boxShadow: '2px 0px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Sidebar />
      </div>

      {/* Sticky Navbar */}
      <div
        className="navbar-container"
        style={{
          position: 'fixed',
          top: '0',
          left: '250px',
          right: '0',
          zIndex: 1,
          height: '60px',
          backgroundColor: '#34495E',
          boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <Navbar />
      </div>

      {/* Main Content Section */}
      <div
        className="main-content"
        style={{
          marginTop: '60px',
          marginLeft: '250px',
          display: 'flex',
          flexWrap: 'wrap',
          padding: '20px',
        }}
      >
        {/* Left Column for Pie Chart */}
        <div
          className="content-left"
          style={{
            flex: '1',
            maxWidth: '600px',
            marginBottom: '20px',
            borderRadius: '10px',
            boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
            padding: '20px',
            marginRight: '20px',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <h3 style={{ textAlign: 'center', color: '#2C3E50' }}>Pie Chart</h3>
          <Piechart />
        </div>

        {/* Right Column for Latest News and Other Sections */}
        <div
          className="content-right"
          style={{
            flex: '2',
            maxWidth: '900px',
            marginBottom: '20px',
            borderRadius: '10px',
            boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
            padding: '20px',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <h3 style={{ textAlign: 'center', color: '#2C3E50' }}>Latest News</h3>
          {/* You can add more components here like Latest News */}
        </div>
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 1200px) {
            .main-content {
              flex-direction: column;
              margin-left: 0;
            }
            .content-left,
            .content-right {
              width: 100%;
              margin-right: 0;
            }
          }

          @media (max-width: 768px) {
            .sidebar-container {
              width: 200px;
            }
            .navbar-container {
              left: 200px;
            }
            .main-content {
              margin-left: 200px;
            }
            .content-left,
            .content-right {
              padding: 10px;
            }
          }

          @media (max-width: 576px) {
            .sidebar-container {
              width: 150px;
            }
            .navbar-container {
              left: 150px;
            }
            .main-content {
              margin-left: 150px;
            }
            .content-left,
            .content-right {
              padding: 5px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
