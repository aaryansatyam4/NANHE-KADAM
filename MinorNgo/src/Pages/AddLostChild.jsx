import React, { useState } from 'react';
import Sidebar from '../Component/Sidebar/Sidebar'; 
import Navbar from '../Component/Navbar/CustomNavbar.jsx'; 
import axios from 'axios'; 

const AddLostChild = () => {
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    gender: '',
    email:'',
    lastSeen: '',
    description: '',
    childPhoto: null,
    guardianName: '',
    contactInfo: '',
    additionalComments: '',
    lastSeenLocation: '',
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    formDataToSend.append('childName', formData.childName);
    formDataToSend.append('age', formData.age);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('lastSeen', formData.lastSeen);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('guardianName', formData.guardianName);
    formDataToSend.append('contactInfo', formData.contactInfo);
    formDataToSend.append('additionalComments', formData.additionalComments);
    formDataToSend.append('lastSeenLocation', formData.lastSeenLocation);
    formDataToSend.append('childPhoto', formData.childPhoto);
  
    console.log("Sending FormData:", formDataToSend); // Debugging FormData
  
    try {
      const response = await axios.post('http://localhost:3001/add-lost-child', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
  
      console.log(response.data);
      alert(response.data.message);  // Display success message from the backend
      
      // Refresh the page after successful form submission
      window.location.reload();
    } catch (error) {
      console.error('Error submitting the form:', error.response ? error.response.data : error.message);
      alert('Error submitting the form');
    }
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      childPhoto: file,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      <div style={{ position: 'fixed', top: '0', left: '0', zIndex: 2, height: '100vh', width: '250px' }}>
        <Sidebar />
      </div>

      <div style={{ position: 'fixed', top: '0', left: '250px', right: '0', zIndex: 1, height: '60px' }}>
        <Navbar />
      </div>

      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', marginLeft: '250px', marginTop: '60px' }}>
        <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Report a Missing Child</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="childName">Child's Name</label>
                <input 
                  className="form-control" 
                  id="childName" 
                  name="childName" 
                  type="text" 
                  value={formData.childName} 
                  onChange={handleChange} 
                  placeholder="Enter missing child's full name" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="age">Child's Age</label>
                <input 
                  className="form-control" 
                  id="age" 
                  name="age" 
                  type="number" 
                  value={formData.age} 
                  onChange={handleChange} 
                  placeholder="Enter child's age" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="gender">Child's Gender</label>
                <select 
                  className="form-select" 
                  id="gender" 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="email">Your Email</label>
                <input 
                  className="form-control" 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Your email" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="lastSeenLocation">Location Where the Child Was Last Seen</label>
                <input 
                  className="form-control" 
                  id="lastSeenLocation" 
                  name="lastSeenLocation" 
                  type="text" 
                  value={formData.lastSeenLocation} 
                  onChange={handleChange} 
                  placeholder="Enter last known location" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">Description of the Child</label>
                <textarea 
                  className="form-control" 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Provide additional details about the child" 
                  rows="3" 
                  required 
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="guardianName">Guardian's Full Name</label>
                <input 
                  className="form-control" 
                  id="guardianName" 
                  name="guardianName" 
                  type="text" 
                  value={formData.guardianName} 
                  onChange={handleChange} 
                  placeholder="Enter guardian's full name" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="contactInfo">Your Contact Information</label>
                <input 
                  className="form-control" 
                  id="contactInfo" 
                  name="contactInfo" 
                  type="text" 
                  value={formData.contactInfo} 
                  onChange={handleChange} 
                  placeholder="Enter your contact information" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="additionalComments">Additional Comments</label>
                <textarea 
                  className="form-control" 
                  id="additionalComments" 
                  name="additionalComments" 
                  value={formData.additionalComments} 
                  onChange={handleChange} 
                  placeholder="Any additional information" 
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="childPhoto">Upload a Recent Photo of the Child</label>
                <input 
                  className="form-control" 
                  id="childPhoto" 
                  name="childPhoto" 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">Submit Lost Child Report</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLostChild;
