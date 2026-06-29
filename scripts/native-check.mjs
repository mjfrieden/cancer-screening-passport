import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const APP_ID = 'com.whitecloudmedical.cancerpassport';
const APP_NAME = 'Cancer Prevention Passport';

const checks = [
  {
    file: 'capacitor.config.ts',
    expect: contents => contents.includes(`appId: '${APP_ID}'`) && contents.includes(`appName: '${APP_NAME}'`),
    label: 'Capacitor app identity',
  },
  {
    file: 'android/app/build.gradle',
    expect: contents => (
      contents.includes(`namespace = "${APP_ID}"`) &&
      contents.includes(`applicationId "${APP_ID}"`) &&
      contents.includes('buildConfig = true')
    ),
    label: 'Android application ID',
  },
  {
    file: 'android/app/src/main/res/values/strings.xml',
    expect: contents => contents.includes(`<string name="app_name">${APP_NAME}</string>`),
    label: 'Android app name',
  },
  {
    file: 'android/app/src/main/AndroidManifest.xml',
    expect: contents => (
      contents.includes('android:allowBackup="false"') &&
      contents.includes('android:fullBackupContent="false"') &&
      contents.includes('android:networkSecurityConfig="@xml/network_security_config"')
    ),
    label: 'Android health-data backup and network protections',
  },
  {
    file: 'android/app/src/main/res/xml/network_security_config.xml',
    expect: contents => contents.includes('cleartextTrafficPermitted="false"'),
    label: 'Android cleartext traffic disabled',
  },
  {
    file: 'android/app/src/main/res/xml/file_paths.xml',
    expect: contents => (
      contents.includes('<cache-path name="secure_exports" path="exports/" />') &&
      !contents.includes('<external-path')
    ),
    label: 'Android export sharing is cache-scoped',
  },
  {
    file: 'ios/App/App/Info.plist',
    expect: contents => contents.includes(`<string>${APP_NAME}</string>`) && contents.includes('<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>'),
    label: 'iOS display name and bundle placeholder',
  },
  {
    file: 'android/app/src/androidTest/java/com/whitecloudmedical/cancerpassport/AppIdentityInstrumentedTest.java',
    expect: contents => contents.includes(`assertEquals("${APP_ID}", appContext.getPackageName())`),
    label: 'Android instrumentation package assertion',
  },
];

const forbidden = [
  { pattern: 'com.getcapacitor.myapp', label: 'Capacitor starter test package' },
  { pattern: 'com.getcapacitor.app', label: 'Capacitor starter app ID' },
];

const scannedExtensions = new Set([
  '.gradle',
  '.java',
  '.json',
  '.kt',
  '.m',
  '.md',
  '.plist',
  '.swift',
  '.ts',
  '.xml',
  '.xcconfig',
]);

async function listTextFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listTextFiles(entryPath));
      continue;
    }

    if (scannedExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

for (const check of checks) {
  if (!existsSync(check.file)) {
    throw new Error(`Missing native check target: ${check.file}`);
  }

  const contents = await readFile(check.file, 'utf8');
  if (!check.expect(contents)) {
    throw new Error(`Native readiness check failed: ${check.label}`);
  }

  console.log(`ok - ${check.label}`);
}

const filesToScan = [
  'capacitor.config.ts',
  ...await listTextFiles('android'),
  ...await listTextFiles('ios'),
];

for (const file of filesToScan) {
  const contents = await readFile(file, 'utf8');
  for (const item of forbidden) {
    if (contents.includes(item.pattern)) {
      throw new Error(`Native readiness check found ${item.label} in ${file}`);
    }
  }
}

console.log('ok - no starter native identifiers in native text files');
