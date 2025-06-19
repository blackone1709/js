create database pktn;
use pktn;
CREATE TABLE patients (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  note TEXT,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointments (
  id INT NOT NULL AUTO_INCREMENT,
  patient_name VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  date DATE DEFAULT NULL,
  time TIME DEFAULT NULL,
  note TEXT,
  patient_id INT DEFAULT NULL,
  doctor_id INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY patient_id (patient_id),
  KEY fk_doctor (doctor_id),
  CONSTRAINT appointments_ibfk_1 FOREIGN KEY (patient_id) REFERENCES patients (id),
  CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctor_logins (doctor_id)
)
ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE doctors (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  working_hours VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE medical_records (
  id INT NOT NULL AUTO_INCREMENT,
  patient_id INT DEFAULT NULL,
  note TEXT,
  date DATE DEFAULT NULL,
  diagnosis TEXT,
  PRIMARY KEY (id),
  KEY patient_id (patient_id),
  CONSTRAINT medical_records_ibfk_1 FOREIGN KEY (patient_id) REFERENCES patients(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doctor_logins (
  doctor_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) DEFAULT NULL,
  password VARCHAR(100) DEFAULT NULL,
  full_name VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (doctor_id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    medical_records_id INT NOT NULL,
    note TEXT,
    duration VARCHAR(50),
    frequency VARCHAR(50),
    dosage VARCHAR(50),
    FOREIGN KEY (medical_records_id) REFERENCES medical_records(id)
);