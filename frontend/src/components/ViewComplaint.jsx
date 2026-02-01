import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/client';

/**
 * HR view complaint - allows workflow progression and adding comments
 */
export default function ViewComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getComplaint(id);
      setComplaint(response.data);
    } catch (err) {
      setError('Failed to load complaint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setCommenting(true);
    try {
      // Include current step when adding comment
      await complaintAPI.addComment(id, comment, complaint.status);
      setComment('');
      fetchComplaint();
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleProgressWorkflow = async () => {
    const steps = ['RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION', 'CLOSED'];
    const currentIndex = steps.indexOf(complaint.status);

    if (currentIndex >= steps.length - 1) {
      alert('Complaint is already closed');
      return;
    }

    // Check if user has typed a comment but not submitted it
    if (comment.trim()) {
      alert(`You have an unsaved comment for the ${complaint.status} step. Please click "Add Comment for ${complaint.status} Step" button first, then try moving to the next step.`);
      setUpdatingStatus(false);
      return;
    }

    const nextStep = steps[currentIndex + 1];
    setUpdatingStatus(true);

    try {
      await complaintAPI.updateStatus(id, nextStep, `Moved to ${nextStep}`);
      fetchComplaint();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update status';
      
      // Show more helpful message if it's about missing comment
      if (errorMessage.includes('add a comment')) {
        alert(`${errorMessage}\n\nPlease add at least one comment for the ${complaint.status} step before proceeding.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">⏳ Loading complaint...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/hr-dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!complaint) {
    return <div className="text-center py-10">Complaint not found</div>;
  }

  const steps = ['RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION', 'CLOSED'];
  const currentStepIndex = steps.indexOf(complaint.status);
  const canProgress = currentStepIndex < steps.length - 1;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/hr-dashboard')}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6"
      >
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{complaint.title}</h1>
            <p className="text-gray-600 mb-4">ID: {complaint.id}</p>

            {!complaint.isAnonymous && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-gray-700">
                  <strong>Reported by:</strong> {complaint.reportedBy?.name} ({complaint.reportedBy?.email})
                </p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>
            </div>

            {/* Files */}
            {complaint.files && complaint.files.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Evidence Files</h2>
                <div className="space-y-2">
                  {complaint.files.map((file) => (
                    <div key={file.id} className="bg-gray-50 rounded-lg p-3 flex items-center">
                      <span className="text-gray-600">📎 {file.filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Internal Comments</h2>

              <form onSubmit={handleAddComment} className="mb-4">
                <div className="mb-2">
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Adding comment for: {complaint.status}
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                  placeholder={`Add comment for ${complaint.status} step...`}
                  disabled={commenting}
                />
                <button
                  type="submit"
                  disabled={commenting || !comment.trim()}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {commenting ? 'Adding...' : `Add Comment for ${complaint.status} Step`}
                </button>
              </form>

              {/* Group comments by step */}
              <div className="space-y-4">
                {complaint.comments && complaint.comments.length > 0 ? (
                  (() => {
                    // Group comments by step
                    const commentsByStep = {};
                    const steps = ['RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION', 'CLOSED'];
                    
                    // Initialize all steps
                    steps.forEach(step => {
                      commentsByStep[step] = [];
                    });

                    // Group comments by their step
                    complaint.comments.forEach(c => {
                      const step = c.step || 'RECEIVED'; // Default to RECEIVED if no step
                      if (commentsByStep[step]) {
                        commentsByStep[step].push(c);
                      }
                    });

                    return steps.map(step => {
                      const stepComments = commentsByStep[step];
                      if (!stepComments || stepComments.length === 0) return null;

                      return (
                        <div key={step} className="border-l-4 border-blue-600 pl-4">
                          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              {
                                RECEIVED: 'bg-yellow-100 text-yellow-800',
                                REVIEW: 'bg-blue-100 text-blue-800',
                                INVESTIGATION: 'bg-purple-100 text-purple-800',
                                ACTION: 'bg-orange-100 text-orange-800',
                                CLOSED: 'bg-green-100 text-green-800'
                              }[step]
                            }`}>
                              {step}
                            </span>
                          </h3>
                          <div className="space-y-2">
                            {stepComments.map((c) => (
                              <div key={c.id} className="bg-blue-50 rounded p-3">
                                <p className="text-gray-700">{c.content}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {c.author?.name || 'Unknown'} • {new Date(c.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }).filter(Boolean); // Remove null entries
                  })()
                ) : (
                  <p className="text-gray-600 text-sm">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Current Status</h3>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    {
                      RECEIVED: 'bg-yellow-100 text-yellow-800',
                      REVIEW: 'bg-blue-100 text-blue-800',
                      INVESTIGATION: 'bg-purple-100 text-purple-800',
                      ACTION: 'bg-orange-100 text-orange-800',
                      CLOSED: 'bg-green-100 text-green-800'
                    }[complaint.status]
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Step:</span>
                <span className="font-semibold">{complaint.currentStep} / 5</span>
              </div>
            </div>

            {canProgress && (
              <button
                onClick={handleProgressWorkflow}
                disabled={updatingStatus}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : '→ Move to Next Step'}
              </button>
            )}

            {!canProgress && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center font-semibold">
                ✅ Complaint Closed
              </div>
            )}
          </div>

          {/* Workflow Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Workflow History</h3>
            <div className="space-y-3">
              {complaint.workflow && complaint.workflow.length > 0 ? (
                complaint.workflow.map((w) => (
                  <div key={w.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <strong className="text-gray-800">{w.step}</strong>
                    </div>
                    <p className="text-gray-600 ml-4">{w.notes}</p>
                    <p className="text-gray-500 text-xs ml-4">
                      {new Date(w.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No workflow history</p>
              )}
            </div>
          </div>

          {/* AI Score */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
            <p className="text-gray-700">
              <strong>AI Confidence:</strong>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {(complaint.confidenceScore * 100).toFixed(0)}%
              </div>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
