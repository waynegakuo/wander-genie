# 📝 Connecting an Angular App to Firebase Emulators

This is a step-by-step guide to configure your local development environment to use the Firebase Emulator Suite with a modern Angular application. This allows you to test your Firebase backend functionality (like Cloud Functions, Firestore, etc.) locally without incurring costs or affecting production data.

## Prerequisites

1.  **Node.js and Angular CLI**: A working Angular development environment.
2.  **Firebase CLI**: The command-line tool for Firebase. Install or update it globally:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Java Development Kit (JDK)**: The Firebase emulators (especially Firestore) require a Java runtime to operate.

---

## Step 1: Install and Verify Java

The emulators will fail to start without a Java runtime.

1.  **Install Java (macOS with Homebrew):**
    The simplest method on macOS is using Homebrew to install a stable version of OpenJDK.
    ```bash
    brew install openjdk@17
    ```

2.  **Link Java for Your System:**
    After installation, Homebrew provides a `sudo ln -sfn ...` command. Run it to make this Java version available system-wide. The command will look similar to this:
    ```bash
    sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
    ```

3.  **Verify Installation:**
    Close and reopen your terminal, then run `java -version`. You should see output confirming the version you just installed.

---

## Step 2: Configure Firebase Emulators

The `firebase.json` file in your project root tells the Firebase CLI which emulators to start and on which ports.

1.  **Initialize Emulators (if needed):**
    If you haven't set up emulators for your project yet, run:
    ```bash
    firebase init emulators
    ```
    Select the emulators you need (e.g., Functions, Firestore, Hosting).

2.  **Verify `firebase.json`:**
    Ensure your `firebase.json` file has an `emulators` block. The ports defined here are what your Angular app will need to connect to.

    ```json
    {
      "emulators": {
        "functions": {
          "port": 5001
        },
        "firestore": {
          "port": 8080
        },
        "hosting": {
          "port": 5000
        },
        "ui": {
          "enabled": true
        },
        "singleProjectMode": true
      }
    }
    ```

---

## Step 3: Configure Your Angular Environment

Your Angular app needs to know the host and port for the emulators during development.

1.  **Edit `src/environments/environment.development.ts`:**
    Add an `emulator` object to your development environment file. This keeps your configuration clean and separate from production.

    ```typescript
    export const environment = {
      production: false,
      firebaseConfig: {
        // ... your standard firebase config
      },
      // Add this block
      emulator: {
        host: 'localhost',
        functionsPort: 5001,
        firestorePort: 8080
      }
    };
    ```

2.  **Ensure Production is Clean:**
    Your production file (`src/environments/environment.ts`) should **not** contain the `emulator` block.

---

## Step 4: Conditionally Connect to Emulators

The best place to manage the connection is in your main application configuration file, `src/app/app.config.ts`. This ensures that any service that injects a Firebase service gets the correct instance (local or production).

1.  **Import necessary functions:**
    In `app.config.ts`, import `isDevMode` from Angular and the `connect...Emulator` functions from Firebase.

2.  **Update Firebase Providers:**
    Wrap your Firebase service providers (`provideFunctions`, `provideFirestore`, etc.) in a factory function that checks the environment.

    ```typescript
    // src/app/app.config.ts
    import { isDevMode } from '@angular/core';
    import { environment } from '../environments/environment';
    import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
    import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';

    export const appConfig: ApplicationConfig = {
      providers: [
        // ... other providers
        provideFunctions(() => {
          const functions = getFunctions(undefined, 'your-function-region'); // e.g., 'africa-south1'
          if (isDevMode() && environment.emulator) {
            console.log('Connecting to Functions emulator...');
            connectFunctionsEmulator(functions, environment.emulator.host, environment.emulator.functionsPort);
          }
          return functions;
        }),
        provideFirestore(() => {
          const firestore = getFirestore();
          if (isDevMode() && environment.emulator) {
            console.log('Connecting to Firestore emulator...');
            connectFirestoreEmulator(firestore, environment.emulator.host, environment.emulator.firestorePort);
          }
          return firestore;
        }),
      ]
    };
    ```

---

## Step 5: Run Everything

To test your setup, you need to run two processes in separate terminal windows.

1.  **Terminal 1: Start Firebase Emulators**
    ```bash
    firebase emulators:start
    ```
    You will see a table confirming the emulators are running and listening on their configured ports. You can also visit the Emulator UI (usually at `http://localhost:4000`) to see your local data.

2.  **Terminal 2: Start Angular Dev Server**
    ```bash
    ng serve
    ```
    Open your app (usually at `http://localhost:4200`). Check the browser's developer console for the "Connecting to... emulator..." logs to confirm it's working. All Firebase calls from your app will now be routed to your local emulators.
