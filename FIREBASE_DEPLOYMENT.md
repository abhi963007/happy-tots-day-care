# Firebase Deployment Guide

This guide will help you deploy the Happy Tots Day Care website to Firebase Hosting and set up Firebase Firestore database with proper security rules.

## Prerequisites

1. Node.js and npm installed on your machine
2. Firebase CLI installed: `npm install -g firebase-tools`
3. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase (Skip if already initialized)

This project is already configured with:
- `firebase.json` - Configuration for hosting and Firestore
- `.firebaserc` - Project ID configuration
- `firestore.rules` - Security rules for Firestore
- `firestore.indexes.json` - Indexes for Firestore queries

### 3. Deploy the Website and Rules

```bash
firebase deploy
```

This will deploy:
- The website to Firebase Hosting
- Firestore security rules
- Firestore indexes

### 4. Deploy Only Specific Features

To deploy only hosting:
```bash
firebase deploy --only hosting
```

To deploy only Firestore rules:
```bash
firebase deploy --only firestore:rules
```

To deploy only Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## Security Rules

The Firestore security rules are configured to:
- Allow anyone to create enquiries (for the contact form)
- Allow only admin users to read, update, and delete enquiries
- Allow users to read/write their own data

## Admin Access

For development and testing, the following email addresses are automatically granted admin privileges:
- admin@example.com
- abhiramak963@gmail.com

In a production environment, you should use Firebase Authentication custom claims to properly assign admin roles. This requires setting up a Firebase Cloud Function or using the Firebase Admin SDK.

## Troubleshooting

If you encounter permission issues:
1. Make sure your security rules are deployed: `firebase deploy --only firestore:rules`
2. Verify you're logged in with an admin account (admin@example.com or abhiramak963@gmail.com)
3. Check the browser console for specific error messages

For "Missing or insufficient permissions" errors:
- Ensure the user is authenticated
- Verify the user's email matches one of the admin emails
- Check if the security rules are properly deployed

## Maintenance

### Updating the Website

1. Make your changes to the website files
2. Test locally using `firebase serve`
3. Deploy using `firebase deploy`

### Updating Firebase Configuration

If you need to update the Firebase configuration:
1. Get the new configuration from the Firebase Console
2. Update the `js/firebase-config.js` file
3. Deploy the changes 