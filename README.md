# Carpool - University Ride Sharing Application

A modern web application built with Meteor and React that facilitates ride sharing within school communities. Users can create, join, and manage carpools with features including secure authentication, CAPTCHA verification, and administrative tools.

## Features

### Core Functionality
- **Create Rides**: Drivers can post available rides with pickup/dropoff locations, dates, and times
- **Join Rides**: Riders can search and join available rides using shareable invite codes
- **Ride Management**: Users can view their active rides as both drivers and passengers
- **Real-time Updates**: Dynamic ride status updates and availability

### Other Features
- **Secure User Registration**: Email-based signup with password validation
- **CAPTCHA Verification**: SVG-based CAPTCHA for bot prevention during signup and signin
- **User Management**: Admins can view, edit, and manage user accounts and roles
- **Ride Oversight**: Administrative dashboard for monitoring all rides
- **Content Moderation**: Tools for managing user-generated content
- **Responsive Design**: Mobile-friendly interface using Semantic UI React

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [Meteor](https://www.meteor.com/install) (latest version)
- [Git](https://git-scm.com/downloads)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zlc1004/Carpool.git
   # or
   gh repo clone zlc1004/Carpool

   cd Carpool
   ```

2. **Navigate to the app directory**
   ```bash
   cd app
   ```

3. **Install dependencies**
   ```bash
   meteor npm install
   ```

## Running the Application

### Development Mode

```bash
cd app
meteor run --settings ../config/settings.development.json
```

This will start the Meteor development server with:
- Hot reloading enabled
- Development settings loaded
- MongoDB server
- Application available at `http://localhost:3000`

## Code Quality & Linting

This project maintains high code quality standards using ESLint with Airbnb configuration.

### Check for lint errors:
```bash
cd app
npm run lint
```

### Auto-fix lint errors:
```bash
cd app
npm run fixlint
```

## Project Structure

```
app/
├── client/                 # Client-side entry points and assets
│   ├── main.html          # Main HTML template
│   ├── main.js            # Client startup
│   ├── style.css          # Global styles
│   └── public/            # Static assets
├── imports/
│   ├── api/               # Data layer (Collections, Methods)
│   │   ├── note/          # Notes collection
│   │   ├── profile/       # User profiles
│   │   ├── ride/          # Rides collection
│   │   └── stuff/         # General items
│   ├── startup/           # Application initialization
│   │   ├── client/        # Client-side startup
│   │   └── server/        # Server-side startup
│   └── ui/                # User interface components
│       ├── components/    # Reusable UI components
│       ├── forms/         # Form utilities and bridges
│       ├── layouts/       # Page layouts
│       └── pages/         # Application pages
├── server/                # Server-side entry points
└── package.json           # Dependencies and scripts
```

## Contributing

We welcome contributions to improve the Carpool application! Here's how you can contribute:

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Set up the development environment** following the installation steps above

### Development Guidelines
1. **Follow the existing code style** and use the provided ESLint configuration
2. **Write meaningful commit messages** describing your changes
3. **Test your changes thoroughly** before submitting
4. **Ensure all lint checks pass**: `npm run lint`
5. **Keep commits focused** - one feature/fix per commit when possible

### Code Standards
- **JavaScript/React**: Follow Airbnb ESLint configuration
- **File Organization**: Place files in appropriate directories following the existing structure
- **Component Structure**: Use functional components where possible, class components when state is needed
- **Naming Conventions**: Use descriptive names for variables, functions, and components
- **Comments**: Add JSDoc comments for complex functions and components

### Submitting Changes
1. **Commit your changes**: `git commit -m "Add feature: description"`
2. **Push to your fork**: `git push origin feature/your-feature-name`
3. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Screenshots if UI changes are involved
   - Reference to any related issues

### Areas for Contribution
- **New Features**: Additional ride sharing functionality
- **UI/UX Improvements**: Enhanced user interface and experience (PLEASE)
- **Documentation**: Improve or expand documentation
- **Bug Fixes**: Address any issues found in the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
