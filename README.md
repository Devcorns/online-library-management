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

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
