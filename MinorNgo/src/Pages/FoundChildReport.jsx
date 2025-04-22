import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../Component/Sidebar/Sidebar';
import Navbar from '../Component/Navbar/CustomNavbar';
import axios from 'axios';

const FoundChildReport = () => {
  const [formData, setFormData] = useState({
    guardianName: '',
    contactInfo: '',
    childName: '',
    email: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    description: '',
    additionalComments: '',
    childPhoto: null,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Autofill current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
          setFormData((prevData) => ({ ...prevData, lastSeenLocation: location }));
        },
        (err) => {
          console.warn('Location access denied:', err.message);
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, childPhoto: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      const response = await axios.post('http://localhost:3001/api/children/lost', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setSuccess('Found child report submitted successfully.');
      console.log(response.data);
    } catch (err) {
      setError(`Submission failed: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 2, height: '100vh', width: '250px' }}>
        <Sidebar />
      </div>

      <div style={{ position: 'fixed', top: 0, left: '250px', right: 0, zIndex: 1, height: '60px' }}>
        <Navbar />
      </div>

      <div className="d-flex" style={{ marginTop: '60px', marginLeft: '250px' }}>
        <Container className="p-4">
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow-lg p-4 mb-5 bg-white rounded">
                <Card.Body>
                  <h3 className="text-center mb-4 heading-title">Report a Found Child</h3>
                  <p className="text-center text-muted mb-4 heading-subtitle">
                    Help reunite this child with their family.
                  </p>

                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Your Full Name</Form.Label>
                      <Form.Control type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Child's Name</Form.Label>
                      <Form.Control type="text" name="childName" value={formData.childName} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Age</Form.Label>
                      <Form.Control type="number" name="age" value={formData.age} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Location Found</Form.Label>
                      <Form.Control type="text" name="lastSeenLocation" value={formData.lastSeenLocation} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Upload Child's Photo</Form.Label>
                      <Form.Control type="file" accept="image/*" onChange={handleFileChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} rows={3} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Additional Comments</Form.Label>
                      <Form.Control as="textarea" name="additionalComments" value={formData.additionalComments} onChange={handleChange} rows={2} />
                    </Form.Group>

                    <div className="d-grid">
                      <Button type="submit" variant="success">Submit Found Report</Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default FoundChildReport;
