# Firebase Deployment Instructions

This document provides instructions on how to deploy the Happy Tots Day Care website to Firebase Hosting.

## Prerequisites

1. Node.js installed (version 14 or higher)
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Firebase account with access to the project

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

This will open a browser window to authenticate with your Google account.

### 2. Initialize Firebase (if not already done)

The project already includes the necessary Firebase configuration files:
- `firebase.json` - Configuration for Firebase services
- `.firebaserc` - Project association
- `firestore.rules` - Security rules for Firestore
- `firestore.indexes.json` - Indexes for Firestore queries
- `storage.rules` - Security rules for Storage

### 3. Deploy the Website

```bash
firebase deploy
```

This will deploy:
- The website to Firebase Hosting
- Security rules to Firestore
- Indexes to Firestore
- Security rules to Storage

To deploy only specific features:

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage
```

### 4. Verify Deployment

After deployment, the CLI will provide a URL where the site is hosted:
https://happy-tots-day-care-ab4c5.web.app

## Troubleshooting

### Common Issues

1. **Permission denied**: Make sure you're logged in with an account that has sufficient permissions for the project.

2. **Build errors**: If you've made changes to the codebase, ensure there are no syntax errors.

3. **Firestore rules deployment fails**: Validate your rules using the Firebase Console before deploying.

### Getting Help

For additional help:
- Firebase documentation: https://firebase.google.com/docs
- Firebase CLI documentation: https://firebase.google.com/docs/cli
- Firebase Hosting documentation: https://firebase.google.com/docs/hosting

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