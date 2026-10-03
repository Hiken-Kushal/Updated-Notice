import { PrismaClient, Role, NoticeStatus, FileType, BannerStatus, ScheduleType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ICEM Smart Notice Portal database with AY 2026-27 academic data...');

  // 1. Clean existing records in reverse dependency order
  await prisma.noticeAcknowledgement.deleteMany({});
  await prisma.noticeBookmark.deleteMany({});
  await prisma.noticeAttachment.deleteMany({});
  await prisma.bannerEvent.deleteMany({});
  await prisma.collegeDocument.deleteMany({});
  await prisma.scheduleItem.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.newsletterSubscription.deleteMany({});

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@icem.ac.in',
      fullName: 'College Administrator',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      department: 'Administration',
      academicYear: 'AY 2026-27',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      username: 'student01',
      email: 'student01@icem.ac.in',
      fullName: 'Aarav Sharma',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      department: 'ce',
      academicYear: 'BE Final Yr',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      username: 'student02',
      email: 'student02@icem.ac.in',
      fullName: 'Priya Patel',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      department: 'it',
      academicYear: 'TE Third Yr',
    },
  });

  console.log('✓ Created users: Admin and 2 Students');

  // 4. Create Notices with Complete fullBody, accurate categories and working attachments
  const notice1 = await prisma.notice.create({
    data: {
      refNo: 'REF-2026-TPO-042',
      title: 'TCS National Qualifier Test (NQT) & Campus Drive 2026',
      category: 'Placement & Training',
      status: NoticeStatus.PUBLISHED,
      summary:
        'Tata Consultancy Services campus recruitment drive for 2026 passing out batch. Eligible branches: Computer Engineering, Information Technology, AI & DS, and ENTC. Mandatory portal registration deadline and hall ticket instructions included.',
      content:
        '<p>Tata Consultancy Services (TCS) announces its flagship campus hiring drive for the graduating engineering batch of 2026. <strong>Eligible branches:</strong> Computer Engineering, IT, AI &amp; DS, and ENTC.</p><p>Mandatory portal registration deadline and hall ticket instructions are provided below.</p><ul><li>Online Cognitive &amp; Technical Assessment: October 14, 2026 (09:00 AM)</li><li>Technical &amp; HR Interview Rounds: October 20-22, 2026</li></ul>',
      fullBody: {
        salutation: 'Dear Final Year Engineering Students (Batch of 2026),',
        introduction:
          'The Training and Placement Cell (TPO) is pleased to announce the TCS National Qualifier Test (NQT) campus recruitment drive for the 2026 graduating batch across eligible engineering disciplines.',
        sections: [
          {
            title: 'Drive Timeline & Round Details',
            items: [
              'Mandatory NextStep Portal Registration Deadline: October 10, 2026 (05:00 PM)',
              'Online Assessment Slot 1: October 14, 2026, 09:00 AM at ICEM Central Computing Facility (Labs 1-4)',
              'Technical & Managerial Interviews: October 20 to October 22, 2026 at TPO Boardroom',
            ],
          },
          {
            title: 'Eligibility Criteria',
            items: [
              'B.E. in Computer Engineering, Information Technology, AI & Data Science, or ENTC',
              'Minimum 60.0% or 6.5 CGPA aggregate throughout 10th, 12th / Diploma, and all completed engineering semesters',
              'No active backlogs at the time of appearance for online assessment',
              'Maximum educational gap: 24 months allowed with valid justification',
            ],
          },
          {
            title: 'Required Documents for Verification',
            items: [
              'Two printed copies of updated resume with passport photograph',
              'College identity card and Government-issued photo ID (Aadhaar / PAN / Passport)',
              'Original and photocopies of marksheets (Semesters 1 through 6)',
            ],
          },
        ],
        instructions: [
          'Complete registration on TCS NextStep portal under IT category.',
          'Verify that your CT/DT reference number matches college records.',
          'Report to Lab 1 at least 30 minutes prior to the scheduled exam slot with your printed hall ticket.',
        ],
        callout:
          'Candidates found engaging in any form of malpractice during the online assessment will be immediately debarred from all campus placement activities for AY 2026-27.',
      },
      issuedBy: 'Prof. R. S. Kulkarni (Head, Training & Placement)',
      department: 'Training & Placement Cell',
      departmentKey: 'tpo',
      date: 'Oct 02, 2026',
      time: '10:30 AM',
      targetAudience: 'BE Final Year (Comp, IT, AIDS, ENTC)',
      academicYear: 'AY 2026-27',
      isImportant: true,
      isUrgent: true,
      actionRequired: true,
      actionDeadline: 'Oct 10, 2026 - 05:00 PM',
      actionDescription: 'Mandatory registration on TCS NextStep portal and upload confirmation slip to TPO desk.',
      createdById: adminUser.id,
      attachments: {
        create: [
          {
            name: 'TCS_NQT_2026_Eligibility_List.pdf',
            originalName: 'TCS_NQT_2026_Eligibility_List.pdf',
            fileUrl: '/uploads/notices/tcs_nqt_2026_eligibility_list.pdf',
            fileType: FileType.PDF,
            fileSize: '1.4 MB',
            mimeType: 'application/pdf',
          },
          {
            name: 'TCS_Drive_Schedule_Slots.xlsx',
            originalName: 'TCS_Drive_Schedule_Slots.xlsx',
            fileUrl: '/uploads/notices/tcs_drive_schedule_slots.xlsx',
            fileType: FileType.EXCEL,
            fileSize: '480 KB',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
      },
    },
  });

  const notice2 = await prisma.notice.create({
    data: {
      refNo: 'EXM-SPPU-2026-88',
      title: 'SPPU End Semester Theory Examination Schedule - Nov/Dec 2026',
      category: 'Examination',
      status: NoticeStatus.PUBLISHED,
      summary:
        'Savitribai Phule Pune University (SPPU) theory examination timetable and hall ticket distribution schedule for SE, TE, and BE regular and backlog engineering students.',
      content:
        '<p>Savitribai Phule Pune University (SPPU) has released the official timetable for the upcoming Winter 2026 End-Semester Examinations for <strong>SE, TE, and BE engineering students</strong>.</p><p>Students are instructed to collect verified physical hall tickets from their respective departmental exam coordinators.</p><ul><li>Examination Commences: November 12, 2026</li><li>Hall Ticket Collection Window: October 25 to November 02, 2026</li></ul>',
      fullBody: {
        salutation: 'All Engineering Students (SE, TE, BE - All Branches),',
        introduction:
          'The Examination Section hereby notifies all enrolled undergraduate engineering students that the SPPU End Semester Theory Examination timetable for the Winter 2026 session has been published.',
        sections: [
          {
            title: 'Examination Slot Timings & Important Dates',
            items: [
              'Morning Session (SE & BE): 10:00 AM to 01:00 PM',
              'Afternoon Session (TE): 02:00 PM to 05:00 PM',
              'Theory Examination Window: November 12, 2026 to December 04, 2026',
              'Hall Ticket Distribution Window: October 25 to November 02, 2026',
            ],
          },
          {
            title: 'Hall Ticket Collection Guidelines',
            items: [
              'Clear all outstanding library dues and departmental equipment clearances before applying.',
              'Verify student signature, photograph, and elective subject codes on the hall ticket.',
              'Report any subject code discrepancies to the Exam Section within 48 hours of receipt.',
            ],
          },
        ],
        instructions: [
          'Collect physical hall ticket from your departmental exam coordinator between 10:00 AM and 03:00 PM.',
          'Carry college ID card and fee receipt at the time of collection.',
        ],
        callout:
          'Possession of mobile phones, smartwatches, or programmable calculators inside the examination hall is strictly prohibited under SPPU Ordinance 9.',
      },
      issuedBy: 'Dr. M. V. Patil (Controller of Examinations)',
      department: 'Examination Section',
      departmentKey: 'exam',
      date: 'Oct 01, 2026',
      time: '09:15 AM',
      targetAudience: 'SE, TE, BE (All Branches)',
      academicYear: 'AY 2026-27',
      isImportant: true,
      isUrgent: true,
      actionRequired: true,
      actionDeadline: 'Nov 02, 2026 - 04:00 PM',
      actionDescription: 'Collect verified hall tickets from departmental examination coordinators with cleared no-dues slip.',
      createdById: adminUser.id,
      attachments: {
        create: [
          {
            name: 'SPPU_Winter_2026_Exam_Timetable.pdf',
            originalName: 'SPPU_Winter_2026_Exam_Timetable.pdf',
            fileUrl: '/uploads/notices/sppu_winter_2026_exam_timetable.pdf',
            fileType: FileType.PDF,
            fileSize: '2.1 MB',
            mimeType: 'application/pdf',
          },
        ],
      },
    },
  });

  const notice3 = await prisma.notice.create({
    data: {
      refNo: 'ACAD-CIR-2026-114',
      title: 'Advanced AI & Generative Modeling Industrial Workshop',
      category: 'Academics',
      status: NoticeStatus.PUBLISHED,
      summary:
        'Three-day intensive industrial workshop covering Transformer architectures, LLM fine-tuning, and PyTorch distributed training conducted in collaboration with NVIDIA Deep Learning Institute.',
      content:
        '<p>The Department of Computer Engineering and Information Technology announces a three-day intensive workshop on <strong>Deep Generative Modeling and LLM Systems</strong> conducted in partnership with NVIDIA Deep Learning Institute (DLI).</p><p>Students will receive hands-on cloud GPU credits and industry certifications upon capstone project completion.</p>',
      fullBody: {
        salutation: 'Dear Engineering Students and Faculty Members,',
        introduction:
          'The Department of Computer Engineering is pleased to host a 3-day practical bootcamp on "Advanced AI & Generative Modeling" featuring senior machine learning engineers from leading research labs.',
        sections: [
          {
            title: 'Curriculum & Key Highlights',
            items: [
              'Day 1: Transformer Foundations, Attention Mechanisms, and Tokenization at Scale',
              'Day 2: Supervised Fine-Tuning (SFT), LoRA/QLoRA Parameter-Efficient Tuning on Cloud GPUs',
              'Day 3: Retrieval-Augmented Generation (RAG) Architecture and Production Deployment with Docker',
            ],
          },
          {
            title: 'Eligibility & Prerequisites',
            items: [
              'Open to TE & BE students of Computer, IT, and AI/Data Science branches',
              'Prior working familiarity with Python and basic Linear Algebra / Calculus concepts',
              'Laptop with minimum 8GB RAM and modern browser for cloud terminal access',
            ],
          },
        ],
        instructions: [
          'Register through the college ERP academic portal before October 08, 2026.',
          'Complete pre-workshop Jupyter notebook setup link sent via registered email.',
        ],
        callout:
          'Limited to 80 participants on a first-come, first-served basis. Verified DLI certificates will be awarded to students who maintain 100% attendance.',
      },
      issuedBy: 'Dr. S. N. Deshmukh (Dean Academics)',
      department: 'Department of Computer Engineering',
      departmentKey: 'ce',
      date: 'Sep 29, 2026',
      time: '11:00 AM',
      targetAudience: 'TE, BE (Comp, IT, AIDS)',
      academicYear: 'AY 2026-27',
      isImportant: true,
      isUrgent: false,
      actionRequired: true,
      actionDeadline: 'Oct 08, 2026 - 05:00 PM',
      actionDescription: 'Mandatory student registration on college ERP academic portal for workshop seat allocation.',
      createdById: adminUser.id,
      attachments: {
        create: [
          {
            name: 'AI_Workshop_Syllabus_Brochure.pdf',
            originalName: 'AI_Workshop_Syllabus_Brochure.pdf',
            fileUrl: '/uploads/notices/ai_workshop_syllabus_brochure.pdf',
            fileType: FileType.PDF,
            fileSize: '890 KB',
            mimeType: 'application/pdf',
          },
        ],
      },
    },
  });

  const notice4 = await prisma.notice.create({
    data: {
      refNo: 'ADM-REG-2026-055',
      title: 'Mandatory Anti-Ragging Affidavit Submission AY 2026-27',
      category: 'Administration',
      status: NoticeStatus.PUBLISHED,
      summary:
        'All admitted students must complete and submit their annual online anti-ragging undertaking on the UGC portal as per Supreme Court of India and AICTE guidelines.',
      content:
        '<p>In strict compliance with directives from the Supreme Court of India, UGC, and AICTE, all students enrolled at ICEM for AY 2026-27 must submit an <strong>Anti-Ragging Undertaking</strong> online.</p><p>Printed signed undertaking forms along with reference numbers must be submitted to the Student Section.</p>',
      fullBody: {
        salutation: 'Dear Students and Parents,',
        introduction:
          'As per UGC Regulation F.1-16/2007 (CPP-II) and AICTE apex notifications, submission of online Anti-Ragging affidavits by every student and parent/guardian is mandatory at the beginning of each academic year.',
        sections: [
          {
            title: 'Submission Procedure',
            items: [
              'Visit official portal www.antiragging.in or www.amanmovement.org',
              'Fill in ICEM College AISHE Code and Director/Principal contact details',
              'Download generated PDF undertaking containing unique reference ID',
              'Submit one signed printed copy to the Student Section desk',
            ],
          },
          {
            title: 'Compliance Deadline & Consequence',
            items: [
              'Last Date for Online Submission: October 15, 2026 (05:00 PM)',
              'Students failing to submit reference numbers will not be issued semester clearance certificates',
            ],
          },
        ],
        instructions: [
          'Keep college registration number and parent contact details ready before starting online form.',
          'Obtain receipt acknowledgement seal from student section counter.',
        ],
        callout:
          'ICEM operates a zero-tolerance policy against any form of ragging. Violators face immediate suspension, rustication, and filing of police FIR.',
      },
      issuedBy: 'Registrar, ICEM Pune',
      department: 'Administrative Office',
      departmentKey: 'admin',
      date: 'Sep 28, 2026',
      time: '02:30 PM',
      targetAudience: 'All Students (FE, SE, TE, BE & ME)',
      academicYear: 'AY 2026-27',
      isImportant: true,
      isUrgent: false,
      actionRequired: true,
      actionDeadline: 'Oct 15, 2026 - 05:00 PM',
      actionDescription: 'Submit signed physical UGC anti-ragging affidavit to the student section desk.',
      createdById: adminUser.id,
      attachments: {
        create: [
          {
            name: 'UGC_AntiRagging_Guidelines_2026.pdf',
            originalName: 'UGC_AntiRagging_Guidelines_2026.pdf',
            fileUrl: '/uploads/notices/ugc_antiragging_guidelines_2026.pdf',
            fileType: FileType.PDF,
            fileSize: '620 KB',
            mimeType: 'application/pdf',
          },
        ],
      },
    },
  });

  const notice5 = await prisma.notice.create({
    data: {
      refNo: 'CUL-EVT-2026-021',
      title: 'Avishkar 2026 — Inter-Collegiate Technical Innovation Fest',
      category: 'Events & Cultural',
      status: NoticeStatus.PUBLISHED,
      summary:
        'Annual flagship technical symposium and project exhibition featuring RoboWars, Hackathon, Drone Arena, and AI Model Showdown with cash prizes over ₹3,00,000.',
      content:
        '<p>Indira College of Engineering and Management presents <strong>Avishkar 2026</strong>, our annual technical and innovation symposium featuring over 60 engineering colleges.</p><p>Competitions include 24-hour Hackathon, RoboWars, Drone Navigation Arena, and Best Engineering Project Expo.</p>',
      fullBody: {
        salutation: 'Dear Student Innovators & Tech Enthusiasts,',
        introduction:
          'The Student Council and Technical Committee are thrilled to invite registrations for Avishkar 2026, the premier collegiate tech symposium of Western Maharashtra, taking place from October 28 to October 30, 2026.',
        sections: [
          {
            title: 'Track Highlights & Prize Pool',
            items: [
              'Autonomous Drone Racing & Obstacle Course (₹75,000 Prize Pool)',
              'Inter-Collegiate Combat Robotics (RoboWars 15kg & 30kg Category)',
              'Smart India Hackathon track: AI, IoT, Clean Energy solutions',
              'Best Final Year Capstone Project Exhibition',
            ],
          },
          {
            title: 'Registration & Team Composition',
            items: [
              'Teams of 2 to 4 members from any accredited engineering institution',
              'Registration includes access to food stalls, mentorship sessions, and certificates',
              'Early-bird team registration closes October 18, 2026',
            ],
          },
        ],
        instructions: [
          'Register team online through portal or at registration desk in Central Quad.',
          'Submit 2-page project synopsis for innovation track by October 20.',
        ],
        callout:
          'Participating students will be granted official academic attendance allowances for all competition days upon faculty coordinator endorsement.',
      },
      issuedBy: 'Cultural & Technical Committee Convener',
      department: 'Student Welfare & Cultural Cell',
      departmentKey: 'all',
      date: 'Sep 25, 2026',
      time: '03:45 PM',
      targetAudience: 'All Engineering Students',
      academicYear: 'AY 2026-27',
      isImportant: false,
      isUrgent: false,
      actionRequired: false,
      createdById: adminUser.id,
      attachments: {
        create: [
          {
            name: 'Avishkar_2026_Rulebook_Schedule.pdf',
            originalName: 'Avishkar_2026_Rulebook_Schedule.pdf',
            fileUrl: '/uploads/notices/avishkar_2026_rulebook_schedule.pdf',
            fileType: FileType.PDF,
            fileSize: '1.8 MB',
            mimeType: 'application/pdf',
          },
        ],
      },
    },
  });

  const notice6 = await prisma.notice.create({
    data: {
      refNo: 'REF-2026-TPO-045',
      title: 'Infosys Springboard Certification & Virtual Internship Cohort',
      category: 'Placement & Training',
      status: NoticeStatus.PUBLISHED,
      summary:
        'Industry-aligned technical learning pathways and guaranteed virtual internship opportunity for TE and BE students across Full Stack, Cloud, and Cybersecurity domains.',
      content:
        '<p>Infosys Springboard launches its exclusive technical accelerator program for ICEM engineering students with <strong>free certifications</strong> and fast-tracked pre-placement interview (PPI) opportunities.</p>',
      fullBody: {
        salutation: 'Dear Third & Final Year Students,',
        introduction:
          'The TPO Cell in collaboration with Infosys Springboard announces the launch of the AY 2026-27 cohort for industry certification and structured internship pathways.',
        sections: [
          {
            title: 'Tracks Offered',
            items: [
              'Full Stack Development (Java / SpringBoot / React)',
              'Cloud Architecture & DevOps (AWS / Azure)',
              'Applied AI & Natural Language Processing',
            ],
          },
          {
            title: 'Benefits to Students',
            items: [
              'Industry verified credentials directly recognized by corporate recruiters',
              'Top 10% performers qualify directly for Infosys technical interview rounds',
            ],
          },
        ],
        instructions: [
          'Sign up using your official @icem.ac.in institutional email id.',
          'Complete track selection by October 12, 2026.',
        ],
        callout:
          'Students completing minimum two certified tracks will be prioritized for upcoming Tier-1 campus placement opportunities.',
      },
      issuedBy: 'Training & Placement Officer',
      department: 'Training & Placement Cell',
      departmentKey: 'tpo',
      date: 'Sep 24, 2026',
      time: '01:15 PM',
      targetAudience: 'TE, BE (All Branches)',
      academicYear: 'AY 2026-27',
      isImportant: false,
      isUrgent: false,
      actionRequired: false,
      createdById: adminUser.id,
      attachments: {
        create: [
          {
            name: 'Infosys_Springboard_Portal_Guide.pdf',
            originalName: 'Infosys_Springboard_Portal_Guide.pdf',
            fileUrl: '/uploads/notices/infosys_springboard_portal_guide.pdf',
            fileType: FileType.PDF,
            fileSize: '740 KB',
            mimeType: 'application/pdf',
          },
        ],
      },
    },
  });

  console.log('✓ Created 6 realistic 2026 notices across all academic categories');

  // 5. Create Student Interactions (Bookmarks & Acknowledgements)
  await prisma.noticeAcknowledgement.create({
    data: {
      noticeId: notice1.id,
      userId: student1.id,
    },
  });

  await prisma.noticeBookmark.create({
    data: {
      noticeId: notice1.id,
      userId: student1.id,
    },
  });

  await prisma.noticeBookmark.create({
    data: {
      noticeId: notice5.id,
      userId: student1.id,
    },
  });

  console.log('✓ Created initial student bookmarks and acknowledgements');

  // 6. Create Featured Banners & Events
  await prisma.bannerEvent.createMany({
    data: [
      {
        title: 'Avishkar 2026 — Inter-Collegiate Technical Innovation Fest',
        tag: 'HACKATHON',
        category: 'Competitions',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        shortDescription: '24-hour national level software and hardware sprint with cash prizes exceeding ₹3,00,000.',
        longDescription:
          "Western India's premier collegiate innovation fest inviting student developers to build AI, IoT, and FinTech prototypes with mentorship from top architects.",
        registrationUrl: 'https://indiraicem.ac.in/avishkar26',
        actionText: 'Register',
        deadlineText: 'Registration closes Oct 18',
        startDate: 'Oct 28, 2026',
        endDate: 'Oct 30, 2026',
        time: '09:00 AM – 06:00 PM',
        venue: 'ICEM Innovation Lab & Engineering Quad',
        isFeatured: true,
        status: BannerStatus.CLOSING_SOON,
        isActive: true,
        noticeId: notice5.id,
        createdById: adminUser.id,
      },
      {
        title: 'Advanced AI & Generative Modeling Bootcamp',
        tag: 'WORKSHOP',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Hands-on practical masterclass on LLMs, Fine-tuning, and scalable distributed systems by NVIDIA certified instructors.',
        longDescription:
          'Comprehensive practical masterclass covering Transformer architecture, model fine-tuning, and cloud scalability.',
        registrationUrl: 'https://indiraicem.ac.in/ai-bootcamp-2026',
        actionText: 'Register',
        deadlineText: 'Oct 08 • Limited 80 Seats',
        startDate: 'Oct 15, 2026',
        endDate: 'Oct 17, 2026',
        time: '10:00 AM – 04:00 PM',
        venue: 'Central Seminar Hall (Block B, 3rd Floor)',
        isFeatured: true,
        status: BannerStatus.OPEN,
        isActive: true,
        noticeId: notice3.id,
        createdById: adminUser.id,
      },
      {
        title: 'TechXelerate 2026 — National Robotics Challenge',
        tag: 'TECH FEST',
        category: 'Festivals',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Flagship engineering extravaganza featuring RoboWars, Drone Racing, and Project Exhibition.',
        longDescription:
          'Flagship tech fest bringing together over 50 engineering institutions to compete in combat robotics, drone agility, and algorithmic coding.',
        registrationUrl: 'https://indiraicem.ac.in/techxelerate26',
        actionText: 'Register',
        deadlineText: 'Nov 20-22 • Registration Open',
        startDate: 'Nov 20, 2026',
        endDate: 'Nov 22, 2026',
        time: '09:00 AM – 06:00 PM',
        venue: 'ICEM Main Auditorium & Ground',
        isFeatured: true,
        status: BannerStatus.OPEN,
        isActive: true,
        createdById: adminUser.id,
      },
      {
        title: "Gusto '26 — Grand Annual Cultural Extravaganza",
        tag: 'CULTURAL FEST',
        category: 'Cultural Events',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
        shortDescription: "Western India's grandest collegiate festival featuring Celebrity Band Night, Battle of Bands, and Theater.",
        longDescription:
          "Indira College of Engineering & Management presents Gusto '26: A 3-day gala of musical concerts, theatrical arts, dance battles, and fashion runway.",
        registrationUrl: 'https://indiraicem.ac.in/gusto26',
        actionText: 'Pass Bookings',
        deadlineText: 'Dec 18-20 • Pass Bookings Open',
        startDate: 'Dec 18, 2026',
        endDate: 'Dec 20, 2026',
        time: '04:00 PM – 10:00 PM',
        venue: 'College Open-Air Amphitheatre',
        isFeatured: true,
        status: BannerStatus.OPEN,
        isActive: true,
        createdById: adminUser.id,
      },
    ],
  });

  console.log('✓ Created 4 featured banners & campus events');

  // 7. Create College Documents
  await prisma.collegeDocument.createMany({
    data: [
      {
        title: 'Scholarship Application Form (AY 2026-27)',
        category: 'Scholarships & Welfare',
        fileType: FileType.PDF,
        fileSize: '1.2 MB',
        description: 'State Government & Merit-cum-Means scholarship application checklist and submission form.',
        downloadUrl: '/uploads/documents/scholarship_form.pdf',
        lastUpdated: 'Oct 2026',
        uploadedById: adminUser.id,
      },
      {
        title: 'SPPU Examination Re-evaluation Form',
        category: 'Examinations',
        fileType: FileType.PDF,
        fileSize: '840 KB',
        description: 'Photocopy request and re-evaluation form for SPPU theory answer sheets.',
        downloadUrl: '/uploads/documents/reevaluation_form.pdf',
        lastUpdated: 'Oct 2026',
        uploadedById: adminUser.id,
      },
      {
        title: 'Student Code of Conduct & Academic Guidelines',
        category: 'Institutional Policy',
        fileType: FileType.PDF,
        fileSize: '2.4 MB',
        description: 'Official college regulations, attendance policies, and campus rules for UG & PG students.',
        downloadUrl: '/uploads/documents/code_of_conduct.pdf',
        lastUpdated: 'Sep 2026',
        uploadedById: adminUser.id,
      },
      {
        title: 'Bonafide Certificate & Transcript Request Form',
        category: 'Student Section',
        fileType: FileType.PDF,
        fileSize: '450 KB',
        description: 'Application for issuing bonafide certificates, fee structure, and academic transcripts.',
        downloadUrl: '/uploads/documents/bonafide_form.pdf',
        lastUpdated: 'Sep 2026',
        uploadedById: adminUser.id,
      },
      {
        title: 'Mandatory Anti-Ragging Undertaking Form',
        category: 'Statutory Compliance',
        fileType: FileType.PDF,
        fileSize: '620 KB',
        description: 'UGC compliant parent and student anti-ragging affidavit format.',
        downloadUrl: '/uploads/documents/antiragging_undertaking.pdf',
        lastUpdated: 'Sep 2026',
        uploadedById: adminUser.id,
      },
      {
        title: 'IEEE & ACM Digital Library Access Manual',
        category: 'Library Services',
        fileType: FileType.PDF,
        fileSize: '950 KB',
        description: 'Step-by-step credentials and proxy guide for remote journal and paper access.',
        downloadUrl: '/uploads/documents/library_manual.pdf',
        lastUpdated: 'Sep 2026',
        uploadedById: adminUser.id,
      },
    ],
  });

  console.log('✓ Created 6 official downloadable college documents');

  // 8. Create Schedule / Timetable Items
  await prisma.scheduleItem.createMany({
    data: [
      {
        time: '09:00 - 10:00',
        period: 'AM',
        subject: 'Database Management Systems (Theory)',
        details: 'Unit IV: Query Optimization & Transaction Management • Room 304',
        type: ScheduleType.LECTURE,
        colorBorder: 'primary',
        department: 'ce',
        dayOfWeek: 'Tuesday',
      },
      {
        time: '10:00 - 11:00',
        period: 'AM',
        subject: 'Advanced Computer Networks',
        details: 'SDN Architecture, OpenFlow & BGP Routing Protocols • Room 304',
        type: ScheduleType.LECTURE,
        colorBorder: 'secondary',
        department: 'ce',
        dayOfWeek: 'Tuesday',
      },
      {
        time: '11:00 - 11:15',
        period: 'AM',
        subject: 'Tea & Morning Break',
        details: 'Central Quad & Cafeteria',
        type: ScheduleType.BREAK,
        colorBorder: 'muted',
        department: 'ce',
        dayOfWeek: 'Tuesday',
      },
      {
        time: '11:15 - 01:15',
        period: 'PM',
        subject: 'Cloud Computing & DevOps Lab (Batch C1/C2)',
        details: 'Kubernetes Cluster Deployment & CI/CD Pipelines • Advanced Lab 3',
        type: ScheduleType.LAB,
        colorBorder: 'tertiary',
        department: 'ce',
        dayOfWeek: 'Tuesday',
      },
    ],
  });

  console.log('✓ Created academic weekly timetable items');

  console.log('\n======================================================');
  console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY (AY 2026-27)');
  console.log('======================================================');
  console.log(' Demo Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Password: Admin@123');
  console.log(' Demo Student Credentials:');
  console.log('   Username: student01');
  console.log('   Password: Student@123');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
