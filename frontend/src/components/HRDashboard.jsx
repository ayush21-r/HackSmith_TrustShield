import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/client';

/**
 * HR Dashboard - view all complaints and manage workflow
 */
export default function HRDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAllComplaints();
      setComplaints(response.data);
    } catch (err) {
      setError('Failed to load complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered =
    filterStatus === 'ALL' ? complaints : complaints.filter((c) => c.status === filterStatus);

  const statusColors = {
    RECEIVED: 'bg-yellow-100 text-yellow-800',
    REVIEW: 'bg-blue-100 text-blue-800',
    INVESTIGATION: 'bg-purple-100 text-purple-800',
    ACTION: 'bg-orange-100 text-orange-800',
    CLOSED: 'bg-green-100 text-green-800'
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>⏳ Loading complaints...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 mb-6 rounded-lg shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">🛡️ HR Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium transition"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {['ALL', 'RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION'].map((status) => {
          const count =
            status === 'ALL' ? complaints.length : complaints.filter((c) => c.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`p-4 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl">{count}</div>
              <div className="text-sm">{status}</div>
            </button>
          );
        })}
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No complaints found</div>
        ) : (
          filtered.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        statusColors[complaint.status]
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    {complaint.isAnonymous ? '🔒 Anonymous Report' : `👤 ${complaint.reportedBy?.name}`}
                  </p>

                  <div className="text-gray-700 text-sm mb-2 line-clamp-2">{complaint.description}</div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      🧠 AI Score: <strong>{(complaint.confidenceScore * 100).toFixed(0)}%</strong>
                    </span>
                    <span>📁 Files: {complaint.files?.length || 0}</span>
                    <span>💬 Comments: {complaint.comments?.length || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/view-complaint/${complaint.id}`)}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
