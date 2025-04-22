import React, { useState, useEffect } from 'react';
import Sidebar from '../Component/Sidebar/Sidebar'; 
import Navbar from '../Component/Navbar/CustomNavbar.jsx'; 
import axios from 'axios'; 

const AddMissingChild = () => {
  const [formData, setFormData] = useState({
    parentName: '',
    contactNumber: '',
    childName: '',
    email: '',
    age: '',
    gender: '',
    lastSeen: '',
    description: '',
    childPhoto: null,
    location: '', // auto-filled
  });

  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        setFormData((prevData) => ({
          ...prevData,
          location: coords,
        }));
      },
      (error) => {
        setLocationError('Unable to get location');
      }
    );
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://localhost:3001/api/children/missing', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting the form:', error.response?.data || error.message);
      alert('Error submitting the missing child report');
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

      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', marginLeft: '250px', marginTop: '60px' }}>
        <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Report My Child Is Missing</h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: "Your Full Name", name: "parentName" },
                { label: "Contact Number", name: "contactNumber" },
                { label: "Child's Name", name: "childName" },
                { label: "Your Email", name: "email", type: "email" },
                { label: "Last Seen Location", name: "lastSeen" },
                { label: "Additional Description", name: "description", as: "textarea" }
              ].map((field) => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label">{field.label}</label>
                  {field.as === "textarea" ? (
                    <textarea
                      className="form-control"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  ) : (
                    <input
                      className="form-control"
                      name={field.name}
                      type={field.type || "text"}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                    />
                  )}
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label">Child's Age</label>
                <input
                  className="form-control"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Upload Recent Photograph</label>
                <input
                  className="form-control"
                  name="childPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {locationError && <p className="text-danger">{locationError}</p>}

              <button type="submit" className="btn btn-danger w-100 mt-3">Submit Missing Report</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMissingChild;
