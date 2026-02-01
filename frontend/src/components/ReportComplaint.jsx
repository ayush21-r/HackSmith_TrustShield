import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/client';

/**
 * Component for submitting a new complaint
 */
export default function ReportComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const MAX_DESCRIPTION_LENGTH = 1000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await complaintAPI.submitComplaint({
        title,
        description,
        isAnonymous
      });

      setSuccess('✅ Complaint submitted successfully!');
      setTitle('');
      setDescription('');
      setIsAnonymous(false);

      // Redirect to complaint status page
      setTimeout(() => {
        navigate(`/complaint/${response.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Report Harassment or Concern</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          ℹ️ <strong>Your safety matters.</strong> You can report anonymously or with your name.
          All reports are taken seriously and handled confidentially.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief title of your concern"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Description *
            <span className="text-sm text-gray-500 ml-2">
              ({description.length}/{MAX_DESCRIPTION_LENGTH} characters)
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                setDescription(e.target.value);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="6"
            placeholder="Provide detailed information about your concern (dates, times, witnesses, etc.)"
            maxLength={MAX_DESCRIPTION_LENGTH}
            required
          />
          {description.length >= MAX_DESCRIPTION_LENGTH && (
            <p className="text-sm text-red-600 mt-1">Maximum character limit reached</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="anonymous" className="text-gray-700 cursor-pointer">
            <strong>Report anonymously</strong> (your name will not be visible to HR)
          </label>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
