import { prisma } from "../config/database";
import { SERVICE_REGISTRY, getServiceSchema, ServiceDefinition, searchServices } from "../config/serviceSchemaRegistry";
import { SCHEME_REGISTRY, getSchemeBySlug, searchSchemes, SchemeDefinition } from "../config/schemeRegistry";

export interface AssistantResponse {
  replyText: string;
  intent: "SERVICE_INQUIRY" | "SCHEME_INQUIRY" | "GRIEVANCE_GUIDE" | "STATUS_TRACKING" | "CHECKLIST" | "GENERAL_HELP";
  data?: {
    service?: {
      code: string;
      name: string;
      id?: string;
      departmentCode: string;
      category: string;
      description: string;
      eligibility: string[];
      estimatedDays: number;
      feeAmount: number;
      isExternal?: boolean;
      officialPortalUrl?: string;
      requiredDocs: string[];
      optionalDocs: string[];
      applyUrl: string;
      prefill?: Record<string, any>;
    };
    scheme?: {
      code: string;
      name: string;
      slug: string;
      category: string;
      shortDescription: string;
      overview: string;
      benefits: string[];
      eligibilityCriteria: string[];
      requiredDocuments: string[];
      officialPortalUrl?: string;
      applicationMethod: string;
      detailsUrl: string;
    };
    schemesList?: Array<{
      code: string;
      name: string;
      slug: string;
      category: string;
      benefitsSummary: string;
      detailsUrl: string;
    }>;
    grievance?: {
      suggestedDepartment: string;
      suggestedCategory: string;
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      title: string;
      description: string;
      lodgeUrl: string;
      prefill?: Record<string, any>;
    };
    tracking?: {
      type: "GRIEVANCE" | "SERVICE_APPLICATION";
      identifier: string;
      title: string;
      status: string;
      department: string;
      officerRemarks?: string | null;
      submittedAt: string;
      slaDeadline?: string | null;
      detailsUrl: string;
    }[];
    checklist?: {
      title: string;
      items: string[];
      mandatoryDocuments: string[];
      optionalDocuments: string[];
      instructions: string;
    };
  };
  suggestedActions: Array<{
    label: string;
    prompt: string;
    actionType?: "NAVIGATE" | "PROMPT" | "PREFILL" | "EXTERNAL_URL";
    url?: string;
  }>;
}

export class AssistantService {
  /**
   * Process a natural language citizen inquiry
   */
  async processQuery(
    message: string,
    language: string = "en",
    userId?: string
  ): Promise<AssistantResponse> {
    const text = message.trim().toLowerCase();

    // 1. Check for Tracking Intent or Reference Tokens
    const grievanceTokenMatch = message.match(/SETU-(?:2026-)?[A-Z]{2,4}-\d{5,8}/i);
    const serviceTokenMatch = message.match(/SETU-SRV-(?:2026-)?\d{5,8}/i);

    if (grievanceTokenMatch) {
      return this.trackGrievanceByToken(grievanceTokenMatch[0]);
    }

    if (serviceTokenMatch) {
      return this.trackServiceApplicationByToken(serviceTokenMatch[0]);
    }

    if (
      text.includes("my grievance") ||
      text.includes("my complaint") ||
      text.includes("my application") ||
      text.includes("track status") ||
      text.includes("check status") ||
      text.includes("pending")
    ) {
      if (userId) {
        return this.trackUserRecentItems(userId);
      } else {
        return {
          replyText:
            "To inspect the live status of your grievances or service applications, please enter your tracking number (e.g., SETU-2026-WAT-001245 or SETU-SRV-2026-104928) or sign in to your citizen account.",
          intent: "STATUS_TRACKING",
          suggestedActions: [
            { label: "Sign In to Track", prompt: "Sign In", actionType: "NAVIGATE", url: "/login" },
            { label: "Lodge New Grievance", prompt: "I want to lodge a complaint", actionType: "NAVIGATE", url: "/citizen/grievances/new" },
          ],
        };
      }
    }

    // 2. Government Schemes Inquiries
    if (
      text.includes("scheme") ||
      text.includes("pm kisan") ||
      text.includes("kisan") ||
      text.includes("farmer") ||
      text.includes("ayushman") ||
      text.includes("pmjay") ||
      text.includes("health insurance") ||
      text.includes("awas yojana") ||
      text.includes("housing scheme") ||
      text.includes("house subsidy") ||
      text.includes("svanidhi") ||
      text.includes("street vendor") ||
      text.includes("vendor loan") ||
      text.includes("scholarship") ||
      text.includes("mudra") ||
      text.includes("business loan") ||
      text.includes("matru vandana") ||
      text.includes("maternity") ||
      text.includes("pregnant") ||
      text.includes("pension scheme") ||
      text.includes("old age pension") ||
      text.includes("widow pension") ||
      text.includes("surya ghar") ||
      text.includes("solar subsidy") ||
      text.includes("solar panel") ||
      text.includes("free electricity") ||
      text.includes("atal pension") ||
      text.includes("financial help for education") ||
      text.includes("financial assistance")
    ) {
      return this.handleSchemeInquiry(text, language);
    }

    // 3. Document / Checklist Requests
    if (
      text.includes("documents required") ||
      text.includes("what documents") ||
      text.includes("document checklist") ||
      text.includes("checklist for") ||
      text.includes("requirements for")
    ) {
      return this.handleChecklistInquiry(text, language);
    }

    // 4. Grievance / Complaint Triage
    if (
      text.includes("complaint") ||
      text.includes("grievance") ||
      text.includes("pothole") ||
      text.includes("water leak") ||
      text.includes("broken pipe") ||
      text.includes("drainage") ||
      text.includes("garbage") ||
      text.includes("street light") ||
      text.includes("electricity out") ||
      text.includes("power cut") ||
      text.includes("flooding") ||
      text.includes("noise") ||
      text.includes("bribe") ||
      text.includes("corruption") ||
      text.includes("officer not") ||
      text.includes("delay in")
    ) {
      return this.handleGrievanceTriage(text, language);
    }

    // 5. Government Services Catalog Inquiry
    return this.handleServiceInquiry(text, language);
  }

  /**
   * Handle Government Scheme inquiries with verified data
   */
  private async handleSchemeInquiry(text: string, language: string): Promise<AssistantResponse> {
    let matchedScheme: SchemeDefinition | undefined;

    if (text.includes("kisan") || text.includes("farmer") || text.includes("agriculture")) {
      matchedScheme = SCHEME_REGISTRY["pm-kisan-samman-nidhi"];
    } else if (text.includes("ayushman") || text.includes("pmjay") || text.includes("health insurance") || text.includes("hospital")) {
      matchedScheme = SCHEME_REGISTRY["ayushman-bharat-pmjay"];
    } else if (text.includes("awas") || text.includes("house") || text.includes("housing")) {
      matchedScheme = SCHEME_REGISTRY["pradhan-mantri-awas-yojana"];
    } else if (text.includes("svanidhi") || text.includes("street vendor") || text.includes("vendor loan") || text.includes("hawker")) {
      matchedScheme = SCHEME_REGISTRY["pm-svanidhi-street-vendor"];
    } else if (text.includes("scholarship") || text.includes("education") || text.includes("student") || text.includes("college fee")) {
      matchedScheme = SCHEME_REGISTRY["national-scholarship-portal"];
    } else if (text.includes("mudra") || text.includes("business loan") || text.includes("shop loan") || text.includes("msme loan")) {
      matchedScheme = SCHEME_REGISTRY["pradhan-mantri-mudra-yojana"];
    } else if (text.includes("matru") || text.includes("pregnant") || text.includes("maternity") || text.includes("lactating")) {
      matchedScheme = SCHEME_REGISTRY["pm-matru-vandana-yojana"];
    } else if (text.includes("old age") || text.includes("widow") || text.includes("disability pension") || text.includes("nsap")) {
      matchedScheme = SCHEME_REGISTRY["national-social-assistance-pension"];
    } else if (text.includes("surya") || text.includes("solar") || text.includes("free electricity") || text.includes("rooftop")) {
      matchedScheme = SCHEME_REGISTRY["pm-surya-ghar-muft-bijli"];
    } else if (text.includes("atal") || text.includes("apy")) {
      matchedScheme = SCHEME_REGISTRY["atal-pension-yojana"];
    }

    if (matchedScheme) {
      const isEnglish = language === "en";
      const reply = isEnglish
        ? `**${matchedScheme.name}** is administered under the ${matchedScheme.sponsoringAgency}.\n\n**Key Benefits:**\n${matchedScheme.benefits.slice(0, 2).map(b => "• " + b).join("\n")}\n\n**Eligibility:**\n${matchedScheme.eligibilityCriteria.slice(0, 2).map(e => "• " + e).join("\n")}\n\n**Required Documents:** ${matchedScheme.requiredDocuments.slice(0, 3).join(", ")}.\n\nYou can check your preliminary eligibility directly or visit the official government portal.`
        : `**${matchedScheme.translations?.[language]?.name || matchedScheme.name}**:\n${matchedScheme.translations?.[language]?.shortDescription || matchedScheme.shortDescription}\n\nஅதிகாரப்பூர்வ அரசு போர்ட்டல் மூலம் விண்ணப்பிக்கலாம்.`;

      return {
        replyText: reply,
        intent: "SCHEME_INQUIRY",
        data: {
          scheme: {
            code: matchedScheme.code,
            name: matchedScheme.name,
            slug: matchedScheme.slug,
            category: matchedScheme.category,
            shortDescription: matchedScheme.shortDescription,
            overview: matchedScheme.overview,
            benefits: matchedScheme.benefits,
            eligibilityCriteria: matchedScheme.eligibilityCriteria,
            requiredDocuments: matchedScheme.requiredDocuments,
            officialPortalUrl: matchedScheme.officialPortalUrl,
            applicationMethod: matchedScheme.applicationMethod,
            detailsUrl: `/citizen/schemes/${matchedScheme.slug}`,
          },
        },
        suggestedActions: [
          { label: "View Scheme Details", prompt: "View Details", actionType: "NAVIGATE", url: `/citizen/schemes/${matchedScheme.slug}` },
          { label: "Check Eligibility", prompt: "Check Eligibility", actionType: "NAVIGATE", url: `/citizen/schemes/${matchedScheme.slug}?check=true` },
          { label: "Official Portal", prompt: "Go to Portal", actionType: "EXTERNAL_URL", url: matchedScheme.officialPortalUrl },
        ],
      };
    }

    // Multiple schemes search match
    const schemes = searchSchemes(text);
    const topSchemes = schemes.slice(0, 3);

    return {
      replyText: `I found ${topSchemes.length} verified government schemes relevant to your query. Select a scheme below to inspect statutory benefits, eligibility rules, and required documents:`,
      intent: "SCHEME_INQUIRY",
      data: {
        schemesList: topSchemes.map(s => ({
          code: s.code,
          name: s.name,
          slug: s.slug,
          category: s.category,
          benefitsSummary: s.benefits[0] || s.shortDescription,
          detailsUrl: `/citizen/schemes/${s.slug}`,
        })),
      },
      suggestedActions: [
        ...topSchemes.map(s => ({
          label: s.name.split(" (")[0].substring(0, 30),
          prompt: `Tell me more about ${s.name}`,
          actionType: "NAVIGATE" as const,
          url: `/citizen/schemes/${s.slug}`,
        })),
        { label: "Explore All Schemes", prompt: "Explore all schemes", actionType: "NAVIGATE" as const, url: "/citizen/schemes" },
      ],
    };
  }

  /**
   * Handle Service Inquiries & External Redirections
   */
  private async handleServiceInquiry(text: string, language: string): Promise<AssistantResponse> {
    // 1. Identity & External Services
    if (text.includes("aadhaar") || text.includes("aadhar") || text.includes("uidai")) {
      const srv = SERVICE_REGISTRY["SRV-ADH-001"];
      return {
        replyText:
          "**Aadhaar Demographic & Address Update** is an official service managed by the Unique Identification Authority of India (UIDAI).\n\n**Notice:** To safeguard biometric privacy and conform to UIDAI statutory security standards, demographic and address updates are processed directly on the official **myAadhaar UIDAI Portal**.\n\n**What you need:** Aadhaar Number, Active OTP Mobile, Valid Address Proof (PoA) in PDF/JPG format.",
        intent: "SERVICE_INQUIRY",
        data: {
          service: {
            code: srv.code,
            name: srv.name,
            departmentCode: srv.departmentCode,
            category: srv.category,
            description: srv.description,
            eligibility: srv.eligibility,
            estimatedDays: srv.estimatedDays,
            feeAmount: srv.feeAmount,
            isExternal: true,
            officialPortalUrl: srv.officialPortalUrl,
            requiredDocs: ["Aadhaar Card", "Valid Address Proof Document (PoA)"],
            optionalDocs: [],
            applyUrl: srv.officialPortalUrl || "https://myaadhaar.uidai.gov.in",
          },
        },
        suggestedActions: [
          { label: "Continue to Official UIDAI Portal", prompt: "Open UIDAI", actionType: "EXTERNAL_URL", url: "https://myaadhaar.uidai.gov.in" },
          { label: "Browse Other Services", prompt: "View Services", actionType: "NAVIGATE", url: "/citizen/services" },
        ],
      };
    }

    if (text.includes("pan card") || text.includes("pan application") || text.includes("e-pan")) {
      const srv = SERVICE_REGISTRY["SRV-PAN-002"];
      return {
        replyText:
          "**PAN Card Application & Instant e-PAN** is administered by the Income Tax Department via NSDL / UTIITSL.\n\n**Application Mode:** Handled through the official NSDL digital processing channel using Aadhaar paperless e-KYC.\n\n**Estimated Processing:** 10 working days (Instant e-PAN in 2 hours).",
        intent: "SERVICE_INQUIRY",
        data: {
          service: {
            code: srv.code,
            name: srv.name,
            departmentCode: srv.departmentCode,
            category: srv.category,
            description: srv.description,
            eligibility: srv.eligibility,
            estimatedDays: srv.estimatedDays,
            feeAmount: srv.feeAmount,
            isExternal: true,
            officialPortalUrl: srv.officialPortalUrl,
            requiredDocs: ["Aadhaar Card with mobile linked"],
            optionalDocs: [],
            applyUrl: srv.officialPortalUrl || "https://www.onlineservices.nsdl.com",
          },
        },
        suggestedActions: [
          { label: "Continue to NSDL Portal", prompt: "Open NSDL", actionType: "EXTERNAL_URL", url: srv.officialPortalUrl },
          { label: "Browse Services", prompt: "Browse", actionType: "NAVIGATE", url: "/citizen/services" },
        ],
      };
    }

    if (text.includes("driving license") || text.includes("driving licence") || text.includes("learner license") || text.includes("rc")) {
      const srv = SERVICE_REGISTRY["SRV-TRN-001"];
      return {
        replyText:
          "**Driving Licence & Vehicle Services** are governed by the Ministry of Road Transport and Highways (MoRTH) on the national **Parivahan Sewa** portal.\n\n**Services Available:** Learner's Licence, Driving Skill Test Slot Booking, Licence Renewal, Address Change, and RC Transfer.",
        intent: "SERVICE_INQUIRY",
        data: {
          service: {
            code: srv.code,
            name: srv.name,
            departmentCode: srv.departmentCode,
            category: srv.category,
            description: srv.description,
            eligibility: srv.eligibility,
            estimatedDays: srv.estimatedDays,
            feeAmount: srv.feeAmount,
            isExternal: true,
            officialPortalUrl: srv.officialPortalUrl,
            requiredDocs: ["Aadhaar Card", "Age Proof", "Medical Fitness Form 1A"],
            optionalDocs: [],
            applyUrl: srv.officialPortalUrl || "https://parivahan.gov.in",
          },
        },
        suggestedActions: [
          { label: "Continue to Parivahan Portal", prompt: "Open Parivahan", actionType: "EXTERNAL_URL", url: srv.officialPortalUrl },
          { label: "Browse Services", prompt: "Browse", actionType: "NAVIGATE", url: "/citizen/services" },
        ],
      };
    }

    // 2. Internal Certificate Services (Income, Domicile, Caste, Water, Trade, Birth)
    let serviceKey = "SRV-INC-001";
    if (text.includes("caste") || text.includes("community") || text.includes("obc") || text.includes("sc") || text.includes("st")) {
      serviceKey = "SRV-CAS-003";
    } else if (text.includes("domicile") || text.includes("residence") || text.includes("nativity")) {
      serviceKey = "SRV-DOM-002";
    } else if (text.includes("water") || text.includes("pipeline") || text.includes("pipe connection")) {
      serviceKey = "SRV-WTR-004";
    } else if (text.includes("trade") || text.includes("shop license") || text.includes("commercial permit")) {
      serviceKey = "SRV-TRD-005";
    } else if (text.includes("birth")) {
      serviceKey = "SRV-BRT-001";
    } else if (text.includes("land") || text.includes("patta") || text.includes("khasra") || text.includes("ror")) {
      serviceKey = "SRV-LND-001";
    } else if (text.includes("property tax") || text.includes("khata transfer")) {
      serviceKey = "SRV-MNC-001";
    } else if (text.includes("police verification") || text.includes("character certificate")) {
      serviceKey = "SRV-OTH-001";
    }

    const matchedService = SERVICE_REGISTRY[serviceKey] || SERVICE_REGISTRY["SRV-INC-001"];

    // Find in DB
    const dbService = await prisma.governmentService.findFirst({
      where: {
        OR: [
          { code: matchedService.code },
          { name: { contains: matchedService.name } },
        ],
      },
    });

    const targetServiceId = dbService?.id || matchedService.code;
    const requiredDocNames = matchedService.documents?.map((d) => d.name) || ["Identity Proof", "Address Proof"];

    return {
      replyText: `**${matchedService.name}** (${matchedService.code}) is administered by the Department of Revenue / Local Administration.\n\n**Description:** ${matchedService.description}\n\n**Eligibility:**\n${matchedService.eligibility.map((e) => "• " + e).join("\n")}\n\n**Mandatory Documents Required:**\n${requiredDocNames.map((d) => "• " + d).join("\n")}\n\n**Processing Timeline:** ${matchedService.estimatedDays} statutory working days (Fee: ${matchedService.feeAmount === 0 ? "Free / No Govt Fee" : "₹" + matchedService.feeAmount}).`,
      intent: "SERVICE_INQUIRY",
      data: {
        service: {
          code: matchedService.code,
          name: matchedService.name,
          id: targetServiceId,
          departmentCode: matchedService.departmentCode,
          category: matchedService.category,
          description: matchedService.description,
          eligibility: matchedService.eligibility,
          estimatedDays: matchedService.estimatedDays,
          feeAmount: matchedService.feeAmount,
          isExternal: false,
          requiredDocs: requiredDocNames,
          optionalDocs: [],
          applyUrl: `/citizen/services/${targetServiceId}/apply`,
        },
      },
      suggestedActions: [
        {
          label: `Apply Now: ${matchedService.name}`,
          prompt: `Apply for ${matchedService.name}`,
          actionType: "NAVIGATE",
          url: `/citizen/services/${targetServiceId}/apply`,
        },
        {
          label: "View Document Checklist",
          prompt: `What documents are required for ${matchedService.name}?`,
          actionType: "PROMPT",
        },
        {
          label: "Explore Government Schemes",
          prompt: "Show me relevant government schemes",
          actionType: "NAVIGATE",
          url: "/citizen/schemes",
        },
      ],
    };
  }

  /**
   * Handle dynamic checklist generation
   */
  private async handleChecklistInquiry(text: string, language: string): Promise<AssistantResponse> {
    if (text.includes("kisan")) {
      const s = SCHEME_REGISTRY["pm-kisan-samman-nidhi"];
      return this.formatChecklistResponse(s.name, s.requiredDocuments, "/citizen/schemes/" + s.slug);
    }
    if (text.includes("ayushman") || text.includes("pmjay")) {
      const s = SCHEME_REGISTRY["ayushman-bharat-pmjay"];
      return this.formatChecklistResponse(s.name, s.requiredDocuments, "/citizen/schemes/" + s.slug);
    }
    if (text.includes("caste") || text.includes("community")) {
      const s = SERVICE_REGISTRY["SRV-CAS-003"];
      return this.formatChecklistResponse(s.name, s.documents?.map(d => d.name) || [], "/citizen/services/SRV-CAS-003/apply");
    }
    if (text.includes("domicile") || text.includes("residence")) {
      const s = SERVICE_REGISTRY["SRV-DOM-002"];
      return this.formatChecklistResponse(s.name, s.documents?.map(d => d.name) || [], "/citizen/services/SRV-DOM-002/apply");
    }

    // Default Income Certificate checklist
    const s = SERVICE_REGISTRY["SRV-INC-001"];
    return this.formatChecklistResponse(s.name, s.documents?.map(d => d.name) || [], "/citizen/services/SRV-INC-001/apply");
  }

  private formatChecklistResponse(title: string, docs: string[], url: string): AssistantResponse {
    const checklistItems = [
      "Eligibility check & statutory age criteria",
      "Personal and residential identity details",
      "Valid active mobile number for OTP eKYC verification",
      ...docs,
      "Self-declaration / Citizen legal undertaking",
    ];

    return {
      replyText: `### 📋 PRE-SUBMISSION READINESS CHECKLIST: ${title}\n\nEnsure you have the following records verified before commencing your digital submission:\n\n${checklistItems.map(item => "☐ " + item).join("\n")}\n\nAll document scans must be in PDF, PNG, or JPG format (maximum 10MB per file).`,
      intent: "CHECKLIST",
      data: {
        checklist: {
          title,
          items: checklistItems,
          mandatoryDocuments: docs,
          optionalDocuments: [],
          instructions: "Upload clear scanned copies with all corners visible.",
        },
      },
      suggestedActions: [
        { label: "Proceed to Application", prompt: "Apply Now", actionType: "NAVIGATE", url },
        { label: "Check Relevant Schemes", prompt: "Show related schemes", actionType: "NAVIGATE", url: "/citizen/schemes" },
      ],
    };
  }

  /**
   * Handle Grievance Triage
   */
  private async handleGrievanceTriage(text: string, language: string): Promise<AssistantResponse> {
    let deptName = "Public Works & Infrastructure";
    let catName = "Potholes / Road Damage";
    let priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" = "MEDIUM";

    if (text.includes("water") || text.includes("pipeline") || text.includes("drainage") || text.includes("sewage")) {
      deptName = "Water Supply & Sanitation";
      catName = "Pipeline Leakage / Contaminated Water";
      priority = text.includes("leak") || text.includes("flooding") ? "HIGH" : "MEDIUM";
    } else if (text.includes("electricity") || text.includes("power") || text.includes("wire") || text.includes("transformer")) {
      deptName = "Power & Energy Distribution";
      catName = "Power Outage / Hazardous Exposed Wiring";
      priority = text.includes("spark") || text.includes("wire") || text.includes("shock") ? "URGENT" : "HIGH";
    } else if (text.includes("garbage") || text.includes("waste") || text.includes("clean") || text.includes("sanitation")) {
      deptName = "Municipal Corporation";
      catName = "Solid Waste Management / Public Hygiene";
      priority = "MEDIUM";
    } else if (text.includes("street light") || text.includes("light")) {
      deptName = "Public Works & Infrastructure";
      catName = "Defective Street Illumination";
      priority = "LOW";
    }

    const prefillParams = {
      title: text.length > 50 ? text.substring(0, 50) + "..." : text,
      category: catName,
      department: deptName,
      priority,
    };

    return {
      replyText: `I have classified this issue for the **${deptName}** under priority level **${priority}** (Category: ${catName}).\n\n**Next Step:** You can lodge an official grievance with optional photo evidence and GPS coordinates to trigger field officer inspection under the statutory SLA.\n\nWould you like me to open the prefilled grievance registration form?`,
      intent: "GRIEVANCE_GUIDE",
      data: {
        grievance: {
          suggestedDepartment: deptName,
          suggestedCategory: catName,
          priority,
          title: prefillParams.title,
          description: text,
          lodgeUrl: "/citizen/grievances/new",
          prefill: prefillParams,
        },
      },
      suggestedActions: [
        {
          label: "Lodge Grievance with 1-Click Prefill",
          prompt: "Lodge Grievance Now",
          actionType: "PREFILL",
          url: `/citizen/grievances/new?prefillTitle=${encodeURIComponent(prefillParams.title)}&prefillDept=${encodeURIComponent(deptName)}&prefillCat=${encodeURIComponent(catName)}&priority=${priority}`,
        },
        {
          label: "View My Existing Grievances",
          prompt: "Show my grievances",
          actionType: "NAVIGATE",
          url: "/citizen/grievances",
        },
      ],
    };
  }

  /**
   * Track Grievance by official token
   */
  private async trackGrievanceByToken(token: string): Promise<AssistantResponse> {
    const grievance = await prisma.grievance.findFirst({
      where: {
        OR: [
          { trackingNumber: token },
          { id: token },
        ],
      },
      include: {
        department: true,
      },
    });

    if (!grievance) {
      return {
        replyText: `I could not locate any active grievance matching tracking number **${token}**. Please verify the reference code (format: SETU-2026-WAT-XXXXXX) or check your dashboard.`,
        intent: "STATUS_TRACKING",
        suggestedActions: [
          { label: "View All My Grievances", prompt: "My Grievances", actionType: "NAVIGATE", url: "/citizen/grievances" },
        ],
      };
    }

    return {
      replyText: `### 📍 LIVE GRIEVANCE STATUS: ${grievance.trackingNumber}\n\n• **Subject:** ${grievance.title}\n• **Current Status:** ${grievance.status.replace(/_/g, " ")}\n• **Governing Department:** ${grievance.department?.name || "General Administration"}\n• **Priority:** ${grievance.priority}\n• **Submitted:** ${grievance.createdAt.toLocaleDateString()}\n• **Officer Remarks:** ${grievance.resolutionSummary || "Under departmental investigation"}`,
      intent: "STATUS_TRACKING",
      data: {
        tracking: [
          {
            type: "GRIEVANCE",
            identifier: grievance.trackingNumber,
            title: grievance.title,
            status: grievance.status,
            department: grievance.department?.name || "General Administration",
            officerRemarks: grievance.resolutionSummary,
            submittedAt: grievance.createdAt.toISOString(),
            slaDeadline: grievance.slaDeadline?.toISOString() || null,
            detailsUrl: `/citizen/grievances/${grievance.id}`,
          },
        ],
      },
      suggestedActions: [
        { label: "View Grievance Timeline", prompt: "View Details", actionType: "NAVIGATE", url: `/citizen/grievances/${grievance.id}` },
        { label: "Lodge New Issue", prompt: "New Grievance", actionType: "NAVIGATE", url: "/citizen/grievances/new" },
      ],
    };
  }

  /**
   * Track Service Application by official reference token
   */
  private async trackServiceApplicationByToken(token: string): Promise<AssistantResponse> {
    const app = await prisma.serviceApplication.findFirst({
      where: {
        OR: [
          { applicationNumber: token },
          { id: token },
        ],
      },
      include: {
        service: true,
        department: true,
      },
    });

    if (!app) {
      return {
        replyText: `No government service application found matching reference **${token}**. Please ensure the application number (e.g. SETU-SRV-2026-XXXXXX) is correct.`,
        intent: "STATUS_TRACKING",
        suggestedActions: [
          { label: "View My Applications", prompt: "My Applications", actionType: "NAVIGATE", url: "/citizen/applications" },
        ],
      };
    }

    return {
      replyText: `### 📜 SERVICE APPLICATION STATUS: ${app.applicationNumber}\n\n• **Service:** ${app.service.name}\n• **Status:** ${app.status.replace(/_/g, " ")}\n• **Department:** ${app.department.name}\n• **Submitted:** ${app.submittedAt.toLocaleDateString()}\n• **Officer Remarks:** ${app.officerRemarks || "Documents in verification queue."}`,
      intent: "STATUS_TRACKING",
      data: {
        tracking: [
          {
            type: "SERVICE_APPLICATION",
            identifier: app.applicationNumber,
            title: app.service.name,
            status: app.status,
            department: app.department.name,
            officerRemarks: app.officerRemarks,
            submittedAt: app.submittedAt.toISOString(),
            detailsUrl: `/citizen/applications/${app.id}`,
          },
        ],
      },
      suggestedActions: [
        { label: "View Application Dossier", prompt: "View Details", actionType: "NAVIGATE", url: `/citizen/applications/${app.id}` },
      ],
    };
  }

  /**
   * Summarize user's recent grievances and applications
   */
  private async trackUserRecentItems(userId: string): Promise<AssistantResponse> {
    const [recentGrievances, recentApps] = await Promise.all([
      prisma.grievance.findMany({
        where: { citizenId: userId },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { department: true },
      }),
      prisma.serviceApplication.findMany({
        where: { citizenId: userId },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { service: true, department: true },
      }),
    ]);

    if (recentGrievances.length === 0 && recentApps.length === 0) {
      return {
        replyText: "You currently have no active grievances or service applications on record. You can apply for certificates or lodge complaints directly from the portal.",
        intent: "STATUS_TRACKING",
        suggestedActions: [
          { label: "Browse Government Services", prompt: "Services", actionType: "NAVIGATE", url: "/citizen/services" },
          { label: "Explore Government Schemes", prompt: "Schemes", actionType: "NAVIGATE", url: "/citizen/schemes" },
          { label: "Lodge a Grievance", prompt: "Grievance", actionType: "NAVIGATE", url: "/citizen/grievances/new" },
        ],
      };
    }

    let summary = "### 📊 YOUR RECENT CITIZEN SUBMISSIONS\n\n";
    if (recentGrievances.length > 0) {
      summary += "**Public Grievances:**\n";
      recentGrievances.forEach((g) => {
        summary += `• **${g.trackingNumber}** (${g.title}): Status **${g.status.replace(/_/g, " ")}**\n`;
      });
      summary += "\n";
    }

    if (recentApps.length > 0) {
      summary += "**Service Applications:**\n";
      recentApps.forEach((a) => {
        summary += `• **${a.applicationNumber}** (${a.service.name}): Status **${a.status.replace(/_/g, " ")}**\n`;
      });
    }

    return {
      replyText: summary,
      intent: "STATUS_TRACKING",
      suggestedActions: [
        { label: "View All Applications", prompt: "My Applications", actionType: "NAVIGATE", url: "/citizen/applications" },
        { label: "View All Grievances", prompt: "My Grievances", actionType: "NAVIGATE", url: "/citizen/grievances" },
      ],
    };
  }
}

export const assistantService = new AssistantService();
export default assistantService;
