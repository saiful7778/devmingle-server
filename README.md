# DevMingle - a online forum server side code

![devMingle-banner](https://github.com/saiful7778/devmingle-client/assets/83330293/739b0da9-9b30-483d-9a14-370b1d2c6499)

## Technical Documentation for DevMingle

### Table of Contents

- [Introduction](#introduction)
- [Preview](#preview)
- [System Requirements](#system-requirements)
- [Installation and Setup](#installation-and-setup)
- [Frontend Technologies Used](#frontend-technologies-used)
- [Backend Technologies Used](#backend-technologies-used)

#### Introduction

DevMingle is a forum website built on the MERN stack where users can share posts, ask questions, and interact with others on topics related to MERN stack technologies. In this project I try my best coding knowladge and I am continuously updating this also I try to maintain the best practices.

#### Preview

- Live site: [devmingle-forum.web.app](https://devmingle-forum.web.app)
- Client side code: [Devmingle-github-client-code](https://github.com/saiful7778/devmingle-client)

#### Features

- User registration and authentication using Firebase and JWT
- Forum posts and questions
- Routing with react-router-dom
- API data handling and caching with tenstack query
- Form handling with react-hook-form
- Alert notifications with sweet-alert
- Spam protection with Google reCaptcha
- Payment control with Stripe

#### Frontend Technologies Used

- React javascript UI library
- React-route-dom for single page application routing
- Tenstack query for api data caching and handling
- Firebase for only for authentication purpose
- Axios for handling api request and response
- React-hook-form for handling form data
- Sweet-alert2 for show alert notification in ui and model
- Keep-react react UI component library
- Google reCaptcha for protecting spaming
- Stripe for payment handling system

#### Backend Technologies Used

- Node.js
- Express.js
- Mongodb database
- Mongoose ODM
- Stripe
- Google ReCaptcha
- ES6+ module system
- JWT (json web token)

#### System Requirements

- Node.js
- npm or yarn
- Web browser (latest versions recommended)

#### Installation and Setup

setup `.env` file with those key

```
ACCESS_TOKEN=
SITE_SECRET=
FORNTEND_URL=
DB_CONNECT=
SECRET_KEY=
SECRET_IV=
ECNRYPTION_METHOD=
RUN_ENV= single | cluster
```

```
npm install
or
yarn
```
