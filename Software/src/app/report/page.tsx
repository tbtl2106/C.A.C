// src/app/components/layout/Header.tsx
'use client';
import React, { useState } from 'react';
import axios from 'axios';

const Page = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFile) {
      const formData = new FormData();

      // Get current date
      const date = new Date().toISOString().split('T')[0];

      // Get current latitude and longitude
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Rename the file
        const renamedFile = new File([selectedFile], `__${latitude}__${longitude}__${date}.png`, {
          type: selectedFile.type,
        });

        formData.append('file', renamedFile);

        try {
          const response = await axios.post('http://localhost:3001/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('File uploaded:', response.data);
          setUploadMessage("Your picture was sent");
          setTimeout(() => {
            setUploadMessage(null);
          }, 2000);
        } catch (error) {
          console.error('Error uploading file:', error);
          setUploadMessage("Failed to upload picture");
          setTimeout(() => {
            setUploadMessage(null);
          }, 2000);
        }
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Upload Your Photos</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
            Upload
          </button>
        </form>
        {uploadMessage && <p className="mt-4 text-green-500">{uploadMessage}</p>}
      </div>
    </div>
  );
};

export default Page;