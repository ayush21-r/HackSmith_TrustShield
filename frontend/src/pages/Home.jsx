import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Home page for employees
 */
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 mb-8 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🛡️ TrustShield</h1>
          <p className="text-blue-100">Workplace Harassment Reporting & Resolution Platform</p>
        </div>
        <div className="text-right">
          {user && <p className="mb-2">Welcome, {user.name}!</p>}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Submit Report Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-8 border border-blue-200">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Report a Concern</h2>
          <p className="text-gray-700 mb-6">
            Submit a report about workplace harassment or discrimination. You can report anonymously or with your name.
            All reports are handled confidentially.
          </p>
          <Link
            to="/report"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Submit Report →
          </Link>
        </div>

        {/* Check Status Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-8 border border-green-200">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Status</h2>
          <p className="text-gray-700 mb-6">
            Enter your complaint ID to view the current status and progress of your report.
            You'll see internal HR notes and workflow updates.
          </p>
          <CheckStatusForm />
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { number: '1', title: 'Report', desc: 'Submit complaint anonymously or named' },
            { number: '2', title: 'Review', desc: 'HR reviews and verifies the report' },
            { number: '3', title: 'Investigate', desc: 'Formal investigation is conducted' },
            { number: '4', title: 'Action', desc: 'Appropriate actions are taken' },
            { number: '5', title: 'Closed', desc: 'Case resolved and documented' }
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                {step.number}
              </div>
              <h3 className="font-bold text-gray-800">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Safety & Privacy</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">✓</span>
            <span><strong>Confidential:</strong> Your report is treated with the highest confidentiality</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">✓</span>
            <span><strong>Anonymous Option:</strong> Report without revealing your identity</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">✓</span>
            <span><strong>No Retaliation:</strong> We have strict policies against retaliation</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">✓</span>
            <span><strong>AI-Assisted:</strong> AI analyzes reports for patterns and severity</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-3">✓</span>
            <span><strong>Transparent Process:</strong> Track your case status in real-time</span>
          </li>
        </ul>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
        <p className="text-gray-700 mb-4">
          If you need support or have questions about the process, please contact HR directly.
        </p>
        <p className="text-gray-600">
          Email: <strong>hr@company.com</strong> | Phone: <strong>1-800-HR-SAFE</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Inline form to check complaint status
 */
function CheckStatusForm() {
  const [complaintId, setComplaintId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (complaintId.trim()) {
      navigate(`/complaint/${complaintId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="number"
        value={complaintId}
        onChange={(e) => setComplaintId(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Enter complaint ID"
        required
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
      >
        Check →
      </button>
    </form>
  );
}
