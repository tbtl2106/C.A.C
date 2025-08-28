// src/app/(routes)/page.tsx
import Slider from './components/ui/Slider';
import Footer from './components/layout/Footer'
export default function HomePage() {
  return (
    <div className="space-y-12">
      <Slider/>
      <div id="featured" className="featured">
              <div className="container">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="icon-box">
                      <i className="bi bi-card-checklist"></i>
                      <h3><a href="~/home/cause">Research Purpose</a></h3>
                      <ul className="custom-list">
                        <li className="mb-4">
                          <p>
                            Explore support devices, detection, and warning systems to help protect people from the dangers of landslides.
                          </p>
                        </li>
                        <li>
                          <p>
                            Assist users in monitoring the condition of the land where the device is installed.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-4 mt-4 mt-lg-0">
                      <div className="icon-box">
                        <i className="bi bi-bar-chart"></i>
                        <h3><a href="~/home/cause">Novelty of the Topic</a></h3>
                        <ul className="custom-list">
                          <li>
                            <p>
                              Utilizing sensors to measure data and generate predictions on the likelihood of landslides, enabling residents to receive timely information and avoid unfortunate accidents.
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-4 mt-4 mt-lg-0">
                        <div className="icon-box">
                          <i className="bi bi-binoculars"></i>
                          <h3><a href="~/home/cause"> Practicality of the Topic</a></h3>
                          <ul className="custom-list">
                            <li>
                              <p>
                                The topic has high practical applicability and can be easily implemented in mountainous areas prone to frequent rainfall.
                              </p>
                            </li>
                            <li>
                              <p>
                                Easy installation: The system is very easy to set up; all functional modules are configured in a plug-and-play mode, allowing users to operate and use it effortlessly.
                              </p>
                            </li>
                            <li>
                              <p>
                                Low cost and affordability.
                              </p>
                            </li>
                            <li>
                              <p>
                                Notably, users can monitor the condition of the area where the device is installed.
                              </p>
                            </li>
                          </ul>
                         </div>
                      </div>
                  </div>
              </div>
            </div>
      <Footer/>
    </div>
  );
}