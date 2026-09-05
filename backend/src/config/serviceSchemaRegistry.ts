export type FieldRequirementType = "REQUIRED" | "OPTIONAL" | "CONDITIONAL";

export interface ServiceFieldDefinition {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  requirement: FieldRequirementType;
  placeholder?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
  condition?: {
    field: string;
    operator: "equals" | "not_equals" | "truthy" | "greater_than";
    value: any;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ServiceDocumentDefinition {
  code: string;
  name: string;
  description: string;
  requirement: "REQUIRED" | "OPTIONAL";
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

export interface ServiceDefinition {
  code: string;
  name: string;
  departmentCode: string;
  category: string;
  description: string;
  eligibility: string[];
  estimatedDays: number;
  feeAmount: number;
  isExternal?: boolean;
  officialPortalUrl?: string;
  applicationType?: "INTERNAL" | "EXTERNAL";
  targetAudience?: string;
  fields?: {
    personal: ServiceFieldDefinition[];
    contact: ServiceFieldDefinition[];
    address: ServiceFieldDefinition[];
    serviceSpecific: ServiceFieldDefinition[];
  };
  documents?: ServiceDocumentDefinition[];
  declarationText?: string;
  translations?: Record<
    string,
    {
      name?: string;
      description?: string;
      category?: string;
    }
  >;
}

export const SERVICE_CATEGORIES = [
  "All Categories",
  "Identity & Personal Documents",
  "Certificates",
  "Civil Registration",
  "Education",
  "Social Welfare",
  "Pension & Senior Citizen Services",
  "Employment",
  "Health Services",
  "Housing",
  "Revenue & Land Services",
  "Transport",
  "Utility Services",
  "Business & Licenses",
  "Agriculture",
  "Municipal Services",
  "Other Citizen Services",
];

export const SERVICE_REGISTRY: Record<string, ServiceDefinition> = {
  // 1. Identity & Personal Documents (EXTERNAL)
  "SRV-ADH-001": {
    code: "SRV-ADH-001",
    name: "Aadhaar Demographic & Address Update",
    departmentCode: "IDN",
    category: "Identity & Personal Documents",
    description: "Official update of demographic details (Name, Address, Date of Birth, Gender) in your Aadhaar profile through UIDAI digital portal.",
    eligibility: [
      "Any resident holding a valid 12-digit Aadhaar number with active mobile linked for OTP verification.",
      "Valid Supporting Document (PoA - Proof of Address, PoI - Proof of Identity) in acceptable UIDAI format.",
    ],
    estimatedDays: 15,
    feeAmount: 50,
    isExternal: true,
    officialPortalUrl: "https://myaadhaar.uidai.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "All Indian Residents with Aadhaar",
    translations: {
      ta: {
        name: "ஆதார் முகவரி மற்றும் விபரங்கள் புதுப்பித்தல்",
        description: "UIDAI போர்டல் மூலம் உங்கள் ஆதார் அட்டையில் பெயர், முகவரி மற்றும் பிறந்த தேதியை மாற்றவும்.",
        category: "அடையாள மற்றும் தனிநபர் ஆவணங்கள்"
      },
      hi: {
        name: "आधार जनसांख्यिकी एवं पता अपडेट",
        description: "यूआईडीएआई पोर्टल के माध्यम से अपने आधार में नाम, पता और जन्मतिथि अपडेट करें।",
        category: "पहचान और व्यक्तिगत दस्तावेज"
      }
    }
  },

  "SRV-PAN-002": {
    code: "SRV-PAN-002",
    name: "PAN Card Application & Instant e-PAN",
    departmentCode: "IDN",
    category: "Identity & Personal Documents",
    description: "Apply for a new Permanent Account Number (PAN) card or instant paperless e-PAN using Aadhaar e-KYC through NSDL / UTIITSL.",
    eligibility: [
      "Any individual citizen who does not already possess a PAN number.",
      "Valid Aadhaar number with mobile number linked.",
    ],
    estimatedDays: 10,
    feeAmount: 107,
    isExternal: true,
    officialPortalUrl: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    applicationType: "EXTERNAL",
    targetAudience: "Taxpayers, Professionals, Students",
    translations: {
      ta: {
        name: "புதிய பான் கார்டு விண்ணப்பம்",
        description: "புதிய பான் அட்டை அல்லது உடனடி இ-பான் பெற NSDL போர்ட்டல் மூலம் விண்ணப்பிக்கவும்.",
        category: "அடையாள மற்றும் தனிநபர் ஆவணங்கள்"
      },
      hi: {
        name: "पैन कार्ड आवेदन एवं त्वरित ई-पैन",
        description: "एनएसडीएल पोर्टल के माध्यम से नया पैन कार्ड या तत्काल ई-पैन प्राप्त करें।",
        category: "पहचान और व्यक्तिगत दस्तावेज"
      }
    }
  },

  "SRV-VTR-003": {
    code: "SRV-VTR-003",
    name: "Voter Registration & EPIC Card Download",
    departmentCode: "IDN",
    category: "Identity & Personal Documents",
    description: "New voter enrollment (Form 6), address shifting, or digital e-EPIC voter card download via Election Commission of India (ECI) portal.",
    eligibility: [
      "Indian citizen who has attained 18 years of age on the qualifying date.",
      "Resident of the assembly constituency where enrollment is sought.",
    ],
    estimatedDays: 30,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://voters.eci.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "Citizens 18+ years",
    translations: {
      ta: {
        name: "வாக்காளர் அடையாள அட்டை விண்ணப்பம் (Voter ID)",
        description: "புதிய வாக்காளர் பதிவு மற்றும் வாக்காளர் அடையாள அட்டை பதிவிறக்கம்.",
        category: "அடையாள மற்றும் தனிநபர் ஆவணங்கள்"
      },
      hi: {
        name: "मतदाता पंजीकरण एवं ई-एपिक डाउनलोड",
        description: "भारत निर्वाचन आयोग के माध्यम से नया वोटर कार्ड बनवाएं या डाउनलोड करें।",
        category: "पहचान और व्यक्तिगत दस्तावेज"
      }
    }
  },

  // 2. Certificates (INTERNAL 7-Step Wizard)
  "SRV-INC-001": {
    code: "SRV-INC-001",
    name: "Income Certificate",
    departmentCode: "REV",
    category: "Certificates",
    description: "Official governmental certification of annual family income from all verifiable sources for scholarships, fee waivers, subsidies, and welfare entitlements.",
    eligibility: [
      "Applicant must be a permanent resident of the State / Union Territory.",
      "Citizen or head of household declaring legitimate annual income.",
      "Valid identity proof and income proof (Salary slip, Form 16, or Village Revenue Officer endorsement).",
    ],
    estimatedDays: 7,
    feeAmount: 0,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Applicant", type: "text", requirement: "REQUIRED", validation: { min: 2, max: 100 } },
        { id: "fatherOrSpouseName", label: "Father's / Husband's Full Name", type: "text", requirement: "REQUIRED", validation: { min: 2, max: 100 } },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", requirement: "REQUIRED" },
        { id: "gender", label: "Gender", type: "select", requirement: "REQUIRED", options: [
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
          { value: "OTHER", label: "Other" },
        ]},
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED", validation: { pattern: "^[6-9]\\d{9}$", message: "10-digit mobile number" } },
        { id: "email", label: "Email Address", type: "text", requirement: "OPTIONAL" },
      ],
      address: [
        { id: "addressLine", label: "Residential Street Address", type: "text", requirement: "REQUIRED", validation: { min: 3 } },
        { id: "locality", label: "Village / Ward / Locality", type: "text", requirement: "REQUIRED" },
        { id: "district", label: "District / Tehsil", type: "text", requirement: "REQUIRED" },
        { id: "state", label: "State / UT", type: "text", requirement: "REQUIRED" },
        { id: "pincode", label: "Postal PIN Code", type: "text", requirement: "REQUIRED", validation: { pattern: "^[1-9][0-9]{5}$", message: "6-digit PIN code" } },
      ],
      serviceSpecific: [
        { id: "occupation", label: "Primary Occupation / Source of Livelihood", type: "text", requirement: "REQUIRED" },
        { id: "annualIncome", label: "Total Annual Household Income (in INR ₹)", type: "number", requirement: "REQUIRED", validation: { min: 0 } },
        { id: "isEmployedInGovt", label: "Is any family member in Government Service?", type: "boolean", requirement: "OPTIONAL" },
        {
          id: "govtDesignation",
          label: "Designation & Department of Govt Employee",
          type: "text",
          requirement: "CONDITIONAL",
          condition: { field: "isEmployedInGovt", operator: "truthy", value: true },
          validation: { min: 2 },
        },
        { id: "purposeOfCertificate", label: "Purpose of Certificate (e.g. Scholarship, Fee Concession, Subsidy)", type: "text", requirement: "REQUIRED" },
      ],
    },
    documents: [
      {
        code: "ID_PROOF",
        name: "Identity Proof",
        description: "Aadhaar Card / Voter ID / Passport / PAN Card",
        requirement: "REQUIRED",
        allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
        maxSizeBytes: 10 * 1024 * 1024,
      },
      {
        code: "ADDRESS_PROOF",
        name: "Address Proof",
        description: "Ration Card / Electricity Bill / Telephone Bill / Property Tax Receipt",
        requirement: "REQUIRED",
        allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
        maxSizeBytes: 10 * 1024 * 1024,
      },
      {
        code: "INCOME_PROOF",
        name: "Income Proof Document",
        description: "Salary Slip / Form 16 / Income Affidavit / Village Accountant Endorsement",
        requirement: "REQUIRED",
        allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
        maxSizeBytes: 10 * 1024 * 1024,
      },
    ],
    declarationText: "I hereby solemnly declare that the annual household income stated above is true, complete, and accurate. I understand that providing false declarations is punishable under the Indian Penal Code.",
    translations: {
      ta: {
        name: "வருமானச் சான்றிதழ்",
        description: "கல்வி உதவித்தொகை மற்றும் அரசு சலுகைகளுக்கான அதிகாரப்பூர்வ குடும்ப வருமான சான்றிதழ்.",
        category: "சான்றிதழ்கள்"
      },
      hi: {
        name: "आय प्रमाण पत्र",
        description: "छात्रवृत्ति, शुल्क छूट और सरकारी योजनाओं के लिए आधिकारिक आय प्रमाण पत्र।",
        category: "प्रमाण पत्र"
      }
    }
  },

  "SRV-DOM-002": {
    code: "SRV-DOM-002",
    name: "Domicile / Residence Certificate",
    departmentCode: "REV",
    category: "Certificates",
    description: "Statutory proof of continuous residential status in the State/UT for academic admissions, government employment quotas, and resident benefits.",
    eligibility: [
      "Resident of the State/UT continuously for a minimum of 5 to 15 years as per State domicile guidelines.",
      "Parents resided in the state or owns residential immovable property in the state.",
    ],
    estimatedDays: 10,
    feeAmount: 25,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Applicant", type: "text", requirement: "REQUIRED" },
        { id: "fatherOrSpouseName", label: "Father's / Mother's Name", type: "text", requirement: "REQUIRED" },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", requirement: "REQUIRED" },
        { id: "placeOfBirth", label: "Place of Birth (Town/Village & District)", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED", validation: { pattern: "^[6-9]\\d{9}$" } },
        { id: "email", label: "Email Address", type: "text", requirement: "OPTIONAL" },
      ],
      address: [
        { id: "addressLine", label: "Permanent Residential Address", type: "text", requirement: "REQUIRED" },
        { id: "locality", label: "Village / Ward / Locality", type: "text", requirement: "REQUIRED" },
        { id: "district", label: "District", type: "text", requirement: "REQUIRED" },
        { id: "state", label: "State / UT", type: "text", requirement: "REQUIRED" },
        { id: "pincode", label: "Postal PIN Code", type: "text", requirement: "REQUIRED", validation: { pattern: "^[1-9][0-9]{5}$" } },
      ],
      serviceSpecific: [
        { id: "yearsOfContinuousResidence", label: "Years of Continuous Residence in State", type: "number", requirement: "REQUIRED", validation: { min: 1 } },
        { id: "reasonForApplication", label: "Purpose / Reason for Certificate", type: "text", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "ID_PROOF", name: "Identity Proof (Aadhaar/Voter ID)", description: "Valid photo identity proof", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "RESIDENCE_PROOF", name: "Residence Proof / School Records", description: "Proof of residence spanning continuous years or School Leaving Certificate", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I certify that I am a bonafide resident of this State and the duration of stay stated above is accurate.",
    translations: {
      ta: {
        name: "இருப்பிடச் சான்றிதழ்",
        description: "கல்வி மற்றும் அரசு வேலைவாய்ப்புகளுக்கான அதிகாரப்பூர்வ இருப்பிடச் சான்றிதழ்.",
        category: "சான்றிதழ்கள்"
      },
      hi: {
        name: "निवास / अधिवास प्रमाण पत्र",
        description: "शिक्षा और सरकारी नौकरियों में निवासी कोटे के लिए आधिकारिक निवास प्रमाण पत्र।",
        category: "प्रमाण पत्र"
      }
    }
  },

  "SRV-CAS-003": {
    code: "SRV-CAS-003",
    name: "Community / Caste Certificate",
    departmentCode: "REV",
    category: "Certificates",
    description: "Official governmental validation of community / social category (SC, ST, OBC, MBC, EWS) for affirmative action benefits, admissions, and scholarships.",
    eligibility: [
      "Applicant must belong to recognized SC/ST/OBC/SEBC/EWS list of the State/Central Government.",
      "Valid parental community proof or ancestral revenue endorsement.",
    ],
    estimatedDays: 14,
    feeAmount: 0,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Applicant", type: "text", requirement: "REQUIRED" },
        { id: "fatherOrSpouseName", label: "Father's Full Name", type: "text", requirement: "REQUIRED" },
        { id: "motherName", label: "Mother's Full Name", type: "text", requirement: "REQUIRED" },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", requirement: "REQUIRED" },
        { id: "religion", label: "Religion", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED", validation: { pattern: "^[6-9]\\d{9}$" } },
        { id: "email", label: "Email Address", type: "text", requirement: "OPTIONAL" },
      ],
      address: [
        { id: "addressLine", label: "Permanent Residential Address", type: "text", requirement: "REQUIRED" },
        { id: "locality", label: "Village / Ward", type: "text", requirement: "REQUIRED" },
        { id: "district", label: "District", type: "text", requirement: "REQUIRED" },
        { id: "state", label: "State / UT", type: "text", requirement: "REQUIRED" },
        { id: "pincode", label: "PIN Code", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        {
          id: "communityCategory",
          label: "Caste / Category Claimed",
          type: "select",
          requirement: "REQUIRED",
          options: [
            { value: "SC", label: "Scheduled Caste (SC)" },
            { value: "ST", label: "Scheduled Tribe (ST)" },
            { value: "OBC", label: "Other Backward Class (OBC)" },
            { value: "EWS", label: "Economically Weaker Section (EWS)" },
            { value: "GENERAL", label: "General" },
          ],
        },
        { id: "subCaste", label: "Sub-Caste / Sub-Tribe Name", type: "text", requirement: "REQUIRED" },
        { id: "hasParentCertificate", label: "Does father/mother possess a verified Caste Certificate?", type: "boolean", requirement: "OPTIONAL" },
        {
          id: "parentCertificateNumber",
          label: "Parent's Caste Certificate Number",
          type: "text",
          requirement: "CONDITIONAL",
          condition: { field: "hasParentCertificate", operator: "truthy", value: true },
        },
      ],
    },
    documents: [
      { code: "ID_PROOF", name: "Applicant Identity Proof", description: "Aadhaar Card / School ID", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "PARENT_CASTE_PROOF", name: "Parental Community Record / School TC", description: "Father's Caste Certificate or Transfer Certificate indicating community", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I declare that the community claim made above is genuine and corresponds to official Gazette records.",
    translations: {
      ta: {
        name: "சாதிச் சான்றிதழ்",
        description: "கல்வி மற்றும் வேலைவாய்ப்பு இடஒதுக்கீடுகளுக்கான அதிகாரப்பூர்வ சாதிச் சான்றிதழ்.",
        category: "சான்றிதழ்கள்"
      },
      hi: {
        name: "जाति / समुदाय प्रमाण पत्र",
        description: "आरक्षण और सरकारी लाभों के लिए आधिकारिक जाति प्रमाण पत्र।",
        category: "प्रमाण पत्र"
      }
    }
  },

  // 3. Civil Registration (INTERNAL)
  "SRV-BRT-001": {
    code: "SRV-BRT-001",
    name: "Birth Certificate Registration & Certified Copy",
    departmentCode: "MNC",
    category: "Civil Registration",
    description: "Official registration of child birth with municipal/panchayat registrar and issuance of certified digital Birth Certificate.",
    eligibility: [
      "Parents or legal guardians of the child born within the municipal/panchayat jurisdiction.",
      "Hospital discharge slip or institutional birth report.",
    ],
    estimatedDays: 7,
    feeAmount: 20,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "childName", label: "Name of Child (if named)", type: "text", requirement: "OPTIONAL" },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", requirement: "REQUIRED" },
        { id: "gender", label: "Gender of Child", type: "select", requirement: "REQUIRED", options: [
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
        ]},
        { id: "placeOfBirth", label: "Place of Birth (Hospital Name / Residential Address)", type: "text", requirement: "REQUIRED" },
        { id: "fatherName", label: "Father's Full Name", type: "text", requirement: "REQUIRED" },
        { id: "motherName", label: "Mother's Full Name", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED", validation: { pattern: "^[6-9]\\d{9}$" } },
        { id: "email", label: "Email Address", type: "text", requirement: "OPTIONAL" },
      ],
      address: [
        { id: "addressLine", label: "Parents' Residential Address at Time of Birth", type: "text", requirement: "REQUIRED" },
        { id: "locality", label: "Locality / Ward", type: "text", requirement: "REQUIRED" },
        { id: "district", label: "District", type: "text", requirement: "REQUIRED" },
        { id: "state", label: "State", type: "text", requirement: "REQUIRED" },
        { id: "pincode", label: "PIN Code", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        { id: "hospitalRegistrationNo", label: "Hospital Discharge / Registration Number", type: "text", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "HOSPITAL_SLIP", name: "Hospital Discharge / Birth Slip", description: "Original birth slip from institutional medical facility", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "PARENTS_ID", name: "Parents Identity Proof (Aadhaar)", description: "Aadhaar of Mother and Father", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I verify that the birth event and particulars stated above occurred within the territorial jurisdiction and are accurate.",
    translations: {
      ta: {
        name: "பிறப்புச் சான்றிதழ் பதிவு",
        description: "நகராட்சி மற்றும் உள்ளாட்சி நிர்வாகத்தின் மூலம் பிறப்புச் சான்றிதழ் பதிவு மற்றும் நகல் பெறுதல்.",
        category: "குடிமைப் பதிவு"
      },
      hi: {
        name: "जन्म प्रमाण पत्र पंजीकरण",
        description: "नगर निगम या पंचायत के माध्यम से आधिकारिक जन्म प्रमाण पत्र पंजीकरण।",
        category: "नागरिक पंजीकरण"
      }
    }
  },

  // 4. Utility Services (INTERNAL)
  "SRV-WTR-004": {
    code: "SRV-WTR-004",
    name: "New Domestic Water Pipeline Connection",
    departmentCode: "WAT",
    category: "Utility Services",
    description: "Application for municipal potable piped water supply connection for residential households and housing societies.",
    eligibility: [
      "Property owner or authorized lawful tenant with owner NOC.",
      "Property must fall within the municipal water supply distribution grid.",
    ],
    estimatedDays: 14,
    feeAmount: 500,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Property Owner", type: "text", requirement: "REQUIRED" },
        { id: "fatherOrSpouseName", label: "Father's / Spouse's Name", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED", validation: { pattern: "^[6-9]\\d{9}$" } },
        { id: "email", label: "Email Address", type: "text", requirement: "OPTIONAL" },
      ],
      address: [
        { id: "addressLine", label: "Premises Address where Connection is Required", type: "text", requirement: "REQUIRED" },
        { id: "locality", label: "Ward / Municipal Zone", type: "text", requirement: "REQUIRED" },
        { id: "district", label: "District", type: "text", requirement: "REQUIRED" },
        { id: "state", label: "State", type: "text", requirement: "REQUIRED" },
        { id: "pincode", label: "PIN Code", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        { id: "propertyTaxId", label: "Property Tax Assessment / PID Number", type: "text", requirement: "REQUIRED" },
        { id: "pipeSizeInches", label: "Required Pipe Diameter (e.g. 0.5 inch, 0.75 inch)", type: "text", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "PROPERTY_OWNERSHIP", name: "Property Ownership Proof / Tax Receipt", description: "Latest Property Tax Receipt or Sale Deed", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "ID_PROOF", name: "Applicant Aadhaar Card", description: "Identity verification", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I agree to comply with all municipal water supply bylaws and pay meter consumption tariffs regularly.",
    translations: {
      ta: {
        name: "புதிய குடிநீர் குழாய் இணைப்பு",
        description: "வீட்டு உபயோகத்திற்கான புதிய நகராட்சி குடிநீர் குழாய் இணைப்பு விண்ணப்பம்.",
        category: "பயன்பாட்டுச் சேவைகள்"
      },
      hi: {
        name: "नया घरेलू नल जल कनेक्शन",
        description: "आवासीय भवनों के लिए नए नगर पालिका पेयजल कनेक्शन हेतु आवेदन।",
        category: "उपयोगिता सेवाएं"
      }
    }
  },

  // 5. Business & Licenses (INTERNAL)
  "SRV-TRD-005": {
    code: "SRV-TRD-005",
    name: "Municipal Commercial Trade License",
    departmentCode: "MNC",
    category: "Business & Licenses",
    description: "Statutory municipal trade permit required to operate commercial retail, eatery, warehouse, or service establishments.",
    eligibility: [
      "Proprietor, partner, or authorized signatory of the commercial establishment.",
      "Premises must conform to municipal master plan commercial zoning bylaws.",
    ],
    estimatedDays: 14,
    feeAmount: 1500,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Business Proprietor / Director", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Business Contact Mobile", type: "text", requirement: "REQUIRED", validation: { pattern: "^[6-9]\\d{9}$" } },
        { id: "email", label: "Official Business Email", type: "text", requirement: "REQUIRED" },
      ],
      address: [
        { id: "addressLine", label: "Commercial Premises Address", type: "text", requirement: "REQUIRED" },
        { id: "locality", label: "Ward / Zone", type: "text", requirement: "REQUIRED" },
        { id: "district", label: "District", type: "text", requirement: "REQUIRED" },
        { id: "state", label: "State", type: "text", requirement: "REQUIRED" },
        { id: "pincode", label: "PIN Code", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        { id: "businessName", label: "Trade / Enterprise Name", type: "text", requirement: "REQUIRED" },
        { id: "natureOfTrade", label: "Nature of Trade / Commercial Activity", type: "text", requirement: "REQUIRED" },
        { id: "builtUpAreaSqFt", label: "Total Commercial Area (in Sq. Ft)", type: "number", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "PREMISES_PROOF", name: "Premises Ownership / Rent Agreement", description: "Lease agreement or property tax receipt", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "PAN_PROOF", name: "Proprietor / Firm PAN Card", description: "PAN verification", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I certify that the business conforms to local commercial regulations, fire safety protocols, and health standards.",
    translations: {
      ta: {
        name: "நகராட்சி வணிக உரிமம் (Trade License)",
        description: "வணிக நிறுவனங்கள் மற்றும் கடைகள் நடத்துவதற்கான நகராட்சி வர்த்தக உரிமம்.",
        category: "வணிகம் மற்றும் உரிமங்கள்"
      },
      hi: {
        name: "नगर निगम व्यापार लाइसेंस (Trade License)",
        description: "दुकानों एवं व्यावसायिक प्रतिष्ठानों के संचालन हेतु आधिकारिक म्यूनिसिपल ट्रेड लाइसेंस।",
        category: "व्यापार एवं लाइसेंस"
      }
    }
  },

  // 6. Transport (EXTERNAL)
  "SRV-TRN-001": {
    code: "SRV-TRN-001",
    name: "Driving Licence & Vehicle Registration (Parivahan Sewa)",
    departmentCode: "TRN",
    category: "Transport",
    description: "Apply for Learner's Licence, Permanent Driving Licence, Renewal, or Vehicle RC Transfer via MoRTH Sarathi & Vahan portals.",
    eligibility: [
      "Learner's Licence: Age 16+ for gearless 50cc two-wheeler, 18+ for light motor vehicle.",
      "Permanent Licence: Valid Learner's Licence held for minimum 30 days.",
    ],
    estimatedDays: 15,
    feeAmount: 200,
    isExternal: true,
    officialPortalUrl: "https://parivahan.gov.in/parivahan//en/content/driving-licence-0",
    applicationType: "EXTERNAL",
    targetAudience: "Vehicle Owners, Drivers",
    translations: {
      ta: {
        name: "ஓட்டுநர் உரிமம் மற்றும் வாகனப் பதிவு (பரிவாஹன்)",
        description: "பரிவாஹன் போர்ட்டல் மூலம் ஓட்டுநர் உரிமம் விண்ணப்பித்தல் மற்றும் புதுப்பித்தல்.",
        category: "போக்குவரத்து"
      },
      hi: {
        name: "ड्राइविंग लाइसेंस एवं वाहन पंजीकरण (परिवहन सेवा)",
        description: "परिवहन पोर्टल के माध्यम से ड्राइविंग लाइसेंस एवं आरसी सेवाएं प्राप्त करें।",
        category: "परिवहन"
      }
    }
  },

  // 7. Health Services (EXTERNAL)
  "SRV-HLT-001": {
    code: "SRV-HLT-001",
    name: "Ayushman Card Generation (ABHA & PM-JAY)",
    departmentCode: "HLT",
    category: "Health Services",
    description: "Create your Ayushman Bharat Health Account (ABHA ID) or generate PM-JAY Golden Card for ₹5 Lakh cashless hospital treatment.",
    eligibility: [
      "Beneficiaries registered under SECC 2011, NFSA ration card holders, or all senior citizens 70+ years.",
    ],
    estimatedDays: 1,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://beneficiary.nha.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "All Citizens & Vulnerable Families",
    translations: {
      ta: {
        name: "ஆயுஷ்மான் கார்டு உருவாக்கம் (AB-PMJAY)",
        description: "₹5 லட்சம் வரை மருத்துவ சிகிச்சை பெற ஆயுஷ்மான் அட்டை பதிவிறக்கம் செய்யவும்.",
        category: "சுகாதார சேவைகள்"
      },
      hi: {
        name: "आयुष्मान कार्ड जनरेशन (ABHA एवं PM-JAY)",
        description: "₹5 लाख तक के मुफ्त इलाज के लिए अपना आयुष्मान कार्ड डाउनलोड करें।",
        category: "स्वास्थ्य सेवाएं"
      }
    }
  },

  // 8. Education & Scholarships (EXTERNAL)
  "SRV-EDU-001": {
    code: "SRV-EDU-001",
    name: "National & State Scholarship Applications",
    departmentCode: "EDU",
    category: "Education",
    description: "One-stop application for central and state government pre-matric, post-matric, and higher education scholarships.",
    eligibility: [
      "Students enrolled in recognized schools, colleges, and polytechnics meeting scheme-specific merit and income limits.",
    ],
    estimatedDays: 30,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://scholarships.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "School & College Students",
    translations: {
      ta: {
        name: "அரசு கல்வி உதவித்தொகை விண்ணப்பம்",
        description: "பள்ளி மற்றும் கல்லூரி மாணவர்களுக்கான மத்திய, மாநில கல்வி உதவித்தொகைகள்.",
        category: "கல்வி"
      },
      hi: {
        name: "राष्ट्रीय एवं राज्य छात्रवृत्ति आवेदन",
        description: "स्कूली एवं कॉलेज छात्रों के लिए आधिकारिक छात्रवृत्ति आवेदन।",
        category: "शिक्षा"
      }
    }
  },

  // 9. Social Welfare (EXTERNAL)
  "SRV-WLF-001": {
    code: "SRV-WLF-001",
    name: "Unique Disability ID (UDID) Card",
    departmentCode: "SOC",
    category: "Social Welfare",
    description: "National database and digital identity card for Persons with Disabilities (PwD) for seamless government entitlements.",
    eligibility: [
      "Any person with benchmark disability certified by a government medical authority.",
    ],
    estimatedDays: 30,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://www.swavlambancard.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "Persons with Disabilities (PwD)",
    translations: {
      ta: {
        name: "மாற்றுத்திறனாளிகளுக்கான தனித்துவ அடையாள அட்டை (UDID)",
        description: "மாற்றுத்திறனாளிகளுக்கான மத்திய அரசின் தேசிய UDID அட்டை விண்ணப்பம்.",
        category: "சமூக நலம்"
      },
      hi: {
        name: "विशिष्ट दिव्यांगता पहचान पत्र (UDID Card)",
        description: "दिव्यांगजनों के लिए सरकारी लाभ हेतु राष्ट्रीय यूडीआईडी कार्ड।",
        category: "समाज कल्याण"
      }
    }
  },

  // 10. Pension & Senior Citizen Services (EXTERNAL)
  "SRV-PEN-001": {
    code: "SRV-PEN-001",
    name: "National Social Assistance Old Age & Widow Pension",
    departmentCode: "SOC",
    category: "Pension & Senior Citizen Services",
    description: "Monthly direct pension for BPL senior citizens (60+), destitute widows (40+), and disabled citizens under NSAP.",
    eligibility: [
      "Citizens belonging to Below Poverty Line (BPL) households meeting age criteria.",
    ],
    estimatedDays: 30,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://nsap.nic.in",
    applicationType: "EXTERNAL",
    targetAudience: "Senior Citizens, Widows, BPL Families",
    translations: {
      ta: {
        name: "தேசிய சமூக பாதுகாப்பு முதியோர் ஓய்வூதியம்",
        description: "வறுமைக்கோட்டிற்கு கீழ் உள்ள முதியோர் மற்றும் விதவைகளுக்கான மாதாந்திர ஓய்வூதியம்.",
        category: "ஓய்வூதியம் மற்றும் மூத்த குடிமக்கள்"
      },
      hi: {
        name: "राष्ट्रीय वृद्धावस्था एवं विधवा पेंशन (NSAP)",
        description: "बीपीएल वृद्धजनों एवं विधवाओं के लिए मासिक सामाजिक सुरक्षा पेंशन।",
        category: "पेंशन एवं वरिष्ठ नागरिक"
      }
    }
  },

  // 11. Employment (EXTERNAL)
  "SRV-EMP-001": {
    code: "SRV-EMP-001",
    name: "National Career Service (NCS) Jobseeker Registration",
    departmentCode: "EMP",
    category: "Employment",
    description: "Register with Ministry of Labour & Employment's National Career Service portal for public and private sector employment opportunities.",
    eligibility: [
      "Any Indian jobseeker seeking employment, apprenticeship, or vocational skill training.",
    ],
    estimatedDays: 1,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://www.ncs.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "Jobseekers, Graduates, Skilled Technicians",
    translations: {
      ta: {
        name: "தேசிய வேலைவாய்ப்பு சேவை பதிவு (NCS)",
        description: "அரசு மற்றும் தனியார் வேலைவாய்ப்புகளுக்கு பதிவு செய்யவும்.",
        category: "வேலைவாய்ப்பு"
      },
      hi: {
        name: "राष्ट्रीय कैरियर सेवा (NCS) रोजगार पंजीकरण",
        description: "सरकारी और निजी नौकरियों के लिए राष्ट्रीय रोजगार पोर्टल पर पंजीकरण।",
        category: "रोजगार"
      }
    }
  },

  // 12. Housing (EXTERNAL)
  "SRV-HSG-001": {
    code: "SRV-HSG-001",
    name: "Pradhan Mantri Awas Yojana Housing Assistance",
    departmentCode: "HSG",
    category: "Housing",
    description: "Financial grant for rural pucca house construction or urban interest subsidy under PMAY.",
    eligibility: [
      "Families not owning a pucca house anywhere in India with annual household income under prescribed EWS/LIG limits.",
    ],
    estimatedDays: 60,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://pmaymis.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "Homeless Families, EWS/LIG",
    translations: {
      ta: {
        name: "பிரதமர் ஆவாஸ் யோஜனா வீட்டு வசதி திட்டம்",
        description: "சொந்தமாக கான்கிரீட் வீடு கட்ட அரசு நிதி உதவி விண்ணப்பம்.",
        category: "வீட்டு வசதி"
      },
      hi: {
        name: "प्रधानमंत्री आवास योजना गृह सहायता",
        description: "पक्का मकान बनाने हेतु सरकारी वित्तीय अनुदान एवं सब्सिडी।",
        category: "आवास"
      }
    }
  },

  // 13. Revenue & Land Services (INTERNAL)
  "SRV-LND-001": {
    code: "SRV-LND-001",
    name: "Land Records RoR / Patta Extract & Mutation",
    departmentCode: "REV",
    category: "Revenue & Land Services",
    description: "Application for certified Record of Rights (RoR / Khatauni / Patta) and land revenue record mutation upon property transfer.",
    eligibility: [
      "Registered property / agricultural land owner or legal heir.",
    ],
    estimatedDays: 21,
    feeAmount: 100,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Landowner", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED" },
      ],
      address: [
        { id: "district", label: "District", type: "text", requirement: "REQUIRED" },
        { id: "tehsilOrTaluk", label: "Tehsil / Taluk", type: "text", requirement: "REQUIRED" },
        { id: "village", label: "Village / Revenue Ward", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        { id: "surveyNumber", label: "Survey / Khasra / Plot Number", type: "text", requirement: "REQUIRED" },
        { id: "subdivisionNumber", label: "Subdivision / Khata Number", type: "text", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "DEED_COPY", name: "Sale Deed / Title Deed Copy", description: "Proof of ownership", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I solemnly verify that the land survey details submitted are accurate.",
    translations: {
      ta: {
        name: "பட்டா சிட்டா / நில ஆவணங்கள் நகல்",
        description: "வருவாய்த் துறையின் அதிகாரப்பூர்வ பட்டா மற்றும் நில ஆவணங்கள் பெறுதல்.",
        category: "வருவாய் மற்றும் நிலச் சேவைகள்"
      },
      hi: {
        name: "भू-अभिलेख / खतौनी एवं नामांतरण",
        description: "राजस्व विभाग से प्रमाणित खतौनी / भू-नक्शा और नामांतरण आवेदन।",
        category: "राजस्व एवं भूमि सेवाएं"
      }
    }
  },

  // 14. Agriculture (EXTERNAL)
  "SRV-AGR-001": {
    code: "SRV-AGR-001",
    name: "Kisan Credit Card (KCC) & Agri Subsidy",
    departmentCode: "AGR",
    category: "Agriculture",
    description: "Concessional institutional crop loans, fertilizer subsidies, and PM-KISAN enrollment for cultivating farmers.",
    eligibility: [
      "All owner cultivators, tenant farmers, oral lessees, and SHG joint liability groups.",
    ],
    estimatedDays: 14,
    feeAmount: 0,
    isExternal: true,
    officialPortalUrl: "https://pmkisan.gov.in",
    applicationType: "EXTERNAL",
    targetAudience: "Farmers, Cultivators, Dairy & Fishery Workers",
    translations: {
      ta: {
        name: "கிசான் கிரெடிட் கார்டு (KCC விவசாய கடன்)",
        description: "குறைந்த வட்டி விவசாய கடன்களுக்கான கிசான் கடன் அட்டை விண்ணப்பம்.",
        category: "விவசாயம்"
      },
      hi: {
        name: "किसान क्रेडिट कार्ड (KCC) एवं कृषि सब्सिडी",
        description: "रियायती फसली ऋण और कृषि सब्सिडी हेतु आवेदन।",
        category: "कृषि"
      }
    }
  },

  // 15. Municipal Services (INTERNAL)
  "SRV-MNC-001": {
    code: "SRV-MNC-001",
    name: "Property Tax Name Transfer (Khata Transfer)",
    departmentCode: "MNC",
    category: "Municipal Services",
    description: "Transfer of registered property tax assessment name upon purchase, inheritance, or gift deed transfer.",
    eligibility: [
      "New legal owner of the property possessing registered title deed.",
      "All prior municipal property tax dues must be cleared.",
    ],
    estimatedDays: 21,
    feeAmount: 250,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "New Property Owner Full Name", type: "text", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED" },
      ],
      address: [
        { id: "propertyAddress", label: "Property Physical Address", type: "text", requirement: "REQUIRED" },
        { id: "wardNumber", label: "Ward Number", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        { id: "propertyPid", label: "Property Tax Assessment / PID Number", type: "text", requirement: "REQUIRED" },
        { id: "transferMode", label: "Mode of Transfer (Sale Deed / Inheritance / Gift)", type: "text", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "REGISTERED_DEED", name: "Registered Sale Deed / Title Deed", description: "Registered deed copy", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "LATEST_TAX_RECEIPT", name: "Latest Property Tax Paid Receipt", description: "Proof of clear tax arrears", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I undertake that the property transfer is legitimate and all presented deeds are registered with the Sub-Registrar.",
    translations: {
      ta: {
        name: "சொத்து வரி பெயர் மாற்றம்",
        description: "நகராட்சி சொத்து வரி பதிவேட்டில் புதிய உரிமையாளர் பெயர் மாற்றம் செய்தல்.",
        category: "நகராட்சி சேவைகள்"
      },
      hi: {
        name: "संपत्ति कर नाम परिवर्तन (म्यूटेशन)",
        description: "नगर पालिका रिकॉर्ड में संपत्ति करदाता के नाम का नामांतरण।",
        category: "नगर पालिका सेवाएं"
      }
    }
  },

  // 16. Other Citizen Services (INTERNAL)
  "SRV-OTH-001": {
    code: "SRV-OTH-001",
    name: "Police Verification & Character Clearance",
    departmentCode: "ADM",
    category: "Other Citizen Services",
    description: "Official police background verification clearance certificate for private employment, foreign travel, or tenant verification.",
    eligibility: [
      "Resident with valid proof of identity and clean judicial record.",
    ],
    estimatedDays: 14,
    feeAmount: 250,
    isExternal: false,
    applicationType: "INTERNAL",
    fields: {
      personal: [
        { id: "applicantName", label: "Full Name of Applicant", type: "text", requirement: "REQUIRED" },
        { id: "fatherName", label: "Father's Name", type: "text", requirement: "REQUIRED" },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", requirement: "REQUIRED" },
      ],
      contact: [
        { id: "mobileNumber", label: "Mobile Number", type: "text", requirement: "REQUIRED" },
      ],
      address: [
        { id: "addressLine", label: "Current Residential Address", type: "text", requirement: "REQUIRED" },
        { id: "policeStationJurisdiction", label: "Local Police Station Jurisdiction", type: "text", requirement: "REQUIRED" },
      ],
      serviceSpecific: [
        { id: "purposeOfVerification", label: "Purpose of Clearance Certificate", type: "text", requirement: "REQUIRED" },
        { id: "hasCriminalCases", label: "Are there any pending criminal proceedings?", type: "boolean", requirement: "REQUIRED" },
      ],
    },
    documents: [
      { code: "ID_PROOF", name: "Aadhaar Card / Passport", description: "Identity document", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
      { code: "ADDRESS_PROOF", name: "Address Proof Document", description: "Proof of residence", requirement: "REQUIRED", allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeBytes: 10 * 1024 * 1024 },
    ],
    declarationText: "I solemnly affirm that I have not been convicted by any court of law and the details provided are true.",
    translations: {
      ta: {
        name: "காவல்துறை நன்னடத்தைச் சான்றிதழ்",
        description: "வேலைவாய்ப்பு மற்றும் வெளிநாட்டுப் பயணத்திற்கான காவல்துறை சரிபார்ப்புச் சான்றிதழ்.",
        category: "பிற குடிமக்கள் சேவைகள்"
      },
      hi: {
        name: "पुलिस सत्यापन एवं चरित्र प्रमाण पत्र",
        description: "रोजगार एवं पासपोर्ट सत्यापन हेतु आधिकारिक पुलिस चरित्र प्रमाण पत्र।",
        category: "अन्य नागरिक सेवाएं"
      }
    }
  }
};

/**
 * Retrieve schema definition by service code
 */
export function getServiceSchema(serviceCode: string): ServiceDefinition | undefined {
  return SERVICE_REGISTRY[serviceCode];
}

/**
 * Search services by query and category
 */
export function searchServices(query?: string, category?: string): ServiceDefinition[] {
  let list = Object.values(SERVICE_REGISTRY);

  if (category && category !== "All Categories" && category !== "ALL") {
    list = list.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Validate a submission payload against the service definition schema
 */
export function validateServiceApplicationPayload(
  schema: ServiceDefinition,
  formData: Record<string, any>,
  uploadedDocs: Array<{ documentType: string; fileUrl: string }>
): { isValid: boolean; missingFields: string[]; missingDocs: string[]; errors: string[] } {
  const missingFields: string[] = [];
  const missingDocs: string[] = [];
  const errors: string[] = [];

  if (!schema.fields) {
    return { isValid: true, missingFields: [], missingDocs: [], errors: [] };
  }

  const allSections = [
    ...(schema.fields.personal || []),
    ...(schema.fields.contact || []),
    ...(schema.fields.address || []),
    ...(schema.fields.serviceSpecific || []),
  ];

  for (const field of allSections) {
    if (field.requirement === "REQUIRED") {
      const val = formData[field.id];
      if (val === undefined || val === null || String(val).trim() === "") {
        missingFields.push(field.label);
      }
    } else if (field.requirement === "CONDITIONAL" && field.condition) {
      const triggerVal = formData[field.condition.field];
      let conditionMet = false;
      if (field.condition.operator === "truthy") {
        conditionMet = Boolean(triggerVal);
      } else if (field.condition.operator === "equals") {
        conditionMet = triggerVal === field.condition.value;
      }

      if (conditionMet) {
        const val = formData[field.id];
        if (val === undefined || val === null || String(val).trim() === "") {
          missingFields.push(`${field.label} (Required based on your selection)`);
        }
      }
    }
  }

  // Validate required documents
  if (schema.documents) {
    for (const doc of schema.documents) {
      if (doc.requirement === "REQUIRED") {
        const isAttached = uploadedDocs.some(
          (u) => u.documentType === doc.code || u.documentType === doc.name
        );
        if (!isAttached) {
          missingDocs.push(doc.name);
        }
      }
    }
  }

  const isValid = missingFields.length === 0 && missingDocs.length === 0 && errors.length === 0;

  return {
    isValid,
    missingFields,
    missingDocs,
    errors,
  };
}
