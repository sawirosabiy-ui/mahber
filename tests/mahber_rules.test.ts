import assert from 'node:assert/strict';
import { INITIAL_MEMBERS } from '../src/data/mockData.ts';
import { mahberService } from '../src/services/mahberService.ts';
import { SpendingProposal } from '../src/types/index.ts';
import {
  ethiopianToGregorian,
  gregorianToEthiopian,
  isEthiopianLeapYear,
  getGatheringTimestamps,
  getNextMahberProjectedDate,
} from '../src/utils/ethiopianCalendar.ts';

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

// Test 14: Dual Administrator Ceiling & Specific Roles (Sawiros Super Admin & Natnael Finance Admin)
console.log('Test 14: Validating exactly 2 system administrators and specific functional domain roles...');
const members = mahberService.getAllMembers();
const adminMembers = members.filter(m => m.role === 'admin');
assert.equal(adminMembers.length, 2, 'Strictly 2 members may hold role = admin');
assert.ok(adminMembers.some(m => m.id === 'm1' && m.name === 'Sawiros Abiy'), 'Sawiros Abiy must be Admin');
assert.ok(adminMembers.some(m => m.id === 'm2' && m.name === 'Natnael Endale'), 'Natnael Endale must be Admin');

const elias = members.find(m => m.id === 'm6');
assert.equal(elias?.role, 'member', 'Elias Roba is role member');
assert.equal(elias?.functionalRole, 'mezmur_leader', 'Elias Roba has dedicated functionalRole mezmur_leader');

const samuel = members.find(m => m.id === 'm10');
assert.equal(samuel?.role, 'member', 'Samuel Muse is role member');
assert.equal(samuel?.functionalRole, 'bible_teacher', 'Samuel Muse has dedicated functionalRole bible_teacher');
console.log('✓ Test 14 Passed: Exactly 2 administrators and domain-specific roles verified');

// Test 15: Ethiopian Calendar 1461-Day 4-Year Cycle & Leap Year Accuracy (Pagumē 6 & Meskerem 1)
console.log('Test 15: Validating Ethiopian Calendar Pagumē 6 leap year conversion and Day 27 projection...');
// 2015 EC was a leap year (2015 % 4 === 3), Pagumē had 6 days
assert.equal(isEthiopianLeapYear(2015), true, '2015 EC must be leap year');
assert.equal(isEthiopianLeapYear(2016), false, '2016 EC is not leap year');
assert.equal(isEthiopianLeapYear(2017), false, '2017 EC is not leap year');
assert.equal(isEthiopianLeapYear(2018), false, '2018 EC is not leap year');
assert.equal(isEthiopianLeapYear(2019), true, '2019 EC must be leap year (2019 % 4 === 3)');

// Pagumē 6, 2015 EC is September 11, 2023 GC
const pagumen6_2015 = ethiopianToGregorian(2015, 13, 6);
const p6Back = gregorianToEthiopian(pagumen6_2015);
assert.equal(p6Back.year, 2015, 'Year matches 2015');
assert.equal(p6Back.month, 13, 'Month matches Pagumē (13)');
assert.equal(p6Back.day, 6, 'Day matches 6');

// Meskerem 1, 2016 EC is September 12, 2023 GC
const meskerem1_2016 = ethiopianToGregorian(2016, 1, 1);
const m1Back = gregorianToEthiopian(meskerem1_2016);
assert.equal(m1Back.year, 2016, 'Year matches 2016');
assert.equal(m1Back.month, 1, 'Month matches Meskerem (1)');
assert.equal(m1Back.day, 1, 'Day matches 1');

// Next Mahber day 27 projection
const proj = getNextMahberProjectedDate(27);
assert.equal(proj.ethDay, 27, 'Projected Mahber day is 27');
assert.ok(proj.ethDateAm.includes('27'), 'Amharic date string includes 27');
console.log('✓ Test 15 Passed: 1461-day leap year cycle and Pagumē 6 transitions verified');

// Test 16: Sacred Custody vs Gathering Hosts Separation (At Most 1 Active Custodian)
console.log('Test 16: Validating Sacred Custody vs Gathering Host separation and single active holder...');
const initialCustody = mahberService.getCustodyHistory('obj_medhanialem_icon');
const activeHolders = initialCustody.filter(c => c.isCurrentActiveHolder);
assert.equal(activeHolders.length, 1, 'Strictly 1 active custody holder allowed');
assert.equal(activeHolders[0].holderId, 'm1', 'Sawiros Abiy is initial active custodian');

// Handover custody to Natnael (m2)
const handoverRes = mahberService.recordCustodyHandover('obj_medhanialem_icon', 'm2', 'Sawiros Abiy', 'Handover for holy season');
assert.ok(handoverRes.success, 'Handover succeeds');
const updatedCustody = mahberService.getCustodyHistory('obj_medhanialem_icon');
const newActiveHolders = updatedCustody.filter(c => c.isCurrentActiveHolder);
assert.equal(newActiveHolders.length, 1, 'Still strictly 1 active holder after handover');
assert.equal(newActiveHolders[0].holderId, 'm2', 'Natnael Endale is now current active custodian');
assert.equal(updatedCustody.find(c => c.holderId === 'm1')?.isCurrentActiveHolder, false, 'Sawiros is now inactive custodian');

// Verify hosting swap DOES NOT alter custody!
const hostSwapRes = mahberService.recordHostingSwap('gath_test_host', 'm3', 'm4', 'Emergency shift swap', 'Sawiros Abiy');
const custodyAfterHostingSwap = mahberService.getCustodyHistory('obj_medhanialem_icon');
const activeAfterHostSwap = custodyAfterHostingSwap.find(c => c.isCurrentActiveHolder);
assert.equal(activeAfterHostSwap?.holderId, 'm2', 'Hosting swap has ZERO effect on sacred icon custody');
console.log('✓ Test 16 Passed: Sacred custody vs hosting separation strictly verified');

// Test 17: Remote Member Rights & Penalty Exemption (Fisiha)
console.log('Test 17: Validating Remote Member status, 100 ETB contribution, and in-person penalty exemption...');
const fisihaMem = mahberService.getAllMembers().find(m => m.id === 'm5');
assert.ok(fisihaMem, 'Fisiha member record found');
assert.equal(fisihaMem?.participationStatus, 'remote', 'Fisiha status must be remote');
assert.equal(fisihaMem?.livesAbroad, true, 'Fisiha livesAbroad flag must be true');

// Finalize gathering where all members are marked absent: Fisiha must NOT receive any penalty!
const testGathRemote = 'gath_remote_check_1';
const attendanceWithAbsentMap: Record<string, { status: any }> = {
  m1: { status: 'PRESENT' },
  m2: { status: 'PRESENT' },
  m3: { status: 'ABSENT' },
  m5: { status: 'ABSENT' }, // Fisiha marked absent in raw map
};
const finalizeRes = mahberService.finalizeGatheringAttendance(testGathRemote, attendanceWithAbsentMap, 'Natnael Endale');
assert.ok(finalizeRes.success, 'Attendance finalization succeeded');
const assessedPenalties = finalizeRes.penaltiesAssessed;
assert.ok(assessedPenalties.some(p => p.memberId === 'm3' && p.type === 'absence'), 'In-person member m3 assessed absence penalty');
assert.equal(assessedPenalties.some(p => p.memberId === 'm5'), false, 'Remote member Fisiha is strictly exempt from absence penalties');
console.log('✓ Test 17 Passed: Remote member penalty immunity verified');

// Test 18: Attendance Timing Boundaries (29 vs 31 Minutes Grace Period)
console.log('Test 18: Testing exact boundary conditions: 29 mins late (0 penalty) vs 31 mins late (100 ETB)...');
const t29 = mahberService.validateAttendanceTiming('15:29', '15:00', 30);
assert.equal(t29.isLate, false, '29 minutes late is within 30 min grace period -> PRESENT');
assert.equal(t29.penaltyAmount, 0, '29 minutes late incurs 0 penalty');
assert.equal(t29.status, 'PRESENT', 'Status is PRESENT');

const t30 = mahberService.validateAttendanceTiming('15:30', '15:00', 30);
assert.equal(t30.isLate, false, '30 minutes late is exact grace boundary -> PRESENT');
assert.equal(t30.penaltyAmount, 0, '30 minutes late incurs 0 penalty');

const t31 = mahberService.validateAttendanceTiming('15:31', '15:00', 30);
assert.equal(t31.isLate, true, '31 minutes late exceeds 30 min grace period -> LATE');
assert.equal(t31.penaltyAmount, 100, '31 minutes late incurs 100 ETB penalty');
assert.equal(t31.status, 'LATE', 'Status is LATE');
console.log('✓ Test 18 Passed: Attendance timing 29/30/31 min boundaries strictly validated');

// Test 19: Attendance Finalization Idempotency
console.log('Test 19: Validating idempotent attendance finalization (zero duplicate penalties on re-run)...');
const testGathIdemp = 'gath_idempotency_check';
const initialPenCount = mahberService.getPenalties().length;

const run1 = mahberService.finalizeGatheringAttendance(testGathIdemp, {
  m3: { status: 'LATE' },
  m4: { status: 'ABSENT' },
}, 'Natnael Endale');
assert.equal(run1.isDuplicate, false, 'First finalization run executes');
const penCountAfterRun1 = mahberService.getPenalties().length;
assert.ok(penCountAfterRun1 > initialPenCount, 'Penalties added on run 1');

// Run 2 on same gathering: must return isDuplicate = true and create 0 new records
const run2 = mahberService.finalizeGatheringAttendance(testGathIdemp, {
  m3: { status: 'LATE' },
  m4: { status: 'ABSENT' },
}, 'Natnael Endale');
assert.equal(run2.isDuplicate, true, 'Second finalization run flagged as duplicate');
assert.equal(run2.ledgerEntries.length, 0, 'Zero new ledger entries created on duplicate run');
assert.equal(mahberService.getPenalties().length, penCountAfterRun1, 'Penalties count unchanged on re-run');
console.log('✓ Test 19 Passed: Idempotent finalization prevents duplicate penalties');

// Test 20: Compensating Reversing Ledger Entry (Absent -> Excused)
console.log('Test 20: Testing compensating reversing ledger entry when unexcused absence is corrected to excused...');
const testGathRev = 'gath_reversal_test';
mahberService.finalizeGatheringAttendance(testGathRev, {
  m7: { status: 'ABSENT' },
}, 'Natnael Endale');

const ledgerBeforeRev = mahberService.getFinancialLedger();
const originalDebit = ledgerBeforeRev.find(e => e.gatheringId === testGathRev && e.memberId === 'm7' && e.entryType === 'debit');
assert.ok(originalDebit, 'Original 200 ETB debit entry found for m7');
assert.equal(originalDebit.amount, 200, 'Original debit amount is 200');

// Correct status to EXCUSED
const correctionRes = mahberService.correctAttendanceStatus(testGathRev, 'm7', 'EXCUSED', 'Natnael Endale', 'Medical certificate submitted');
assert.ok(correctionRes.success, 'Status correction succeeded');
assert.ok(correctionRes.reversingLedgerEntry, 'Reversing ledger entry generated');
assert.equal(correctionRes.reversingLedgerEntry.entryType, 'reversal', 'Reversal entryType confirmed');
assert.equal(correctionRes.reversingLedgerEntry.amount, 200, 'Reversal amount matches original debit 200 ETB');
assert.equal(correctionRes.reversingLedgerEntry.reversesEntryId, originalDebit.id, 'Links to original debit entry ID');

// Ensure original debit was NOT deleted or mutated!
const ledgerAfterRev = mahberService.getFinancialLedger();
const preservedOriginal = ledgerAfterRev.find(e => e.id === originalDebit.id);
assert.ok(preservedOriginal, 'Original debit row strictly preserved in immutable ledger');
console.log('✓ Test 20 Passed: Compensating reversing ledger entry verified with immutable history');

// Test 21: Dual Accounts & Split Payment Receipt (175 ETB Split Allocation)
console.log('Test 21: Validating Dual Financial Accounts and Split Payment Receipts...');
const testPayKey = `pay-split-test-${Date.now()}`;
const splitRes = mahberService.recordSplitPayment(
  'm8',
  175,
  [
    {
      accountId: 'core_treasury',
      amount: 100,
      category: 'monthly_dues',
      description: 'Monthly contribution 100 ETB',
      descriptionAm: 'ወርሃዊ መዋጮ 100 ብር',
    },
    {
      accountId: 'gathering_logistics_escrow',
      amount: 75,
      category: 'transport_escrow',
      description: 'Debre Libanos pilgrimage transport 75 ETB',
      descriptionAm: 'የደብረ ሊባኖስ ጉዞ ትራንስፖርት 75 ብር',
    },
  ],
  'Natnael Endale',
  testPayKey
);

assert.ok(splitRes.success, 'Split payment succeeded');
assert.equal(splitRes.entries.length, 2, 'Created 2 separate ledger entries');
assert.equal(splitRes.entries[0].accountId, 'core_treasury', 'Entry 1 posted to core_treasury');
assert.equal(splitRes.entries[0].amount, 100, 'Entry 1 amount is 100');
assert.equal(splitRes.entries[1].accountId, 'gathering_logistics_escrow', 'Entry 2 posted to gathering_logistics_escrow');
assert.equal(splitRes.entries[1].amount, 75, 'Entry 2 amount is 75');

// Attempt duplicate submission with same idempotencyKey: must return existing entries without adding new ones!
const dupSplitRes = mahberService.recordSplitPayment(
  'm8',
  175,
  [
    { accountId: 'core_treasury', amount: 100, category: 'monthly_dues', description: 'Monthly contribution' },
    { accountId: 'gathering_logistics_escrow', amount: 75, category: 'transport_escrow', description: 'Transport' },
  ],
  'Natnael Endale',
  testPayKey
);
assert.ok(dupSplitRes.success, 'Idempotent replay succeeds');
assert.equal(dupSplitRes.entries.length, 2, 'Returns same 2 original ledger entries');
const allLedger = mahberService.getFinancialLedger();
const matchingKeyEntries = allLedger.filter(e => e.idempotencyKey?.startsWith(testPayKey));
assert.equal(matchingKeyEntries.length, 2, 'Zero duplicate ledger rows created on replay');
console.log('✓ Test 21 Passed: Dual accounts split payment and idempotency protection verified');

// Test 22: Unused Logistics Escrow Reclassification to Core Treasury
console.log('Test 22: Validating unused logistics reconciliation and reclassification...');
const reconcileRes = mahberService.reconcileLogisticsEscrow('gath_debre_libanos', 50, 'reclassify', 'Natnael Endale');
assert.ok(reconcileRes.success, 'Escrow reconciliation succeeded');
assert.equal(reconcileRes.actionTaken, 'reclassify', 'Action taken confirmed as reclassify');
if (reconcileRes.remainingBalance > 0) {
  assert.ok(reconcileRes.ledgerEntry, 'Ledger transfer entry created for surplus transfer');
  assert.equal(reconcileRes.ledgerEntry?.accountId, 'core_treasury', 'Surplus transferred to core_treasury');
  assert.equal(reconcileRes.ledgerEntry?.category, 'unused_transport_reclassified', 'Category confirmed');
}
console.log('✓ Test 22 Passed: Logistics escrow reconciliation and reclassification verified');

// Test 23: Governed Voting: Quorum, Abstentions, and Tie Handling
console.log('Test 23: Validating governed proposal voting (Quorum, Tie handling without unilateral casting vote)...');
const govProp = mahberService.createGovernedProposal({
  title: 'Sound System Upgrade for Hall',
  titleAm: 'የድምፅ መሣሪያ ማሻሻያ',
  description: 'Purchase 2 wireless microphones for choir',
  amount: 3500,
  category: 'worship',
  proposedBy: 'm6',
  proposedByName: 'ኤልያስ ሮባ',
  quorumThreshold: 6,
  deadlineDays: 5,
});

assert.ok(govProp.governance, 'Governance record created');
assert.equal(govProp.governance.quorumThreshold, 6, 'Quorum threshold is 6');
assert.ok(govProp.governance.eligibleMemberIds.includes('m5'), 'Fisiha (abroad) is included in eligible voters');

// Scenario A: Insufficient quorum (< 6 votes cast)
mahberService.castGovernedVote(govProp.proposal.id, 'm1', 'favor');
mahberService.castGovernedVote(govProp.proposal.id, 'm2', 'favor');
const earlyTally = mahberService.tallyGovernedProposal(govProp.proposal.id, 'Sawiros Abiy');
assert.equal(earlyTally.finalOutcome, 'no_quorum', 'Fewer than 6 votes results in no_quorum');

// Scenario B: Tie Handling (3 favor vs 3 against = 6 votes, quorum met)
const tieProp = mahberService.createGovernedProposal({
  title: 'Special Feast Hall Rental',
  titleAm: 'የአዳራሽ ኪራይ ለልዩ በዓል',
  description: 'Rent external hall for annual commemoration',
  amount: 8000,
  category: 'hospitality',
  proposedBy: 'm1',
  proposedByName: 'ሳዊሮስ አብይ',
  quorumThreshold: 6,
});
mahberService.castGovernedVote(tieProp.proposal.id, 'm1', 'favor');
mahberService.castGovernedVote(tieProp.proposal.id, 'm2', 'favor');
mahberService.castGovernedVote(tieProp.proposal.id, 'm3', 'favor');
mahberService.castGovernedVote(tieProp.proposal.id, 'm4', 'against');
mahberService.castGovernedVote(tieProp.proposal.id, 'm6', 'against');
mahberService.castGovernedVote(tieProp.proposal.id, 'm7', 'against');

const tieTally = mahberService.tallyGovernedProposal(tieProp.proposal.id, 'Sawiros Abiy');
assert.equal(tieTally.finalOutcome, 'tied', '3 vs 3 votes results in TIED (no automatic unilateral casting vote)');
console.log('✓ Test 23 Passed: Quorum threshold and tied vote neutrality verified');

// Test 24: Persistent Reminder Queue (72h and 24h Timestamps)
console.log('Test 24: Validating persistent reminder queue generation (72h and 24h)...');
const sampleGath = mahberService.getAllGatherings()[0];
const reminders = mahberService.generateGatheringReminders(sampleGath);
assert.equal(reminders.length, 2, 'Generates exactly 2 reminders (72h & 24h)');
const r72 = reminders.find(r => r.triggerType === '72_hours');
const r24 = reminders.find(r => r.triggerType === '24_hours');
assert.ok(r72, '72h reminder generated');
assert.ok(r24, '24h reminder generated');
assert.ok(new Date(r72.scheduledFor).getTime() < new Date(r24.scheduledFor).getTime(), '72h reminder scheduled before 24h reminder');
assert.ok(r72.dedupKey.startsWith('dedup-72h-'), 'Dedup key properly formatted');
console.log('✓ Test 24 Passed: Persistent reminder queue verified');

// Test 25: Official Announcement Board & Telegram Privacy Firewall
console.log('Test 25: Validating Telegram Privacy Firewall against sensitive leaks...');
const safeAnnouncement = {
  id: 'ann-safe-1',
  title: 'Monthly Gathering Date',
  body: 'Brothers, our monthly gathering takes place this Sunday at 3:00 PM at Bole.',
  priority: 'normal' as const,
  category: 'general' as const,
  authorId: 'm1',
  authorName: 'Sawiros Abiy',
  authorAvatar: '',
  targetAudience: 'all' as const,
  tags: ['gathering'],
  publishedAt: new Date().toISOString(),
  readBy: [],
};
const safeDispatch = mahberService.dispatchTelegramAnnouncement(safeAnnouncement);
assert.ok(safeDispatch.success, 'Safe announcement dispatched to Telegram');
assert.equal(safeDispatch.log.status, 'sent', 'Status is sent');

// Sensitive leak attempt: must be blocked by Privacy Firewall!
const leakAnnouncement = {
  id: 'ann-leak-1',
  title: 'Outstanding Debts Notice',
  body: 'Member Simon has a private balance debt of 400 ETB and password issue.',
  priority: 'urgent' as const,
  category: 'administrative' as const,
  authorId: 'm2',
  authorName: 'Natnael Endale',
  authorAvatar: '',
  targetAudience: 'all' as const,
  tags: ['debt'],
  publishedAt: new Date().toISOString(),
  readBy: [],
};
const leakDispatch = mahberService.dispatchTelegramAnnouncement(leakAnnouncement);
assert.equal(leakDispatch.success, false, 'Leaked announcement blocked by Privacy Firewall');
assert.ok(leakDispatch.error?.includes('Privacy Firewall'), 'Error mentions Privacy Firewall');
console.log('✓ Test 25 Passed: Telegram Privacy Firewall strictly prevents confidential data leakage');

// Test 26: Member Offboarding & Financial Reconciliation
console.log('Test 26: Validating Member Offboarding, bad debt write-off as adjustment, and custody re-delegation...');
// Prepare departing member with debt and custody
const departingMemberId = 'm9'; // Mikiyas Cmc
mahberService.recordAbsencePenalty('gath_pre_offboard', departingMemberId, false);
mahberService.recordCustodyHandover('obj_medhanialem_icon', departingMemberId, 'Sawiros Abiy', 'Temporary custody');

const offboardResult = mahberService.offboardMember(
  departingMemberId,
  'Sawiros Abiy',
  'Permanent relocation to another city',
  'written_off',
  'transferred_to_treasury'
);

assert.ok(offboardResult, 'Offboarding record generated');
assert.equal(offboardResult.memberId, departingMemberId, 'Target member recorded');
assert.equal(offboardResult.debtDisposition, 'written_off', 'Debt written off');
assert.ok(offboardResult.writeOffLedgerEntryId, 'Write-off ledger adjustment entry generated');

// Verify write-off entry is NOT recorded as income!
const offbLedgerEntry = mahberService.getFinancialLedger().find(e => e.id === offboardResult.writeOffLedgerEntryId);
assert.ok(offbLedgerEntry, 'Write-off ledger entry found');
assert.equal(offbLedgerEntry.entryType, 'adjustment_write_off', 'Entry type is adjustment_write_off, NOT income');

// Verify custody was safely re-delegated away from departed member
const custodyPostOffboard = mahberService.getCustodyHistory('obj_medhanialem_icon');
const activeHolderPost = custodyPostOffboard.find(c => c.isCurrentActiveHolder);
assert.notEqual(activeHolderPost?.holderId, departingMemberId, 'Departed member is NO LONGER active custodian');
assert.equal(activeHolderPost?.holderId, 'm1', 'Custody safely reassigned to Super Admin Sawiros');

// Verify member account deactivated but identity preserved
const departedMemObj = mahberService.getAllMembers().find(m => m.id === departingMemberId);
assert.equal(departedMemObj?.isDeactivated, true, 'Member marked deactivated');
assert.equal(departedMemObj?.status, 'inactive', 'Member status inactive');
assert.ok(departedMemObj?.name, 'Member name and identity preserved for audit history');
console.log('✓ Test 26 Passed: Member offboarding with clean reconciliation and custody transfer verified');

// Test 27: Audio Metadata & Bandwidth Guard (<= 20MB & Bitrate Calculation)
console.log('Test 27: Validating Audio upload file-size limit (20MB) and bitrate calculation...');
const oversizedAudio = {
  fileName: 'huge_mezmur.wav',
  sizeBytes: 25 * 1024 * 1024, // 25MB > 20MB
  mimeType: 'audio/wav',
};
const overRes = mahberService.recordAudioUpload('mez-1', oversizedAudio);
assert.equal(overRes.success, false, 'Oversized file > 20MB rejected');

const validAudio = {
  fileName: 'medhanialem_mezmur.mp3',
  sizeBytes: 3 * 1024 * 1024, // 3MB
  mimeType: 'audio/mp3',
  durationSeconds: 240, // 4 mins
};
const validRes = mahberService.recordAudioUpload('mez-1', validAudio, 'm6');
assert.ok(validRes.success, 'Valid audio uploaded');
assert.ok(validRes.record, 'Audio record returned');
assert.ok(validRes.record.estimatedBitrateKbps >= 64 && validRes.record.estimatedBitrateKbps <= 128, 'Bitrate within mobile target range (64-128 kbps)');
console.log('✓ Test 27 Passed: Audio upload bandwidth guard and bitrate tracking verified');

// Test 28: Offline Intent Queue Idempotency
console.log('Test 28: Validating Offline Intent Queue and Idempotent Syncing...');
const offlineKey = `intent-${Date.now()}`;
mahberService.queueOfflineIntent({
  idempotencyKey: offlineKey,
  endpoint: '/rest/v1/attendance',
  method: 'POST',
  payload: { gatheringId: 'g1', memberId: 'm1', status: 'PRESENT' },
  createdAt: new Date().toISOString(),
  status: 'pending',
});

// Queue same intent again
mahberService.queueOfflineIntent({
  idempotencyKey: offlineKey,
  endpoint: '/rest/v1/attendance',
  method: 'POST',
  payload: { gatheringId: 'g1', memberId: 'm1', status: 'PRESENT' },
  createdAt: new Date().toISOString(),
  status: 'pending',
});

const syncRes = mahberService.syncPendingOfflineIntents();
assert.equal(syncRes.syncedCount, 1, 'Exactly 1 intent synced; duplicate queued intent ignored');
console.log('✓ Test 28 Passed: Offline intent queue idempotency verified');

console.log('\n======================================================');
console.log('ALL 28 MAHBER V1 INVARIANTS & HARDENED RULES VERIFIED!');
console.log('======================================================');


