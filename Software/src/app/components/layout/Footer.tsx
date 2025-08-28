// src/app/components/layout/Footer.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child, set } from 'firebase/database';
import '../wwwroot/css/animate.min.css';
import '../wwwroot/css/bootstrap.min.css';
import '../wwwroot/css/bootstrap-icons.css';
import '../wwwroot/css/boxicons.min.css';
import '../wwwroot/css/glightbox.min.css';
import '../wwwroot/css/swiper-bundle.min.css';
import '../wwwroot/css/style.css';

// Firebase configuration
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
import { useRouter } from 'next/navigation';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Footer = () => {
  const [email, setEmail] = useState('');

  

  const handleRegisterClick = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'information_users'));
      let count = 0;

      if (snapshot.exists()) {
        const data = snapshot.val();
        count = Object.keys(data).length;
      }

      // Add the new email to Firebase
      const newKey = count + 1; // Key is count + 1
      await set(ref(database, `information_users/${newKey}`), email);

      alert(`Email registered successfully! Total users: ${count + 1}`);
    } catch (error) {
      console.error('Error uploading email:', error);
      alert('Failed to register email.');
    }
  };
  const router = useRouter();
  const handleHome = () => {
    router.push('/app/layout.tsx');
  };
  const handleMonitor = () => {
    router.push('/monitor');
  }
  const handleReport = () => {
    router.push('/report');
  }
  const handleContact = () => {
    router.push('/contact');
  }
  return (
    <footer id="footer">
      <div className="footer-newsletter">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h4>Get the newsletter</h4>
              <p>
                You are interested in landslides, share and join the community, leave your email to update the latest information.
              </p>
            </div>
            <div className="col-lg-6">
              <form onSubmit={handleRegisterClick}>
                <label htmlFor="emailInput">Email:</label>
                <input 
                  id="emailInput"
                  type="email" 
                  name="email" 
                  required 
                  className="email-input" // Use external CSS class
                  placeholder="Enter your email" // Add placeholder
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update email state
                />
                <input type="submit" value="Register" />
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-4 footer-links">
              <h4>Link</h4>
              <ul>
                <li><i className="bx bx-chevron-right"></i> <a href="" onClick={handleHome}>Home</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="" onClick={handleMonitor}>Monitor</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="" onClick={handleReport}>Report</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="" onClick={handleContact}>Contact</a></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-4 footer-contact">
              <h4>Contact</h4>
              <p>
                Le Anh Tu<br/>
                Le Duc Chinh<br />
                {/* 
                Đỗ Trần Khánh Vinh<br />
                Văn Công Nam <br />
                */}
                Huynh Thanh Hai Phong <br />
                <strong>Phone:</strong> +363950017<br/>
                <strong>Email:</strong> landslide.detection.and.warning@gmail.com<br />
              </p>
            </div>
            <div className="col-lg-4 col-md-4 footer-info">
              <h3>Introduce</h3>
              <p>A smart landslide warning system combining real-time environmental sensors and web monitoring, enabling early alerts to protect lives, infrastructure, and support disaster management decisions.</p>
                <div className="social-links mt-3">
                  <a   href="#" className="twitter"><i className="bx bxl-twitter"></i></a>
                  <a href="#" className="facebook"><i className="bx bxl-facebook"></i></a>
                  <a href="#" className="google-plus"><i className="bx bxl-skype"></i></a>
                </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;