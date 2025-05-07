import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReportedLostChildren from '../Reported/ReportedLostChildren';
import ReportedMissingChildren from '../Reported/ReportedMissingChildren';

const UserProfileCard = () => {
  const [userData, setUserData] = useState(null);
  const [lostChildCount, setLostChildCount] = useState(0);
  const [missingChildren, setMissingChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getCookie = (cookieName) => {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return "";
  };

  useEffect(() => {
    const userId = getCookie('userId');
    if (userId) {
      axios.get(`http://localhost:3001/api/user/${userId}`, { withCredentials: true })
        .then(res => setUserData(res.data))
        .catch(err => console.error('User fetch error:', err));

      axios.get(`http://localhost:3001/api/children/count/${userId}`)
        .then(res => setLostChildCount(res.data.count))
        .catch(err => console.error('Count fetch error:', err));

      axios.get(`http://localhost:3001/api/children/missingchildren/byuser/${userId}`)
        .then(res => setMissingChildren(res.data))
        .catch(err => console.error('Missing children fetch error:', err));
    }
  }, []);

  const handleCloseCase = async (id) => {
    try {
      await axios.put(`http://localhost:3001/api/children/close/${id}`, { founded: true });
  
      // ✅ Remove the closed child from the list
      setMissingChildren(prev => prev.filter(child => child._id !== id));
  
      setShowModal(false);
    } catch (err) {
      console.error('Error closing case:', err);
    }
  };
  
  if (!userData) return <div>Loading profile...</div>;

  const profilePicture = userData.photo
    ? `http://localhost:3001/userpic/${userData.photo}`
    : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp";

  const getBadge = () => {
    if (lostChildCount === 1) return <span className="badge bg-success">🥉 First Report</span>;
    if (lostChildCount <= 5) return <span className="badge bg-primary">🥈 Making a Difference</span>;
    if (lostChildCount <= 20) return <span className="badge bg-warning text-dark">🥇 Guardian Contributor</span>;
    if (lostChildCount <= 50) return <span className="badge bg-danger">🏅 Heroic Reporter</span>;
    return <span className="badge bg-dark">🏆 Legend of Hope</span>;
  };

  return (
    <section style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container py-5">
        <div className="row">
          {/* Profile Column */}
          <div className="col-lg-4">
            <div className="card text-center mb-4 shadow-sm">
              <div className="card-body">
                <img src={profilePicture} alt="avatar" className="rounded-circle img-fluid mb-3" style={{ width: '150px' }} />
                <h5 className="mb-1">{userData.name}</h5>
                <p className="text-muted mb-2">{userData.category}</p>
                <p className="text-muted">📍 New Delhi, India</p>
                <hr />
                <h6 className="text-muted">Lost Children Reported</h6>
                <h3 className="text-primary fw-bold">{lostChildCount}</h3>
                <div className="mt-2">{getBadge()}</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <i className="fas fa-globe text-warning"></i>
                    <span>https://saveourchildren.org.in</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <i className="fab fa-github text-dark"></i>
                    <span>saveourchildren</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <i className="fab fa-twitter text-info"></i>
                    <span>@saveourchildren</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <i className="fab fa-instagram text-danger"></i>
                    <span>saveourchildren</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <i className="fab fa-facebook text-primary"></i>
                    <span>saveourchildren</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info + Reports */}
          <div className="col-lg-8">
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-sm-4"><strong>Full Name</strong></div>
                  <div className="col-sm-8 text-muted">{userData.name}</div>
                </div>
                <div className="row">
                  <div className="col-sm-4"><strong>Email</strong></div>
                  <div className="col-sm-8 text-muted">{userData.email}</div>
                </div>
              </div>
            </div>

            {/* Missing Children Table */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Missing Children Reported</h5>
              </div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Child</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missingChildren.length > 0 ? (
                      missingChildren.map(child => (
                        <tr
                          key={child._id}
                          onClick={() => {
                            setSelectedChild(child);
                            setShowModal(true);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{child.childName}</td>
                          <td>{child.age}</td>
                          <td>{child.gender}</td>
                          <td>
                            {child.founded
                              ? <span className="badge bg-success">Found</span>
                              : <span className="badge bg-warning text-dark">Still Missing</span>}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No missing children reported yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedChild && (
        <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedChild.childName} - Full Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <img
                    src={
                      selectedChild.childPhoto
                        ? `http://localhost:3001/reported/${selectedChild.childPhoto}`
                        : 'https://via.placeholder.com/150x150.png?text=No+Image'
                    }
                    alt="Child"
                    className="rounded"
                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ccc' }}
                  />
                </div>

                <p><strong>Age:</strong> {selectedChild.age}</p>
                <p><strong>Gender:</strong> {selectedChild.gender}</p>
                <p><strong>Guardian:</strong> {selectedChild.parentName}</p>
                <p><strong>Contact:</strong> {selectedChild.contactNumber}</p>
                <p><strong>Email:</strong> {selectedChild.email}</p>
                <p><strong>Last Seen:</strong> {selectedChild.lastSeen}</p>
                <p><strong>Description:</strong> {selectedChild.description}</p>
                <p><strong>Status:</strong> {selectedChild.founded ? '✅ Found' : '🚨 Still Missing'}</p>

                {selectedChild.lastSeen?.toLowerCase().includes("lat") && (
                  <div className="mt-4">
                    <h6>📍 Last Known Location</h6>
                    <iframe
                      width="100%"
                      height="300"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${selectedChild.lastSeen.replace('Lat:', '').replace('Lng:', '').replace(/\s/g, '')}&z=15&output=embed`}
                      allowFullScreen
                      title="Child Location Map"
                    ></iframe>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {!selectedChild.founded && (
                  <button className="btn btn-success" onClick={() => handleCloseCase(selectedChild._id)}>
                    Close Case (Mark as Found)
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserProfileCard;
