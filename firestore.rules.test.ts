import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

const projectId = 'cancer-screening-passport-rules-test';

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe('Firestore security rules', () => {
  it('allows users to read and write only their own profile', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();
    const anonymous = testEnv.unauthenticatedContext().firestore();

    const aliceProfile = doc(alice, 'user_profiles/alice');
    const aliceProfileAsBob = doc(bob, 'user_profiles/alice');
    const aliceProfileAnon = doc(anonymous, 'user_profiles/alice');

    await assertSucceeds(setDoc(aliceProfile, { userId: 'alice', name: 'Alice' }));
    await assertSucceeds(getDoc(aliceProfile));
    await assertFails(getDoc(aliceProfileAsBob));
    await assertFails(setDoc(aliceProfileAsBob, { userId: 'bob', name: 'Bob' }));
    await assertFails(getDoc(aliceProfileAnon));
  });

  it('allows users to read and write only their own consent record', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();
    const anonymous = testEnv.unauthenticatedContext().firestore();

    const aliceConsent = doc(alice, 'user_consents/alice');
    const aliceConsentAsBob = doc(bob, 'user_consents/alice');
    const aliceConsentAnon = doc(anonymous, 'user_consents/alice');

    await assertSucceeds(setDoc(aliceConsent, {
      userId: 'alice',
      acceptedAt: '2026-06-20T00:00:00.000Z',
      privacyVersion: '2026-06-20',
      termsVersion: '2026-06-20',
      medicalDisclaimerVersion: '2026-06-20',
    }));
    await assertSucceeds(getDoc(aliceConsent));
    await assertFails(getDoc(aliceConsentAsBob));
    await assertFails(setDoc(aliceConsentAsBob, { userId: 'bob' }));
    await assertFails(setDoc(aliceConsent, { userId: 'bob' }));
    await assertFails(getDoc(aliceConsentAnon));
  });

  it('allows users to create and manage only their own screening events', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();

    const aliceEvent = doc(alice, 'screening_events/event-1');
    const aliceEventAsBob = doc(bob, 'screening_events/event-1');

    await assertSucceeds(setDoc(aliceEvent, {
      userId: 'alice',
      type: 'colonoscopy',
      date: '2026-06-11',
      result: 'Normal',
      isAbnormal: false,
      status: 'completed',
    }));

    await assertSucceeds(updateDoc(aliceEvent, { result: 'Normal, no polyps' }));
    await assertFails(updateDoc(aliceEventAsBob, { result: 'Changed by Bob' }));
    await assertFails(deleteDoc(aliceEventAsBob));
    await assertSucceeds(deleteDoc(aliceEvent));
  });

  it('rejects creating a screening event for another userId', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();

    await assertFails(setDoc(doc(alice, 'screening_events/event-2'), {
      userId: 'bob',
      type: 'fit',
      date: '2026-06-11',
      result: 'Negative',
      isAbnormal: false,
      status: 'completed',
    }));
  });

  it('allows owner-scoped screening event queries and rejects broad collection reads', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'screening_events/alice-event'), { userId: 'alice', date: '2026-06-11' });
      await setDoc(doc(adminDb, 'screening_events/bob-event'), { userId: 'bob', date: '2026-06-11' });
    });

    const alice = testEnv.authenticatedContext('alice').firestore();

    await assertSucceeds(getDocs(query(
      collection(alice, 'screening_events'),
      where('userId', '==', 'alice'),
    )));

    await assertFails(getDocs(collection(alice, 'screening_events')));
    await assertFails(getDocs(query(
      collection(alice, 'screening_events'),
      where('userId', '==', 'bob'),
    )));
  });

  it('denies all client access to synthetic recovery validation records', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), '_recovery_validation/synthetic-marker'), {
        synthetic: true,
      });
    });

    const alice = testEnv.authenticatedContext('alice').firestore();
    const anonymous = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(alice, '_recovery_validation/synthetic-marker')));
    await assertFails(setDoc(doc(alice, '_recovery_validation/other-marker'), {
      synthetic: true,
    }));
    await assertFails(getDoc(doc(anonymous, '_recovery_validation/synthetic-marker')));
  });
});
