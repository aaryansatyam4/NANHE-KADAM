import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';

const CreateEvents = () => {
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    location: '',
    time: '',
    objectives: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/events', eventData, {
        withCredentials: true,
      });
      setSuccessMessage('Event created successfully');
      setEventData({ title: '', date: '', location: '', time: '', objectives: '' });
    } catch (error) {
      setErrorMessage('Failed to create event. Please check all fields and try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create New Event</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label>Event Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="location">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={eventData.location}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="time">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="time"
            name="time"
            value={eventData.time}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="objectives">
          <Form.Label>Objectives</Form.Label>
          <Form.Control
            as="textarea"
            name="objectives"
            value={eventData.objectives}
            onChange={handleChange}
            rows={3}
            required
          />
        </Form.Group>

        <Button className="mt-3" type="submit">Create</Button>
      </Form>
    </div>
  );
};

export default CreateEvents;
