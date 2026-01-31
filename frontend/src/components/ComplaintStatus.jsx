import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/client';

/**
 * Component to view complaint status and details
 */
export default function ComplaintStatus() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getComplaint(id);
      setComplaint(response.data);
    } catch (err) {
      setError('Failed to load complaint details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">⏳ Loading complaint details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!complaint) {
    return <div className="text-center py-10">Complaint not found</div>;
  }

  // Workflow steps for visualization
  const steps = ['RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION', 'CLOSED'];
  const currentStepIndex = steps.indexOf(complaint.status);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6"
      >
        ← Back to Home
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{complaint.title}</h1>
            <p className="text-gray-600">Complaint ID: {complaint.id}</p>
          </div>
          <div className="text-right">
            {!complaint.isAnonymous && (
              <p className="text-gray-600">
                <strong>Reported by:</strong> {complaint.reportedBy?.name}
              </p>
            )}
            <p className="text-gray-600">
              <strong>Submitted:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* AI Confidence Score */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700">
            <strong>AI Confidence Score:</strong>{' '}
            <span className="text-lg font-semibold text-blue-600">
              {(complaint.confidenceScore * 100).toFixed(0)}%
            </span>
          </p>
          <p className="text-gray-600 text-sm mt-1">
            This AI-generated score indicates the likelihood that this report contains genuine concerns
            based on linguistic patterns.
          </p>
        </div>

        {/* Workflow Progress */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status Progress</h2>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">{step}</p>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-1 mt-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Details */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Details</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </div>

        {/* Files */}
        {complaint.files && complaint.files.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Evidence Files</h2>
            <div className="space-y-2">
              {complaint.files.map((file) => (
                <div key={file.id} className="bg-gray-50 rounded-lg p-3 flex items-center">
                  <span className="text-gray-600">📎 {file.filename}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {complaint.comments && complaint.comments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">HR Notes</h2>
            <div className="space-y-3">
              {complaint.comments.map((comment) => (
                <div key={comment.id} className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {comment.author.name} • {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
