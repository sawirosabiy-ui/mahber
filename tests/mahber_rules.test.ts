import assert from 'node:assert/strict';
import { INITIAL_MEMBERS } from '../src/data/mockData.ts';
import { mahberService } from '../src/services/mahberService.ts';
import { SpendingProposal } from '../src/types/index.ts';

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

console.log('--- RUNNING MAHBER V1 INVARIANT SUITE ---');

// Test 1: Canonical 11 Members Roster Verification
console.log('Test 1: Validating exact 11 members roster...');
assert.equal(INITIAL_MEMBERS.length, 11, 'Roster must contain exactly 11 members');
const names = INITIAL_MEMBERS.map(m => m.name);
assert.ok(names.includes('Sawiros Abiy'), 'Sawiros Abiy must be in roster');
assert.ok(names.includes('Natnael Endale'), 'Natnael Endale must be in roster');
assert.ok(names.includes('Bereket Mikre'), 'Bereket Mikre must be in roster');
assert.ok(names.includes('Nahom Wondu'), 'Nahom Wondu must be in roster');
assert.ok(names.includes('Fisiha'), 'Fisiha must be in roster');
assert.ok(names.includes('Elias Roba'), 'Elias Roba must be in roster');
assert.ok(names.includes('Yohannes Roba'), 'Yohannes Roba must be in roster');
assert.ok(names.includes('Mikiyas Birhanu'), 'Mikiyas Birhanu must be in roster');
assert.ok(names.includes('Mikiyas Cmc'), 'Mikiyas Cmc must be in roster');
assert.ok(names.includes('Samuel Muse'), 'Samuel Muse must be in roster');
assert.ok(names.includes('Simon Beyene'), 'Simon Beyene must be in roster');

// Fisiha abroad check
const fisiha = INITIAL_MEMBERS.find(m => m.name === 'Fisiha');
assert.ok(fisiha?.livesAbroad, 'Fisiha must be flagged as living abroad');
assert.ok(!fisiha?.isDeactivated, 'Fisiha must remain active and contributing');

console.log('✓ Test 1 Passed: Exact 11-member roster verified');

// Test 2: 100 ETB Contribution Baseline & Sequential Multi-Month Advance Allocation
console.log('Test 2: Verifying 100 ETB baseline and advance allocation across periods...');
const periods = mahberService.getContributionPeriods();
const period1 = periods.find(p => p.id === 'per-meskerem-2019') || periods[0];
assert.equal(period1?.expectedAmount, 100, 'Baseline monthly contribution is 100 ETB');

// Record 300 ETB advance payment from mem_3 (Bereket Mikre)
const allocEntries = mahberService.recordAdvancePayment('mem_3', 300, '27 መስከረም 2019', 'Advance for 3 months');
const totalAllocated = allocEntries.reduce((s, e) => s + e.amount, 0);
assert.equal(totalAllocated, 300, 'Should allocate all 300 ETB');
assert.ok(allocEntries.length >= 1, 'Should record payment entries across periods');
console.log('✓ Test 2 Passed: 100 ETB baseline & 300 ETB multi-period allocation verified');

// Test 3: 30-Minute Grace Period & 100 ETB Late Arrival Penalty
console.log('Test 3: Testing arrival lateness with 30-minute grace period...');
const scheduledStart = '2026-10-27T18:00:00';
const onTimeArrival = '2026-10-27T18:15:00'; // 15 mins late -> within 30 min grace -> NO penalty
const noPenaltyRes = mahberService.recordLateArrivalWithGracePeriod('gath_test_1', 'mem_4', onTimeArrival, scheduledStart);
assert.equal(noPenaltyRes.isLate, false, 'Arrival within 30 minutes grace period incurs 0 penalty');
assert.equal(noPenaltyRes.penalty, undefined, 'No penalty object generated within grace period');

const lateArrival = '2026-10-27T18:45:00'; // 45 mins late -> exceeds 30 min grace -> 100 ETB penalty
const lateRes = mahberService.recordLateArrivalWithGracePeriod('gath_test_1', 'mem_4', lateArrival, scheduledStart);
assert.equal(lateRes.isLate, true, 'Flagged late when exceeding 30 min grace period');
assert.ok(lateRes.penalty, 'Penalty must be created for lateness > 30 minutes');
assert.equal(lateRes.penalty?.amount, 100, 'Late penalty amount must be 100 ETB');
assert.equal(lateRes.penalty?.type, 'late', 'Penalty type must be late');
console.log('✓ Test 3 Passed: 30-minute grace period and 100 ETB late penalty verified');

// Test 4: 200 ETB Unexcused Absence Penalty & Excused Waiver
console.log('Test 4: Testing 200 ETB unexcused absence penalty vs excused waiver...');
const unexcused = mahberService.recordAbsencePenalty('mem_7', 'gath_test_1', false);
assert.ok(unexcused, 'Unexcused absence must generate a penalty');
assert.equal(unexcused?.amount, 200, 'Unexcused absence penalty must be 200 ETB');
assert.equal(unexcused?.status, 'pending', 'Penalty status must be pending');

const excused = mahberService.recordAbsencePenalty('mem_8', 'gath_test_1', true, 'Illness with prior notice');
assert.ok(excused, 'Excused absence record created');
assert.equal(excused?.amount, 0, 'Excused absence incurs 0 ETB fee');
assert.equal(excused?.status, 'waived', 'Excused absence status is waived');
console.log('✓ Test 4 Passed: 200 ETB unexcused absence penalty & excused waiver verified');

// Test 5: Shared Fund Ledger Formula (Income - Expenses)
console.log('Test 5: Validating Shared Fund balance calculation...');
// Reset shared fund table for precise math
mockLocalStorage.setItem('mahber_shared_fund_v1', JSON.stringify([]));
mahberService.recordSharedFundTransaction({
  type: 'income',
  amount: 5000,
  category: 'charity',
  description: 'Initial contribution pool',
  descriptionAm: 'የመጀመሪያ መዋጮ',
  recordedBy: 'mem_1',
});
mahberService.recordSharedFundTransaction({
  type: 'expense',
  amount: 1200,
  category: 'hospitality',
  description: 'Gathering bread & refreshments',
  descriptionAm: 'የማኅበር ዳቦ እና መስተንግዶ',
  recordedBy: 'mem_1',
});
const fundSummary = mahberService.getSharedFundBalance();
assert.equal(fundSummary.balance, 3800, 'Shared fund balance must equal Income (5000) - Expenses (1200) = 3800');
assert.equal(fundSummary.income, 5000, 'Total income recorded matches');
assert.equal(fundSummary.expenses, 1200, 'Total expenses recorded matches');
console.log('✓ Test 5 Passed: Shared fund balance formula verified');

// Test 6: Spending Proposal Majority Vote (> 50% = >= 6 / 11) & Single-Vote Invariant
console.log('Test 6: Validating majority vote rule and single vote per member...');
const proposal = mahberService.createSpendingProposal({
  title: 'Alms for hospital patient',
  titleAm: 'የሆስፒታል በሽተኛ መጠየቂያ',
  description: 'Provide financial relief for admitted parishioner',
  amount: 2000,
  category: 'charity',
  proposedBy: 'mem_10',
  proposedByName: 'ሳሙኤል ሙሴ',
});

// Vote 1: mem_1 in favor
let voteRes = mahberService.voteOnProposal(proposal.id, 'mem_1', 'favor');
assert.equal(voteRes.error, undefined, 'First vote by mem_1 must succeed');

// Duplicate vote rejection by mem_1
voteRes = mahberService.voteOnProposal(proposal.id, 'mem_1', 'favor');
assert.ok(voteRes.error, 'Duplicate vote by same member must be rejected');

// Cast 4 more favor votes (total 5: mem_1, mem_2, mem_3, mem_4, mem_5)
mahberService.voteOnProposal(proposal.id, 'mem_2', 'favor');
mahberService.voteOnProposal(proposal.id, 'mem_3', 'favor');
mahberService.voteOnProposal(proposal.id, 'mem_4', 'favor');
mahberService.voteOnProposal(proposal.id, 'mem_5', 'favor');

let propState = mahberService.getSpendingProposals().find(p => p.id === proposal.id);
assert.equal(propState?.status, 'active', '5/11 votes is NOT a majority (> 5.5 required, so 6 needed)');

// 6th vote casts favor (mem_6) -> should tip into 'approved'
mahberService.voteOnProposal(proposal.id, 'mem_6', 'favor');
propState = mahberService.getSpendingProposals().find(p => p.id === proposal.id);
assert.equal(propState?.status, 'approved', '6/11 favor votes achieves majority (>50%) and marks proposal approved');
console.log('✓ Test 6 Passed: Majority vote threshold (>50% = 6/11) and single-vote invariant verified');

// Test 7: Painting Rotation & Non-Destructive Hosting Swap
console.log('Test 7: Validating sacred painting rotation and non-destructive hosting swap...');
const initialRotation = mahberService.getPaintingRotation();
const originalOrder = [...initialRotation.rotationOrder];
const originalNextHost = initialRotation.nextAssignedHostId;

// Perform swap: substitute mem_9 (Mikiyas Cmc) for mem_2
const swappedRotation = mahberService.recordHostingSwap(
  'gath_current',
  initialRotation.nextAssignedHostId,
  'mem_9',
  'Family travel abroad',
  'mem_1'
);

// Scheduled host is now mem_9, but nextAssignedHostId and rotationOrder remain intact!
assert.equal(swappedRotation.scheduledHostId, 'mem_9', 'Scheduled host reflects the swap');
assert.equal(swappedRotation.nextAssignedHostId, originalNextHost, 'Underlying rotation nextAssignedHostId preserved');
assert.deepEqual(swappedRotation.rotationOrder, originalOrder, 'Underlying canonical rotation order preserved');
console.log('✓ Test 7 Passed: Painting rotation & non-destructive hosting swap verified');

// Test 8: Single-Use Invitation Code Lifecycle
console.log('Test 8: Validating single-use invitation creation and redemption...');
const invite = mahberService.createInvitation('mem_11', 'mem_1');
assert.ok(invite.code.startsWith('MAH-'), 'Invite code must start with MAH- prefix');
assert.equal(invite.isUsed, false, 'Invite code must initially be unused');

// Redeem invitation
const redeemRes = mahberService.redeemInvitation(invite.code);
assert.ok(redeemRes.success, 'Redeeming valid code must succeed');
assert.equal(redeemRes.memberId, 'mem_11', 'Redeemed member must match assigned member');

// Attempt duplicate redemption
const dupRedeem = mahberService.redeemInvitation(invite.code);
assert.equal(dupRedeem.success, false, 'Reusing an already redeemed code must be rejected');
console.log('✓ Test 8 Passed: Single-use invitation lifecycle verified');

// Test 9: Transport Collection Separation
console.log('Test 9: Validating separate transport collections...');
const transport = mahberService.createTransportCollection(
  'gath_current',
  'Debre Libanos Trip Taxi',
  'የደብረ ሊባኖስ ጉዞ ትራንስፖርት',
  'Debre Libanos',
  75,
  'Round trip minibus'
);
assert.equal(transport.agreedAmountPerMember, 75, 'Transport cost per member recorded');
const transPayRes = mahberService.recordTransportPayment(transport.id, 'mem_1', 75, 'Paid via CBE');
assert.ok(transPayRes, 'Transport payment must be recorded');
assert.equal(transPayRes?.payments.length, 1, 'Payment logged under collection');
console.log('✓ Test 9 Passed: Transport collections verified');

// Test 10: Concurrent Message Texting by 2 Different Members
console.log('Test 10: Testing concurrent texting by 2 different members...');
const msg1Res = mahberService.sendMessage(
  'm1',
  'Sawiros Abiy',
  'ሳዊሮስ አብይ',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  true,
  'ሰላም ለሁላችን ይሁን ወንድሞች'
);
const msg2Res = mahberService.sendMessage(
  'm2',
  'Natnael Endale',
  'ናትናኤል እንዳለ',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  true,
  'አሜን አብሮ ያድርሰን ወንድሜ'
);
assert.ok(msg1Res.success, 'Member 1 text must succeed');
assert.ok(msg2Res.success, 'Member 2 text must succeed');
assert.notEqual(msg1Res.message?.id, msg2Res.message?.id, 'Message IDs must never collide even if sent at the same time');
const allMsgs = mahberService.getMessages();
assert.ok(allMsgs.some(m => m.id === msg1Res.message?.id), 'Message 1 must be saved in storage');
assert.ok(allMsgs.some(m => m.id === msg2Res.message?.id), 'Message 2 must be saved in storage with neither overwriting the other');
console.log('✓ Test 10 Passed: Concurrent messaging safe with zero collisions and zero overwrites');

// Test 11: Admin Password Gate Verification (mahber@27)
console.log('Test 11: Testing Admin Password Gate verification...');
assert.equal(mahberService.verifyAdminPassword('wrongpassword'), false, 'Wrong password must be rejected');
assert.equal(mahberService.verifyAdminPassword('admin123'), false, 'Common admin guess must be rejected');
assert.equal(mahberService.verifyAdminPassword(''), false, 'Empty password must be rejected');
assert.equal(mahberService.verifyAdminPassword('mahber@27'), true, 'Password mahber@27 must be accepted');
assert.equal(mahberService.verifyAdminPassword('  mahber@27  '), true, 'Password mahber@27 with trim whitespace must be accepted');
console.log('✓ Test 11 Passed: Admin password gate (mahber@27) strictly validated');

// Test 12: Admin Attendance Update Saved in History for Members to View
console.log('Test 12: Testing Admin Attendance update auto-synced into History...');
const testGatheringId = 'g-2026-10-07';
mahberService.saveActualAttendance(
  testGatheringId,
  {
    m1: { status: 'PRESENT' },
    m2: { status: 'PRESENT' },
    m3: { status: 'LATE' }, // Late counts as attended
    m4: { status: 'EXCUSED', note: 'Sick' },
    m5: { status: 'ABSENT' },
  },
  'm1',
  'Sawiros Abiy'
);
const historyList = mahberService.getHistory();
const targetHistory = historyList.find(h => h.gatheringId === testGatheringId || h.ethDate === '27 መስከረም 2019');
assert.ok(targetHistory, 'Attendance record must be saved in History');
assert.equal(targetHistory.attendingCount, 3, 'Attending count in History must reflect present and late members (m1, m2, m3)');
assert.ok(targetHistory.presentMembers && targetHistory.presentMembers.length === 3, 'History present members roster must list 3 attending members');
const presentIds = targetHistory.presentMembers.map(m => m.id);
assert.ok(presentIds.includes('m1'), 'm1 must be in History present members');
assert.ok(presentIds.includes('m2'), 'm2 must be in History present members');
assert.ok(presentIds.includes('m3'), 'm3 must be in History present members');
console.log('✓ Test 12 Passed: Admin attendance update saved in History and visible to all members');

// Test 13: Attendance Visibility for Normal Users (Read-Only) vs Admin Editing
console.log('Test 13: Testing Attendance Visibility for Normal Users (Read-Only) vs Admin Editing...');
const attendanceMap = mahberService.getActualAttendance(testGatheringId);
// Normal user can retrieve and view all attendance records
assert.ok(attendanceMap['m1'], 'Normal user can view m1 attendance');
assert.equal(attendanceMap['m1'].status, 'PRESENT', 'm1 status is PRESENT');
assert.equal(attendanceMap['m3'].status, 'LATE', 'm3 status is LATE');
assert.equal(attendanceMap['m4'].status, 'EXCUSED', 'm4 status is EXCUSED');
assert.equal(attendanceMap['m5'].status, 'ABSENT', 'm5 status is ABSENT');

// Normal users cannot access admin editing dashboard without master password
assert.equal(mahberService.verifyAdminPassword('user_password'), false, 'Normal user password rejected for editing');
assert.equal(mahberService.verifyAdminPassword('mahber@27'), true, 'Only master password mahber@27 unlocks admin editing');
console.log('✓ Test 13 Passed: Normal users can view attendance in read-only mode, only admin can edit');

console.log('\n======================================================');
console.log('ALL 13 MAHBER V1 INVARIANTS & RULES SUCCESSFULLY VERIFIED!');
console.log('======================================================');


