# 📊 PROJECT SETU — PostgreSQL Relational Schema Reference

This reference describes the complete data models, relations, enums, and foreign-key cascade behaviors configured in `database/prisma/schema.prisma` and `backend/prisma/schema.prisma`.

---

## 1. Relational Entities (19 Core Tables)

1. **`users`**: Base identity entity holding credentials, roles, and timestamps.
2. **`citizen_profiles`**: 1-to-1 extension of `users` storing citizen demographic metadata, Aadhaar hash, and address.
3. **`officer_profiles`**: 1-to-1 extension of `users` linking officers to specific `departments`, badges, and jurisdiction wards.
4. **`locations`**: Normalized administrative geography (State, District, SubDistrict/Tehsil, Ward, Locality, PIN Code, GPS Lat/Long).
5. **`departments`**: Master government department catalog with default and escalation SLA hours.
6. **`grievance_categories`**: Problem taxonomy belonging to a department with default priority and turnaround SLA.
7. **`grievances`**: Core grievance complaints with tracking number (`SETU-2026-XXX-XXXXXX`), citizen FK, department FK, category FK, location FK, status, priority, and SLA deadlines.
8. **`ai_classifications`**: 1-to-1 extension of `grievances` storing NLP predicted department, category, confidence score, sentiment, keywords, and model version.
9. **`grievance_status_histories`**: Immutable append-only audit trail logging every status change, actor, and remarks.
10. **`grievance_assignments`**: Assignment records mapping complaints to specific officer profiles.
11. **`grievance_attachments`**: Metadata for uploaded citizen evidence documents & photos.
12. **`escalations`**: Multi-tiered supervisor escalations triggered upon SLA breach or manual trigger.
13. **`government_services`**: Public government service catalog with fee amounts and processing timelines.
14. **`service_applications`**: Citizen applications for government services with JSON form data.
15. **`service_documents`**: Verification documents uploaded by citizens for service applications.
16. **`feedbacks`**: Citizen satisfaction ratings (1-5 scale) for grievances and service applications.
17. **`notifications`**: Real-time notifications dispatched to citizens and officers.
18. **`audit_logs`**: Administrative forensic audit log capturing actors, actions, and JSON change diffs.

---

## 2. Foreign Key & Cascade Behaviors

| Parent Entity | Child Entity | Foreign Key Column | On Delete Action | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `citizen_profiles` | `userId` | `CASCADE` | Profile cannot exist without user account. |
| `users` | `officer_profiles` | `userId` | `CASCADE` | Profile cannot exist without user account. |
| `users` | `grievances` | `citizenId` | `RESTRICT` | User account cannot be deleted if active grievances exist. |
| `departments` | `officer_profiles` | `departmentId` | `RESTRICT` | Department cannot be deleted if active officers are employed. |
| `departments` | `grievance_categories` | `departmentId` | `CASCADE` | Categories belong directly to parent department. |
| `grievances` | `ai_classifications` | `grievanceId` | `CASCADE` | AI inference record is tied 1:1 to grievance. |
| `grievances` | `grievance_status_histories` | `grievanceId` | `CASCADE` | Audit history is tied to grievance lifecycle. |
| `grievances` | `grievance_attachments` | `grievanceId` | `CASCADE` | Attachments are deleted when parent grievance is pruned. |
| `departments` | `government_services` | `departmentId` | `CASCADE` | Services belong to parent department. |
| `government_services` | `service_applications` | `serviceId` | `RESTRICT` | Service catalog item cannot be removed if applications exist. |

---

## 3. PostgreSQL Enums

```prisma
enum Role {
  CITIZEN
  OFFICER
  SENIOR_OFFICER
  ADMIN
}

enum Priority {
  PENDING_AI
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum GrievanceStatus {
  SUBMITTED
  AI_TRIAGED
  ASSIGNED
  IN_PROGRESS
  UNDER_INSPECTION
  RESOLVED
  REJECTED
  ESCALATED
  REOPENED
}

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  DOCUMENT_VERIFICATION
  APPROVED
  REJECTED
  COMPLETED
}
```
