# Minara calendar deployment

Welcome to Minara, A calendar for discovery and all your needs! This documentation will outline how the Minara app works, current features, features to be implemented, as well as troubleshooting potential issues and logging in using Google OAuth.

# Tech Stack

The backend is built on supabase which allows for easy google-authentication and session management. The frontend is built using next.js/react.js. The website is hosted on vercel for now, and we have a GCP account tied to the permissions for the app. The supabase and GCP keys are tied with the accounts, so in the case developers want to use them, must gain access to the existing projects, otherwise will have to update the .env. 

# Running the App as a Developer
if you want to test the app before pushing your changes to production, make sure to run the following:
```npm run dev```

# Current Features

### Login using Google OAuth

### Event and Calendar creation

### Current Database Schema

### Deployment using Vercel

# Features to be Implemented

### Tags

### NLP Search

# Notes

As of now, the DB schema is not fully matching with the frontend forms. So when creating calendars/organizations the frontend form information is completely aligned with the DB schema. Can consider rewriting the DB schema and updating these fields. Tags is also not completely implemented within DB/Backend so please take a look at the entries for both. 


There is also currently a refresh bug when adding calendars. You must refresh the page to see all available calendars.

# Troubleshooting


# Contact Info
If you have any questions, feel free to reach out to either Ricky Lin (Rickyl3@illinois.edu), or Tanav Palisetti (tanavp2@illinois.edu).
