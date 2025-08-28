'use client'
import Footer from '../components/layout/Footer';
import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, get, set } from 'firebase/database';

// Initialize Firebase
const firebaseConfig = {                                                    
  apiKey: "AIzaSyBeNKymDI7abdj6Hj6YVHWqPU4QoIA8Kac",
  authDomain: "landslide-7cf2a.firebaseapp.com",
  databaseURL: "https://landslide-7cf2a-default-rtdb.firebaseio.com",
  projectId: "landslide-7cf2a",
  storageBucket: "landslide-7cf2a.firebasestorage.app",
  messagingSenderId: "939694240101",
  appId: "1:939694240101:web:c2ba7a13b43f59a0f9718c",
  measurementId: "G-F5PSQDXDTC"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Loading...');

    try {
      const messagesRef = ref(database, 'message from users');
      
      // Get the current number of elements in "message from users"
      const snapshot = await get(messagesRef);
      const id = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

      // Push the new message with the calculated id
      const newMessageRef = ref(database, `message from users/${id}`);
      await set(newMessageRef, formData);

      setStatus('Your message has been sent. Thank you!');
      setFormData({ name: '', subject: '', message: '' }); // Reset form
    } catch (error) {
      console.error('Error uploading message:', error);
      setStatus('Failed to send message. Please try again.');
    }
  };

  return (
    <div>
      <section id="contact" className="contact">
        <div className="container">
          <section id="breadcrumbs" className="breadcrumbs">
            <div className="container">
              <ol>
                <li><a href="~/Home">Home</a></li>
                <li>Contact</li>
              </ol>
              <h2>Contact</h2>
            </div>
          </section>
          <div className="row">
            <div className="col-lg-6">
              <div className="info-box mb-4">
                <i className="bx bx-map"></i>
                <h3>Le Quy Don High School for the Gifted</h3>
                <p>01 Vu Van Dung, An Hai Tay, Son Tra, Da Nang, Vietnam</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="info-box mb-4">
                <i className="bx bx-envelope"></i>
                <h3>Email</h3>
                <p>landslide.detection.and.warning@gmail.com</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="info-box mb-4">
                <i className="bx bx-phone-call"></i>
                <h3>Phone</h3>
                <p>+84 0363950017</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <iframe
                className="gmap_iframe"
                width="100%"
                src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=Lê Quý Đôn đà nẵng&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                style={{ border: '0', width: '100%', height: '305px' }}
                allowFullScreen
              />
            </div>
            <div className="col-lg-6">
              <form onSubmit={handleSubmit} className="php-email-form">
                <div className="form-group mt-3">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    id="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group mt-3">
                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    id="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group mt-3">
                  <textarea
                    className="form-control"
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div className="my-3">
                  <div className="loading">{status === 'Loading...' && status}</div>
                  <div className="error-message">{status.includes('Failed') && status}</div>
                  <div className="sent-message">{status === 'Your message has been sent. Thank you!' && status}</div>
                </div>
                <div className="text-center">
                  <button type="submit">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}