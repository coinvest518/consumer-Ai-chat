"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TEMPLATE_CATEGORIES = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var AuthContext_1 = require("@/contexts/AuthContext");
var api_1 = require("@/lib/api");
var use_toast_1 = require("@/hooks/use-toast");
exports.TEMPLATE_CATEGORIES = {
    PERSONAL_INFO: 'Personal Information',
    CRA_DISPUTE: 'Credit Reporting Agency Dispute',
    DEBT_VALIDATION: 'Debt Validation',
    REINVESTIGATION: 'Reinvestigation Request',
    INQUIRY_DISPUTE: 'Inquiry Dispute'
};
// Professional Legal Dispute Templates
var legalTemplates = [
    {
        id: "personal-info-update",
        name: "Personal Information Update Request",
        type: "form",
        category: exports.TEMPLATE_CATEGORIES.PERSONAL_INFO,
        description: "Update incorrect personal information in credit bureau records under FCRA",
        preview: "Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a), I am writing to request updates to my personal information...",
        fullContent: "[YOUR NAME]\n[YOUR ADDRESS]\n[CITY, STATE ZIP]\n[YOUR EMAIL]\n[YOUR PHONE]\n[DATE]\n\nVIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED\n[CREDIT BUREAU NAME]\n[CREDIT BUREAU ADDRESS]\n[CITY, STATE ZIP]\n\nRe: Request to Update Personal Information - Consumer File [LAST 4 OF SSN]\n\nTo Whom It May Concern:\n\nPursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00A7 1681i(a), I am writing to request updates to my personal information in your records. After reviewing my credit report, I have identified inaccurate personal information that requires correction.\n\nCURRENT INFORMATION TO BE RETAINED:\nFull Legal Name: [YOUR FULL LEGAL NAME]\nCurrent Address: [YOUR CURRENT ADDRESS]\nDate of Birth: [YOUR DOB]\nSocial Security Number: XXX-XX-[LAST 4]\n\nINFORMATION TO BE REMOVED:\n[LIST INCORRECT NAMES, ADDRESSES, OR OTHER PERSONAL INFORMATION]\n\nLEGAL REQUIREMENTS:\nUnder FCRA \u00A7 1681i(a), you are required to:\n1. Process this request within 30 days\n2. Forward all relevant information to information furnishers\n3. Notify me of the results of your investigation\n\nPlease send me an updated copy of my credit report reflecting these changes at the address listed above.\n\nSincerely,\n[YOUR SIGNATURE]\n[YOUR PRINTED NAME]\n\nEnclosures:\n- Copy of Driver's License or State ID\n- Proof of Address (Utility Bill/Lease Agreement)\n- Social Security Card (last 4 digits visible only)",
        tags: ["personal", "info", "fcra", "update"],
        rating: 4.9,
        creditCost: 2,
        isPopular: true,
        legalArea: "Personal Information",
        requirements: [
            "Valid government-issued ID",
            "Proof of current address",
            "Social Security card (last 4 digits)",
            "List of incorrect information to remove"
        ],
        legalCitations: [
            "FCRA § 1681i(a) - Procedure in case of disputed accuracy",
            "FCRA § 1681h - Conditions and form of disclosure to consumers"
        ]
    },
    {
        id: "cra-dispute-comprehensive",
        name: "Credit Report Dispute Letter (Comprehensive)",
        type: "form",
        category: exports.TEMPLATE_CATEGORIES.CRA_DISPUTE,
        description: "Comprehensive dispute letter for credit reporting agencies under FCRA",
        preview: "I am writing to dispute inaccurate information in my credit report. I have identified the following items that require investigation...",
        fullContent: "[YOUR NAME]\n[YOUR ADDRESS]\n[CITY, STATE ZIP]\n[YOUR EMAIL]\n[YOUR PHONE]\n[DATE]\n\nVIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED\n[CREDIT BUREAU NAME]\n[CREDIT BUREAU ADDRESS]\n[CITY, STATE ZIP]\n\nRe: Formal Dispute of Inaccurate Information - Consumer File [LAST 4 OF SSN]\n\nNOTICE OF DISPUTE PURSUANT TO FCRA \u00A7 1681i(a)\n\nTo Whom It May Concern:\n\nI am writing to dispute inaccurate information in my credit report. I have identified the following items that require investigation and correction pursuant to the Fair Credit Reporting Act (FCRA):\n\nDISPUTED ITEMS:\n1. Account: [CREDITOR NAME]\n   Account #: XXXX-XXXX-[LAST 4]\n   Reason for Dispute: [SPECIFIC REASON]\n   Supporting Documentation: [LIST DOCUMENTS ATTACHED]\n\n2. Account: [CREDITOR NAME]\n   Account #: XXXX-XXXX-[LAST 4]\n   Reason for Dispute: [SPECIFIC REASON]\n   Supporting Documentation: [LIST DOCUMENTS ATTACHED]\n\nLEGAL REQUIREMENTS AND CITATIONS:\nPursuant to FCRA \u00A7 1681i(a), you must:\n1. Conduct a reasonable investigation within 30 days\n2. Forward all relevant information to the furnishers\n3. Consider all information I have submitted\n4. Delete any information that cannot be verified\n5. Notify me of the results within 5 business days of completion\n\nDEMAND FOR CORRECTION:\nIf you cannot verify this information with the original creditor, you must delete it pursuant to FCRA \u00A7 1681i(a)(5). Failure to comply may result in legal action under FCRA \u00A7 1681n for willful non-compliance.\n\nPlease send me an updated copy of my credit report showing your corrections.\n\nSincerely,\n[YOUR SIGNATURE]\n[YOUR PRINTED NAME]\n\nEnclosures:\n- Copy of credit report with disputed items circled\n- Supporting documentation for each dispute\n- Copy of ID and proof of address",
        tags: ["cra", "dispute", "fcra", "comprehensive"],
        rating: 4.9,
        creditCost: 3,
        isPopular: true,
        legalArea: "Credit Reporting",
        requirements: [
            "Credit report copy with disputed items marked",
            "Supporting documentation for disputes",
            "Valid ID and proof of address",
            "Detailed list of disputed items"
        ],
        legalCitations: [
            "FCRA § 1681i(a) - Investigation procedures",
            "FCRA § 1681i(a)(5) - Treatment of inaccurate or unverifiable information",
            "FCRA § 1681n - Civil liability for willful noncompliance"
        ]
    },
    {
        id: "debt-validation-demand",
        name: "Debt Validation Demand Letter",
        type: "form",
        category: exports.TEMPLATE_CATEGORIES.DEBT_VALIDATION,
        description: "Professional debt validation request under FDCPA Section 809(b)",
        preview: "I am writing in response to your notice regarding the above-referenced account. I dispute the validity of this debt and request validation...",
        fullContent: "[YOUR NAME]\n[YOUR ADDRESS]\n[CITY, STATE ZIP]\n[YOUR EMAIL]\n[YOUR PHONE]\n[DATE]\n\nVIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED\n[DEBT COLLECTOR NAME]\n[DEBT COLLECTOR ADDRESS]\n[CITY, STATE ZIP]\n\nRe: Debt Validation Request - Account # [ACCOUNT NUMBER IF KNOWN]\n    Alleged Amount: $[AMOUNT]\n\nNOTICE OF DISPUTE AND DEMAND FOR VALIDATION\nPURSUANT TO FDCPA \u00A7 809(b) [15 USC \u00A7 1692g(b)]\n\nTo Whom It May Concern:\n\nI am writing in response to your [LETTER/PHONE CALL] dated [DATE] regarding the above-referenced account. I dispute the validity of this debt and request validation pursuant to the Fair Debt Collection Practices Act (FDCPA).\n\nLEGAL NOTICE AND DEMANDS:\n\nPursuant to FDCPA \u00A7 809(b), I hereby demand that you provide ALL of the following:\n\n1. Amount and itemization of the alleged debt, including:\n   - Original principal\n   - Added interest\n   - Collection fees\n   - Other charges\n\n2. Name and address of the original creditor\n\n3. Complete chain of title showing your right to collect, including:\n   - Assignment documentation\n   - Purchase agreements\n   - Bills of sale\n\n4. Copy of the original signed agreement\n\n5. Complete payment history showing:\n   - All payments made\n   - Interest calculations\n   - Fees added\n   - Current balance calculation\n\n6. Your license status:\n   - Proof of license to collect in [YOUR STATE]\n   - Registration with Secretary of State\n   - Bond information if required\n\n7. Statute of limitations verification:\n   - Date of last payment\n   - Date of default\n   - Applicable state statute\n\nLEGAL REQUIREMENTS AND CONSEQUENCES:\n\nUnder FDCPA \u00A7 809(b), you must:\n1. Cease all collection activities until you provide validation\n2. Mark this debt as disputed with credit bureaus\n3. Provide complete validation within 30 days\n4. Remove credit reporting if you cannot validate\n\nNOTICE OF RIGHTS RESERVED:\n\nThis is an attempt to resolve this matter amicably. However, failure to comply with this request may result in legal action under FDCPA \u00A7 813 [15 USC \u00A7 1692k] for statutory damages of $1,000 plus actual damages, costs, and attorney fees.\n\nI await your response within 30 days. Send all future communications in writing to the address above.\n\nSincerely,\n[YOUR SIGNATURE]\n[YOUR PRINTED NAME]\n\nEnclosures:\n- Copy of your collection notice (if applicable)\n- Copy of certified mail receipt",
        tags: ["debt", "validation", "fdcpa", "collector"],
        rating: 4.8,
        creditCost: 3,
        isPopular: true,
        legalArea: "Debt Collection",
        requirements: [
            "Copy of collection notice or documentation of call",
            "Account information (if known)",
            "Certified mail receipt",
            "Detailed list of disputed items"
        ],
        legalCitations: [
            "FDCPA § 809(b) [15 USC § 1692g(b)] - Validation of debts",
            "FDCPA § 813 [15 USC § 1692k] - Civil liability",
            "FDCPA § 807 [15 USC § 1692e] - False or misleading representations",
            "FDCPA § 808 [15 USC § 1692f] - Unfair practices"
        ]
    },
    {
        id: "reinvestigation-demand",
        name: "Reinvestigation Demand Letter",
        type: "form",
        category: exports.TEMPLATE_CATEGORIES.REINVESTIGATION,
        description: "Demand proper reinvestigation when credit bureaus fail to investigate adequately",
        preview: "I am writing regarding your inadequate investigation of my previous dispute. Your investigation failed to comply with FCRA requirements...",
        fullContent: "[YOUR NAME]\n[YOUR ADDRESS]\n[CITY, STATE ZIP]\n[YOUR EMAIL]\n[YOUR PHONE]\n[DATE]\n\nVIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED\n[CREDIT BUREAU NAME]\n[CREDIT BUREAU ADDRESS]\n[CITY, STATE ZIP]\n\nRe: Demand for Reinvestigation - Consumer File [LAST 4 OF SSN]\n    Previous Dispute Date: [DATE OF ORIGINAL DISPUTE]\n\nNOTICE OF FAILED INVESTIGATION AND DEMAND FOR REINVESTIGATION\nPURSUANT TO FCRA \u00A7 611 [15 USC \u00A7 1681i]\n\nTo Whom It May Concern:\n\nI am writing regarding your inadequate investigation of my previous dispute dated [DATE]. Your investigation failed to comply with the requirements of the Fair Credit Reporting Act (FCRA).\n\nPREVIOUS DISPUTE DETAILS:\nDate of Original Dispute: [DATE]\nMethod of Submission: [CERTIFIED MAIL/ONLINE/FAX]\nItems Disputed: [LIST ITEMS]\nYour Response Date: [DATE]\n\nLEGAL VIOLATIONS IN PREVIOUS INVESTIGATION:\n\n1. Failure to conduct a reasonable investigation as required by FCRA \u00A7 611(a)(1)\n2. Failure to review and consider all relevant information submitted\n3. Failure to forward all relevant information to furnishers\n4. Failure to provide description of investigation procedures\n5. [OTHER SPECIFIC VIOLATIONS]\n\nEVIDENCE OF INADEQUATE INVESTIGATION:\n\n1. [SPECIFIC EVIDENCE OF INADEQUATE INVESTIGATION]\n2. [DOCUMENTATION IGNORED IN PREVIOUS INVESTIGATION]\n3. [PROOF OF CONTINUED INACCURATE REPORTING]\n\nLEGAL DEMANDS:\n\nPursuant to FCRA \u00A7 611, I demand that you:\n\n1. Conduct a new, thorough investigation of all disputed items\n2. Forward all enclosed documentation to furnishers\n3. Provide detailed description of investigation procedures\n4. Remove information that cannot be properly verified\n5. Send investigation results within 30 days\n6. Include source documents used to verify information\n\nNOTICE OF LIABILITY:\n\nFailure to conduct a proper reinvestigation may result in legal action under:\n- FCRA \u00A7 616 [15 USC \u00A7 1681n] for willful noncompliance\n- FCRA \u00A7 617 [15 USC \u00A7 1681o] for negligent noncompliance\n\nYour continued failure to investigate properly may result in claims for:\n- Actual damages\n- Statutory damages up to $1,000\n- Punitive damages\n- Attorney's fees and costs\n\nPlease send all correspondence to the address above. I expect your response within 30 days as required by law.\n\nSincerely,\n[YOUR SIGNATURE]\n[YOUR PRINTED NAME]\n\nEnclosures:\n- Copy of previous dispute letter\n- Copy of your inadequate response\n- Supporting documentation\n- Credit report with disputed items marked",
        tags: ["reinvestigation", "fcra", "failed", "demand"],
        rating: 4.7,
        creditCost: 4,
        legalArea: "Credit Reporting",
        requirements: [
            "Copy of original dispute letter",
            "Copy of credit bureau response",
            "Evidence of inadequate investigation",
            "Current credit report copy",
            "Supporting documentation"
        ],
        legalCitations: [
            "FCRA § 611 [15 USC § 1681i] - Procedure in case of disputed accuracy",
            "FCRA § 616 [15 USC § 1681n] - Civil liability for willful noncompliance",
            "FCRA § 617 [15 USC § 1681o] - Civil liability for negligent noncompliance",
            "Cushman v. Trans Union Corp., 115 F.3d 220 (3d Cir. 1997)"
        ]
    },
    {
        id: "inquiry-dispute",
        name: "Unauthorized Inquiry Dispute Letter",
        type: "form",
        category: exports.TEMPLATE_CATEGORIES.INQUIRY_DISPUTE,
        description: "Dispute unauthorized credit inquiries that violate FCRA Section 604",
        preview: "I am writing to dispute unauthorized credit inquiries that appear on my credit report. These inquiries were made without my permission...",
        fullContent: "[YOUR NAME]\n[YOUR ADDRESS]\n[CITY, STATE ZIP]\n[YOUR EMAIL]\n[YOUR PHONE]\n[DATE]\n\nVIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED\n[CREDIT BUREAU NAME]\n[CREDIT BUREAU ADDRESS]\n[CITY, STATE ZIP]\n\nRe: Dispute of Unauthorized Credit Inquiry - Consumer File [LAST 4 OF SSN]\n\nNOTICE OF DISPUTE - UNAUTHORIZED INQUIRY\nPURSUANT TO FCRA \u00A7 604 [15 USC \u00A7 1681b]\n\nTo Whom It May Concern:\n\nI am writing to dispute unauthorized credit inquiries that appear on my credit report. These inquiries were made without my permission and without a permissible purpose under FCRA \u00A7 604.\n\nDISPUTED INQUIRIES:\n\n1. Company Name: [COMPANY NAME]\n   Date of Inquiry: [DATE]\n   Reason: No permissible purpose/No business relationship/No authorization\n\n2. Company Name: [COMPANY NAME]\n   Date of Inquiry: [DATE]\n   Reason: No permissible purpose/No business relationship/No authorization\n\nLEGAL VIOLATIONS:\n\nThe above inquiries violate FCRA \u00A7 604 [15 USC \u00A7 1681b] which requires:\n1. A permissible purpose for accessing credit reports\n2. Written consent for employment purposes\n3. Legitimate business need related to a transaction\n\nI have no business relationship with these companies and did not authorize these inquiries. This constitutes a violation of:\n- FCRA \u00A7 604 [15 USC \u00A7 1681b] - Permissible Purposes\n- FCRA \u00A7 607 [15 USC \u00A7 1681e] - Compliance Procedures\n- FCRA \u00A7 615 [15 USC \u00A7 1681m] - Requirements on Users\n\nLEGAL DEMANDS:\n\nPursuant to FCRA \u00A7 611 [15 USC \u00A7 1681i], I demand that you:\n\n1. Remove all unauthorized inquiries immediately\n2. Investigate how these companies obtained access\n3. Implement procedures to prevent unauthorized access\n4. Provide me with investigation results\n5. Send updated credit report showing removals\n\nNOTICE OF LIABILITY:\n\nUnauthorized access to credit reports may result in:\n- Statutory damages of $1,000 per violation\n- Actual damages\n- Punitive damages\n- Attorney's fees and costs\n\nUnder FCRA \u00A7 616 [15 USC \u00A7 1681n] and \u00A7 617 [15 USC \u00A7 1681o]\n\nPlease respond within 30 days as required by law. Send all correspondence to the address above.\n\nSincerely,\n[YOUR SIGNATURE]\n[YOUR PRINTED NAME]\n\nEnclosures:\n- Copy of credit report with unauthorized inquiries marked\n- Documentation showing no business relationship (if available)\n- Copy of ID and proof of address",
        tags: ["inquiry", "unauthorized", "fcra", "dispute"],
        rating: 4.6,
        creditCost: 2,
        legalArea: "Credit Reporting",
        requirements: [
            "Credit report with unauthorized inquiries marked",
            "Proof of no business relationship (if available)",
            "Valid ID and proof of address",
            "List of unauthorized inquiries"
        ],
        legalCitations: [
            "FCRA § 604 [15 USC § 1681b] - Permissible purposes of consumer reports",
            "FCRA § 607 [15 USC § 1681e] - Compliance procedures",
            "FCRA § 615 [15 USC § 1681m] - Requirements on users",
            "FCRA § 616 [15 USC § 1681n] - Civil liability for willful noncompliance",
            "FCRA § 617 [15 USC § 1681o] - Civil liability for negligent noncompliance"
        ]
    }
];
function TemplateSidebar(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onToggle = _a.onToggle, onTemplateSelect = _a.onTemplateSelect, userCredits = _a.userCredits, onCreditUpdate = _a.onCreditUpdate;
    var _b = react_1.useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = react_1.useState("All"), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var _d = react_1.useState("all"), selectedType = _d[0], setSelectedType = _d[1];
    var _e = react_1.useState(null), previewTemplate = _e[0], setPreviewTemplate = _e[1];
    var _f = react_1.useState(false), isProcessing = _f[0], setIsProcessing = _f[1];
    var user = AuthContext_1.useAuth().user;
    var toast = use_toast_1.useToast().toast;
    var categories = __spreadArrays(["All"], Array.from(new Set(legalTemplates.map(function (t) { return t.category; }))));
    var filteredTemplates = legalTemplates.filter(function (template) {
        var matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.tags.some(function (tag) { return tag.toLowerCase().includes(searchTerm.toLowerCase()); }) ||
            template.legalArea.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
        var matchesType = selectedType === "all" || template.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });
    var handleUseTemplate = function (template) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user) {
                        toast({
                            title: "Authentication Required",
                            description: "Please log in to use templates",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    if (userCredits < template.creditCost) {
                        toast({
                            title: "Insufficient Credits",
                            description: "This template requires " + template.creditCost + " credits. You have " + userCredits + " credits remaining.",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsProcessing(true);
                    // Call the API to use the template and deduct credits
                    return [4 /*yield*/, api_1.api.useTemplate(user.id, {
                            template_id: template.id,
                            credit_cost: template.creditCost,
                            credits_remaining: userCredits - template.creditCost,
                            metadata: {
                                name: template.name,
                                type: template.type,
                                legalArea: template.legalArea
                            }
                        })];
                case 2:
                    // Call the API to use the template and deduct credits
                    _a.sent();
                    // Call the template selection handler
                    onTemplateSelect(template);
                    // Update credits display
                    onCreditUpdate();
                    toast({
                        title: "Template Applied",
                        description: "\"" + template.name + "\" has been applied. " + template.creditCost + " credits used."
                    });
                    // Close sidebar on mobile
                    if (window.innerWidth < 1024) {
                        onToggle();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error using template:', error_1);
                    toast({
                        title: "Error",
                        description: "Failed to apply template. Please try again.",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyTemplate = function (template) {
        navigator.clipboard.writeText(template.fullContent);
        toast({
            title: "Copied to clipboard",
            description: "\"" + template.name + "\" has been copied to your clipboard."
        });
    };
    return (React.createElement(React.Fragment, null,
        isOpen && React.createElement("div", { className: "fixed inset-0 bg-black/50 z-40 lg:hidden", onClick: onToggle }),
        React.createElement("div", { className: "\n        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700\n        transform transition-transform duration-300 ease-in-out z-50\n        " + (isOpen ? "translate-x-0" : "-translate-x-full") + "\n        w-80 lg:w-96 flex flex-col shadow-lg\n      " },
            React.createElement("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700" },
                React.createElement("div", { className: "flex items-center justify-between mb-4" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Scale, { className: "w-5 h-5 text-blue-600" }),
                        React.createElement("h2", { className: "text-xl font-bold text-gray-900 dark:text-white" }, "Legal Templates")),
                    React.createElement("button", { onClick: onToggle, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden" },
                        React.createElement(lucide_react_1.X, { className: "w-5 h-5" }))),
                React.createElement("div", { className: "mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg" },
                    React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                        React.createElement(lucide_react_1.CreditCard, { className: "w-4 h-4 text-blue-600" }),
                        React.createElement("span", { className: "text-blue-800 dark:text-blue-200" },
                            "Credits: ",
                            React.createElement("span", { className: "font-semibold" }, userCredits)))),
                React.createElement("div", { className: "relative mb-4" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }),
                    React.createElement("input", { type: "text", placeholder: "Search legal templates...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg \r\n                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white\r\n                       focus:ring-2 focus:ring-blue-500 focus:border-transparent" })),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "flex gap-2" }, ["all", "prompt", "form"].map(function (type) { return (React.createElement("button", { key: type, onClick: function () { return setSelectedType(type); }, className: "px-3 py-1 rounded-full text-sm font-medium transition-colors " + (selectedType === type
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600") }, type === "all" ? "All" : type === "prompt" ? "Prompts" : "Forms")); })),
                    React.createElement("select", { value: selectedCategory, onChange: function (e) { return setSelectedCategory(e.target.value); }, className: "w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg \r\n                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white\r\n                       focus:ring-2 focus:ring-blue-500 focus:border-transparent" }, categories.map(function (category) { return (React.createElement("option", { key: category, value: category }, category)); })))),
            React.createElement("div", { className: "flex-1 overflow-y-auto p-4 space-y-3" },
                filteredTemplates.map(function (template) { return (React.createElement("div", { key: template.id, className: "group relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 \r\n                       transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600" },
                    React.createElement("div", { className: "flex items-start justify-between mb-2" },
                        React.createElement("div", { className: "flex items-center gap-2 flex-1" },
                            template.type === "prompt" ? (React.createElement(lucide_react_1.FileText, { className: "w-4 h-4 text-blue-500 flex-shrink-0" })) : (React.createElement(lucide_react_1.Layout, { className: "w-4 h-4 text-green-500 flex-shrink-0" })),
                            React.createElement("h3", { className: "font-medium text-gray-900 dark:text-white text-sm line-clamp-1" }, template.name),
                            template.isPopular && React.createElement(lucide_react_1.Star, { className: "w-3 h-3 text-yellow-500 fill-current flex-shrink-0" }))),
                    React.createElement("div", { className: "mb-2" },
                        React.createElement("span", { className: "inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full" }, template.legalArea)),
                    React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" }, template.description),
                    React.createElement("div", { className: "flex flex-wrap gap-1 mb-3" }, template.tags.slice(0, 3).map(function (tag) { return (React.createElement("span", { key: tag, className: "px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 \r\n                             text-xs rounded-full uppercase" }, tag)); })),
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.Star, { className: "w-3 h-3 text-yellow-500 fill-current" }),
                                React.createElement("span", { className: "text-xs text-gray-600 dark:text-gray-400" }, template.rating)),
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.CreditCard, { className: "w-3 h-3 text-blue-500" }),
                                React.createElement("span", { className: "text-xs text-blue-600 dark:text-blue-400 font-medium" },
                                    template.creditCost,
                                    " credits"))),
                        React.createElement("div", { className: "flex gap-1" },
                            React.createElement("button", { onClick: function (e) {
                                    e.stopPropagation();
                                    setPreviewTemplate(template);
                                }, className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors", title: "Preview" },
                                React.createElement(lucide_react_1.Eye, { className: "w-3 h-3 text-gray-600 dark:text-gray-400" })),
                            React.createElement("button", { onClick: function (e) {
                                    e.stopPropagation();
                                    handleCopyTemplate(template);
                                }, className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors", title: "Copy" },
                                React.createElement(lucide_react_1.Copy, { className: "w-3 h-3 text-gray-600 dark:text-gray-400" })))),
                    React.createElement(button_1.Button, { onClick: function () { return handleUseTemplate(template); }, disabled: userCredits < template.creditCost || isProcessing, className: "w-full mt-3 text-sm", size: "sm" }, isProcessing ? "Processing..." :
                        userCredits < template.creditCost ? "Insufficient Credits" :
                            "Use Template (" + template.creditCost + " credits)"))); }),
                filteredTemplates.length === 0 && (React.createElement("div", { className: "text-center py-8" },
                    React.createElement(lucide_react_1.Scale, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }),
                    React.createElement("p", { className: "text-gray-500 dark:text-gray-400" }, "No templates found"),
                    React.createElement("p", { className: "text-sm text-gray-400 dark:text-gray-500" }, "Try adjusting your search or filters"))))),
        previewTemplate && (React.createElement("div", { className: "fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" },
            React.createElement("div", { className: "bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden" },
                React.createElement("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement(lucide_react_1.Scale, { className: "w-5 h-5 text-blue-600" }),
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white" }, previewTemplate.name),
                            React.createElement("p", { className: "text-sm text-gray-500" }, previewTemplate.legalArea))),
                    React.createElement("button", { onClick: function () { return setPreviewTemplate(null); }, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" },
                        React.createElement(lucide_react_1.X, { className: "w-5 h-5" }))),
                React.createElement("div", { className: "p-4 overflow-y-auto max-h-96" },
                    React.createElement("div", { className: "mb-4" },
                        React.createElement("span", { className: "inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full mb-2" }, previewTemplate.type === "prompt" ? "AI Prompt" : "Legal Form"),
                        React.createElement("p", { className: "text-gray-600 dark:text-gray-300 text-sm mb-4" }, previewTemplate.description),
                        previewTemplate.requirements && previewTemplate.requirements.length > 0 && (React.createElement("div", { className: "mb-4" },
                            React.createElement("h4", { className: "font-semibold text-gray-900 dark:text-white mb-2" }, "Required Documentation:"),
                            React.createElement("ul", { className: "list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1" }, previewTemplate.requirements.map(function (req, index) { return (React.createElement("li", { key: index }, req)); })))),
                        previewTemplate.legalCitations && previewTemplate.legalCitations.length > 0 && (React.createElement("div", { className: "mb-4" },
                            React.createElement("h4", { className: "font-semibold text-gray-900 dark:text-white mb-2" }, "Legal Citations:"),
                            React.createElement("ul", { className: "list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1" }, previewTemplate.legalCitations.map(function (citation, index) { return (React.createElement("li", { key: index }, citation)); }))))),
                    React.createElement("div", { className: "border-t pt-4" },
                        React.createElement("h4", { className: "font-semibold text-gray-900 dark:text-white mb-2" }, "Template Content:"),
                        React.createElement("pre", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap" },
                            React.createElement("code", { className: "text-gray-900 dark:text-white" }, previewTemplate.fullContent)))),
                React.createElement("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end" },
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return handleCopyTemplate(previewTemplate); } }, "Copy Template"),
                    React.createElement(button_1.Button, { onClick: function () {
                            handleUseTemplate(previewTemplate);
                            setPreviewTemplate(null);
                        }, disabled: userCredits < previewTemplate.creditCost || isProcessing }, userCredits < previewTemplate.creditCost ?
                        "Insufficient Credits" :
                        "Use Template (" + previewTemplate.creditCost + " credits)")))))));
}
exports["default"] = TemplateSidebar;
