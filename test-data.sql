-- Test Data for Dental Lab Management System
-- This script creates test patients and lab scripts for development and testing

-- Insert Test Patients
INSERT INTO patients (
  first_name, 
  last_name, 
  date_of_birth, 
  phone, 
  gender, 
  street, 
  city, 
  state, 
  zip_code, 
  treatment_type, 
  status, 
  last_visit, 
  next_appointment
) VALUES 
-- Patient 1
(
  'Emma', 
  'Rodriguez', 
  '1985-03-15', 
  '(555) 123-4567', 
  'Female', 
  '123 Oak Street', 
  'Los Angeles', 
  'CA', 
  '90210', 
  'Orthodontic', 
  'Active', 
  '2024-01-10', 
  '2024-02-15'
),
-- Patient 2
(
  'James', 
  'Thompson', 
  '1978-11-22', 
  '(555) 234-5678', 
  'Male', 
  '456 Pine Avenue', 
  'San Francisco', 
  'CA', 
  '94102', 
  'Restorative', 
  'Active', 
  '2024-01-08', 
  '2024-02-12'
),
-- Patient 3
(
  'Sophia', 
  'Martinez', 
  '1992-07-03', 
  '(555) 345-6789', 
  'Female', 
  '789 Elm Drive', 
  'San Diego', 
  'CA', 
  '92101', 
  'Cosmetic', 
  'Active', 
  '2024-01-12', 
  '2024-02-18'
),
-- Patient 4
(
  'Alexander', 
  'Kim', 
  '1980-09-18', 
  '(555) 456-7890', 
  'Male', 
  '321 Maple Lane', 
  'Sacramento', 
  'CA', 
  '95814', 
  'Prosthetic', 
  'Active', 
  '2024-01-05', 
  '2024-02-10'
),
-- Patient 5
(
  'Isabella', 
  'Davis', 
  '1988-12-07', 
  '(555) 567-8901', 
  'Female', 
  '654 Cedar Court', 
  'Fresno', 
  'CA', 
  '93701', 
  'Preventive', 
  'Active', 
  '2024-01-14', 
  '2024-02-20'
),
-- Patient 6
(
  'William', 
  'Garcia', 
  '1975-04-25', 
  '(555) 678-9012', 
  'Male', 
  '987 Birch Boulevard', 
  'Oakland', 
  'CA', 
  '94601', 
  'Surgical', 
  'Active', 
  '2024-01-09', 
  '2024-02-14'
),
-- Patient 7
(
  'Olivia', 
  'Wilson', 
  '1995-01-30', 
  '(555) 789-0123', 
  'Female', 
  '147 Willow Way', 
  'Long Beach', 
  'CA', 
  '90802', 
  'Orthodontic', 
  'Active', 
  '2024-01-11', 
  '2024-02-16'
),
-- Patient 8
(
  'Benjamin', 
  'Anderson', 
  '1983-08-14', 
  '(555) 890-1234', 
  'Male', 
  '258 Spruce Street', 
  'Anaheim', 
  'CA', 
  '92801', 
  'Restorative', 
  'Active', 
  '2024-01-07', 
  '2024-02-13'
),
-- Patient 9
(
  'Charlotte', 
  'Taylor', 
  '1990-06-12', 
  '(555) 901-2345', 
  'Female', 
  '369 Redwood Road', 
  'Santa Ana', 
  'CA', 
  '92701', 
  'Cosmetic', 
  'Active', 
  '2024-01-13', 
  '2024-02-19'
),
-- Patient 10
(
  'Lucas', 
  'Brown', 
  '1987-02-28', 
  '(555) 012-3456', 
  'Male', 
  '741 Sequoia Circle', 
  'Riverside', 
  'CA', 
  '92501', 
  'Prosthetic', 
  'Active', 
  '2024-01-06', 
  '2024-02-11'
);

-- Insert Test Lab Scripts using the patient names
INSERT INTO lab_scripts (
  patient_name, 
  arch_type, 
  upper_appliance_type, 
  lower_appliance_type, 
  upper_treatment_type, 
  lower_treatment_type, 
  screw_type, 
  vdo_details, 
  requested_date, 
  due_date, 
  instructions, 
  notes, 
  status
) VALUES 
-- Lab Script 1 - Emma Rodriguez
(
  'Emma Rodriguez',
  'upper',
  'surgical-day-appliance',
  NULL,
  'orthodontic',
  NULL,
  'DC Screw',
  'Open up to 4mm without calling Doctor',
  '2024-01-15',
  '2024-01-22',
  'Please design upper SDA for orthodontic treatment. Patient requires expedited completion with careful attention to occlusal contacts. Use high-quality materials and ensure proper fit. Thank you.',
  'Patient prefers natural shade A2. Previous orthodontic work completed successfully.',
  'in-progress'
),
-- Lab Script 2 - James Thompson
(
  'James Thompson',
  'dual',
  'printed-tryin',
  'crown',
  'restorative',
  'restorative',
  'Rosen',
  'Open VDO based on requirement',
  '2024-01-16',
  '2024-01-23',
  'Please design PTI for upper arch and crown for lower arch with dual restorative treatment approach. Ensure proper occlusion and contact points. Standard processing timeline acceptable. Thank you.',
  'Patient has history of bruxism. Recommend durable materials.',
  'pending'
),
-- Lab Script 3 - Sophia Martinez
(
  'Sophia Martinez',
  'lower',
  NULL,
  'night-guard',
  NULL,
  'preventive',
  'Powerball',
  'No changes required in VDO',
  '2024-01-17',
  '2024-01-24',
  'Please fabricate night guard for lower arch with preventive treatment approach. Patient grinds teeth at night and requires comfortable fit. Standard materials acceptable. Thank you.',
  'Patient reports jaw pain in mornings. Soft material preferred.',
  'completed'
),
-- Lab Script 4 - Alexander Kim
(
  'Alexander Kim',
  'upper',
  'direct-load-zirconia',
  NULL,
  'prosthetic',
  NULL,
  'SIN PRH30',
  'Open up to 4mm with calling Doctor',
  '2024-01-18',
  '2024-01-25',
  'Please design direct load zirconia for upper arch with prosthetic treatment. Contact doctor before opening VDO beyond 4mm. High precision required for implant integration. Thank you.',
  'Previous implant placement successful. Patient satisfied with initial results.',
  'in-progress'
),
-- Lab Script 5 - Isabella Davis
(
  'Isabella Davis',
  'dual',
  'ti-bar-superstructure',
  'denture',
  'surgical',
  'prosthetic',
  'Dess',
  'Open VDO based on requirement',
  '2024-01-19',
  '2024-01-26',
  'Please fabricate Ti-Bar and superstructure for upper arch and denture for lower arch. Complex case requiring careful attention to VDO adjustments and proper retention. Thank you.',
  'Patient requires full mouth rehabilitation. Multiple appointments scheduled.',
  'pending'
),
-- Lab Script 6 - William Garcia
(
  'William Garcia',
  'lower',
  NULL,
  'printed-tryin',
  NULL,
  'surgical',
  'Neodent',
  'No changes required in VDO',
  '2024-01-20',
  '2024-01-27',
  'Please design PTI for lower arch with surgical treatment approach. Patient requires precise fit for upcoming surgical procedure. Expedited processing needed. Thank you.',
  'Pre-surgical case. Coordination with oral surgeon required.',
  'completed'
),
-- Lab Script 7 - Olivia Wilson
(
  'Olivia Wilson',
  'upper',
  'crown',
  NULL,
  'orthodontic',
  NULL,
  'DC Screw',
  'Open up to 4mm without calling Doctor',
  '2024-01-21',
  '2024-01-28',
  'Please fabricate crown for upper arch with orthodontic treatment considerations. Patient is in active orthodontic treatment and requires temporary restoration. Thank you.',
  'Active orthodontic patient. Temporary crown needed during treatment.',
  'in-progress'
),
-- Lab Script 8 - Benjamin Anderson
(
  'Benjamin Anderson',
  'dual',
  'surgical-day-appliance',
  'crown',
  'restorative',
  'cosmetic',
  'Rosen',
  'Open VDO based on requirement',
  '2024-01-22',
  '2024-01-29',
  'Please design SDA for upper arch and crown for lower arch. Upper requires restorative approach while lower needs cosmetic enhancement. Color matching essential. Thank you.',
  'Patient very concerned about aesthetics. Shade matching critical.',
  'pending'
),
-- Lab Script 9 - Charlotte Taylor
(
  'Charlotte Taylor',
  'lower',
  NULL,
  'direct-load-zirconia',
  NULL,
  'cosmetic',
  'Powerball',
  'No changes required in VDO',
  '2024-01-23',
  '2024-01-30',
  'Please design direct load zirconia for lower arch with cosmetic treatment focus. Patient desires natural appearance with excellent aesthetics. High-quality materials essential. Thank you.',
  'Patient is a model and requires perfect aesthetics. Premium materials only.',
  'completed'
),
-- Lab Script 10 - Lucas Brown
(
  'Lucas Brown',
  'upper',
  'ti-bar-superstructure',
  NULL,
  'prosthetic',
  NULL,
  'SIN PRH30',
  'Open up to 4mm with calling Doctor',
  '2024-01-24',
  '2024-01-31',
  'Please fabricate Ti-Bar and superstructure for upper arch with prosthetic treatment. Complex implant case requiring precise engineering and excellent retention. Thank you.',
  'Multiple implants placed. Requires careful load distribution.',
  'in-progress'
);

-- Insert additional lab scripts with different statuses for testing
INSERT INTO lab_scripts (
  patient_name, 
  arch_type, 
  upper_appliance_type, 
  lower_appliance_type, 
  screw_type, 
  vdo_details, 
  requested_date, 
  due_date, 
  instructions, 
  notes, 
  status
) VALUES 
-- Additional completed scripts for report cards testing
(
  'Emma Rodriguez',
  'lower',
  NULL,
  'night-guard',
  'Powerball',
  'No changes required in VDO',
  '2024-01-25',
  '2024-02-01',
  'Follow-up night guard for lower arch. Patient satisfied with previous upper work.',
  'Second appliance for complete protection.',
  'completed'
),
(
  'James Thompson',
  'upper',
  'crown',
  NULL,
  'Neodent',
  'Open up to 4mm without calling Doctor',
  '2024-01-26',
  '2024-02-02',
  'Additional crown work for upper arch completion.',
  'Final restoration in treatment plan.',
  'completed'
),
(
  'Sophia Martinez',
  'dual',
  'surgical-day-appliance',
  'printed-tryin',
  'DC Screw',
  'Open VDO based on requirement',
  '2024-01-27',
  '2024-02-03',
  'Comprehensive dual arch treatment with SDA and PTI.',
  'Complex case requiring coordination between appliances.',
  'completed'
);
