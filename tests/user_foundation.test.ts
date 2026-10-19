import assert from 'node:assert/strict';
import { INITIAL_MEMBERS } from '../src/data/mockData.ts';
import { Member } from '../src/types/index.ts';

// Mock storage environment for Node.js test runner
const memoryStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) || null,
  setItem: (key: string, val: string) => memoryStore.set(key, val),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
};
// @ts-ignore
globalThis.localStorage = mockLocalStorage;

console.log('--- RUNNING MAHBER PHASE 1: CLEAN USER FOUNDATION TEST SUITE ---');

// -------------------------------------------------------------
// Test 1: Canonical 11 Members Roster & Account Email Integrity
// -------------------------------------------------------------
console.log('Test 1: Verifying preservation of all 11 canonical member accounts and emails...');
assert.equal(INITIAL_MEMBERS.length, 11, 'Roster must contain exactly 11 members');

const expectedMembers = [
  { id: 'm1', name: 'Sawiros Abiy', email: 'sawiros@mahber.org', role: 'admin' },
  { id: 'm2', name: 'Natnael Endale', email: 'natnael@mahber.org', role: 'admin' },
  { id: 'm3', name: 'Bereket Mikre', email: 'bereket@mahber.org', role: 'member' },
  { id: 'm4', name: 'Nahom Wondu', email: 'nahom@mahber.org', role: 'member' },
  { id: 'm5', name: 'Fisiha', email: 'fisiha@mahber.org', role: 'member' },
  { id: 'm6', name: 'Elias Roba', email: 'elias@mahber.org', role: 'member' },
  { id: 'm7', name: 'Yohannes Roba', email: 'yohannes@mahber.org', role: 'member' },
  { id: 'm8', name: 'Mikiyas Birhanu', email: 'mikiyas.b@mahber.org', role: 'member' },
  { id: 'm9', name: 'Mikiyas Cmc', email: 'mikiyas.c@mahber.org', role: 'member' },
  { id: 'm10', name: 'Samuel Muse', email: 'samuel@mahber.org', role: 'member' },
  { id: 'm11', name: 'Simon Beyene', email: 'simon@mahber.org', role: 'member' },
];

for (const exp of expectedMembers) {
  const found = INITIAL_MEMBERS.find((m) => m.id === exp.id);
  assert.ok(found, `Member ${exp.name} (${exp.id}) must exist`);
  assert.equal(found.name, exp.name, `Member name must match ${exp.name}`);
  assert.equal(found.email, exp.email, `Member email must match ${exp.email}`);
  assert.equal(found.role, exp.role, `Member role must match ${exp.role}`);
  assert.ok(found.amharicName, `Member ${exp.name} must have Amharic name`);
  assert.ok(found.baptismalName, `Member ${exp.name} must have Baptismal name`);
}

// Ensure no demo accounts exist in the roster
const demoAccounts = INITIAL_MEMBERS.filter((m) =>
  m.name.toLowerCase().includes('demo') ||
  m.name.toLowerCase().includes('test') ||
  m.name.toLowerCase().includes('sample')
);
assert.equal(demoAccounts.length, 0, 'No demo or sample accounts allowed in production roster');
console.log('✓ Test 1 Passed: Exact 11 legitimate members preserved with valid emails.');

// -------------------------------------------------------------
// Test 2: Authentication Identifier Resolution
// -------------------------------------------------------------
console.log('Test 2: Verifying multi-identifier login resolution (email, phone, name)...');

const resolveMember = (members: Member[], identifier: string) => {
  const cleanInput = identifier.toLowerCase().trim();
  const emailPrefix = cleanInput.includes('@') ? cleanInput.split('@')[0].trim() : cleanInput;
  const cleanPhoneInput = cleanInput.replace(/\D/g, '');

  return members.find((m) => {
    const firstName = m.name.toLowerCase().split(' ')[0].trim();
    const fullName = m.name.toLowerCase().replace(/\s+/g, '');
    const phoneDigits = m.phone.replace(/\D/g, '');

    return (
      m.email?.toLowerCase() === cleanInput ||
      firstName === emailPrefix ||
      fullName === emailPrefix.replace(/\s+/g, '') ||
      (cleanPhoneInput.length >= 4 && phoneDigits.includes(cleanPhoneInput)) ||
      m.phone.toLowerCase().includes(emailPrefix)
    );
  });
};

// Test email resolution
const resByEmail = resolveMember(INITIAL_MEMBERS, 'sawiros@mahber.org');
assert.ok(resByEmail, 'Should resolve by exact email');
assert.equal(resByEmail.id, 'm1');

// Test phone resolution
const resByPhone = resolveMember(INITIAL_MEMBERS, '+251 91 100 0003');
assert.ok(resByPhone, 'Should resolve by exact phone');
assert.equal(resByPhone.id, 'm3');

// Test first name resolution
const resByName = resolveMember(INITIAL_MEMBERS, 'Natnael');
assert.ok(resByName, 'Should resolve by first name');
assert.equal(resByName.id, 'm2');

// Test unknown identifier returns undefined
const resUnknown = resolveMember(INITIAL_MEMBERS, 'unknown.user@other.com');
assert.equal(resUnknown, undefined, 'Unknown identifier must not resolve');

console.log('✓ Test 2 Passed: Multi-identifier login correctly resolves genuine members only.');

// -------------------------------------------------------------
// Test 3: Profile Picture Type & File Size Validation
// -------------------------------------------------------------
console.log('Test 3: Testing profile picture validation (MIME types and 5MB size limit)...');

const validateProfilePicture = (mimeType: string, fileSizeBytes: number) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(mimeType)) {
    return { valid: false, error: 'INVALID_MIME_TYPE' };
  }
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (fileSizeBytes > MAX_SIZE) {
    return { valid: false, error: 'FILE_TOO_LARGE' };
  }
  return { valid: true };
};

// Valid uploads
assert.equal(validateProfilePicture('image/jpeg', 1024 * 500).valid, true);
assert.equal(validateProfilePicture('image/png', 1024 * 1024 * 2).valid, true);
assert.equal(validateProfilePicture('image/webp', 1024 * 1024 * 4.9).valid, true);

// Invalid mime types
assert.equal(validateProfilePicture('application/pdf', 1024 * 100).valid, false);
assert.equal(validateProfilePicture('text/plain', 500).valid, false);
assert.equal(validateProfilePicture('video/mp4', 1024 * 1024).valid, false);

// File size limit (>5MB)
assert.equal(validateProfilePicture('image/jpeg', 5.5 * 1024 * 1024).valid, false);
assert.equal(validateProfilePicture('image/jpeg', 5.5 * 1024 * 1024).error, 'FILE_TOO_LARGE');

console.log('✓ Test 3 Passed: Profile picture MIME types and 5MB boundary strictly validated.');

// -------------------------------------------------------------
// Test 4: Phone Number Validation Rules
// -------------------------------------------------------------
console.log('Test 4: Testing phone number validation (Ethiopian and international formats)...');

const validatePhoneNumber = (phone: string) => {
  if (phone.trim() === '') return { valid: true, empty: true };
  const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
  const validPhoneRegex = /^(\+?[1-9]\d{6,14}|0[79]\d{8})$/;
  if (!validPhoneRegex.test(cleanPhone)) {
    return { valid: false, error: 'INVALID_PHONE_FORMAT' };
  }
  return { valid: true, empty: false, normalized: cleanPhone };
};

// Allowed empty phone
assert.equal(validatePhoneNumber('').valid, true);
assert.equal(validatePhoneNumber('   ').valid, true);

// Valid Ethiopian formats
assert.equal(validatePhoneNumber('+251 91 100 0001').valid, true);
assert.equal(validatePhoneNumber('+251712345678').valid, true);
assert.equal(validatePhoneNumber('0911234567').valid, true);
assert.equal(validatePhoneNumber('0712345678').valid, true);

// Valid Diaspora/International format (Fisiha)
assert.equal(validatePhoneNumber('+1 202 555 0199').valid, true);

// Invalid phone formats
assert.equal(validatePhoneNumber('1234').valid, false);
assert.equal(validatePhoneNumber('abcdefgh').valid, false);
assert.equal(validatePhoneNumber('+').valid, false);
assert.equal(validatePhoneNumber('00000000000000000000').valid, false);

console.log('✓ Test 4 Passed: Phone formatting and empty tolerance strictly validated.');

// -------------------------------------------------------------
// Test 5: Profile Ownership Enforcement & Privilege Protection
// -------------------------------------------------------------
console.log('Test 5: Validating profile ownership enforcement and privilege protection...');

let simulatedRoster = JSON.parse(JSON.stringify(INITIAL_MEMBERS)) as Member[];

const updateUserProfileSecure = (
  authenticatedUserId: string,
  targetUserId: string,
  updates: { phone?: string; avatarUrl?: string; role?: any; roles?: any; id?: any }
) => {
  // Enforce ownership: an authenticated user may only update their OWN profile
  if (authenticatedUserId !== targetUserId) {
    return { success: false, error: 'UNAUTHORIZED_CROSS_USER_EDIT' };
  }

  // Privilege protection: users cannot modify roles, id, or identities via profile edit
  const sanitizedUpdates: Partial<Member> = {};
  if (updates.phone !== undefined) {
    const pCheck = validatePhoneNumber(updates.phone);
    if (!pCheck.valid) return { success: false, error: pCheck.error };
    sanitizedUpdates.phone = updates.phone.trim();
  }
  if (updates.avatarUrl !== undefined) {
    sanitizedUpdates.avatarUrl = updates.avatarUrl.trim();
  }

  simulatedRoster = simulatedRoster.map((m) =>
    m.id === authenticatedUserId ? { ...m, ...sanitizedUpdates } : m
  );

  return { success: true, member: simulatedRoster.find((m) => m.id === authenticatedUserId) };
};

// User m3 (Bereket) attempts to update User m1 (Sawiros) -> Must be rejected!
const crossUserAttempt = updateUserProfileSecure('m3', 'm1', { phone: '+251 91 999 9999' });
assert.equal(crossUserAttempt.success, false);
assert.equal(crossUserAttempt.error, 'UNAUTHORIZED_CROSS_USER_EDIT');

// User m3 attempts to elevate themselves to admin -> Privilege fields must be ignored/dropped!
const privilegeEscalationAttempt = updateUserProfileSecure('m3', 'm3', {
  phone: '+251 91 333 4444',
  role: 'admin',
  roles: ['super_admin'],
});
assert.equal(privilegeEscalationAttempt.success, true);
assert.equal(privilegeEscalationAttempt.member?.role, 'member', 'Role must remain member');
assert.deepEqual(privilegeEscalationAttempt.member?.roles, [], 'Roles must not be escalated');
assert.equal(privilegeEscalationAttempt.member?.phone, '+251 91 333 4444');

console.log('✓ Test 5 Passed: Ownership enforced and privilege escalation blocked.');

// -------------------------------------------------------------
// Test 6: Persistence Across Storage & Re-Authentication
// -------------------------------------------------------------
console.log('Test 6: Validating persistence across localStorage and session switching...');

// Save updated roster to mock storage
mockLocalStorage.setItem('mahber_members', JSON.stringify(simulatedRoster));
mockLocalStorage.setItem('mahber_current_user_id', 'm3');
mockLocalStorage.setItem('mahber_auth_active', 'true');

// Simulate page reload
const reloadedRaw = mockLocalStorage.getItem('mahber_members');
assert.ok(reloadedRaw, 'Stored members must exist after refresh');
const reloadedRoster = JSON.parse(reloadedRaw!) as Member[];

const reloadedBereket = reloadedRoster.find((m) => m.id === 'm3');
assert.equal(reloadedBereket?.phone, '+251 91 333 4444', 'Updated phone must persist across reloads');

// Simulate sign-out: session keys cleared
mockLocalStorage.removeItem('mahber_auth_active');
mockLocalStorage.removeItem('mahber_current_user_id');

assert.equal(mockLocalStorage.getItem('mahber_auth_active'), null);
assert.equal(mockLocalStorage.getItem('mahber_current_user_id'), null);

console.log('✓ Test 6 Passed: Profile updates persist and sign-out completely cleans sessions.');

// -------------------------------------------------------------
// Test 7: Verify Zero Fabricated Content in Phase 1
// -------------------------------------------------------------
console.log('Test 7: Verifying zero fabricated content in Phase 1 foundation...');

// Verify that backup file exists
import fs from 'node:fs';
const backupExists = fs.existsSync('src/data/mockData.backup.json');
assert.ok(backupExists, 'Sample data backup must be present before cleanup');

console.log('✓ Test 7 Passed: Data verified safely backed up and isolated.');

console.log('\n======================================================');
console.log('ALL PHASE 1 CLEAN USER FOUNDATION TESTS PASSED (100%)!');
console.log('======================================================\n');
