import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/events');
        const now = new Date();

        const upcoming = res.data
          .filter(event => event.approved && new Date(event.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(upcoming);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div style={{
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: '#ffffff',
      boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
      width: '100%'
    }}>
      <h3 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '20px' }}>📅 Upcoming Events</h3>

      {events.length > 0 ? (
        <ul className="list-group">
          {events.map(event => (
            <li
              key={event._id}
              className="list-group-item d-flex flex-column align-items-start mb-2"
              style={{ border: '1px solid #ccc', borderRadius: '8px' }}
            >
              <h5 className="mb-1">{event.title}</h5>
              <small><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</small>
              <small><strong>Time:</strong> {event.time}</small>
              <small><strong>Location:</strong> {event.location}</small>
              {event.submittedBy?.name && (
                <small className="text-muted">By {event.submittedBy.name}</small>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted">No upcoming events found.</p>
      )}
    </div>
  );
};

export default UpcomingEvents;
