create database pktn;
use pktn;
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    phone VARCHAR(20)
);
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_name VARCHAR(100),
    phone VARCHAR(20),
    date DATE,
    time TIME,
    note TEXT,
    patient_id INT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100),
    username VARCHAR(50),
    working_hours VARCHAR(100)
);
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    prescription TEXT,
    note TEXT,
    date DATE,
    diagnosis TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);
CREATE TABLE doctor_logins (
    doctor_id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
ALTER TABLE appointments ADD COLUMN doctor_id INT NULL;
ALTER TABLE appointments ADD CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctor_logins(doctor_id);