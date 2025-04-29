import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { PhotoIcon } from '@heroicons/react/24/outline';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setPrediction(response.data);
      } else {
        setError(response.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Medicinal Plant Identifier
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Upload an image of a medicinal plant to identify it
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-64 w-auto object-contain"
                />
              ) : (
                <div className="space-y-2">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-gray-600">
                    {isDragActive ? (
                      <p>Drop the image here</p>
                    ) : (
                      <p>Drag and drop an image, or click to select</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {prediction && (
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800">Prediction Results</h3>
                <div className="mt-2 text-green-700">
                  <p>Plant: {prediction.prediction}</p>
                  <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${!file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
            >
              {loading ? 'Processing...' : 'Identify Plant'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App; 