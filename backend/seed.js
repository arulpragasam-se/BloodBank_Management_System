const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Donor = require('./models/Donor');
const Hospital = require('./models/Hospital');
const Recipient = require('./models/Recipient');
const Campaign = require('./models/Campaign');
const BloodInventory = require('./models/BloodInventory');
const BloodRequest = require('./models/BloodRequest');
const Donation = require('./models/Donation');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_bank_db');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Hospital.deleteMany({});
    await Recipient.deleteMany({});
    await Campaign.deleteMany({});
    await BloodInventory.deleteMany({});
    await BloodRequest.deleteMany({});
    await Donation.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing data');

    // Password hash for all users - Password: 'Pass123'
    const hashedPassword = '$2a$12$3Nwd6khJoHP6e/.7bN.L0elqayut17WfCg1n4MF.IuSveuAcpi.o2';

    // Create Users
    const users = await User.insertMany([
      // Admin users
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '+94771234567',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'System Administrator',
        email: 'system@gmail.com',
        password: hashedPassword,
        phone: '+94771234568',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      },

      // Hospital staff users
      {
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@hospital.com',
        password: hashedPassword,
        phone: '+94771234569',
        role: 'hospital_staff',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        password: hashedPassword,
        phone: '+94771234570',
        role: 'hospital_staff',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Nurse Emily Davis',
        email: 'emily.davis@hospital.com',
        password: hashedPassword,
        phone: '+94771234571',
        role: 'hospital_staff',
        isActive: true,
        isEmailVerified: true
      },

      // Donor users
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: hashedPassword,
        phone: '+94771234572',
        role: 'donor',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Mary Johnson',
        email: 'mary.johnson@email.com',
        password: hashedPassword,
        phone: '+94771234573',
        role: 'donor',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'David Brown',
        email: 'david.brown@email.com',
        password: hashedPassword,
        phone: '+94771234574',
        role: 'donor',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Lisa Garcia',
        email: 'lisa.garcia@email.com',
        password: hashedPassword,
        phone: '+94771234575',
        role: 'donor',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Robert Martinez',
        email: 'robert.martinez@email.com',
        password: hashedPassword,
        phone: '+94771234576',
        role: 'donor',
        isActive: true,
        isEmailVerified: true
      },

      // Recipient users
      {
        name: 'Jennifer Wilson',
        email: 'jennifer.wilson@email.com',
        password: hashedPassword,
        phone: '+94771234577',
        role: 'recipient',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Thomas Anderson',
        email: 'thomas.anderson@email.com',
        password: hashedPassword,
        phone: '+94771234578',
        role: 'recipient',
        isActive: true,
        isEmailVerified: true
      }
    ]);

    console.log('Created users');

    // Create Hospitals
    const hospitals = await Hospital.insertMany([
      {
        name: 'Colombo General Hospital',
        registrationNumber: 'CGH001',
        address: {
          street: 'Regent Street',
          city: 'Colombo',
          district: 'Colombo',
          zipCode: '00700'
        },
        contactInfo: {
          phone: '+94112691111',
          email: 'info@cgh.gov.lk',
          emergencyPhone: '+94112692222'
        },
        staffMembers: [
          {
            userId: users[2]._id, // Dr. Sarah Wilson
            position: 'doctor',
            department: 'Hematology'
          },
          {
            userId: users[4]._id, // Nurse Emily Davis
            position: 'nurse',
            department: 'Blood Bank'
          }
        ],
        isActive: true,
        bloodBankCapacity: 500
      },
      {
        name: 'Kandy Teaching Hospital',
        registrationNumber: 'KTH002',
        address: {
          street: 'William Gopallawa Mawatha',
          city: 'Kandy',
          district: 'Kandy',
          zipCode: '20000'
        },
        contactInfo: {
          phone: '+94812232270',
          email: 'info@kth.gov.lk',
          emergencyPhone: '+94812232271'
        },
        staffMembers: [
          {
            userId: users[3]._id, // Dr. Michael Chen
            position: 'doctor',
            department: 'Emergency Medicine'
          }
        ],
        isActive: true,
        bloodBankCapacity: 300
      },
      {
        name: 'Galle District Hospital',
        registrationNumber: 'GDH003',
        address: {
          street: 'Karapitiya Road',
          city: 'Galle',
          district: 'Galle',
          zipCode: '80000'
        },
        contactInfo: {
          phone: '+94912232233',
          email: 'info@gdh.gov.lk',
          emergencyPhone: '+94912232234'
        },
        staffMembers: [],
        isActive: true,
        bloodBankCapacity: 200
      }
    ]);

    console.log('Created hospitals');

    // Create Donors
    const donors = await Donor.insertMany([
      {
        userId: users[5]._id, // John Smith
        bloodType: 'O+',
        dateOfBirth: new Date('1990-05-15'),
        weight: 70,
        height: 175,
        address: {
          street: '123 Main Street',
          city: 'Colombo',
          district: 'Colombo',
          zipCode: '00100'
        },
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+94771234580',
          relationship: 'Spouse'
        },
        medicalHistory: {
          allergies: ['None'],
          medications: [],
          diseases: [],
          surgeries: []
        },
        lastDonationDate: new Date('2024-10-15'),
        totalDonations: 5,
        isEligible: true,
        nextEligibleDate: new Date('2025-01-15')
      },
      {
        userId: users[6]._id, // Mary Johnson
        bloodType: 'A+',
        dateOfBirth: new Date('1985-08-22'),
        weight: 60,
        height: 165,
        address: {
          street: '456 Oak Avenue',
          city: 'Kandy',
          district: 'Kandy',
          zipCode: '20100'
        },
        emergencyContact: {
          name: 'Robert Johnson',
          phone: '+94771234581',
          relationship: 'Husband'
        },
        medicalHistory: {
          allergies: ['Penicillin'],
          medications: [],
          diseases: [],
          surgeries: []
        },
        lastDonationDate: new Date('2024-12-01'),
        totalDonations: 3,
        isEligible: true,
        nextEligibleDate: new Date('2025-03-01')
      },
      {
        userId: users[7]._id, // David Brown
        bloodType: 'B+',
        dateOfBirth: new Date('1988-12-10'),
        weight: 80,
        height: 180,
        address: {
          street: '789 Pine Road',
          city: 'Galle',
          district: 'Galle',
          zipCode: '80100'
        },
        emergencyContact: {
          name: 'Susan Brown',
          phone: '+94771234582',
          relationship: 'Sister'
        },
        medicalHistory: {
          allergies: [],
          medications: [],
          diseases: [],
          surgeries: []
        },
        lastDonationDate: null,
        totalDonations: 0,
        isEligible: true,
        nextEligibleDate: null
      },
      {
        userId: users[8]._id, // Lisa Garcia
        bloodType: 'AB+',
        dateOfBirth: new Date('1992-03-18'),
        weight: 55,
        height: 160,
        address: {
          street: '321 Elm Street',
          city: 'Negombo',
          district: 'Gampaha',
          zipCode: '11500'
        },
        emergencyContact: {
          name: 'Carlos Garcia',
          phone: '+94771234583',
          relationship: 'Father'
        },
        medicalHistory: {
          allergies: [],
          medications: [],
          diseases: [],
          surgeries: []
        },
        lastDonationDate: new Date('2024-11-10'),
        totalDonations: 2,
        isEligible: true,
        nextEligibleDate: new Date('2025-02-10')
      },
      {
        userId: users[9]._id, // Robert Martinez
        bloodType: 'O-',
        dateOfBirth: new Date('1987-07-25'),
        weight: 75,
        height: 178,
        address: {
          street: '654 Maple Drive',
          city: 'Jaffna',
          district: 'Jaffna',
          zipCode: '40000'
        },
        emergencyContact: {
          name: 'Maria Martinez',
          phone: '+94771234584',
          relationship: 'Wife'
        },
        medicalHistory: {
          allergies: [],
          medications: [],
          diseases: [],
          surgeries: []
        },
        lastDonationDate: new Date('2024-09-20'),
        totalDonations: 8,
        isEligible: true,
        nextEligibleDate: new Date('2024-12-20')
      }
    ]);

    console.log('Created donors');


// Create Recipients
const recipients = await Recipient.insertMany([
  {
    userId: users[10]._id, // Jennifer Wilson
    bloodType: 'A+',
    dateOfBirth: new Date('1995-04-12'),
    medicalCondition: 'Chronic anemia requiring regular transfusions',
    emergencyContact: {
      name: 'Mark Wilson',
      phone: '+94771234585',
      relationship: 'Brother'
    },
    transfusionHistory: [
      {
        date: new Date('2024-12-15'),
        bloodType: 'A+',
        units: 2,
        hospitalId: hospitals[0]._id,
        reason: 'Chronic anemia treatment',
        complications: 'None'
      },
      {
        date: new Date('2024-10-20'),
        bloodType: 'A+',
        units: 1,
        hospitalId: hospitals[0]._id,
        reason: 'Routine transfusion',
        complications: 'None'
      }
    ],
    allergies: ['Shellfish', 'Penicillin'],
    currentMedications: ['Iron supplements', 'Folic acid'],
    isActive: true
  },
  {
    userId: users[11]._id, // Thomas Anderson
    bloodType: 'O+',
    dateOfBirth: new Date('1980-11-30'),
    medicalCondition: 'Thalassemia major requiring regular blood transfusions',
    emergencyContact: {
      name: 'Sarah Anderson',
      phone: '+94771234586',
      relationship: 'Wife'
    },
    transfusionHistory: [
      {
        date: new Date('2024-12-10'),
        bloodType: 'O+',
        units: 3,
        hospitalId: hospitals[1]._id,
        reason: 'Thalassemia treatment',
        complications: 'None'
      },
      {
        date: new Date('2024-11-15'),
        bloodType: 'O+',
        units: 2,
        hospitalId: hospitals[1]._id,
        reason: 'Routine transfusion',
        complications: 'Mild iron overload'
      }
    ],
    allergies: [],
    currentMedications: ['Deferasirox', 'Warfarin'],
    isActive: true
  }
]);

    console.log('Created recipients');

    // Create Blood Inventory
// Create Blood Inventory
const bloodInventory = await BloodInventory.insertMany([
  {
    bloodType: 'O+',
    units: 25,
    collectionDate: new Date('2024-12-01'),
    expiryDate: new Date('2025-01-30'),
    donorId: donors[0]._id, // John Smith
    status: 'available',
    testResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative'
    },
    storageLocation: {
      section: 'A1',
      shelf: '1',
      position: '001'
    },
    notes: 'Good quality blood, all tests passed'
  },
  {
    bloodType: 'A+',
    units: 18,
    collectionDate: new Date('2024-12-05'),
    expiryDate: new Date('2025-02-03'),
    donorId: donors[1]._id, // Mary Johnson
    status: 'available',
    testResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative'
    },
    storageLocation: {
      section: 'A1',
      shelf: '1',
      position: '002'
    },
    notes: 'Excellent quality, donor has good health record'
  },
  {
    bloodType: 'B+',
    units: 12,
    collectionDate: new Date('2024-12-08'),
    expiryDate: new Date('2025-02-06'),
    donorId: donors[2]._id, // David Brown
    status: 'available',
    testResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative'
    },
    storageLocation: {
      section: 'B1',
      shelf: '2',
      position: '001'
    },
    notes: 'First-time donor, all screening passed'
  },
  {
    bloodType: 'AB+',
    units: 8,
    collectionDate: new Date('2024-12-10'),
    expiryDate: new Date('2025-02-08'),
    donorId: donors[3]._id, // Lisa Garcia
    status: 'available',
    testResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative'
    },
    storageLocation: {
      section: 'B1',
      shelf: '2',
      position: '002'
    },
    notes: 'Universal plasma donor, high quality'
  },
  {
    bloodType: 'O-',
    units: 15,
    collectionDate: new Date('2024-12-12'),
    expiryDate: new Date('2025-02-10'),
    donorId: donors[4]._id, // Robert Martinez
    status: 'available',
    testResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative'
    },
    storageLocation: {
      section: 'C1',
      shelf: '1',
      position: '001'
    },
    notes: 'Universal donor blood, critical inventory'
  }
]);

    console.log('Created blood inventory');

    // Create Campaigns
    const campaigns = await Campaign.insertMany([
      {
        title: 'New Year Blood Drive 2025',
        description: 'Start the new year by giving the gift of life. Join our New Year blood donation campaign.',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-17'),
        location: {
          venue: 'Colombo Municipal Council Hall',
          address: '2nd Floor, Town Hall, Cinnamon Gardens',
          city: 'Colombo',
          district: 'Colombo'
        },
        organizer: users[0]._id, // Admin User
        targetBloodTypes: ['O+', 'O-', 'A+', 'B+'],
        targetDonors: 100,
        registeredDonors: [
          {
            donorId: donors[0]._id,
            registrationDate: new Date('2025-01-05'),
            status: 'registered',
            appointmentTime: new Date('2025-01-15T09:00:00Z')
          },
          {
            donorId: donors[1]._id,
            registrationDate: new Date('2025-01-06'),
            status: 'confirmed',
            appointmentTime: new Date('2025-01-15T10:30:00Z')
          }
        ],
        status: 'planned',
        results: {
          totalAttendees: 0,
          successfulDonations: 0,
          unitsCollected: 0
        },
        isPublic: true
      },
      {
        title: 'Emergency Blood Collection - Kandy',
        description: 'Urgent blood collection drive due to increased demand from local hospitals.',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-01-21'),
        location: {
          venue: 'Kandy Teaching Hospital',
          address: 'William Gopallawa Mawatha',
          city: 'Kandy',
          district: 'Kandy'
        },
        organizer: users[3]._id, // Dr. Michael Chen
        targetBloodTypes: ['O-', 'A-', 'B-', 'AB-'],
        targetDonors: 50,
        registeredDonors: [
          {
            donorId: donors[4]._id,
            registrationDate: new Date('2025-01-08'),
            status: 'registered',
            appointmentTime: new Date('2025-01-20T14:00:00Z')
          }
        ],
        status: 'planned',
        results: {
          totalAttendees: 0,
          successfulDonations: 0,
          unitsCollected: 0
        },
        isPublic: true
      },
      {
        title: 'World Blood Donor Day Preparation',
        description: 'Preparing for World Blood Donor Day with a special collection drive.',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-14'),
        location: {
          venue: 'Galle International Stadium',
          address: 'Thalapitiya Road',
          city: 'Galle',
          district: 'Galle'
        },
        organizer: users[1]._id, // System Administrator
        targetBloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
        targetDonors: 200,
        registeredDonors: [],
        status: 'planned',
        results: {
          totalAttendees: 0,
          successfulDonations: 0,
          unitsCollected: 0
        },
        isPublic: true
      }
    ]);

    console.log('Created campaigns');

    // Create Blood Requests
const bloodRequests = await BloodRequest.insertMany([
  {
    hospitalId: hospitals[0]._id,
    bloodType: 'A+',
    unitsRequired: 4,
    urgencyLevel: 'high',
    requiredBy: new Date('2025-01-25'),
    requestedBy: users[2]._id, // Dr. Sarah Wilson
    reason: 'Post-surgical complications requiring immediate transfusion',
    patientInfo: {
      patientId: 'P001',
      age: 35,
      gender: 'female',
      diagnosis: 'Severe anemia post-surgery'
    },
    patientCondition: 'Patient requires immediate blood transfusion following major surgery',
    status: 'pending',
    allocatedBlood: [],
    notes: 'Patient is stable but requires transfusion within 48 hours'
  },
  {
    hospitalId: hospitals[1]._id,
    bloodType: 'O-',
    unitsRequired: 2,
    urgencyLevel: 'critical',
    requiredBy: new Date('2025-01-22'),
    requestedBy: users[3]._id, // Dr. Michael Chen
    reason: 'Emergency trauma case with massive blood loss',
    patientInfo: {
      patientId: 'P002',
      age: 28,
      gender: 'male',
      diagnosis: 'Trauma - multiple injuries'
    },
    patientCondition: 'Emergency trauma case requiring immediate O- blood',
    status: 'pending',
    allocatedBlood: [],
    notes: 'Critical emergency - universal donor blood needed immediately'
  },
  {
    hospitalId: hospitals[0]._id,
    bloodType: 'B+',
    unitsRequired: 3,
    urgencyLevel: 'medium',
    requiredBy: new Date('2025-01-30'),
    requestedBy: users[2]._id, // Dr. Sarah Wilson
    reason: 'Routine transfusion for thalassemia patient',
    patientInfo: {
      patientId: 'P003',
      age: 45,
      gender: 'male',
      diagnosis: 'Thalassemia'
    },
    patientCondition: 'Regular transfusion patient with thalassemia',
    status: 'approved',
    allocatedBlood: [
      {
        inventoryId: bloodInventory[2]._id,
        units: 3,
        allocationDate: new Date('2025-01-18')
      }
    ],
    processedBy: users[0]._id, // Admin User
    processedAt: new Date('2025-01-18'),
    notes: 'Regular patient - approved for transfusion'
  }
]);

    console.log('Created blood requests');

    // Create Donations
    const donations = await Donation.insertMany([
      {
        donorId: donors[0]._id, // John Smith
        campaignId: campaigns[0]._id,
        donationDate: new Date('2024-10-15'),
        bloodType: 'O+',
        unitsCollected: 1,
        preScreening: {
          weight: 70,
          bloodPressure: {
            systolic: 120,
            diastolic: 80
          },
          hemoglobin: 13.5,
          temperature: 98.6,
          pulse: 72,
          passed: true,
          notes: 'All vitals normal'
        },
        collectedBy: users[4]._id, // Nurse Emily Davis
        location: {
          venue: 'Colombo General Hospital',
          address: 'Regent Street, Colombo 07'
        },
        status: 'stored',
        inventoryId: bloodInventory[0]._id,
        complications: null,
        followUpRequired: false
      },
      {
        donorId: donors[1]._id, // Mary Johnson
        campaignId: null,
        donationDate: new Date('2024-12-01'),
        bloodType: 'A+',
        unitsCollected: 1,
        preScreening: {
          weight: 60,
          bloodPressure: {
            systolic: 115,
            diastolic: 75
          },
          hemoglobin: 12.8,
          temperature: 98.4,
          pulse: 68,
          passed: true,
          notes: 'Healthy donor'
        },
        collectedBy: users[3]._id, // Dr. Michael Chen
        location: {
          venue: 'Kandy Teaching Hospital',
          address: 'William Gopallawa Mawatha, Kandy'
        },
        status: 'stored',
        inventoryId: bloodInventory[1]._id,
        complications: null,
        followUpRequired: false
      }
    ]);

    console.log('Created donations');

// Create Notifications
const notifications = await Notification.insertMany([
  {
    recipient: users[5]._id, // John Smith (Donor)
    type: 'eligibility_update',
    title: 'You are eligible to donate again!',
    message: 'Your next donation eligibility date has arrived. Schedule your next donation today.',
    data: {
      donationId: donations[0]._id
    },
    channels: {
      sms: {
        sent: false,
        phone: '+94771234572',
        status: 'pending'
      },
      email: {
        sent: false,
        email: 'john.smith@email.com',
        status: 'pending'
      },
      inApp: {
        read: false,
        readAt: null
      }
    },
    priority: 'medium',
    scheduledFor: new Date('2025-01-15T09:00:00Z')
  },
  {
    recipient: users[6]._id, // Mary Johnson (Donor)
    type: 'campaign_invitation',
    title: 'New Blood Drive Campaign - Join Us!',
    message: 'A new blood donation campaign is starting near you. Your donation can save lives!',
    data: {
      campaignId: campaigns[0]._id
    },
    channels: {
      sms: {
        sent: true,
        sentAt: new Date('2025-01-10T10:00:00Z'),
        phone: '+94771234573',
        messageId: 'SMS001',
        status: 'delivered'
      },
      email: {
        sent: true,
        sentAt: new Date('2025-01-10T10:00:00Z'),
        email: 'mary.johnson@email.com',
        status: 'delivered'
      },
      inApp: {
        read: true,
        readAt: new Date('2025-01-10T14:30:00Z')
      }
    },
    priority: 'medium',
    scheduledFor: new Date('2025-01-10T10:00:00Z')
  },
  {
    recipient: users[2]._id, // Dr. Sarah Wilson (Hospital Staff)
    type: 'low_stock_alert',
    title: 'Low Blood Stock Alert - A+ Blood Type',
    message: 'A+ blood type inventory is running low. Current stock: 18 units. Consider organizing a blood drive.',
    data: {
      inventoryId: bloodInventory[1]._id
    },
    channels: {
      sms: {
        sent: true,
        sentAt: new Date('2025-01-18T08:00:00Z'),
        phone: '+94771234569',
        messageId: 'SMS002',
        status: 'delivered'
      },
      email: {
        sent: true,
        sentAt: new Date('2025-01-18T08:00:00Z'),
        email: 'sarah.wilson@hospital.com',
        status: 'delivered'
      },
      inApp: {
        read: false,
        readAt: null
      }
    },
    priority: 'high',
    scheduledFor: new Date('2025-01-18T08:00:00Z')
  },
  {
    recipient: users[0]._id, // Admin User
    type: 'emergency_request',
    title: 'Emergency Blood Request - O- Blood Type',
    message: 'Critical emergency request for O- blood from Kandy Teaching Hospital. Immediate attention required.',
    data: {
      requestId: bloodRequests[1]._id
    },
    channels: {
      sms: {
        sent: true,
        sentAt: new Date('2025-01-19T15:30:00Z'),
        phone: '+94771234567',
        messageId: 'SMS003',
        status: 'delivered'
      },
      email: {
        sent: true,
        sentAt: new Date('2025-01-19T15:30:00Z'),
        email: 'admin@bloodbank.com',
        status: 'delivered'
      },
      inApp: {
        read: false,
        readAt: null
      }
    },
    priority: 'urgent',
    scheduledFor: new Date('2025-01-19T15:30:00Z')
  },
  {
    recipient: users[10]._id, // Jennifer Wilson (Recipient)
    type: 'appointment_reminder',
    title: 'Blood Transfusion Appointment Reminder',
    message: 'Your scheduled blood transfusion appointment is tomorrow at 2:00 PM. Please arrive 30 minutes early.',
    data: {},
    channels: {
      sms: {
        sent: true,
        sentAt: new Date('2025-01-20T09:00:00Z'),
        phone: '+94771234577',
        messageId: 'SMS004',
        status: 'delivered'
      },
      email: {
        sent: true,
        sentAt: new Date('2025-01-20T09:00:00Z'),
        email: 'jennifer.wilson@email.com',
        status: 'delivered'
      },
      inApp: {
        read: false,
        readAt: null
      }
    },
    priority: 'high',
    scheduledFor: new Date('2025-01-20T09:00:00Z')
  }
]);

   console.log('Created notifications');

   console.log('✅ Seed data created successfully!');
   console.log('\n📊 Summary:');
   console.log(`👥 Users: ${users.length}`);
   console.log(`🏥 Hospitals: ${hospitals.length}`);
   console.log(`🩸 Donors: ${donors.length}`);
   console.log(`🏥 Recipients: ${recipients.length}`);
   console.log(`🧪 Blood Inventory: ${bloodInventory.length}`);
   console.log(`📢 Campaigns: ${campaigns.length}`);
   console.log(`📋 Blood Requests: ${bloodRequests.length}`);
   console.log(`💉 Donations: ${donations.length}`);
   console.log(`🔔 Notifications: ${notifications.length}`);
   
   console.log('\n🔐 Default Login Credentials:');
   console.log('Password for all users: password123');
   console.log('\n👨‍💼 Admin Users:');
   console.log('- admin@bloodbank.com');
   console.log('- system@bloodbank.com');
   console.log('\n👩‍⚕️ Hospital Staff:');
   console.log('- sarah.wilson@hospital.com');
   console.log('- michael.chen@hospital.com');
   console.log('- emily.davis@hospital.com');
   console.log('\n🩸 Donors:');
   console.log('- john.smith@email.com');
   console.log('- mary.johnson@email.com');
   console.log('- david.brown@email.com');
   console.log('- lisa.garcia@email.com');
   console.log('- robert.martinez@email.com');
   console.log('\n🏥 Recipients:');
   console.log('- jennifer.wilson@email.com');
   console.log('- thomas.anderson@email.com');

 } catch (error) {
   console.error('❌ Error seeding data:', error);
 } finally {
   await mongoose.connection.close();
   console.log('🔌 Database connection closed');
 }
};

// Handle process termination
process.on('SIGINT', async () => {
 console.log('\n⚠️  Process interrupted. Closing database connection...');
 await mongoose.connection.close();
 process.exit(0);
});

// Run the seed function
if (require.main === module) {
 seedData();
}

module.exports = seedData;