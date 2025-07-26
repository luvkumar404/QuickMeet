# QuickMeet

This project is a full-stack web application that replicates the core functionalities of a video conferencing platform like Zoom. It includes features for user authentication, creating and joining video meetings, and real-time communication.

## Features

*   **User Authentication:** Secure user registration and login system.
*   **Video Conferencing:** Create and join video meetings with real-time audio and video streaming.
*   **Meeting History:** View a history of past meetings.
*   **Real-time Interaction:** Utilizes WebSockets for seamless real-time communication between participants.

## Tech Stack

### Frontend

*   **React.js:** A JavaScript library for building user interfaces.
*   **Material-UI (MUI):** A popular React UI framework for faster and easier web development.
*   **React Router:** For declarative routing in the React application.
*   **Socket.IO Client:** For real-time, bidirectional event-based communication.
*   **Axios:** A promise-based HTTP client for the browser and Node.js.

### Backend

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js:** A minimal and flexible Node.js web application framework.
*   **MongoDB:** A cross-platform document-oriented database program.
*   **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **Socket.IO:** Enables real-time, bidirectional and event-based communication.
*   **bcrypt:** A library for hashing passwords.
*   **dotenv:** A zero-dependency module that loads environment variables from a `.env` file.

## Project Structure

The project is organized into two main directories:

-   `frontend/`: Contains the React.js client-side application.
-   `backend/`: Contains the Node.js and Express.js server-side application.

## Getting Started

### Prerequisites

*   Node.js (v14 or later)
*   npm
*   MongoDB (Make sure your MongoDB server is running)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `backend` root directory and add the following environment variables:
    ```env
    PORT=8000
    MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
    CORS_ORIGIN=http://localhost:3000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The backend server will start on `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    The frontend application will open in your browser at `http://localhost:3000`.

## Available Scripts

### Backend

-   `npm run dev`: Starts the backend server in development mode with `nodemon`.
-   `npm start`: Starts the backend server.
-   `npm run prod`: Starts the backend server using `pm2` for production.

### Frontend

-   `npm start`: Runs the app in development mode.
-   `npm test`: Launches the test runner in interactive watch mode.
-   `npm run build`: Builds the app for production to the `build` folder.
-   `npm run eject`: Removes the single dependency configuration.

## Author

-   Love Kumar Chaudhary

## License

This project is licensed under the ISC License.
