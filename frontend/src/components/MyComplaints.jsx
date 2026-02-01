import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/complaints/my/history');
      setComplaints(response.data);
    } catch (err) {
      setError('Failed to load your complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      RECEIVED: 'bg-blue-100 text-blue-800',
      REVIEW: 'bg-yellow-100 text-yellow-800',
      INVESTIGATION: 'bg-orange-100 text-orange-800',
      ACTION: 'bg-purple-100 text-purple-800',
      CLOSED: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Complaint History</h1>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't submitted any complaints yet.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/report')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Your First Complaint
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 cursor-pointer border-2 border-transparent hover:border-blue-200 relative"
                onClick={() => navigate(`/complaint/${complaint.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        ID: #{complaint.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                      {complaint.isAnonymous && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {complaint.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {complaint.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        AI Confidence: {Math.round(complaint.confidenceScore * 100)}%
                      </span>
                      {complaint.comments && complaint.comments.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-blue-600">
                            {complaint.comments.length} HR Comment{complaint.comments.length !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Stage Information with Comment Preview */}
                    {complaint.status && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-600">Current Stage:</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        {complaint.workflow && complaint.workflow.length > 0 && (
                          <span className="text-xs text-gray-500">
                            • Step {complaint.workflow.length} of 5
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-center gap-2">
                    <button 
                      className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                      title="View full details and comments"
                    >
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <span className="text-[10px] text-gray-500 font-medium">View Details</span>
                  </div>
                </div>

                {/* Workflow Progress */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    {['RECEIVED', 'REVIEW', 'INVESTIGATION', 'ACTION', 'CLOSED'].map(
                      (step, index) => {
                        const isCompleted = complaint.workflow.some((w) => w.step === step);
                        const isCurrent = complaint.status === step;
                        
                        // Count comments for this specific step
                        const stepComments = complaint.comments?.filter(c => c.step === step) || [];
                        const hasComments = stepComments.length > 0;
                        
                        // Get short step name
                        const shortNames = {
                          'RECEIVED': 'Received',
                          'REVIEW': 'Review',
                          'INVESTIGATION': 'Investigation',
                          'ACTION': 'Action',
                          'CLOSED': 'Closed'
                        };
                        
                        return (
                          <div key={step} className="flex flex-col items-center relative group flex-1">
                            <div className="flex items-center w-full justify-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all ${
                                  isCompleted || isCurrent
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-500'
                                } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                                title={`${step}${hasComments ? ` - ${stepComments.length} comment(s)` : ''}`}
                              >
                                <span className="text-sm font-bold">
                                  {isCompleted ? '✓' : index + 1}
                                </span>
                                {/* Show comment indicator badge */}
                                {hasComments && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-md">
                                    {stepComments.length}
                                  </div>
                                )}
                              </div>
                              {index < 4 && (
                                <div
                                  className={`h-1 flex-1 mx-1 transition-all ${
                                    isCompleted && !isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                                  }`}
                                ></div>
                              )}
                            </div>
                            {/* Step name below circle */}
                            <div className={`mt-2 text-[11px] font-medium text-center ${
                              isCurrent ? 'text-blue-600 font-bold' : 
                              (isCompleted ? 'text-gray-700' : 'text-gray-400')
                            }`}>
                              {shortNames[step]}
                            </div>
                            {/* Show current indicator */}
                            {isCurrent && (
                              <div className="text-[9px] text-blue-600 font-semibold mt-0.5">
                                Current
                              </div>
                            )}
                            {/* Hover tooltip for comment count */}
                            {hasComments && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                {stepComments.length} HR comment{stepComments.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Total complaints: {complaints.length}
        </div>
      </div>
    </div>
  );
}
