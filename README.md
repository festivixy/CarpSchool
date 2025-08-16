<p align="center">
    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">CARPOOL</h1></p>
<p align="center">
	<em><code>❯ Modern rideshare platform for school communities</code></em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/zlc1004/Carpool?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/zlc1004/Carpool?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/zlc1004/Carpool?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/zlc1004/Carpool?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center"><!-- default option, no dependency badges. -->
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>
<br>

##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
  - [ Project Index](#-project-index)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
  - [ Testing](#-testing)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview

**carp.school** is a comprehensive rideshare application built with Meteor.js and React, designed specifically for school communities. The platform enables students, faculty, and staff to create and join carpools with real-time chat, interactive map integration, and native mobile support for iOS and Android.

The application leverages modern web technologies including styled-components for UI, OpenMapTiles for mapping, and Cordova for native mobile functionality. With features like UUID-based place references, comprehensive error handling, and skeleton loading states, carp.school provides a polished user experience across all platforms.

---

##  Features

|    | Feature            | Summary       |
|----|-------------------|-------------|
| ⚡ | **Real-time Chat** | In-ride messaging with live updates and participant management |
| 📱 | **Native Mobile** | iOS/Android apps with native navigation bars and optimized UX |
| 🗺️ | **Interactive Maps** | OpenMapTiles integration with route planning via OSRM |
| 👤 | **User Profiles** | Photo uploads, profile management, and user authentication |
| 🏠 | **Place Management** | Save frequently used locations with UUID-based references |
| 🎨 | **Modern UI** | Responsive design with skeleton loading states and error boundaries |
| 🔒 | **Secure Auth** | SVG CAPTCHA verification and secure user authentication |
| 🚗 | **Ride Management** | Create, join, and manage carpools with shareable invite codes |
| 🛠️ | **Developer Tools** | Comprehensive testing utilities and component documentation |
| 🌐 | **External Services** | TileServer, Nominatim, and OSRM integration for mapping features |

---

##  Project Structure

```sh
└── carp.school/
    ├── app/                          # Main Meteor application
    │   ├── imports/
    │   │   ├── api/                  # Backend collections & methods
    │   │   │   ├── accounts/         # User authentication
    │   │   │   ├── chat/             # Real-time messaging
    │   │   │   ├── places/           # Location management
    │   │   │   ├── profile/          # User profiles
    │   │   │   └── ride/             # Rideshare functionality
    │   │   └── ui/
    │   │       ├── mobile/           # Mobile-specific components
    │   │       │   ├── components/   # Mobile UI components
    │   │       │   ├── ios/          # Native iOS components
    │   │       │   ├── pages/        # Mobile page components
    │   │       │   └── styles/       # Mobile styled-components
    │   │       ├── desktop/          # Desktop-specific components
    │   │       ├── liquidGlass/      # Component library
    │   │       ├── skeleton/         # Loading skeleton components
    │   │       └── test/             # Component testing & demos
    │   ├── plugins/                  # Cordova plugins
    │   │   └── cordova-plugin-native-navbar/  # Custom iOS navbar
    │   ├── public/                   # Static assets
    │   ├── client/                   # Client entry point
    │   └── server/                   # Server entry point
    ├── tools/                        # Development utilities
    │   ├── checkRefs.py             # Import validation
    ���   ├── read_terminal.applescript # Terminal integration
    │   └── write_terminal.applescript
    ├── config/                       # Application settings
    ├── docker-compose.yml           # Development environment
    └── runner.sh                    # Unified development interface
```

---
##  Getting Started

###  Prerequisites

Before getting started with carp.school, ensure your runtime environment meets the following requirements:

- **Node.js:** Version 14 or higher
- **Meteor:** Version 3.3.0 ([Install Meteor](https://www.meteor.com/install))
- **Package Manager:** npm (included with Node.js)
- **Mobile Development (Optional):**
  - **iOS:** Xcode, iOS Simulator
  - **Android:** Android Studio, Android SDK
- **Container Runtime:** Docker (for production deployment)


###  Installation

Install carp.school using the following method:

1. **Clone the repository:**
```sh
❯ git clone https://github.com/zlc1004/Carpool
```

2. **Navigate to the app directory:**
```sh
❯ cd Carpool/app
```

3. **Install Meteor dependencies:**
```sh
❯ meteor npm install
```

4. **Optional - Set up external services:**
```sh
❯ cd .. && ./install.sh  # Sets up TileServer, Nominatim, OSRM
```




###  Usage

Run carp.school in different modes:

**Development Mode** &nbsp; [<img align="center" src="https://img.shields.io/badge/Meteor-DE4F4F.svg?style={badge_style}&logo=meteor&logoColor=white" />](https://www.meteor.com/)
```sh
❯ cd app && npm start        # Web development server
❯ cd app && npm start ios    # iOS development with simulator
❯ cd app && npm start android # Android development
```

**Production Mode** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)
```sh
❯ cd app && npm start prod   # Production build with Docker
```

**Development Tools**
```sh
❯ cd app && npm run lint     # Check code quality
❯ cd app && npm run lint:fix # Auto-fix linting issues
```

The application will be available at:
- **Web:** `http://localhost:3001`
- **MongoDB:** `mongodb://127.0.0.1:3002/meteor`

###  Testing

carp.school includes comprehensive component testing and demos:

```sh
❯ cd app && npm start
❯ # Navigate to http://localhost:3001/_test for component demos
```

**Available Test Pages:**
- **Component Library:** Desktop & mobile component showcase
- **Skeleton Components:** Loading state demonstrations
- **LiquidGlass Components:** UI component library
- **Mobile Navigation:** iOS/Android navigation testing

---

##  Contributing

- **💬 [Join the Discussions](https://github.com/zlc1004/Carpool/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/zlc1004/Carpool/issues)**: Submit bugs found or log feature requests for the `Carpool` project.
- **💡 [Submit Pull Requests](https://github.com/zlc1004/Carpool/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/zlc1004/Carpool
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/zlc1004/Carpool/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=zlc1004/Carpool">
   </a>
</p>
</details>

---

##  License

This project is protected under the [MIT](https://choosealicense.com/licenses/mit/) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

##  Acknowledgments

- **[Meteor.js](https://www.meteor.com/)** - Full-stack JavaScript platform
- **[OpenMapTiles](https://openmaptiles.org/)** - Vector map tiles and hosting
- **[Nominatim](https://nominatim.org/)** - Geocoding and search functionality
- **[OSRM](http://project-osrm.org/)** - Route calculation and optimization
- **[React](https://reactjs.org/)** - UI component framework
- **[styled-components](https://styled-components.com/)** - CSS-in-JS styling solution
- **[Semantic UI React](https://react.semantic-ui.com/)** - UI component library

---
