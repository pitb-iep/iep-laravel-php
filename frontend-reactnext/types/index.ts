// ==========================================
// User & Authentication
// ==========================================
export interface User {
    id: string;
    _id?: string;
    name: string;
    fullName?: string;
    email?: string;
    role?: 'Admin' | 'School Head' | 'Teacher' | 'Parent';
}

// ==========================================
// Prompt & Session Management (ABA Therapy)
// ==========================================
export type PromptLevel = 'Independent' | 'Verbal' | 'Gestural' | 'Physical' | 'Modeling' | 'None';
export type SessionType = 'Teaching' | 'Baseline' | 'Probe' | 'Generalization' | 'Maintenance';

// ==========================================
// Goal Bank Hierarchy
// Domain → SubSkill → GoalBankEntry
// ==========================================

/**
 * A top-level curriculum domain (e.g. "Communication & Language Development").
 * Each domain groups related sub-skills and goals.
 *
 * The 11 domains from the PITB curriculum (in order):
 *   1. CLD  — Communication & Language Development
 *   2. FA   — Functional Academics (ENG, URD, NUM, SCI, SS)
 *   3. ADL  — Daily Living Activities & Life Skills
 *   4. VOC  — Vocational Readiness & Career Skills
 *   5. SEL  — Social-Emotional Learning
 *   6. SEN  — Sensory Processing & Self-Regulation
 *   7. IME  — Islamic & Moral Education
 *   8. CEE  — Creative Expression & Emotional Outlet
 *   9. TEC  — Technology & AAC Integration
 *  10. PE   — Physical Education & Recreation
 *  11. CCP  — Civic & Community Participation
 */
export interface Domain {
    id: string;
    _id?: string;
    /** Short curriculum prefix code (e.g. 'CLD', 'ADL', 'FA', 'IME') */
    code?: string;
    title: string;
    name?: string; // Backward-compat alias for title (same value)
    icon?: string; // Emoji icon, e.g. '🗣️', '🏠', '💼'
    description?: string;
    /** Display order (1–11, matching PITB curriculum domain numbering) */
    order?: number;
    subSkills?: SubSkill[];
}

/**
 * A sub-skill groups related goals within a domain.
 * Examples:
 *   Domain CLD → SubSkills: "Receptive Language", "Expressive Language",
 *                            "Pragmatic Communication", "AAC", "Higher-Order"
 *   Domain FA  → SubSkills: "English Literacy" (ENG), "Urdu Literacy" (URD),
 *                            "Numeracy & Math" (NUM), "Science" (SCI), "Social Studies" (SS)
 */
export interface SubSkill {
    id: string;
    _id?: string;
    /** Sub-skill curriculum code (e.g. 'CLD-RL', 'ENG', 'NUM', 'ADL-HC') */
    code?: string;
    title: string;
    name?: string; // Backward-compat alias for title
    description?: string;
    domain?: string | Domain;
    /** Display order within the parent domain */
    order?: number;
    goals?: GoalBankEntry[];
}

/**
 * ABA Prompt Hierarchy — from most to least intrusive.
 * Used in `GoalBankEntry.suggestedPromptLevel` and `Log.promptLevel`.
 *
 * - **Physical**    → Hand-over-hand or full physical guidance (Tier A, new skills)
 * - **Modeling**    → Therapist demonstrates before learner attempts
 * - **Gestural**    → Pointing or visual gesture, no verbal cue
 * - **Verbal**      → Spoken instruction or partial prompt
 * - **Visual**      → Picture card, schedule, or written cue only
 * - **Independent** → No prompt; learner performs skill without help
 * - **None**        → Prompt tracking not applicable
 *
 * Goal: systematically fade from Physical → Independent over time.
 */
export type GoalPromptLevel =
    | 'Physical'     // Most support
    | 'Modeling'
    | 'Gestural'
    | 'Verbal'
    | 'Visual'
    | 'Independent'  // Least support
    | 'None';        // Not tracked

/**
 * Curriculum tier — indicates the learner's developmental level this goal targets.
 *
 * - **A** → Foundational (≈4-6yr developmental age).
 *           Early imitation, object recognition, PECS/AAC introduction,
 *           single-step tasks, hand-over-hand support.
 *
 * - **B** → Emerging (≈7-9yr developmental age).
 *           Functional communication, social initiation, 2-3 step tasks,
 *           verbal prompting, some generalization.
 *
 * - **C** → Functional / Advanced (≈10+ developmental age).
 *           Community-based skills, pre-vocational independence,
 *           self-monitoring, generalization with minimal prompts.
 *
 * ⚠️ Tiers are developmental guidelines — NOT age-based mandates.
 * A 15-year-old learner may still require Tier A goals.
 */
export type GoalTier = 'A' | 'B' | 'C';

/**
 * Classifies the goal by skill area or primary delivery method.
 *
 * ── Core Therapy Approaches ──────────────────────────────────
 * - **ABA**        → Applied Behavior Analysis. DTT, NET, data-driven trials.
 *                    Delivered by BCBA / ABA therapist.
 * - **TEACCH**     → Structured Teaching. Visual structure, work systems,
 *                    predictability. Delivered by trained teacher.
 * - **Speech**     → Speech-Language Therapy. Articulation, pragmatics, AAC.
 *                    Delivered by SLP (Speech-Language Pathologist).
 * - **OT**         → Occupational Therapy. Fine motor, sensory integration, ADLs.
 *                    Delivered by Occupational Therapist.
 * - **PT**         → Physical Therapy. Gross motor, balance, mobility.
 *                    Delivered by Physical Therapist.
 *
 * ── Curriculum Domain Types ──────────────────────────────────
 * - **Functional** → General daily life skills (no specific therapy discipline).
 * - **ADL**        → Activities of Daily Living: hygiene, dressing, feeding.
 * - **Social**     → Peer interaction, social stories, SEL. (SLP/BCBA/teacher)
 * - **Academic**   → Functional literacy, numeracy, science, social studies.
 * - **Motor**      → Gross & fine motor, physical education goals.
 * - **Behavior**   → Self-regulation, replacement behaviors. (BCBA)
 * - **Safety**     → Personal & community safety awareness.
 *
 * ── Extended Curriculum Types (PITB PDF-aligned) ─────────────
 * - **Vocational** → Pre-vocational & career readiness (Domain 4: VOC).
 * - **Sensory**    → Sensory desensitization & self-regulation (Domain 6: SEN).
 * - **Islamic**    → Islamic practices, values, Quranic literacy (Domain 7: IME).
 * - **Creative**   → Arts, music, drama, creative writing (Domain 8: CEE).
 * - **Technology** → AAC devices, digital literacy (Domain 9: TEC).
 * - **Civic**      → Community safety, national identity (Domain 11: CCP).
 */
export type GoalSkillType =
    // Core therapy approaches
    | 'ABA' | 'TEACCH' | 'Speech' | 'OT' | 'PT'
    // Core curriculum domain types
    | 'Functional' | 'ADL' | 'Social' | 'Academic' | 'Motor' | 'Behavior' | 'Safety'
    // Extended curriculum types (PITB PDF-aligned)
    | 'Vocational' | 'Sensory' | 'Islamic' | 'Creative' | 'Technology' | 'Civic';

/**
 * A single goal from the Goal Bank.
 * Goals are sourced from the PITB Curriculum Handbook and identified by `code`.
 *
 * Hierarchy: Domain → SubSkill → GoalBankEntry
 * IEP usage: Goals are referenced in `IEP.goals` via a `GoalRef`.
 */
export interface GoalBankEntry {
    id: string;
    _id?: string;
    /**
     * Unique curriculum goal code (primary identifier for upsert/lookup).
     * Format: DOMAIN-NNN — e.g. 'CLD-001', 'ADL-01', 'ENG-045', 'IME-078'
     */
    code?: string;
    /** Short goal statement as it appears in the IEP (required) */
    title: string;
    /** Extended instructional notes or context (optional) */
    description?: string;
    /** Developmental tier: A=Foundational, B=Emerging, C=Advanced */
    tier?: GoalTier;
    /** Age group guideline from curriculum (advisory only): '4-6', '7-9', '10+' */
    ageGroup?: string;
    /**
     * Short-term objectives — the measurable steps used for IEP data collection.
     * Typically 8-10 steps in ascending difficulty.
     * Example: ["Place hands under running water.", "Apply soap with assistance.", ...]
     */
    objectives?: string[];
    /** Skill area / therapy type — determines who delivers this goal */
    skillType?: GoalSkillType;
    /**
     * Criterion for mastery — used directly in the IEP document.
     * Examples:
     *   - '90% independence across 3 different settings' (ADL)
     *   - '80% accuracy across 3 consecutive sessions' (Speech)
     *   - '4 out of 5 opportunities with generalization' (Social)
     */
    masteryCriteria?: string;
    /** Recommended starting prompt level when introducing this goal */
    suggestedPromptLevel?: GoalPromptLevel;
    promptLevel?: string; // Alias from some API responses (same as suggestedPromptLevel)
    subSkill?: string | SubSkill;
}

/** @deprecated Use GoalBankEntry for goal bank items */
export interface GoalDef {
    _id: string;
    id: string;
    title: string;
    description?: string;
    skillType?: string;
    masteryCriteria?: string;
}

// ==========================================
// IEP & Goals
// ==========================================
export interface GoalRef {
    id: string;
    _id?: string;
    originalGoal?: string | GoalDef | GoalBankEntry;
    status: 'Not Started' | 'In Progress' | 'Achieved';
    targetDate?: string;
    activities?: string;
    customTrialsTarget?: number;
    customMeasurementType?: string;
}

export interface TeamMember {
    name: string;
    role: string;
    attended?: boolean;
}

export interface Accommodations {
    instructional?: string[];
    environmental?: string[];
    assessment?: string[];
}

export interface PresentLevelSummary {
    strengths?: string;
    concerns?: string;
    impact?: string;
    academics?: string;
    functional?: string;
}

export interface IEP {
    id?: string;
    _id?: string;
    status: 'Active' | 'Draft' | 'Archived';
    startDate?: string;
    endDate?: string;
    reviewPeriod?: string;
    nextReviewDate?: string;
    createdBy?: { name: string; fullName?: string };
    goals: GoalRef[];
    presentLevelSummary?: PresentLevelSummary;
    teamMembers?: TeamMember[];
    accommodations?: Accommodations;
    transitionPlan?: {
        postSecondaryGoals?: string;
        postSecondary?: string;
        vocationalGoals?: string;
        vocational?: string;
        independentLiving?: string;
        community?: string;
    };
    esy?: { required: boolean; justification?: string; services?: string };
    teachingApproach?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ==========================================
// Student
// ==========================================
export type ProgramStream = 'ECE' | 'Junior' | 'Senior' | 'Autism Support' | 'General Ed' | 'Life Skills';

export interface Student {
    id: string;
    _id: string;
    name: string;
    diagnosis?: string;
    dob?: string;
    programStream?: ProgramStream;
    currentLevel?: string;
    img?: string;
    activeTherapies?: string[];
    isActive?: boolean;
    teacher?: { fullName: string; name?: string };
    parents?: User[];
    ieps?: IEP[];
    age?: number; // Virtual field
    history?: StudentHistory[];
}

// ==========================================
// Student History
// ==========================================
export interface StudentHistory {
    id: string;
    _id?: string;
    date: string;
    type: 'Previous IEP' | 'Clinical Note' | 'Assessment' | 'Medical Record' | 'Other';
    content: string;
    fileUrl?: string; // Optional link to physical document
    fileName?: string;
    addedBy?: string | User;
    createdAt?: string;
}

// ==========================================
// Progress Logs
// ==========================================
export interface Log {
    id: string;
    _id?: string;
    /**
     * @deprecated Use performanceStatus instead
     */
    result?: string;
    performanceStatus?: 'Achieved' | 'Emerging' | 'Not Yet';
    /**
     * @deprecated Use goal instead
     */
    goalId?: string;
    goal?: { title: string; originalGoal?: { title: string } } | GoalBankEntry | string;
    student?: string | Student;
    iep?: string | IEP;
    notes?: string;
    activity?: string;
    timestamp: string;
    recordedBy?: { name: string; fullName?: string };

    // Trial Data
    trialsCorrect?: number;
    trialsTotal?: number;
    rubricLevel?: 1 | 2 | 3 | 4 | 5;

    // Prompt & Independence Tracking (Critical for ABA)
    promptLevel?: PromptLevel;
    isIndependent?: boolean; // TRUE only when promptLevel is 'Independent' or 'None'

    // Session Management
    sessionType?: SessionType;
    includeInProgress?: boolean; // FALSE for baseline/probe sessions
}

// ==========================================
// Assessments
// ==========================================
export type AssessmentType = 'Baseline' | 'Periodic' | 'Re-assessment' | 'Behavior' | 'VB-MAPP' | 'ABLLS-R' | 'AFLS' | 'Vineland' | 'Other';

export interface AssessmentResult {
    subSkill?: string | SubSkill;
    scoreOrLevel?: string;
    comments?: string;
}

export interface Assessment {
    id: string;
    _id?: string;
    student: string | Student;
    assessor?: string | User;
    dateConducted?: string;
    type: AssessmentType;
    results?: AssessmentResult[];
    summaryNotes?: string;
    createdAt?: string;
}

// ==========================================
// Reports
// ==========================================
export type ReportType = 'Monthly' | 'Quarterly' | 'IEP Review' | 'Annual';

export interface Report {
    id: string;
    _id?: string;
    student: string | Student;
    generatedBy: string | User;
    reportType: ReportType;
    generationDate?: string;
    filePath: string;
    createdAt?: string;
}

// ==========================================
// Incidents (Critical Incident Reports)
// ==========================================
export type IncidentType =
    | 'Staff Injury'
    | 'Student Injury'
    | 'Medical Error'
    | 'Administration of Sedative Medication'
    | 'Emergency Protective Measure'
    | 'Extension of Standard Protective Measure'
    | 'Use of Extraordinary Procedure'
    | 'Novel Staff/Student Behavior'
    | 'Inappropriate Student-to-Student Contact'
    | 'Runaway'
    | 'Community/Neighbor Issue'
    | 'Van Accident'
    | 'False Fire Alarm'
    | 'Actual Fire'
    | 'Major Environmental Damage'
    | 'Unusual Family Issue/Communication'
    | 'Other';

export type IncidentStatus = 'Open' | 'Under Review' | 'Resolved' | 'Closed';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Incident {
    id: string;
    _id?: string;
    reportingStaff: string | User;
    reportingStaffName: string;
    date: string;
    startTime: string;
    endTime?: string;
    teamMembersOnShift?: string[];
    otherStaffPresent?: string;
    studentsInvolved?: (string | Student)[];
    studentNames?: string[];
    setting: string;
    incidentType: IncidentType;
    nameOfInjured?: string;
    description: string;
    reportedTo?: { name?: string; date?: string };
    receivedBySpecialist?: { name?: string; date?: string };
    receivedByDirector?: { name?: string; date?: string };
    comments?: string;
    followUpActions?: { action: string; completedBy?: string; completedDate?: string }[];
    status: IncidentStatus;
    severity: IncidentSeverity;
    attachments?: { filename: string; url: string; uploadedAt?: string }[];
    createdAt?: string;
    updatedAt?: string;
}
