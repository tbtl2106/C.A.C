Because of the privacy, I can just show you main code for each part and tutorial to apply these code in my project. 
* Firstly, you need to successfully set up all the required sensors (Lora sender, rain guage, soil moisture, accerelometer) with Arduino Uno R3.
* Secondly, you have to load code in LORA02_SENDDATA to Arduino Uno R3 (WARNING: you need to download all necessary library to run the code).
* Thirdly, you need an energy proving for Arduino Uno R3 activation.
* Forthly, you need another Lora receiver connecting with Arduino Uno R3, then plug Arduino Uno R3 into your computer and run file lora_to_firebase (WARNING: you need to modify your COM, firebase_cred_path, database_url to be suitable with your Firebase account).
* Fifthly, you need to connect a buzzer to your ESP32 and load code in ESP32 file to your ESP32 (WARNING: you need to modify WIFI_SSID, WIFI_PASSWORD, API_KEY, DATABASE_URL, USER_EMAIL, USER_PASSWORD to be suitable with your location and your Fibase account. Besides, you have to provide energy for ESP32 activation and download all necessary library for running the code).
* Finally, activate all hardware and run website (tutorial on Software file) to observe real-time data in project. 
