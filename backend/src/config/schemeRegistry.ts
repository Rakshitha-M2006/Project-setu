export interface SchemeDefinition {
  code: string;
  name: string;
  slug: string;
  category: string;
  departmentCode?: string;
  shortDescription: string;
  overview: string;
  benefits: string[];
  eligibilityCriteria: string[];
  eligibilityRules?: {
    ageMin?: number;
    ageMax?: number;
    maxIncome?: number;
    allowedOccupations?: string[];
    gender?: "ALL" | "FEMALE" | "MALE";
    stateScope?: string;
    bplRequired?: boolean;
    landHoldingRequired?: boolean;
    studentRequired?: boolean;
  };
  requiredDocuments: string[];
  applicationMethod: "ONLINE" | "OFFICIAL_PORTAL" | "SETU_INTEGRATED" | "IN_PERSON";
  officialPortalUrl: string;
  targetAudience: string;
  sponsoringAgency: string;
  stateScope: string;
  isActive: boolean;
  lastUpdated: string;
  translations?: Record<
    string,
    {
      name?: string;
      shortDescription?: string;
      overview?: string;
      benefits?: string[];
      eligibilityCriteria?: string[];
      targetAudience?: string;
    }
  >;
}

export const SCHEME_REGISTRY: Record<string, SchemeDefinition> = {
  "pm-kisan-samman-nidhi": {
    code: "SCHEME-PM-KISAN-001",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    slug: "pm-kisan-samman-nidhi",
    category: "Agriculture & Rural Development",
    departmentCode: "AGR",
    shortDescription: "Direct annual income support of ₹6,000 in 3 installments to all landholding farmer families across India.",
    overview: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector Scheme providing income support to all landholding farmer families in the country to supplement their financial needs for procuring agricultural inputs and domestic necessities. The entire financial liability is borne by Government of India.",
    benefits: [
      "Guaranteed financial benefit of ₹6,000 per annum per eligible farmer family.",
      "Disbursed in 3 equal installments of ₹2,000 every four months directly into Aadhaar-seeded bank accounts.",
      "100% Direct Benefit Transfer (DBT) with zero intermediary leakages.",
      "Access to Kisan Credit Card (KCC) with concessional agricultural loan interest rates."
    ],
    eligibilityCriteria: [
      "All landholding farmer families with cultivable landholding registered in their names.",
      "Both small/marginal and other landholding farmers are eligible subject to statutory exclusions.",
      "Exclusions: Institutional landholders, farmer families holding constitutional posts, former/present Ministers, MPs, MLAs, Mayors, Chairpersons of District Panchayats.",
      "Exclusions: Serving or retired officers and employees of Central/State Government, all income tax payees in last assessment year, professionals like Doctors, Engineers, Lawyers, Chartered Accountants."
    ],
    eligibilityRules: {
      ageMin: 18,
      allowedOccupations: ["FARMER", "AGRICULTURE", "SELF_EMPLOYED"],
      maxIncome: 500000,
      landHoldingRequired: true,
    },
    requiredDocuments: [
      "Aadhaar Card (Mandatory for identity & DBT verification)",
      "Land Ownership Record (Khatauni / Record of Rights - RoR)",
      "Active Aadhaar-Linked Savings Bank Account Passbook",
      "Registered Mobile Number (for OTP eKYC validation)"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://pmkisan.gov.in",
    targetAudience: "Small & Marginal Farmers, Cultivators",
    sponsoringAgency: "Ministry of Agriculture & Farmers Welfare, Government of India",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-15",
    translations: {
      ta: {
        name: "பிரதமர் கிசான் சம்மான் நிதி (PM-KISAN)",
        shortDescription: "நிலமுள்ள விவசாய குடும்பங்களுக்கு ஆண்டுதோறும் ₹6,000 நேரடி வருமான ஆதரவு.",
        targetAudience: "விவசாயிகள் மற்றும் நில உரிமையாளர்கள்"
      },
      hi: {
        name: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
        shortDescription: "देश के सभी पात्र भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 की सीधी वित्तीय सहायता।",
        targetAudience: "किसान एवं काश्तकार"
      },
      te: {
        name: "ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)",
        shortDescription: "భూమి కలిగిన రైతు కుటుంబాలకు ఏటా ₹6,000 ప్రత్యక్ష ఆదాయ సహాయం.",
        targetAudience: "రైతులు మరియు వ్యవసాయదారులు"
      },
      kn: {
        name: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ (PM-KISAN)",
        shortDescription: "ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹6,000 ನೇರ ಆದಾಯ ಬೆಂಬಲ.",
        targetAudience: "ರೈತರು ಮತ್ತು ಕೃಷಿಕರು"
      }
    }
  },

  "ayushman-bharat-pmjay": {
    code: "SCHEME-PM-JAY-002",
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    slug: "ayushman-bharat-pmjay",
    category: "Health & Wellness",
    departmentCode: "HLT",
    shortDescription: "Cashless secondary and tertiary healthcare coverage of up to ₹5 Lakh per family per year across 27,000+ empaneled hospitals.",
    overview: "Ayushman Bharat PM-JAY is the world's largest government-funded health assurance scheme. It provides a health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families (approximately 55 crore beneficiaries) across India.",
    benefits: [
      "Cashless and paperless access to healthcare services at the point of care in public and empaneled private hospitals.",
      "Comprehensive coverage of up to ₹5,00,000 per family per year on a family floater basis.",
      "Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses including diagnostics and medicines.",
      "No restriction on family size, age, or gender; all pre-existing conditions are covered from day one.",
      "Universal ₹5 Lakh coverage extension for all senior citizens aged 70 years and above irrespective of family income."
    ],
    eligibilityCriteria: [
      "Families listed in the Socio-Economic Caste Census (SECC 2011) database under specified deprivation categories.",
      "Active National Food Security Act (NFSA) / State Antyodaya Anna Yojana (AAY) & Priority Household (PHH) ration card holders.",
      "All senior citizens aged 70 and above residing in India (Ayushman Vay Vandana Card)."
    ],
    eligibilityRules: {
      maxIncome: 350000,
    },
    requiredDocuments: [
      "Aadhaar Card (or other recognized government photo identity card)",
      "Ration Card (NFSA / State PDS card with family member details)",
      "Active Mobile Number for e-KYC verification"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://pmjay.gov.in",
    targetAudience: "Economically Weaker Families & Senior Citizens (70+)",
    sponsoringAgency: "National Health Authority, Ministry of Health & Family Welfare, GoI",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-20",
    translations: {
      ta: {
        name: "ஆயுஷ்மான் பாரத் - பிரதம மந்திரி ஜன் ஆரோக்கிய திட்டம் (AB-PMJAY)",
        shortDescription: "குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவ சிகிச்சை காப்பீடு.",
        targetAudience: "ஏழை எளிய குடும்பங்கள் மற்றும் 70+ முதியவர்கள்"
      },
      hi: {
        name: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)",
        shortDescription: "प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस द्वितीयक और तृतीयक स्वास्थ्य बीमा कवर।",
        targetAudience: "आर्थिक रूप से कमजोर परिवार और 70+ वरिष्ठ नागरिक"
      },
      te: {
        name: "ఆయుష్మాన్ భారత్ - ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన (AB-PMJAY)",
        shortDescription: "ప్రతి కుటుంబానికి ఏడాదికి ₹5 లక్షల వరకు ఉచిత నగదు రహిత ఆరోగ్య బీమా.",
        targetAudience: "పేద కుటుంబాలు మరియు 70+ వయోవృద్ధులు"
      }
    }
  },

  "pradhan-mantri-awas-yojana": {
    code: "SCHEME-PMAY-003",
    name: "Pradhan Mantri Awas Yojana (PMAY Urban & Gramin)",
    slug: "pradhan-mantri-awas-yojana",
    category: "Housing & Shelter",
    departmentCode: "HSG",
    shortDescription: "Financial assistance and interest subsidies for constructing pucca houses with clean water, sanitation, and electricity.",
    overview: "PMAY addresses the housing shortage among the Economically Weaker Section (EWS), Low Income Group (LIG), and Middle Income Groups (MIG) by providing financial grants for rural house construction and interest subsidies on home loans in urban regions.",
    benefits: [
      "Direct financial grant of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult regions for rural house construction (PMAY-G).",
      "Additional 90/95 days of unskilled wage labor support under MGNREGS (approx. ₹25,000).",
      "Financial assistance of ₹12,000 for toilet construction under Swachh Bharat Mission.",
      "Credit-Linked Subsidy Scheme (CLSS) offering up to 6.5% interest subsidy on home loans up to ₹6 Lakh for urban beneficiaries."
    ],
    eligibilityCriteria: [
      "Beneficiary family must not own a pucca house in their name or in the name of any family member anywhere in India.",
      "Rural: Identified using SECC 2011 housing deprivation parameters verified by Gram Sabha.",
      "Urban: EWS families with annual income up to ₹3,00,000; LIG families with annual income up to ₹6,00,000.",
      "Female ownership or co-ownership of the house is mandatory for urban CLSS."
    ],
    eligibilityRules: {
      maxIncome: 600000,
    },
    requiredDocuments: [
      "Aadhaar Card of all family members",
      "Income Certificate / BPL Card / SECC verification letter",
      "Bank Account Passbook (Aadhaar linked for DBT installments)",
      "Land Ownership Document / Allotment Letter / Gram Panchayat NOC",
      "Photograph of existing dwelling / vacant plot"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://pmaymis.gov.in",
    targetAudience: "Homeless Families, EWS & LIG Households",
    sponsoringAgency: "Ministry of Housing and Urban Affairs & Ministry of Rural Development, GoI",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-07-30",
    translations: {
      ta: {
        name: "பிரதமர் ஆவாஸ் யோஜனா (PMAY வீட்டு வசதித் திட்டம்)",
        shortDescription: "வீடற்ற ஏழை குடும்பங்களுக்கு சொந்த வீடு கட்ட நிதி உதவி.",
        targetAudience: "வீடற்ற மற்றும் குறைந்த வருவாய் குடும்பங்கள்"
      },
      hi: {
        name: "प्रधानमंत्री आवास योजना (PMAY)",
        shortDescription: "पक्का मकान बनाने के लिए वित्तीय सहायता और गृह ऋण पर ब्याज सब्सिडी।",
        targetAudience: "आवासहीन एवं कमजोर आय वर्ग परिवार"
      }
    }
  },

  "pm-svanidhi-street-vendor": {
    code: "SCHEME-PMSVANIDHI-004",
    name: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    slug: "pm-svanidhi-street-vendor",
    category: "Business & Livelihood",
    departmentCode: "MNC",
    shortDescription: "Collateral-free working capital micro-loans from ₹10,000 to ₹50,000 with 7% interest subsidy for street vendors.",
    overview: "PM SVANidhi is a micro-credit scheme launched by the Ministry of Housing and Urban Affairs to empower street vendors by providing access to affordable collateral-free working capital loans to resume and expand their livelihoods.",
    benefits: [
      "1st Tranche Loan: ₹10,000 with 1-year repayment tenure.",
      "2nd Tranche Loan: ₹20,000 upon timely or early repayment of the first loan.",
      "3rd Tranche Loan: ₹50,000 for vendors with consistent credit track record.",
      "7% interest subsidy credited directly to the vendor's bank account on quarterly basis.",
      "Monthly cashback of up to ₹100 (₹1,200/year) on conducting digital sales transactions."
    ],
    eligibilityCriteria: [
      "Street vendors vending in urban areas possessing Certificate of Vending (CoV) or Identity Card issued by Urban Local Body (ULB).",
      "Vendors identified in the municipal survey but not issued CoV/ID card, holding a Letter of Recommendation (LoR).",
      "Vendors of surrounding peri-urban or rural areas vending in the geographical limits of the ULBs."
    ],
    eligibilityRules: {
      ageMin: 18,
      allowedOccupations: ["STREET_VENDOR", "HAWKER", "ARTISAN", "SMALL_BUSINESS"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Certificate of Vending (CoV) / Identity Card / Letter of Recommendation (LoR) from ULB",
      "Bank Account Passbook (active savings or Jan Dhan account)",
      "Mobile number linked to Aadhaar"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://pmsvanidhi.mohua.gov.in",
    targetAudience: "Urban Street Vendors, Hawkers, Artisans",
    sponsoringAgency: "Ministry of Housing and Urban Affairs, Government of India",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-10",
    translations: {
      ta: {
        name: "பிரதமர் சுவநிதி (PM SVANidhi தெருவோர வியாபாரிகள் கடன் திட்டம்)",
        shortDescription: "தெருவோர வியாபாரிகளுக்கு ₹10,000 முதல் ₹50,000 வரை பிணையில்லா தொழிற்கடன்.",
        targetAudience: "தெருவோர வியாபாரிகள் மற்றும் சிறு வணிகர்கள்"
      },
      hi: {
        name: "पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)",
        shortDescription: "स्ट्रीट वेंडरों के लिए ₹10,000 से ₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण।",
        targetAudience: "रेहड़ी-पटरी वाले और छोटे व्यापारी"
      }
    }
  },

  "national-scholarship-portal": {
    code: "SCHEME-NSP-005",
    name: "National Scholarship Portal (NSP) - Higher Education & Post-Matric",
    slug: "national-scholarship-portal",
    category: "Education & Scholarships",
    departmentCode: "EDU",
    shortDescription: "Central and state scholarships for pre-matric, post-matric, higher education, and technical studies via Direct Benefit Transfer.",
    overview: "National Scholarship Portal (NSP) is a one-stop digital platform that integrates all Central Sector, State-sponsored, and UGC/AICTE scholarship schemes. It streamlines application submission, institutional verification, and direct fund disbursement.",
    benefits: [
      "Direct financial support covering tuition fees, examination fees, and monthly maintenance allowance (₹5,000 to ₹50,000/year).",
      "Direct Benefit Transfer (DBT) into the student's Aadhaar-seeded bank account.",
      "Unified single application form for multiple merit, minority, SC, ST, OBC, and disability scholarship schemes."
    ],
    eligibilityCriteria: [
      "Enrolled in a recognized school, college, university, or professional technical institute.",
      "Minimum 50% marks in the previous final qualifying examination.",
      "Annual household family income within the prescribed limit (usually up to ₹2,50,000 per annum depending on the specific scheme)."
    ],
    eligibilityRules: {
      ageMin: 14,
      ageMax: 30,
      maxIncome: 250000,
      studentRequired: true,
    },
    requiredDocuments: [
      "Student Aadhaar Card (and parent/guardian Aadhaar if minor)",
      "Previous Academic Year Marksheet / Scorecard",
      "Bonafide Student Certificate issued by Head of Educational Institution",
      "Family Income Certificate issued by competent Revenue Authority",
      "Community / Caste / Minority Certificate (if applying under reserved category)",
      "Bank Account Passbook in the name of the student"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://scholarships.gov.in",
    targetAudience: "School & College Students, Technical & Professional Scholars",
    sponsoringAgency: "Ministry of Electronics and IT & Ministry of Education, GoI",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-25",
    translations: {
      ta: {
        name: "தேசிய உதவித்தொகை போர்ட்டல் (NSP கல்வி உதவித்தொகை)",
        shortDescription: "பள்ளி மற்றும் கல்லூரி மாணவர்களுக்கான அரசு கல்வி உதவித்தொகை திட்டங்கள்.",
        targetAudience: "மாணவர்கள் மற்றும் உயர்கல்வி பயில்வோர்"
      },
      hi: {
        name: "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)",
        shortDescription: "मैट्रिकोत्तर और उच्च शिक्षा के छात्रों के लिए केंद्र व राज्य सरकार की छात्रवृत्ति योजनाएं।",
        targetAudience: "स्कूली एवं कॉलेज छात्र"
      }
    }
  },

  "pradhan-mantri-mudra-yojana": {
    code: "SCHEME-PMMY-006",
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    slug: "pradhan-mantri-mudra-yojana",
    category: "Business & Finance",
    departmentCode: "REV",
    shortDescription: "Collateral-free business loans up to ₹10 Lakh for micro and small enterprises under Shishu, Kishore, and Tarun categories.",
    overview: "PMMY provides institutional micro-credit to non-corporate, non-farm small/micro enterprises engaged in manufacturing, trading, and services sectors. Loans are provided through commercial banks, RRBs, Small Finance Banks, and MFIs.",
    benefits: [
      "Shishu Category: Loans up to ₹50,000 for nascent and early-stage small entrepreneurs.",
      "Kishore Category: Loans from ₹50,001 to ₹5,00,000 for expanding businesses.",
      "Tarun Category: Loans from ₹5,00,001 to ₹10,00,000 for established small enterprises.",
      "Zero collateral or third-party guarantee required.",
      "Issuance of MUDRA RuPay Debit Card for seamless cash withdrawal and working capital management."
    ],
    eligibilityCriteria: [
      "Any Indian citizen who has a business plan for non-farm income-generating activity.",
      "Small manufacturing units, shopkeepers, fruits/vegetable vendors, artisans, transport operators, food service units.",
      "Applicant must not be a defaulter with any bank or financial institution."
    ],
    eligibilityRules: {
      ageMin: 18,
      allowedOccupations: ["BUSINESS", "SHOPKEEPER", "SELF_EMPLOYED", "ENTREPRENEUR", "ARTISAN"],
    },
    requiredDocuments: [
      "Identity Proof (Aadhaar / Voter ID / Passport / PAN Card)",
      "Address Proof of residence and business premises",
      "Proof of Business Registration / Udyam Certificate (if available)",
      "Quotation / Invoice for machinery, tools, or inventory to be purchased",
      "Bank statement of existing account for the last 6 months"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://www.mudra.org.in",
    targetAudience: "Micro Entrepreneurs, Small Traders, Self-Employed",
    sponsoringAgency: "Department of Financial Services, Ministry of Finance, GoI",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-01",
    translations: {
      ta: {
        name: "பிரதமர் முத்ரா திட்டம் (PMMY சிறுதொழில் கடன்)",
        shortDescription: "சிறு வணிகம் மற்றும் தொழில்முனைவோருக்கு ₹10 லட்சம் வரை பிணையில்லா கடன்.",
        targetAudience: "சிறு வியாபாரிகள் மற்றும் சுயதொழில் செய்வோர்"
      },
      hi: {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY)",
        shortDescription: "सूक्ष्म और लघु उद्यमों के लिए ₹10 लाख तक का संपार्श्विक-मुक्त व्यावसायिक ऋण।",
        targetAudience: "छोटे व्यवसायी एवं उद्यमी"
      }
    }
  },

  "pm-matru-vandana-yojana": {
    code: "SCHEME-PMMVY-007",
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    slug: "pm-matru-vandana-yojana",
    category: "Social Welfare & Women",
    departmentCode: "SOC",
    shortDescription: "Direct cash incentive of ₹5,000 for first child and ₹6,000 for second girl child for pregnant women and lactating mothers.",
    overview: "PMMVY is a conditional cash transfer maternity benefit program under Mission Shakti to provide partial wage compensation during pregnancy and promote safe institutional delivery and child immunization.",
    benefits: [
      "₹5,000 in two installments for the first living child.",
      "₹6,000 in a single installment upon birth of a second girl child to promote child sex ratio improvement.",
      "Direct Benefit Transfer into the mother's Aadhaar-seeded bank account.",
      "Promotes nutritional health, institutional delivery, and full immunization."
    ],
    eligibilityCriteria: [
      "Pregnant Women and Lactating Mothers (PW&LM) who conceive their first or second child on or after April 1, 2022.",
      "Exclusions: Women who are in regular employment with the Central Government or State Governments or Public Sector Undertakings."
    ],
    eligibilityRules: {
      gender: "FEMALE",
      ageMin: 19,
    },
    requiredDocuments: [
      "Mother & Father Aadhaar Cards",
      "Mother-Child Protection (MCP) Card issued by Anganwadi / Health Center",
      "Aadhaar-Linked Bank Account Details of the mother",
      "Birth Registration Certificate of the child (for second installment / second girl child)"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://pmmvy.wcd.gov.in",
    targetAudience: "Pregnant Women & Lactating Mothers",
    sponsoringAgency: "Ministry of Women and Child Development, Government of India",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-07-25",
    translations: {
      ta: {
        name: "பிரதமர் மாத்ரு வந்தனா யோஜனா (PMMVY கர்ப்பிணி உதவித்தொகை)",
        shortDescription: "கர்ப்பிணி தாய்மார்களுக்கு ₹5,000 முதல் ₹6,000 வரை நேரடி நிதி உதவி.",
        targetAudience: "கர்ப்பிணி மற்றும் பாலூட்டும் தாய்மார்கள்"
      },
      hi: {
        name: "प्रधानमंत्री मातृ वंदना योजना (PMMVY)",
        shortDescription: "गर्भवती महिलाओं और स्तनपान कराने वाली माताओं के लिए ₹5,000 से ₹6,000 तक की प्रत्यक्ष नकद सहायता।",
        targetAudience: "गर्भवती एवं धात्री माताएं"
      }
    }
  },

  "national-social-assistance-pension": {
    code: "SCHEME-NSAP-008",
    name: "National Social Assistance Programme (NSAP) - Senior, Widow & Disability Pension",
    slug: "national-social-assistance-pension",
    category: "Pensions & Senior Citizen Support",
    departmentCode: "SOC",
    shortDescription: "Monthly social security pension for BPL senior citizens (60+), destitute widows (40+), and persons with severe disabilities.",
    overview: "NSAP is a flagship welfare program fulfilling the Directive Principles of State Policy by providing financial assistance to elderly, widows, and persons with disabilities living Below Poverty Line (BPL).",
    benefits: [
      "Indira Gandhi National Old Age Pension Scheme (IGNOAPS): Monthly pension for citizens aged 60+ from BPL households.",
      "Indira Gandhi National Widow Pension Scheme (IGNWPS): Monthly pension for widows aged 40-79 years.",
      "Indira Gandhi National Disability Pension Scheme (IGNDPS): Monthly pension for persons aged 18+ with 80%+ severe disability.",
      "Direct monthly credit via DBT with additional top-up provided by respective State Governments (ranging from ₹1,000 to ₹3,500/month)."
    ],
    eligibilityCriteria: [
      "Applicant must belong to a household living Below Poverty Line (BPL) according to criteria prescribed by Govt of India / State.",
      "Age Requirements: Old Age Pension (60+), Widow Pension (40+), Disability Pension (18+ with 80%+ disability).",
      "Must not be in receipt of any other statutory pension."
    ],
    eligibilityRules: {
      maxIncome: 120000,
      bplRequired: true,
    },
    requiredDocuments: [
      "Aadhaar Card",
      "BPL Ration Card / BPL Survey Certificate",
      "Age Proof Certificate / Voter ID / Birth Certificate",
      "Disability Certificate issued by Medical Board (for disability pension)",
      "Husband's Death Certificate (for widow pension)",
      "Bank Account Passbook (Aadhaar linked)"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://nsap.nic.in",
    targetAudience: "BPL Senior Citizens, Widows, Persons with Severe Disabilities",
    sponsoringAgency: "Ministry of Rural Development, Government of India",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-12",
    translations: {
      ta: {
        name: "தேசிய சமூக உதவித் திட்டம் (NSAP முதியோர் & விதவை ஓய்வூதியம்)",
        shortDescription: "வறுமைக்கோட்டிற்கு கீழ் உள்ள முதியோர், விதவைகள் மற்றும் மாற்றுத்திறனாளிகளுக்கு மாத ஓய்வூதியம்.",
        targetAudience: "முதியவர்கள், விதவைகள் மற்றும் மாற்றுத்திறனாளிகள்"
      },
      hi: {
        name: "राष्ट्रीय सामाजिक सहायता कार्यक्रम (NSAP वृद्धावस्था व विधवा पेंशन)",
        shortDescription: "बीपीएल वृद्धजनों, विधवाओं और दिव्यांगजनों के लिए मासिक सामाजिक सुरक्षा पेंशन।",
        targetAudience: "वरिष्ठ नागरिक, विधवाएं एवं दिव्यांगजन"
      }
    }
  },

  "pm-surya-ghar-muft-bijli": {
    code: "SCHEME-PMSURYA-009",
    name: "PM Surya Ghar: Muft Bijli Yojana",
    slug: "pm-surya-ghar-muft-bijli",
    category: "Utility Services",
    departmentCode: "UTL",
    shortDescription: "Direct government subsidy up to ₹78,000 for installing residential rooftop solar systems and providing up to 300 free electricity units/month.",
    overview: "PM Surya Ghar: Muft Bijli Yojana is a pioneering renewable energy scheme to install rooftop solar panels in 1 crore households across India, drastically lowering electricity bills while generating clean green energy.",
    benefits: [
      "₹30,000 direct subsidy for 1 kW rooftop solar system.",
      "₹60,000 direct subsidy for 2 kW rooftop solar system.",
      "₹78,000 direct subsidy for 3 kW or higher rooftop solar systems.",
      "Up to 300 units of free electricity every month.",
      "Opportunity to sell surplus electricity back to the grid (DISCOM) for additional monthly income.",
      "Low-interest collateral-free bank loans (approx 7% interest) for remaining system costs."
    ],
    eligibilityCriteria: [
      "Applicant must be an Indian citizen with an owned residential household.",
      "Must have a suitable shadow-free rooftop or open terrace space.",
      "Must have a valid grid-connected domestic/residential electricity connection in their name.",
      "Must not have availed any other government capital subsidy for solar panels on the same consumer connection."
    ],
    eligibilityRules: {
      ageMin: 18,
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Latest Electricity Bill (last 3 months)",
      "Proof of Residential Property Ownership / Property Tax Receipt",
      "Bank Account Passbook / Cancelled Cheque (for subsidy disbursement)"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://pmsuryaghar.gov.in",
    targetAudience: "Residential Homeowners, Housing Societies",
    sponsoringAgency: "Ministry of New and Renewable Energy, Government of India",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-18",
    translations: {
      ta: {
        name: "பிரதமர் சூர்யா கர்: இலவச மின்சாரத் திட்டம் (PM Surya Ghar)",
        shortDescription: "வீட்டு கூரை சோலார் அமைப்புகளுக்கு ₹78,000 வரை அரசு மானியம் மற்றும் 300 யூனிட் இலவச மின்சாரம்.",
        targetAudience: "வீட்டு உரிமையாளர்கள்"
      },
      hi: {
        name: "पीएम सूर्य घर: मुफ्त बिजली योजना",
        shortDescription: "छत पर सोलर पैनल लगाने के लिए ₹78,000 तक की सीधी सब्सिडी और 300 यूनिट तक मुफ्त बिजली।",
        targetAudience: "आवासीय भवन स्वामी"
      }
    }
  },

  "atal-pension-yojana": {
    code: "SCHEME-APY-010",
    name: "Atal Pension Yojana (APY)",
    slug: "atal-pension-yojana",
    category: "Pensions & Senior Citizen Support",
    departmentCode: "REV",
    shortDescription: "Guaranteed monthly pension of ₹1,000 to ₹5,000 from age 60 for unorganized sector workers with full corpus return to nominee.",
    overview: "Atal Pension Yojana (APY) is a government-backed pension scheme in India targeted at unorganized sector workers to provide guaranteed monthly financial security in old age.",
    benefits: [
      "Guaranteed minimum monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 per month starting at age 60.",
      "Same pension amount continues to the spouse for life upon subscriber's demise.",
      "100% accumulated pension wealth returned to the registered nominee after death of both subscriber and spouse.",
      "Eligible for tax benefits under Section 80CCD(1B)."
    ],
    eligibilityCriteria: [
      "Any Indian citizen aged between 18 and 40 years.",
      "Must have an active savings bank account with auto-debit facility.",
      "Applicant must not be an income tax payer as per rules effective October 1, 2022."
    ],
    eligibilityRules: {
      ageMin: 18,
      ageMax: 40,
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Savings Bank Account / Post Office Account details with Auto-Debit mandate",
      "Active Mobile Number"
    ],
    applicationMethod: "OFFICIAL_PORTAL",
    officialPortalUrl: "https://www.npscra.nsdl.co.in",
    targetAudience: "Unorganized Sector Workers, Daily Wage Earners, Self-Employed",
    sponsoringAgency: "PFRDA, Department of Financial Services, Ministry of Finance, GoI",
    stateScope: "ALL_INDIA",
    isActive: true,
    lastUpdated: "2026-08-05",
    translations: {
      ta: {
        name: "அடல் ஓய்வூதியத் திட்டம் (Atal Pension Yojana - APY)",
        shortDescription: "60 வயதுக்கு பின் மாதம் ₹1,000 முதல் ₹5,000 வரை உத்தரவாத ஓய்வூதியம்.",
        targetAudience: "அமைப்புசாரா தொழிலாளர்கள் மற்றும் இளைஞர்கள்"
      },
      hi: {
        name: "अटल पेंशन योजना (APY)",
        shortDescription: "60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 तक की गारंटीकृत मासिक पेंशन।",
        targetAudience: "असंगठित क्षेत्र के कामगार एवं युवा"
      }
    }
  }
};

export const SCHEME_CATEGORIES = [
  "All Categories",
  "Agriculture & Rural Development",
  "Health & Wellness",
  "Housing & Shelter",
  "Education & Scholarships",
  "Business & Finance",
  "Business & Livelihood",
  "Social Welfare & Women",
  "Pensions & Senior Citizen Support",
  "Utility Services"
];

export function getSchemeBySlug(slug: string): SchemeDefinition | undefined {
  return SCHEME_REGISTRY[slug] || Object.values(SCHEME_REGISTRY).find(s => s.code === slug);
}

export function searchSchemes(query?: string, category?: string, state?: string): SchemeDefinition[] {
  let list = Object.values(SCHEME_REGISTRY);

  if (category && category !== "All Categories" && category !== "ALL") {
    list = list.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (state && state !== "ALL" && state !== "ALL_INDIA") {
    list = list.filter(s => s.stateScope === "ALL_INDIA" || s.stateScope === state);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      s.overview.toLowerCase().includes(q) ||
      s.targetAudience.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }

  return list;
}

export function evaluateSchemeEligibility(
  scheme: SchemeDefinition,
  userData: {
    age?: number;
    occupation?: string;
    annualIncome?: number;
    gender?: string;
    state?: string;
    bplStatus?: boolean;
    hasPuccaHouse?: boolean;
    hasCultivableLand?: boolean;
    isStudent?: boolean;
  }
): {
  isLikelyEligible: boolean;
  score: number;
  matchedCriteria: string[];
  unmetCriteria: string[];
  guidanceText: string;
} {
  const rules = scheme.eligibilityRules || {};
  const matchedCriteria: string[] = [];
  const unmetCriteria: string[] = [];

  // 1. Age Rule
  if (userData.age !== undefined) {
    if (rules.ageMin && userData.age < rules.ageMin) {
      unmetCriteria.push(`Minimum age required is ${rules.ageMin} years (Provided: ${userData.age})`);
    } else if (rules.ageMax && userData.age > rules.ageMax) {
      unmetCriteria.push(`Maximum age limit is ${rules.ageMax} years (Provided: ${userData.age})`);
    } else if (rules.ageMin || rules.ageMax) {
      matchedCriteria.push(`Age eligibility verified (${userData.age} years)`);
    }
  }

  // 2. Income Rule
  if (userData.annualIncome !== undefined && rules.maxIncome) {
    if (userData.annualIncome > rules.maxIncome) {
      unmetCriteria.push(`Annual income must be within ₹${rules.maxIncome.toLocaleString('en-IN')} (Declared: ₹${userData.annualIncome.toLocaleString('en-IN')})`);
    } else {
      matchedCriteria.push(`Annual income within configured threshold of ₹${rules.maxIncome.toLocaleString('en-IN')}`);
    }
  }

  // 3. Gender Rule
  if (rules.gender && rules.gender !== "ALL" && userData.gender) {
    if (userData.gender.toUpperCase() !== rules.gender) {
      unmetCriteria.push(`Scheme is exclusively intended for ${rules.gender === "FEMALE" ? "Female" : "Male"} applicants.`);
    } else {
      matchedCriteria.push(`Gender requirement fulfilled.`);
    }
  }

  // 4. Occupation Rule
  if (rules.allowedOccupations && rules.allowedOccupations.length > 0 && userData.occupation) {
    const occ = userData.occupation.toUpperCase();
    const matchedOcc = rules.allowedOccupations.some(allowed => occ.includes(allowed) || allowed.includes(occ));
    if (matchedOcc) {
      matchedCriteria.push(`Occupation category matches configured criteria (${userData.occupation})`);
    } else {
      unmetCriteria.push(`Configured occupation criteria targeted at: ${rules.allowedOccupations.join(", ")}`);
    }
  }

  // 5. Landholding Rule
  if (rules.landHoldingRequired) {
    if (userData.hasCultivableLand === false) {
      unmetCriteria.push(`Requires registered cultivable landholding.`);
    } else if (userData.hasCultivableLand === true) {
      matchedCriteria.push(`Cultivable landholding requirement satisfied.`);
    }
  }

  // 6. Student Status
  if (rules.studentRequired) {
    if (userData.isStudent === false) {
      unmetCriteria.push(`Enrolled student status in a recognized institution required.`);
    } else if (userData.isStudent === true) {
      matchedCriteria.push(`Enrolled student status verified.`);
    }
  }

  const isLikelyEligible = unmetCriteria.length === 0;
  const score = isLikelyEligible ? 90 : Math.max(20, 100 - unmetCriteria.length * 30);

  const guidanceText = isLikelyEligible
    ? `Based on the preliminary details provided, you meet the standard configured eligibility criteria for ${scheme.name}. You may proceed to view required documents or apply via the official government portal.`
    : `Based on the details provided, you may not meet some of the configured criteria (${unmetCriteria[0] || 'Specific requirements'}). Note: This is an automated preliminary check; please review official scheme guidelines.`;

  return {
    isLikelyEligible,
    score,
    matchedCriteria,
    unmetCriteria,
    guidanceText
  };
}
