# Micro-Loan Connect

## Project Overview

Micro-Loan Connect is a peer-to-peer microloan platform developed to support financial inclusion for underserved communities. The system connects borrowers who need small-scale loans with lenders who are willing to fund approved requests, while administrators oversee approvals, repayments, and platform monitoring.

The platform supports the full micro-lending lifecycle, including user registration, authentication, borrower profile creation, loan request submission, loan approval and rejection, lender funding, repayment scheduling, borrower repayments, analytics, and third-party integrations.

This project was developed for the Application Framework module and demonstrates full-stack development using React, Node.js, Express, MongoDB, role-based access control, and external service integration.

---

## Domain / Problem Statement

Many individuals and small business owners in underserved communities struggle to access formal financial services. Traditional lending systems often require collateral, complex documentation, and lengthy approval procedures, making them difficult to access for low-income borrowers and micro-entrepreneurs.

Micro-Loan Connect addresses this problem by providing a web-based platform where borrowers can request loans, lenders can directly support approved loan requests, and administrators can ensure transparency, review, and accountability throughout the lending process.

The system creates a structured and accessible environment for digital micro-lending and repayment management.

---

## SDG Alignment

This project aligns with **United Nations Sustainable Development Goal 1: No Poverty**.

Micro-Loan Connect supports this goal by:

- improving access to finance for underserved borrowers
- enabling small business growth through micro-loans
- encouraging community-based peer-to-peer lending
- promoting financial accountability through transparent repayments
- supporting economic empowerment through accessible digital financial services

The borrower profile, business purpose, community information, and impact plans are all designed to reflect how financial access contributes to sustainable livelihoods and poverty reduction.

---

## Tech Stack

### Frontend

- React
- React Router DOM
- Axios
- Vite

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi
- JWT
- bcrypt
- helmet
- cors
- morgan

### Third-Party Integrations

- Currency API for foreign exchange conversion
- NotifyLK for SMS notifications
- Stripe for online repayment processing
- OpenStreetMap Nominatim for address-based community detection

### Testing Tools

- Jest
- Supertest
- mongodb-memory-server
- Artillery

---

## Architecture Overview

The system follows a layered architecture in the backend and a page-based component architecture in the frontend.

### Backend Layers

- **Routes** handle endpoint definitions and attach middleware
- **Middlewares** handle authentication, authorization, validation, and error processing
- **Controllers** receive requests and delegate work to services
- **Services** contain business logic and third-party API integrations
- **Repositories** perform database access operations
- **Models** define MongoDB schemas
- **Utils** provide reusable helpers such as JWT generation and async wrappers

### Frontend Structure

- **Pages** manage major UI flows for each user role
- **Components** provide reusable functionality such as `Navbar` and `ProtectedRoute`
- **Context** manages authentication state
- **API layer** provides shared Axios configuration and request handling

---

## System Flow

1. Users register or log in.
2. JWT is issued and stored for authentication.
3. Borrowers create their profile and submit loan requests.
4. Admin reviews submitted loans and approves or rejects them.
5. Lenders browse approved loans and fund them.
6. Admin creates repayment schedule entries.
7. Borrowers make repayments manually or through Stripe.
8. Analytics and transaction records reflect platform activity.

---

## Team Member Contributions

### Adheesha — Transactions Ledger, FX Conversion, Core Integration

- implemented the transactions ledger flow
- developed lender funding transaction creation
- integrated funding transaction records with loan funding progress
- implemented foreign exchange conversion support in transaction processing
- developed the FX Converter feature
- handled transaction summary and lender-side transaction display
- contributed to shared frontend/backend integration and navigation support

### Sachini — Loans, Admin Moderation, NotifyLK Integration

- implemented loan request creation, update, delete, and submission
- developed the Borrower Dashboard functionality
- implemented admin-side loan approval and rejection workflow
- integrated NotifyLK SMS notifications into loan approval and rejection flow
- connected approval/rejection results with admin UI feedback
- contributed to shared authentication and integration support

### Vitharka — Borrower Profiles, Address Detection, Validation

- implemented borrower profile creation, retrieval, update, and deletion
- designed the borrower profile frontend
- added field-level validation and phone number validation
- integrated address-based community detection using Nominatim
- displayed detected location and community preview in the UI
- handled borrower verification visibility and profile completeness flow

### Avindya — Repayments, Stripe Integration

- implemented repayment schedule creation and management
- developed borrower repayment view and admin repayment controls
- implemented manual repayment functionality
- integrated Stripe checkout session creation
- implemented Stripe payment confirmation flow
- added repayment history, repayment updates, and status handling
- contributed to repayment UI and backend repayment business logic

### Shared Contribution

All members contributed to:

- authentication flow integration
- frontend and backend integration
- debugging and issue fixing
- testing and demonstration preparation
- deployment preparation
- documentation preparation

---

## Features by Module

### Authentication Module

- register borrower and lender accounts
- login using JWT-based authentication
- restore session using authenticated user lookup
- role-based protected routes
- logout functionality
- redirect users to correct dashboards based on role

### Borrower Profile Module

- create borrower profile
- update borrower profile
- delete borrower profile
- view own borrower profile
- display verification status
- auto-detect community from address
- validate phone number and required fields
- capture financial growth and impact plan

### Loans Module

- create draft loan request
- edit loan request
- delete draft loan request
- submit loan for admin review
- browse loans as lender or admin
- approve submitted loans
- reject submitted loans
- search and filter loans in admin interface

### Transactions Ledger Module

- create funding transaction
- allow lender funding for approved loans
- display personal transaction history
- provide analytics summary for admin
- display converted FX values during funding
- update funded amount on loans automatically

### Repayment Module

- create repayment schedule entries
- update repayment items
- delete repayment items
- list repayments by loan
- allow manual repayments
- allow Stripe-based repayments
- track repayment history and status

### Analytics Module

- total funding amount
- total repayment amount
- total transaction count
- loan category breakdown
- loan status breakdown
- funding progress view
- financial inclusion impact summary

### FX Converter Module

- convert currency amounts
- show live exchange rate
- show conversion date
- allow multiple currency inputs
- support quick conversion references

### Home / Landing Page

- landing page introducing the platform
- borrower and lender entry points
- impact-oriented statistics section
- financial inclusion messaging
- modern styled homepage with role-based navigation

---

## Third-Party Integrations

### Currency API

Used for:

- FX conversion during lender funding transactions
- standalone currency converter feature

Returned data includes:

- exchange rate
- conversion date
- converted amount

### NotifyLK

Used for:

- SMS notification when a loan is approved
- SMS notification when a loan is rejected

Phone numbers are normalized before sending messages.

### Stripe

Used for:

- borrower online repayments through Stripe Checkout
- checkout session creation
- successful payment confirmation and repayment update

### OpenStreetMap Nominatim

Used for:

- community detection from borrower address
- address-based profile assistance in borrower onboarding

---

## Local Setup Instructions

### Prerequisites

- Node.js
- npm
- MongoDB
- Git

### Backend Setup

Open a terminal in the `backend` folder and run:

```bash
npm install
npm run dev

Backend runs on:

http://localhost:8080

Health check endpoint:

http://localhost:8080/api/health

Expected response:

{ "status": "ok" }
Frontend Setup

Open a terminal in the frontend/frontend folder and run:

npm install
npm run dev

Frontend runs on:

http://localhost:5173

Environment Variables

Backend .env

PORT=8080
MONGO_URI=your_mongodb_connection_string
TEST_MONGO_URI=your_test_mongodb_connection_string

JWT_SECRET=your_jwt_secret
EXCHANGE_API_KEY=your_currency_api_key
EXCHANGE_API_BASE_URL=https://api.currencyapi.com/v3/latest

NOTIFY_LK_USER_ID=your_notifylk_user_id
NOTIFY_LK_API_KEY=your_notifylk_api_key
NOTIFY_LK_SENDER_ID=NotifyDEMO
NOTIFYLK_BASE_URL=https://app.notify.lk/api/v1/send

STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_BASE_URL=http://localhost:5173
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
Frontend .env
VITE_API_BASE_URL=http://localhost:8080/api
Authentication and Roles
Borrower

A borrower can:

create and manage borrower profile
create and submit loan requests
view repayments
make repayments manually or via Stripe
Lender

A lender can:

browse approved loans
fund approved loan requests
view personal transaction history
use the FX Converter
Admin

An admin can:

view all loans
approve or reject submitted loans
access analytics
create and manage repayments
monitor transactions and platform summaries
Frontend Route Overview
Public Routes
/
/login
/register

Borrower Routes

/borrower/dashboard
/borrower/profile

Lender Routes

/lender/dashboard
Shared Protected Routes
/transactions for lender and admin
/fx for lender and admin
/repayments for borrower and admin

Admin Routes

/admin/dashboard
/admin/analytics

API Endpoint Documentation
Base URL
http://localhost:8080/api
Authentication Endpoints
POST /auth/register

Registers a new user.

Authentication: Not required

Request

{
  "name": "Borrower One",
  "email": "borrower1@test.com",
  "password": "123456",
  "role": "BORROWER"
}

Response

{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Borrower One",
    "email": "borrower1@test.com",
    "role": "BORROWER"
  }
}
POST /auth/login

Logs in an existing user.

Authentication: Not required

Request

{
  "email": "borrower1@test.com",
  "password": "123456"
}

Response

{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Borrower One",
    "email": "borrower1@test.com",
    "role": "BORROWER"
  }
}
GET /auth/me

Returns the currently authenticated user.

Authentication: Required

Header

Authorization: Bearer <token>

Response

{
  "user": {
    "id": "user_id",
    "name": "Borrower One",
    "email": "borrower1@test.com",
    "role": "BORROWER"
  }
}
Borrower Profile Endpoints
GET /borrowers/geocode/community?address=...

Detects community from a given address.

Authentication: Required
Role: BORROWER

Response

{
  "displayName": "No 25, Main Street, Colombo, Sri Lanka",
  "community": "Colombo",
  "latitude": "6.9271",
  "longitude": "79.8612"
}
POST /borrowers/profile

Creates a borrower profile.

Authentication: Required
Role: BORROWER

Request

{
  "phone": "0771234567",
  "address": "No 25, Main Street, Colombo",
  "community": "Colombo",
  "businessCategory": "tailoring",
  "monthlyIncomeRange": "30,000 - 50,000",
  "householdSize": 4,
  "povertyImpactPlan": "This loan will help me buy sewing materials and increase family income."
}
GET /borrowers/profile/me

Returns the current borrower’s profile.

Authentication: Required
Role: BORROWER

PUT /borrowers/profile/me

Updates the current borrower’s profile.

Authentication: Required
Role: BORROWER

DELETE /borrowers/profile/me

Deletes the current borrower’s profile.

Authentication: Required
Role: BORROWER

GET /borrowers/:borrowerId/profile

Returns a borrower profile for lender or admin view.

Authentication: Required
Role: LENDER, ADMIN

PATCH /borrowers/:borrowerId/verify

Marks borrower as verified.

Authentication: Required
Role: ADMIN

Loan Endpoints
POST /loans

Creates a new loan request.

Authentication: Required
Role: BORROWER

Request

{
  "title": "Tailoring machine upgrade",
  "description": "Need a better sewing machine to increase production and serve more customers.",
  "amount": 50000,
  "currency": "LKR",
  "tenureMonths": 12,
  "purpose": "Expand tailoring business",
  "businessCategory": "tailoring",
  "povertyImpactPlanSnapshot": "This loan will increase family income and allow me to support household needs."
}
GET /loans/me

Returns loans created by the current borrower.

Authentication: Required
Role: BORROWER

PUT /loans/:loanId

Updates a borrower loan.

Authentication: Required
Role: BORROWER

DELETE /loans/:loanId

Deletes a draft borrower loan.

Authentication: Required
Role: BORROWER

GET /loans

Returns loans for lender/admin browsing, optionally filtered.

Authentication: Required
Role: LENDER, ADMIN

Example

GET /loans?status=APPROVED
PATCH /loans/:loanId/approve

Approves a submitted loan.

Authentication: Required
Role: ADMIN

Response

{
  "loan": {
    "_id": "loan_id",
    "status": "APPROVED"
  },
  "smsResult": {
    "success": true
  },
  "message": "Loan approved successfully and SMS notification triggered"
}
PATCH /loans/:loanId/reject

Rejects a submitted loan.

Authentication: Required
Role: ADMIN

Transaction Endpoints
GET /transactions/summary/analytics

Returns transaction summary analytics.

Authentication: Required
Role: ADMIN

Response

{
  "totalFunding": 100000,
  "totalRepayment": 15000,
  "totalTransactions": 6
}
POST /transactions

Creates a funding transaction.

Authentication: Required
Role: LENDER, ADMIN

Request

{
  "type": "FUNDING",
  "loanId": "loan_id",
  "fromUserId": "lender_user_id",
  "toUserId": "borrower_user_id",
  "amount": 10000,
  "currency": "LKR",
  "note": "Initial lender funding"
}

Response

{
  "_id": "transaction_id",
  "type": "FUNDING",
  "amount": 10000,
  "currency": "LKR",
  "fxRate": 0.0031,
  "amountConverted": 31,
  "convertedCurrency": "USD"
}
GET /transactions

Returns all transactions.

Authentication: Required
Role: ADMIN

GET /transactions/me

Returns transactions for the current user.

Authentication: Required

GET /transactions/:id

Returns a transaction by ID.

Authentication: Required

PUT /transactions/:id

Updates a transaction.

Authentication: Required
Role: ADMIN

DELETE /transactions/:id

Deletes a transaction.

Authentication: Required
Role: ADMIN

Repayment Endpoints
POST /repayments

Creates a repayment item.

Authentication: Required
Role: ADMIN

Request

{
  "loanId": "loan_id",
  "borrowerId": "borrower_user_id",
  "dueDate": "2026-05-10",
  "amountDue": 10000
}
PUT /repayments/:id

Updates a repayment item.

Authentication: Required
Role: ADMIN

DELETE /repayments/:id

Deletes a repayment item.

Authentication: Required
Role: ADMIN

GET /repayments/loan/:loanId

Returns repayments for a selected loan.

Authentication: Required
Role: ADMIN, BORROWER

POST /repayments/:id/pay

Creates a manual repayment entry.

Authentication: Required
Role: BORROWER

Request

{
  "amount": 3000,
  "method": "CASH"
}
POST /repayments/:id/stripe-checkout-session

Creates a Stripe checkout session.

Authentication: Required
Role: BORROWER

Request

{
  "amount": 3000
}

Response

{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
POST /repayments/:id/confirm-stripe-session

Confirms Stripe session and updates repayment.

Authentication: Required
Role: BORROWER

Request

{
  "sessionId": "cs_test_xxx"
}
GET /repayments/:id

Returns a repayment item by ID.

Authentication: Required
Role: ADMIN, BORROWER

FX Endpoint
GET /fx/convert?amount=1000&from=LKR&to=USD

Converts an amount between two currencies.

Authentication: Required

Response

{
  "amount": 1000,
  "from": "LKR",
  "to": "USD",
  "rate": 0.0031,
  "date": "2026-04-07",
  "converted": 3.1
}
Deployment Report

Micro-Loan Connect is prepared for cloud deployment with separate frontend and backend hosting.

Backend Deployment

The backend is deployed on Render.

The backend deployment requires:

MongoDB connection string
JWT secret
third-party API keys
frontend base URL
secure production environment variable configuration
Frontend Deployment

The frontend is deployed on Vercel.

The frontend deployment requires:

Vite production build
backend API base URL configured through environment variables
Vercel SPA route rewrite support for React Router
Production Environment Variables

Backend

PORT
MONGO_URI
JWT_SECRET
EXCHANGE_API_KEY
EXCHANGE_API_BASE_URL
NOTIFY_LK_USER_ID
NOTIFY_LK_API_KEY
NOTIFY_LK_SENDER_ID
NOTIFYLK_BASE_URL
STRIPE_SECRET_KEY
FRONTEND_BASE_URL
NOMINATIM_BASE_URL

Frontend

VITE_API_BASE_URL
Live URLs
Frontend: https://microloan-connect.vercel.app
Backend API: https://microloan-connect-01dh.onrender.com/api
Health endpoint: https://microloan-connect-01dh.onrender.com/api/health

Note: The backend is hosted on the Render free tier, so the service may take some time to wake up after inactivity.

Testing Instruction Report

The backend includes testing-related packages and supports automated backend testing.

Installed Testing Tools
Jest
Supertest
mongodb-memory-server
Artillery
How to Run Unit Tests

Open a terminal in the backend folder and run:

npm test -- tests/unit
How to Run Integration Tests

Open a terminal in the backend folder and run:

npm test -- tests/integration
How to Run Performance Tests

Open a terminal in the backend folder and run:

npx artillery run tests/performance/perf-test.yml
Testing Environment Configuration Details
Unit Testing Environment

Unit tests run inside the backend project and use isolated logic-level testing. These tests do not require the frontend to be running.

Setup required:

open terminal in backend
run npm install
ensure project dependencies are installed

Unit tests mainly cover helper logic such as:

phone number normalization for NotifyLK
FX service logic
utility behavior
Integration Testing Environment

Integration tests run against backend endpoints using Jest, Supertest, and mongodb-memory-server.

Setup required:

open terminal in backend
run npm install
ensure TEST_MONGO_URI is configured if required by the current test setup
ensure backend test dependencies are installed
no frontend is required for integration testing

Integration testing is designed for backend endpoint flows, including:

register flow
login flow
protected route access
borrower loan creation
admin loan approval
lender funding transaction creation
admin repayment creation
borrower manual repayment
Stripe checkout session flow with controlled test setup

At the current stage, the integration test suite is implemented and mostly functional, with one repayment-related scenario still under refinement.

Performance Testing Environment

Performance testing is executed using Artillery.

Setup required:

open terminal in backend
run npm install
make sure the backend server is running before executing the performance script
use the configured target endpoint in tests/performance/perf-test.yml

Performance testing is focused on endpoint behavior under load.

Recommended scenarios include:

login endpoint
approved loans browsing endpoint
transaction creation endpoint

Performance results should reflect:

request volume
latency
failures
endpoint stability

The Artillery-based performance testing setup was completed successfully and summary evidence was captured from the terminal output.

Manual Full Test Flow
A. Start the System
Start MongoDB
Start backend
Check backend health
Verify backend environment variables
Start frontend
Open frontend
B. Prepare Accounts
Prepare borrower account
Prepare lender account
Prepare admin account note
C. Create Admin Manually
Generate bcrypt password hash
Open MongoDB Compass or mongosh
Insert admin document
Confirm admin exists
D. Register Borrower
Open register page
Register borrower
Check borrower navbar
E. Borrower Profile Flow
Open borrower profile
Fill borrower profile
Test auto-detect community from address
Save borrower profile
F. Borrower Loan Flow
Open borrower dashboard
Create first loan
Edit loan
Submit loan
G. Logout Borrower
Logout
H. Register Lender
Open register page
Register lender
Check lender navbar
I. Logout Lender
Logout
J. Login as Admin
Open login page
Login admin
K. Admin Moderation Flow
Check admin dashboard
Find submitted loan
Approve loan and observe NotifyLK result
Optionally test rejection path
L. Admin Analytics Flow
Open analytics page
M. Admin Repayment Flow
Open repayments page
Select approved loan
Create repayment item
Optionally edit repayment item
N. Logout Admin
Logout
O. Login Borrower Again
Login as borrower
Open repayments page
Select borrower loan
P. Manual Repayment Flow
Make manual repayment
Q. Stripe Repayment Flow
Start Stripe checkout
Complete Stripe test payment
R. Logout Borrower
Logout
S. Login Lender Again
Login as lender
Check lender dashboard
Open selected approved loan funding flow
Create funding transaction
T. FX Converter Flow
Open FX Converter
Test conversion
U. Final Admin Re-check
Login as admin
Recheck analytics
Recheck admin dashboard
Known Issues / Limitations
admin accounts are not created through the public registration UI and must be inserted manually for controlled testing
some UI sections may still require final alignment with backend-supported routes
one integration test scenario related to repayments is still under refinement
performance testing scripts and terminal evidence are maintained as part of the testing deliverables
third-party services require valid production/test keys to function fully
Stripe success/cancel flow depends on correct deployment environment configuration
free-tier hosting may introduce wake-up delays after inactivity
Git Workflow Summary

The project followed a branch-based collaborative workflow.

Branches
dev for stable final code
dev for integration and combined development
feature branches for each assigned module
Workflow Summary
each member worked on an assigned feature branch
feature work was committed progressively
pull requests were merged into dev
integrated features were tested together in dev
final stable version was prepared for merge into dev

This workflow helped maintain modular responsibility, improve collaboration, and reduce feature overlap during development.

Screenshots / Evidence

The project includes evidence from the following functional areas:

home page
login page
register page
borrower profile page
borrower dashboard
lender dashboard
transactions ledger
FX converter
admin dashboard
analytics dashboard
repayments page
Stripe repayment flow
unit testing terminal result
integration testing terminal result
performance testing terminal result
backend health endpoint
Render deployment output
Vercel deployment output
hosted frontend and backend URLs
one successful end-to-end deployed flow
Submission Details



Conclusion

Micro-Loan Connect is a full-stack peer-to-peer microloan platform designed to improve financial inclusion through accessible digital lending. The system demonstrates end-to-end support for borrower onboarding, loan management, lender participation, repayment handling, analytics, and external service integration.

The project combines modern application framework practices with a socially relevant problem domain, showing how digital platforms can support underserved communities, transparent financial processes, and sustainable development under SDG 1: No Poverty.