const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || '';

if (!projectId || projectId === 'replace-me') {
  console.error('Missing required FIREBASE_PROJECT_ID for Firestore rules deployment.');
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
  console.error(`FIREBASE_PROJECT_ID does not look like a Firebase project ID: "${projectId}".`);
  process.exit(1);
}

console.log(`Firestore rules deployment target is configured: ${projectId}`);
