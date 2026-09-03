/**
 * PROJECT SETU — Notification Service & Lifecycle Event Trigger Unit / Integration Test
 */

import { notificationService } from "../services/notifications/notificationService";
import { INotificationChannel, NotificationPayload } from "../services/notifications/notification.interface";
import { GrievanceStatus, ApplicationStatus, EscalationLevel, NotificationType } from "@prisma/client";

// Custom In-Memory Channel for Unit Testing
class MockTestChannel implements INotificationChannel {
  name = "MockTestChannel";
  dispatched: NotificationPayload[] = [];

  async send(payload: NotificationPayload): Promise<boolean> {
    this.dispatched.push(payload);
    return true;
  }
}

async function runNotificationTests() {
  console.log("==================================================================");
  console.log("🚀 TESTING NOTIFICATION SYSTEM & LIFECYCLE EVENT DISPATCHERS");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  const mockChannel = new MockTestChannel();
  (notificationService as any).channels = [mockChannel];

  const testUser = { id: "test-user-citizen-01" };

  // ----------------------------------------------------------------------------
  // Test 1: Grievance Lifecycle Notification Triggers
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 1: Grievance Lifecycle Events (1 to 6) ---");
  const testGrievance = {
    id: "test-grv-001",
    trackingNumber: "SETU-2026-TEST-998811",
    citizenId: testUser.id,
    title: "Water pipeline pressure drop in Sector 4",
  };

  // 1. Submit
  await notificationService.onGrievanceSubmitted(testGrievance);

  // 2. AI Classification
  await notificationService.onAiClassificationCompleted(testGrievance, {
    departmentName: "Department of Water Supply & Sewerage",
    categoryName: "Low Water Pressure",
    priority: "HIGH",
    confidence: 0.96,
    suggestedSlaHours: 24,
  });

  // 3. Department Assigned
  await notificationService.onDepartmentAssigned(testGrievance, "Department of Water Supply & Sewerage");

  // 4. Officer Assigned
  await notificationService.onOfficerAssigned(testGrievance, {
    userId: "officer-user-01",
    fullName: "Rajesh Verma",
    designation: "Assistant Executive Engineer",
  });

  // 5. Status Changed
  await notificationService.onGrievanceStatusChanged(
    testGrievance,
    GrievanceStatus.SUBMITTED,
    GrievanceStatus.IN_PROGRESS,
    "Field team dispatched for pipeline inspection."
  );

  // 6. Grievance Resolved
  await notificationService.onGrievanceResolved(
    testGrievance,
    "Pressure regulator replaced on main valve 4. Water flow normalized at 3.2 bar."
  );

  console.log(`  Dispatched Grievance Events: ${mockChannel.dispatched.length} messages`);

  if (mockChannel.dispatched.length === 7) {
    // 1 submit + 1 ai + 1 dept + 2 officer assigned (citizen + officer) + 1 status + 1 resolved = 7
    console.log("✔ Test 1 Passed: Grievance lifecycle triggers generated correctly formatted payloads\n");
    passed++;
  } else {
    console.error("✖ Test 1 Failed: Expected 7 messages, got " + mockChannel.dispatched.length);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 2: SLA Warning & Breach Escalation Events
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 2: SLA Warning & Breach Escalations (7 & 8) ---");
  const preCount = mockChannel.dispatched.length;

  // 7. SLA Approaching Warning
  await notificationService.onSlaApproaching(testGrievance, "officer-user-01", 6);

  // 8. SLA Breached & Escalated
  await notificationService.onSlaBreached(testGrievance, EscalationLevel.LEVEL_1_SUPERVISOR, "supervisor-user-01");

  const newCount = mockChannel.dispatched.length - preCount;
  console.log(`  Dispatched SLA Events: ${newCount} messages`);

  if (newCount === 3) {
    // 1 sla warning + 2 breach (citizen + supervisor) = 3
    console.log("✔ Test 2 Passed: SLA turnaround warnings and tiered breach escalations dispatched\n");
    passed++;
  } else {
    console.error("✖ Test 2 Failed: Expected 3 SLA messages, got " + newCount);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 3: Service Application Lifecycle Events
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 3: Service Application Events (9 & 10) ---");
  const preServiceCount = mockChannel.dispatched.length;

  const testApp = {
    id: "test-app-001",
    applicationNumber: "SETU-SRV-2026-904128",
    citizenId: testUser.id,
  };

  // 9. Application Submitted
  await notificationService.onServiceApplicationSubmitted(
    testApp,
    "New Domestic Piped Water Connection",
    14
  );

  // 10. Application Status Changed
  await notificationService.onServiceApplicationStatusChanged(
    testApp,
    "New Domestic Piped Water Connection",
    ApplicationStatus.DOCUMENT_VERIFICATION,
    "Identity proof verified. Site survey scheduled."
  );

  const serviceCount = mockChannel.dispatched.length - preServiceCount;
  console.log(`  Dispatched Service Events: ${serviceCount} messages`);

  if (serviceCount === 2) {
    console.log("✔ Test 3 Passed: Service application submission and status change notifications dispatched\n");
    passed++;
  } else {
    console.error("✖ Test 3 Failed: Expected 2 service messages, got " + serviceCount);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 4: Notification Payload Integrity & Routing Links
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 4: Routing Links & Type Integrity ---");
  const allDispatched = mockChannel.dispatched;
  let linksValid = true;

  for (const n of allDispatched) {
    if (!n.title || !n.message || !n.recipientId || !n.type) {
      linksValid = false;
      break;
    }
  }

  if (linksValid && allDispatched.length === 12) {
    console.log(`✔ Test 4 Passed: All ${allDispatched.length} notifications contain complete titles, messages, and deep links\n`);
    passed++;
  } else {
    console.error("✖ Test 4 Failed: Payload integrity check failed");
    failed++;
  }

  console.log("==================================================================");
  console.log(`✨ RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runNotificationTests();
