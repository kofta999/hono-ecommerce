## E-Commerce App with Node.js, Hono, Firebase Auth and Prisma

This is a Node.js e-commerce application built using Hono as the serverless framework and Prisma for interacting with the database and Firebase Auth for Authentication.

### Getting Started

1. **Prerequisites:**
    * Node.js and npm (or yarn) installed on your system.
2. **Clone the repository:**
    ```bash
    git clone https://github.com/kofta999/hono-ecommerce.git
    cd hono-ecommerce
    ```
3. **Install dependencies:**
    ```bash
    npm install
    ```
4. **Environment variables:**
Create a `.env` file in the project root directory and add the following environment variables:

  * `DATABASE_URL`: URL of your database (e.g., for Prisma)
  * `JWT_SECRET`: Secret key used for generating JSON Web Tokens (JWT)
  * `FIREBASE_API_KEY`: Your Firebase project's API key
  * `FIREBASE_AUTH_DOMAIN`: Your Firebase project's authentication domain
  * `FIREBASE_PROJECT_ID`: Your Firebase project ID
  * `FIREBASE_STORAGE_BUCKET`: Your Firebase project's storage bucket
  * `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase project's messaging sender ID
  * `FIREBASE_APP_ID`: Your Firebase project's application ID
    
5. **Database Setup:**
    * Run Prisma migrations to create the database schema:
        ```bash
        npx prisma migrate dev
        ```
    * (Optional) Seed the database with some initial data using Prisma seeds:
        ```bash
        npx prisma seed dev
        ```

### Running the application

1. Start the development server:
    ```bash
    npm run dev
    ```
    (or `yarn dev`)

This will start the server on the port specified in the `.env` file (defaults to 3000).

### ERD Diagram

![prisma-erd](https://github.com/kofta999/hono-ecommerce/assets/99273340/51b3c441-ed33-4da8-93c6-22f519fbeadb)
