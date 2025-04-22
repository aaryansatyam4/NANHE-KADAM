import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [id, setId] = useState('');
  const [otpSent, setOtpSent] = useState(false); // To track OTP status
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false); // To track OTP verification status
  const [showOtpModal, setShowOtpModal] = useState(false); // To control OTP modal visibility

  const navigate = useNavigate(); // To navigate to /login after submission

  // Handler to update category selection
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  // Handler for photo upload
  const handlePhotoChange = (event) => {
    setPhoto(event.target.files[0]);
  };

  // Handler for name change
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  // Handler for email change
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  // Handler for password change
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Handler for ID change
  const handleIdChange = (event) => {
    setId(event.target.value);
  };

  // Send OTP function
  const handleSendOtp = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/otp/send', { email })

      .then((response) => {
        console.log(response.data);
        setOtpSent(true);
        setShowOtpModal(true); // Show OTP modal on successful OTP send
      })
      .catch((error) => {
        console.error('Error sending OTP:', error);
      });
  };

  // Verify OTP function
  const handleVerifyOtp = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3001/api/otp/verify', { email, otp })

      .then((response) => {
        console.log(response.data);
        setOtpVerified(true);
        setShowOtpModal(false); // Close OTP modal on successful verification
      })
      .catch((error) => {
        console.error('Error verifying OTP:', error);
      });
  };

  // Submit the form after OTP verification
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare FormData for submission
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('category', category);
    formData.append('password', password);
    formData.append('id', id);
    formData.append('photo', photo); // Append the photo file

    axios.post('http://localhost:3001/api/auth/register', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

      .then(result => {
        console.log(result);
        navigate('/login'); // Navigate to /login after successful registration
      })
      .catch(err => {
        if (err.response) {
          console.log('Error Response:', err.response.data);
        } else {
          console.log('Error:', err.message);
        }
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '36rem', borderRadius: '15px' }}>
        <h3 className="text-center mb-4">Sign Up</h3>
        <form onSubmit={otpVerified ? handleSubmit : handleSendOtp}>
          <div className="row">
            {/* Left Column: Form Fields */}
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={handleNameChange}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="category">Category</label>
                <select
                  className="form-control"
                  id="category"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  <option value="user">User</option>
                  {/* <option value="volunteer">Volunteer</option>
                  <option value="police">Police</option>
                  <option value="investigation">Investigation Department</option> */}
                </select>
              </div>

              {/* Show ID field if category is "police" or "investigation" */}
              {['police', 'investigation'].includes(category) && (
                <div className="form-group mb-3">
                  <label htmlFor="id">Police ID/Investigation ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="id"
                    placeholder="Enter ID"
                    value={id}
                    onChange={handleIdChange}
                  />
                </div>
              )}

              <div className="form-group mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            {/* Right Column: Photo Upload */}
            <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
              <div className="photo-container mb-3">
                {photo ? (
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Uploaded"
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '150px',
                      height: '150px',
                      border: '1px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <span>Photo</span>
                  </div>
                )}
              </div>
              <label htmlFor="photo" className="text-center">Face should be visible</label>
              <input
                type="file"
                className="form-control mt-2"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {!otpVerified ? (
            <button type="submit" className="btn btn-primary w-100 mt-4">
              {otpSent ? 'Verify OTP' : 'Send OTP'}
            </button>
          ) : (
            <button type="submit" className="btn btn-primary w-100 mt-4">Submit</button>
          )}
        </form>

        <div className="text-center mt-3">
          <p>Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h4 className="text-center">Enter OTP</h4>
            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary w-100 mt-4"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </button>
            <button
              className="btn btn-secondary w-100 mt-2"
              onClick={() => setShowOtpModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
