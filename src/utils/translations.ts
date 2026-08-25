export type Language = 'hi' | 'en';

export const translations = {
  en: {
    appName: 'GramSewa',
    tagline: 'From Citizen Complaints to Smarter Rural Governance',
    govHeader: 'Gram Panchayat Digital Grievance Portal',
    portalSubtitle: 'Ministry of Panchayati Raj & Rural Development',
    
    // Roles & Auth
    citizen: 'Citizen / Rural Resident',
    authority: 'Panchayat Authority / Admin',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    switchRole: 'Switch Role',
    loggedAs: 'Logged in as',
    demoAccounts: 'Quick Demo Switch',
    citizenDemo: 'Citizen: Ramesh Kumar (Ward 3, Rampur)',
    authorityDemo: 'Admin: Vikram Singh (Panchayat BDO)',
    name: 'Full Name',
    phone: 'Mobile Number',
    email: 'Email Address',
    state: 'State',
    district: 'District',
    block: 'Block / Tehsil',
    village: 'Gram Panchayat / Village',
    ward: 'Ward Number',
    landmark: 'Nearest Landmark',
    
    // Nav
    navDashboard: 'Dashboard',
    navReport: 'Report Problem',
    navTrack: 'My Grievances',
    navGisMap: 'GIS Problem Map',
    navAnalytics: 'Analytics & SLA',
    navAiInsights: 'AI Insights & Hotspots',
    navNotifications: 'Notifications',

    // Voice
    voiceLanguage: 'Voice Language',
    typeOrSpeak: 'Type or Speak',
    speakBtn: 'Speak',
    typeBtn: 'Type',
    listening: 'Listening... Please speak clearly in Hindi or English',
    clickToStop: 'Click microphone to stop',
    speechNotSupported: 'Speech recognition is not supported in this browser. Please type your message.',
    voiceTip: '💡 Tip: Speak in Hindi or English. Example: "हमारे गांव के मुख्य चौराहे पर पानी का पाइप टूट गया है"',
    micActive: 'Recording Voice...',
    tapToSpeak: 'Tap to speak',
    
    // Stats
    totalComplaints: 'Total Complaints',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    reopened: 'Reopened',
    closed: 'Closed',
    slaBreached: 'SLA Breached',
    slaCompliance: 'SLA Compliance',
    avgResolutionTime: 'Avg Resolution Time',
    satisfactionScore: 'Citizen Satisfaction',

    // Main Actions
    reportProblemBtn: '+ Report a Problem',
    filterCategory: 'All Categories',
    filterStatus: 'All Statuses',
    filterPriority: 'All Priorities',
    filterVillage: 'All Villages',
    searchPlaceholder: 'Search complaints by ID, village, keyword...',
    
    // Complaint Form
    formTitle: 'Submit New Rural Grievance',
    formSubtitle: 'Your complaint will be automatically classified and assigned by AI with strict SLA tracking',
    categoryLabel: 'Problem Category',
    selectCategory: 'Select Category',
    descLabel: 'Problem Description',
    descPlaceholder: 'Describe the issue clearly (e.g., Damaged road near primary school, contaminated drinking water pipe, burnt electric transformer)...',
    additionalDetailsLabel: 'Additional Details / Landmarks',
    additionalDetailsPlaceholder: 'Any landmarks, duration of issue, number of affected houses...',
    uploadImageLabel: 'Upload Photo / Evidence',
    useMyLocation: 'Use My GPS Location',
    locationDetermined: 'Location detected successfully',
    submitting: 'Analyzing with AI & Submitting...',
    submitBtn: 'Submit Complaint with AI Analysis',

    // AI Analysis Screen
    aiAnalysisTitle: 'Automated AI Triage & Verification',
    aiAnalysisSubtitle: 'Complaint analyzed using NLP classification, geospatial clustering, and severity ranking',
    detectedCategory: 'Detected Category',
    confidence: 'Confidence',
    severity: 'Severity Level',
    priorityScore: 'Priority Score',
    suggestedDept: 'Suggested Department',
    slaEstimate: 'Estimated SLA Deadline',
    duplicateAlert: 'Geospatial Duplicate Cluster',
    aiRecommendation: 'AI Governance Recommendation',
    proceedToSubmit: 'Confirm & Dispatch Complaint',

    // Status Timeline
    timelineSubmitted: 'Submitted',
    timelineAiAnalyzed: 'AI Analyzed',
    timelineAssigned: 'Assigned',
    timelineUnderReview: 'Under Review',
    timelineWip: 'Work in Progress',
    timelineResolved: 'Resolved',
    timelineCitizenVerification: 'Citizen Verification',
    timelineClosed: 'Closed',

    // Verification Modal
    verificationTitle: 'Citizen Resolution Verification',
    verificationPrompt: 'Has your problem actually been resolved on the ground?',
    optCompletelyResolved: 'Yes, completely resolved',
    optPartiallyResolved: 'Partially resolved (Issues remain)',
    optNotResolved: 'No, problem still exists',
    confirmResolutionBtn: 'Verify & Close Grievance',
    reopenComplaintBtn: 'Reopen Grievance',
    reopenAndEscalateBtn: 'Reopen & Escalate to District Officer',
    reopenReasonLabel: 'Reason for Reopening / What is still unresolved?',
    reopenReasonPlaceholder: 'Explain what work was left incomplete or if the issue reappeared...',

    // Feedback
    feedbackTitle: 'Citizen Satisfaction Feedback',
    satisfactionQuestion: 'How satisfied are you with the resolution quality?',
    responseTimeQuestion: 'How would you rate the speed of response?',
    feedbackCommentsLabel: 'Citizen Comments & Suggestions',
    submitFeedbackBtn: 'Submit Feedback',

    // Authority Actions
    authorityActions: 'Authority Actions',
    assignDepartment: 'Assign Department',
    updateStatus: 'Update Status',
    markResolved: 'Mark as Resolved',
    resolveDialogTitle: 'Submit Resolution & Proof of Work',
    resolutionNotes: 'Resolution Summary / Action Taken',
    resolutionNotesPlaceholder: 'Detail the repair work, materials used, inspection conducted...',
    evidencePhoto: 'Upload Work Completion Evidence',
    escalateBtn: 'Escalate Overdue Grievance',
    linkDuplicates: 'Merge with Duplicate Cluster',

    // Map & Hotspots
    gisTitle: 'Village GIS Grievance Map',
    gisSubtitle: 'Interactive geospatial distribution of rural civic complaints across Gram Panchayats',
    hotspotsTitle: 'Predictive Infrastructure Hotspots',
    hotspotsSubtitle: 'AI risk assessment for proactive maintenance across villages based on historical failure density',
    
    // Categories
    categories: {
      'Water Supply': 'Water Supply / Drinking Water',
      'Roads': 'Panchayat & PWD Roads',
      'Electricity': 'Electricity & Transformers',
      'Sanitation': 'Sanitation & Cleanliness',
      'Waste Management': 'Waste Management & Garbage',
      'Drainage': 'Drainage & Waterlogging',
      'Street Lights': 'Street Lights / Solar Lights',
      'Healthcare': 'Primary Health Centre (PHC)',
      'Education': 'Village Schools & Anganwadi',
      'Other': 'Other Public Amenities'
    }
  },
  hi: {
    appName: 'ग्रामसेवा',
    tagline: 'नागरिक शिकायतों से स्मार्ट ग्रामीण प्रशासन की ओर',
    govHeader: 'ग्राम पंचायत डिजिटल समस्या निवारण पोर्टल',
    portalSubtitle: 'पंचायती राज एवं ग्रामीण विकास मंत्रालय',
    
    // Roles & Auth
    citizen: 'नागरिक / ग्रामीण निवासी',
    authority: 'पंचायत अधिकारी / व्यवस्थापक',
    login: 'लॉग इन करें',
    register: 'पंजीकरण करें',
    logout: 'लॉग आउट',
    switchRole: 'भूमिका बदलें',
    loggedAs: 'लॉग इन उपयोगकर्ता',
    demoAccounts: 'त्वरित डेमो खाता',
    citizenDemo: 'नागरिक: रमेश कुमार (वार्ड 3, रामपुर)',
    authorityDemo: 'अधिकारी: विक्रम सिंह (बीडीओ/पंचायत सचिव)',
    name: 'पूरा नाम',
    phone: 'मोबाइल नंबर',
    email: 'ईमेल पता',
    state: 'राज्य',
    district: 'जिला',
    block: 'प्रखंड / तहसील',
    village: 'ग्राम पंचायत / गांव',
    ward: 'वार्ड संख्या',
    landmark: 'निकटतम पहचान चिन्ह (Landmark)',
    
    // Nav
    navDashboard: 'डैशबोर्ड',
    navReport: 'समस्या दर्ज करें',
    navTrack: 'मेरी शिकायतें',
    navGisMap: 'GIS समस्या मानचित्र',
    navAnalytics: 'विश्लेषण व SLA',
    navAiInsights: 'AI अंतर्दृष्टि व हॉटस्पॉट',
    navNotifications: 'सूचनाएं',

    // Voice
    voiceLanguage: 'बोलने की भाषा',
    typeOrSpeak: 'लिखें या बोलकर बताएं',
    speakBtn: 'बोलें',
    typeBtn: 'टाइप करें',
    listening: 'सुन रहे हैं... कृपया स्पष्ट आवाज में बोलें',
    clickToStop: 'रोकने के लिए माइक पर क्लिक करें',
    speechNotSupported: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया टाइप करें।',
    voiceTip: '💡 सुझाव: हिंदी या अंग्रेजी में बोलें। उदाहरण: "हमारे गांव के मुख्य चौराहे पर पानी का पाइप टूट गया है"',
    micActive: 'आवाज रिकॉर्ड हो रही है...',
    tapToSpeak: 'बोलने के लिए दबाएं',
    
    // Stats
    totalComplaints: 'कुल शिकायतें',
    pending: 'लंबित (Pending)',
    inProgress: 'कार्य प्रगति पर (In Progress)',
    resolved: 'समाधानित (Resolved)',
    reopened: 'पुनः खुली (Reopened)',
    closed: 'पूर्णतः बंद (Closed)',
    slaBreached: 'SLA समयसीमा पार (Breached)',
    slaCompliance: 'SLA अनुपालन दर',
    avgResolutionTime: 'औसत समाधान समय',
    satisfactionScore: 'नागरिक संतुष्टि',

    // Main Actions
    reportProblemBtn: '+ नई समस्या दर्ज करें',
    filterCategory: 'सभी श्रेणियां',
    filterStatus: 'सभी स्थितियां',
    filterPriority: 'सभी प्राथमिकताएं',
    filterVillage: 'सभी ग्राम पंचायतें',
    searchPlaceholder: 'शिकायत संख्या, गांव, या कीवर्ड से खोजें...',
    
    // Complaint Form
    formTitle: 'नई ग्रामीण समस्या दर्ज करें',
    formSubtitle: 'आपकी शिकायत का AI द्वारा स्वचालित वर्गीकरण और विभाग आवंटन किया जाएगा',
    categoryLabel: 'समस्या की श्रेणी',
    selectCategory: 'श्रेणी चुनें',
    descLabel: 'समस्या का विवरण',
    descPlaceholder: 'समस्या का विस्तार से वर्णन करें (उदा. प्राथमिक विद्यालय के पास क्षतिग्रस्त सड़क, पेयजल पाइपलाइन फूटना, जला हुआ ट्रांसफार्मर)...',
    additionalDetailsLabel: 'अतिरिक्त विवरण / पहचान चिन्ह',
    additionalDetailsPlaceholder: 'स्थान की पहचान, समस्या कितने दिनों से है, प्रभावित घरों की संख्या...',
    uploadImageLabel: 'फोटो / प्रमाण अपलोड करें',
    useMyLocation: 'मेरा GPS स्थान उपयोग करें',
    locationDetermined: 'स्थान सफलतापूर्वक दर्ज किया गया',
    submitting: 'AI विश्लेषण एवं प्रेषण जारी...',
    submitBtn: 'AI विश्लेषण के साथ शिकायत भेजें',

    // AI Analysis Screen
    aiAnalysisTitle: 'स्वचालित AI विश्लेषण एवं वर्गीकरण',
    aiAnalysisSubtitle: 'NLP वर्गीकरण, जियोस्पेशियल क्लस्टरिंग और प्राथमिकता स्कोरिंग द्वारा विश्लेषण',
    detectedCategory: 'पहचानी गई श्रेणी',
    confidence: 'विश्वसनीयता',
    severity: 'गंभीरता स्तर',
    priorityScore: 'प्राथमिकता स्कोर',
    suggestedDept: 'अनुशंसित विभाग',
    slaEstimate: 'अनुमानित समाधान समय (SLA)',
    duplicateAlert: 'समान शिकायतों का क्लस्टर (Duplicate)',
    aiRecommendation: 'AI प्रशासनिक सिफारिश',
    proceedToSubmit: 'शिकायत प्रेषित करें',

    // Status Timeline
    timelineSubmitted: 'दर्ज हुई',
    timelineAiAnalyzed: 'AI विश्लेषित',
    timelineAssigned: 'विभाग आवंटित',
    timelineUnderReview: 'समीक्षाधीन',
    timelineWip: 'कार्य प्रगति पर',
    timelineResolved: 'समाधानित',
    timelineCitizenVerification: 'नागरिक सत्यापन',
    timelineClosed: 'सत्यापित एवं बंद',

    // Verification Modal
    verificationTitle: 'नागरिक धरातलीय समाधान सत्यापन',
    verificationPrompt: 'क्या आपकी समस्या का वास्तव में धरातल पर समाधान हो गया है?',
    optCompletelyResolved: 'हाँ, पूरी तरह समाधान हो गया',
    optPartiallyResolved: 'आंशिक समाधान हुआ (कमियां बाकी हैं)',
    optNotResolved: 'नहीं, समस्या ज्यों की त्यों है',
    confirmResolutionBtn: 'सत्यापित करें और शिकायत बंद करें',
    reopenComplaintBtn: 'शिकायत पुनः खोलें',
    reopenAndEscalateBtn: 'पुनः खोलें व जिला अधिकारी को एस्केलेट करें',
    reopenReasonLabel: 'पुनः खोलने का कारण / क्या कार्य अधूरा रहा?',
    reopenReasonPlaceholder: 'कृपया स्पष्ट करें कि क्या कार्य अधूरा रह गया...',

    // Feedback
    feedbackTitle: 'नागरिक संतुष्टि प्रतिक्रिया (Feedback)',
    satisfactionQuestion: 'समाधान की गुणवत्ता से आप कितने संतुष्ट हैं?',
    responseTimeQuestion: 'अधिकारियों के रिस्पांस समय को आप क्या रेटिंग देंगे?',
    feedbackCommentsLabel: 'नागरिक सुझाव व अनुभव',
    submitFeedbackBtn: 'प्रतिक्रिया जमा करें',

    // Authority Actions
    authorityActions: 'अधिकारी कार्यवाई',
    assignDepartment: 'विभाग नियुक्त करें',
    updateStatus: 'स्थिति अपडेट करें',
    markResolved: 'समाधानित घोषित करें',
    resolveDialogTitle: 'कार्य पूर्णता विवरण व साक्ष्य दर्ज करें',
    resolutionNotes: 'कार्य का विवरण / क्या निवारण किया गया',
    resolutionNotesPlaceholder: 'मरम्मत कार्य, सामग्री, निरीक्षण का विवरण दें...',
    evidencePhoto: 'समाधान का फोटो प्रमाण अपलोड करें',
    escalateBtn: 'अतिदेय शिकायत एस्केलेट करें',
    linkDuplicates: 'समान शिकायतों को मर्ज करें',

    // Map & Hotspots
    gisTitle: 'ग्राम पंचायत GIS समस्या मानचित्र',
    gisSubtitle: 'ग्राम पंचायतों में दर्ज शिकायतों का वास्तविक समय भौगोलिक वितरण',
    hotspotsTitle: 'संभावित समस्या हॉटस्पॉट (Predictive AI)',
    hotspotsSubtitle: 'ऐतिहासिक शिकायतों के आधार पर बुनियादी ढांचे के जोखिम का पूर्वानुमान',
    
    // Categories
    categories: {
      'Water Supply': 'पेयजल एवं जल आपूर्ति',
      'Roads': 'ग्राम व मुख्य संपर्क सड़कें',
      'Electricity': 'विद्युत आपूर्ति व ट्रांसफार्मर',
      'Sanitation': 'स्वच्छता एवं सार्वजनिक शौचालय',
      'Waste Management': 'कचरा प्रबंधन व निस्तारण',
      'Drainage': 'नाली व जलभराव की समस्या',
      'Street Lights': 'मार्ग प्रकाश व सोलर लाइट',
      'Healthcare': 'प्राथमिक स्वास्थ्य केंद्र (PHC)',
      'Education': 'ग्रामीण विद्यालय व आंगनवाड़ी',
      'Other': 'अन्य सार्वजनिक सुविधाएं'
    }
  }
};
