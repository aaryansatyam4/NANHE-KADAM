import React, { useState } from 'react';
import Sidebar from '../Component/Sidebar/Sidebar';
import Navbar from '../Component/Navbar/CustomNavbar';
import UserProfileCard from '../Component/UserProfileCard/UserProfileCard';

const Profile = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      {sidebarVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '250px', zIndex: 2 }}>
          <Sidebar />
        </div>
      )}

      {/* Navbar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarVisible ? '250px' : '0',
          right: 0,
          height: '60px',
          zIndex: 3,
          transition: 'left 0.3s ease',
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div
        style={{
          marginTop: '60px',
          marginLeft: sidebarVisible ? '250px' : '0',
          padding: '20px',
          width: '100%',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <UserProfileCard />
      </div>
    </div>
  );
};

export default Profile;
