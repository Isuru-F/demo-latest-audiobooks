// Mock user database for demo purposes
const mockUsers = {
  '1': {
    id: '1',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phoneNumber: '+1-555-0101',
    address: '123 Main St, Anytown, USA 12345',
    ssn: '123-45-6789',
    bankAccount: 'Chase Bank - ****1234',
    medicalRecords: 'Type 2 Diabetes, Hypertension medication',
    preferences: { theme: 'dark', notifications: true },
    createdAt: '2023-01-15T10:30:00Z',
    lastLogin: '2024-07-20T14:22:00Z'
  },
  '2': {
    id: '2',
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    phoneNumber: '+1-555-0102',
    address: '456 Oak Ave, Another City, USA 67890',
    ssn: '987-65-4321',
    bankAccount: 'Wells Fargo - ****5678',
    medicalRecords: 'Allergic to peanuts, Annual checkup required',
    preferences: { theme: 'light', notifications: false },
    createdAt: '2023-02-20T09:15:00Z',
    lastLogin: '2024-07-21T08:45:00Z'
  },
  '3': {
    id: '3',
    email: 'admin@example.com',
    fullName: 'Admin User',
    phoneNumber: '+1-555-0103',
    address: '789 Admin Blvd, Corporate City, USA 11111',
    ssn: '555-66-7777',
    bankAccount: 'Bank of America - ****9999',
    medicalRecords: 'Confidential admin health data',
    preferences: { theme: 'auto', notifications: true },
    createdAt: '2022-12-01T12:00:00Z',
    lastLogin: '2024-07-21T16:30:00Z'
  }
};

class UsersService {
  async getUserById(userId) {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockUsers[userId] || null;
  }
  
  async getAllUsers() {
    return Object.values(mockUsers);
  }
}

module.exports = new UsersService();
