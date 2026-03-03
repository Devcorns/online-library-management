# Online Library Management

This repository contains a subscription-based library/reading hall management system with the following features:

- Multi-level user management (super admin, admin, staff, user)
- JWT authentication with role-based access control
- Membership subscription and fee handling (monthly/quarterly/yearly) with fine calculation
- Real-time seat availability and booking system
- Simple inventory & requisition management
- Node.js/Express backend with MongoDB Atlas
- Angular 17 frontend

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Devcorns/online-library-management.git
   cd online-library-management
   ```
2. Backend setup:
   ```bash
   npm install
   cp .env.example .env  # configure your MongoDB Atlas URI and JWT secret
   npm run seed          # create the initial super admin
   npm run dev           # start the API server
   ```
3. Frontend setup:
   ```bash
   cd client
   npm install
   ng serve --proxy-config proxy.conf.json
   ```

Visit `http://localhost:4200` in your browser to use the application.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5b19f266-225e-4dfa-8389-13eddf2e8a06" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/64b07d5e-7a58-42cd-8ae4-3692d05ab482" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7213cd64-8a22-4f59-8b9a-4a1a42171542" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7d759a39-da65-4792-8643-7d839e3dc8dc" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/93cbde17-f605-4563-b4ff-67c4d7604208" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7c4b94a1-eb76-4a2e-8337-9ff2f7c367f0" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/72474db1-dba6-4ba5-93e4-b9bfcf451da1" />







## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
