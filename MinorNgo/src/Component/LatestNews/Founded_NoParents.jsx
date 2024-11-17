import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Component to display children where founded = false and adopted = false
const Founded_NoParents = () => {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get('http://localhost:3001/children-unfound-unadopted');
        setChildren(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchChildren();
  }, []);

  return (
    <div>
      <h2>Children Not Yet Found or Adopted</h2>
      {children.length === 0 ? (
        <p>No children found.</p>
      ) : (
        <ul>
          {children.map((child) => (
            <li key={child._id}>
              <p>Name: {child.childName}</p>
              <p>Age: {child.age}</p>
              <p>Last Seen: {child.lastSeen}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Founded_NoParents;
