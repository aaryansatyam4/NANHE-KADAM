import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../Component/Sidebar/Sidebar';
import Navbar from '../Component/Navbar/CustomNavbar';
import axios from 'axios';

const ReportLostChild = () => {
  const [formData, setFormData] = useState({
    parentName: '',
    contactNumber: '',
    childName: '',
    email:'',
    age: '',
    gender: '',
    lastSeen: '',
    description: '',
    childPhoto: null,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      childPhoto: file,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formDataToSend = new FormData();
    formDataToSend.append('parentName', formData.parentName);
    formDataToSend.append('contactNumber', formData.contactNumber);
    formDataToSend.append('childName', formData.childName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('age', formData.age);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('lastSeen', formData.lastSeen);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('childPhoto', formData.childPhoto);

    try {
      const response = await axios.post('http://localhost:3001/add-missing-child', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setSuccess('Lost child report submitted successfully.');
      console.log(response.data);
    } catch (error) {
      setError(`Error submitting the report: ${error.response ? error.response.data.message : error.message}`);
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ position: 'fixed', top: '0', left: '0', zIndex: 2, height: '100vh', width: '250px' }}>
        <Sidebar />
      </div>

      <div style={{ position: 'fixed', top: '0', left: '250px', right: '0', zIndex: 1, height: '60px' }}>
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
                    Help reunite a lost child with their family
                  </p>

                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formParentName">
                      <Form.Label>Guardian's Full Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange} 
                        placeholder="Enter guardian's name" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formContactNumber">
                      <Form.Label>Emergency Contact Number</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange} 
                        placeholder="Enter contact number" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formChildName">
                      <Form.Label>Full Name of the Child</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="childName"
                        value={formData.childName}
                        onChange={handleChange} 
                        placeholder="Enter child's full name" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formChildName">
                      <Form.Label>email</Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange} 
                        placeholder="Enter your email id" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formChildAge">
                      <Form.Label>Child's Age</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="age"
                        value={formData.age}
                        onChange={handleChange} 
                        placeholder="Enter child's age" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formChildGender">
                      <Form.Label>Child's Gender</Form.Label>
                      <Form.Select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formLastSeenLocation">
                      <Form.Label>Location Where the Child Was Last Seen</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="lastSeen"
                        value={formData.lastSeen}
                        onChange={handleChange} 
                        placeholder="Enter last known location" 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formChildImage">
                      <Form.Label>Upload a Clear, Recent Photograph of the Child</Form.Label>
                      <Form.Control 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDescription">
                      <Form.Label>Additional Identifying Information</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide any identifiable information" 
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button variant="danger" type="submit">
                        Submit Report
                      </Button>
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

export default ReportLostChild;
