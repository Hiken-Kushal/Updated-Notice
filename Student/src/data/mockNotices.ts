import type {
  Notice,
  ScheduleItem,
  ActionItem,
  RecentUpdate,
  CollegeDocument,
  FeaturedEvent
} from '../types/notice';

export const mockRecentUpdates: RecentUpdate[] = [
  {
    id: 'upd-1',
    title: 'Internal Examination Schedule',
    department: 'Mechanical Engineering',
    timeAgo: '2h ago',
    category: 'Examination',
    noticeId: 'notice-2',
    isUrgent: true,
  },
  {
    id: 'upd-2',
    title: 'Workshop Registration Open',
    department: 'All Departments',
    timeAgo: '5h ago',
    category: 'Events',
    noticeId: 'notice-4',
    isUrgent: false,
  },
  {
    id: 'upd-3',
    title: 'College Holiday Notice',
    department: 'General',
    timeAgo: 'Yesterday',
    category: 'Administrative',
    noticeId: 'notice-3',
    isUrgent: false,
  },
  {
    id: 'upd-4',
    title: 'TCS Campus Recruitment Drive 2024 Updates',
    department: 'Dept of Placement',
    timeAgo: '1d ago',
    category: 'Placement',
    noticeId: 'notice-1',
    isUrgent: true,
  },
  {
    id: 'upd-5',
    title: 'Central Library Digital Repository Access',
    department: 'Central Library',
    timeAgo: '2d ago',
    category: 'Library',
    noticeId: 'notice-6',
    isUrgent: false,
  }
];

export const mockCollegeDocuments: CollegeDocument[] = [
  {
    id: 'doc-1',
    title: 'Scholarship Application Form (AY 2023-24)',
    category: 'Scholarships & Welfare',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    description: 'State & Merit-cum-Means scholarship application checklist and submission form.',
    downloadUrl: '#',
    lastUpdated: 'Oct 2023',
  },
  {
    id: 'doc-2',
    title: 'SPPU Examination Re-evaluation Form',
    category: 'Examinations',
    fileType: 'pdf',
    fileSize: '840 KB',
    description: 'Photocopy request and re-evaluation form for SPPU theory answer sheets.',
    downloadUrl: '#',
    lastUpdated: 'Oct 2023',
  },
  {
    id: 'doc-3',
    title: 'Student Code of Conduct & Academic Guidelines',
    category: 'Institutional Policy',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    description: 'Official college regulations, attendance policies, and campus rules for UG & PG students.',
    downloadUrl: '#',
    lastUpdated: 'Aug 2023',
  },
  {
    id: 'doc-4',
    title: 'Bonafide Certificate & Transcript Request Form',
    category: 'Student Section',
    fileType: 'pdf',
    fileSize: '450 KB',
    description: 'Application for issuing bonafide certificates, fee structure, and academic transcripts.',
    downloadUrl: '#',
    lastUpdated: 'Sep 2023',
  },
  {
    id: 'doc-5',
    title: 'Mandatory Anti-Ragging Undertaking Form',
    category: 'Statutory Compliance',
    fileType: 'pdf',
    fileSize: '620 KB',
    description: 'UGC compliant parent and student anti-ragging affidavit format.',
    downloadUrl: '#',
    lastUpdated: 'Jul 2023',
  },
  {
    id: 'doc-6',
    title: 'IEEE & ACM Digital Library Access Manual',
    category: 'Library Services',
    fileType: 'pdf',
    fileSize: '950 KB',
    description: 'Step-by-step credentials and proxy guide for remote journal access.',
    downloadUrl: '#',
    lastUpdated: 'Sep 2023',
  }
];

export const mockFeaturedEvents: FeaturedEvent[] = [
  {
    id: 'evt-4',
    title: "Gusto '24 — Grand Annual Cultural Extravaganza",
    tag: 'CULTURAL FEST',
    category: 'Cultural Events',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Western India\'s grandest collegiate festival featuring Celebrity Band Night, Street Play, Haute Couture fashion walk, and Art Exhibitions.',
    longDescription: 'Indira College of Engineering and Management presents Gusto \'24. A 3-day gala of music, theatrical arts, dance battles, and fashion showcases evaluated by celebrity judges. Inter-collegiate teams across Maharashtra compete for championship trophies.',
    registrationUrl: 'https://indiraicem.ac.in/gusto24',
    deadlineText: 'Dec 14-16 • Pass Bookings Open',
    startDate: 'Dec 14, 2023',
    endDate: 'Dec 16, 2023',
    time: '04:00 PM – 10:00 PM',
    venue: 'College Open-Air Amphitheatre & Sports Arena',
    isFeatured: true,
    status: 'open',
    noticeId: 'notice-10',
  },
  {
    id: 'evt-1',
    title: "National Innovation Hackathon '24",
    tag: 'HACKATHON',
    category: 'Competitions',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    shortDescription: '24-hour national level software and hardware sprint with cash prizes exceeding ₹2,50,000.',
    longDescription: 'Organized under the flagship Innovate \'24 banner, this hackathon invites innovative student developers to build AI, IoT, FinTech, and Smart City solutions over 24 uninterrupted hours with mentorship from top tech leads.',
    registrationUrl: 'https://indiraicem.ac.in/hackathon24',
    deadlineText: 'Registration closes Nov 10',
    startDate: 'Nov 15, 2023',
    endDate: 'Nov 16, 2023',
    time: '09:00 AM onwards (24h)',
    venue: 'ICEM Innovation Lab & Engineering Quad',
    isFeatured: true,
    status: 'closing-soon',
    noticeId: 'notice-10',
  },
  {
    id: 'evt-5',
    title: "Rangmanch '24 — Inter-Collegiate One-Act Drama Championship",
    tag: 'THEATRE & ARTS',
    category: 'Cultural Events',
    image: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'State-level dramatic competition hosting top collegiate theatre troupes from Maharashtra across Marathi, Hindi, and English plays.',
    longDescription: 'Annual theatre festival dedicated to promoting powerful socio-cultural storytelling. Judged by veterans of Sangeet Natak Akademi and National School of Drama alumni.',
    registrationUrl: 'https://indiraicem.ac.in/rangmanch24',
    deadlineText: 'Nov 28 • Entry Submissions',
    startDate: 'Nov 28, 2023',
    endDate: 'Nov 29, 2023',
    time: '10:00 AM – 06:00 PM',
    venue: 'Main Auditorium (Block A)',
    isFeatured: false,
    status: 'open',
    noticeId: 'notice-10',
  },
  {
    id: 'evt-3',
    title: "Innovate '24 — Technical & Robotic Fest",
    tag: 'TECH FEST',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Flagship engineering extravaganza featuring RoboWars, Drone Racing, and Project Exhibition.',
    longDescription: 'Annual technical fest bringing together over 3,000 engineering participants across Western Maharashtra for RoboWars in an armored arena, FPV drone obstacle courses, and paper presentations.',
    registrationUrl: 'https://indiraicem.ac.in/innovate24',
    deadlineText: 'Nov 15-17 • Registration Open',
    startDate: 'Nov 15, 2023',
    endDate: 'Nov 17, 2023',
    time: '09:30 AM – 05:30 PM',
    venue: 'ICEM Main Auditorium & Ground',
    isFeatured: true,
    status: 'open',
    noticeId: 'notice-10',
  },
  {
    id: 'evt-2',
    title: 'AI & Cloud Infrastructure Bootcamp',
    tag: 'WORKSHOP',
    category: 'Workshops',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Hands-on industrial masterclass on LLMs, Kubernetes, and scalable distributed systems by Google Architects.',
    longDescription: 'Two-day intensive technical bootcamp for computer engineering students covering containerization, Kubernetes cluster management, ML pipelines, and production inference optimization.',
    registrationUrl: 'https://indiraicem.ac.in/ai-bootcamp',
    deadlineText: 'Oct 26 • Limited 60 Seats',
    startDate: 'Oct 26, 2023',
    endDate: 'Oct 27, 2023',
    time: '02:00 PM – 04:30 PM',
    venue: 'Central Seminar Hall (Block B, 3rd Floor)',
    isFeatured: false,
    status: 'open',
    noticeId: 'notice-4',
  },
  {
    id: 'evt-6',
    title: "Tarang '24 — Classical & Western Dance Face-Off",
    tag: 'DANCE & MUSIC',
    category: 'Competitions',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Solo, duet, and group dance battles evaluated by renowned choreographers with trophies and cash rewards.',
    longDescription: 'High-energy choreography battles in Hip-Hop, Contemporary, Folk, and Classical fusion. Participating crews receive official stage certificate and duty leave allowances.',
    registrationUrl: 'https://indiraicem.ac.in/tarang24',
    deadlineText: 'Dec 02 • Limited Team Slots',
    startDate: 'Dec 02, 2023',
    endDate: 'Dec 02, 2023',
    time: '03:00 PM – 08:00 PM',
    venue: 'Central Sports Complex Arena',
    isFeatured: false,
    status: 'closing-soon',
    noticeId: 'notice-10',
  },
  {
    id: 'evt-7',
    title: 'Inter-Department Basketball & Futsal Championship',
    tag: 'SPORTS',
    category: 'College Events',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Annual inter-department sports tournament selection trials open for all academic years.',
    longDescription: 'Departmental sports showdown across basketball, volleyball, and futsal. Winners will represent ICEM at the Savitribai Phule Pune University zonal tournament.',
    registrationUrl: 'https://indiraicem.ac.in/sports-cup',
    deadlineText: 'Oct 27-28 • Team Nominations',
    startDate: 'Oct 27, 2023',
    endDate: 'Oct 28, 2023',
    time: '08:00 AM – 06:00 PM',
    venue: 'College Sports Complex & Turf',
    isFeatured: false,
    status: 'open',
    noticeId: 'notice-5',
  },
  {
    id: 'evt-8',
    title: 'Symphony & NatyaRang Cultural Audition Sessions',
    tag: 'AUDITIONS',
    category: 'Student Activities',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Open student council auditions for vocalists, instrumentalists, scriptwriters, and actors for upcoming youth festivals.',
    longDescription: 'Annual recruitment and screening by senior cultural coordinators. Selected members join official college teams representing ICEM at Purushottam and Firodiya Karandak.',
    registrationUrl: 'https://indiraicem.ac.in/auditions',
    deadlineText: 'Nov 06-08 • Direct Walk-in',
    startDate: 'Nov 06, 2023',
    endDate: 'Nov 08, 2023',
    time: '03:00 PM – 06:00 PM',
    venue: 'Music Studio & Amphitheatre Stage',
    isFeatured: false,
    status: 'open',
    noticeId: 'notice-10',
  }
];

export const mockActionItems: ActionItem[] = [
  {
    id: 'act-1',
    dateLabel: 'Oct 26',
    title: 'Project Proposal Submission',
    noticeId: 'notice-9',
    type: 'error',
  },
  {
    id: 'act-2',
    dateLabel: 'Oct 30',
    title: 'Semester Fee Payment',
    noticeId: 'notice-3',
    type: 'warning',
  },
  {
    id: 'act-3',
    dateLabel: 'Nov 02',
    title: 'SPPU Exam Form Verification',
    noticeId: 'notice-11',
    type: 'info',
  }
];

export const mockScheduleItems: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '10:00',
    period: 'AM',
    subject: 'Data Structures & Algorithms',
    details: 'Room 304 • Prof. Gupta',
    type: 'lecture',
    colorBorder: 'primary',
  },
  {
    id: 'sch-2',
    time: '11:30',
    period: 'AM',
    subject: 'Web Technologies Lab',
    details: 'Lab 2 • Prof. Singh',
    type: 'lab',
    colorBorder: 'secondary',
  },
  {
    id: 'sch-3',
    time: '01:00',
    period: 'PM',
    subject: 'Lunch Break & Peer Discussion',
    details: 'Central Cafeteria',
    type: 'break',
    colorBorder: 'muted',
  },
  {
    id: 'sch-4',
    time: '02:00',
    period: 'PM',
    subject: 'Software Engineering & Agile',
    details: 'Room 305 • Prof. Deshmukh',
    type: 'lecture',
    colorBorder: 'tertiary',
  },
];

export const mockNotices: Notice[] = [
  {
    id: 'notice-1',
    title: 'TCS Campus Recruitment Drive 2024 - Important Updates',
    category: 'Placement',
    date: 'Oct 24, 2023',
    time: '11:30 AM',
    summary: 'Registration for the TCS Ninja and Digital Campus Recruitment drive is now open for the 2024 graduating batch. Eligible candidates must complete their profile on the NextStep portal before the deadline.',
    content: 'All final-year students of Computer, IT, and ENTC branches are informed that Tata Consultancy Services (TCS) will conduct its campus drive for the 2024 batch. Ensure registration and profile completeness.',
    fullBody: {
      salutation: 'Dear Final Year Students,',
      introduction: 'This is to inform all final-year students of Computer Engineering, Information Technology, and ENTC branches that the Tata Consultancy Services (TCS) Campus Recruitment Drive for the 2024 graduating batch is scheduled for next week. Participation is mandatory for all eligible candidates who have registered on the TCS NextStep portal.',
      sections: [
        {
          title: 'Important Dates & Schedule',
          items: [
            'Pre-Placement Talk: October 27, 2023 (10:00 AM - Main Auditorium)',
            'Online Assessment (Ninja & Digital): October 28, 2023 (Reporting Time: 8:30 AM, Computer Labs 1-4)',
            'Technical & HR Interviews: October 29-30, 2023 (For shortlisted candidates only)'
          ]
        },
        {
          title: 'Eligibility Criteria',
          items: [
            'Minimum 60% or 6.0 CGPA throughout academics (10th, 12th / Diploma, UG)',
            'No active backlogs / ATKT at the time of appearing for the process',
            'Overall academic gap in education should not exceed 24 months'
          ]
        }
      ],
      callout: 'Students must bring their College ID card, 2 physical copies of their updated resume, and valid government ID proof (Aadhar/PAN Card) on the day of assessment.',
      instructions: [
        'Complete registration on NextStep portal under IT category.',
        'Upload verified 7th semester marksheets to TPO portal.',
        'Formal dress code is mandatory for all rounds.'
      ]
    },
    important: true,
    urgent: true,
    actionRequired: true,
    actionDeadline: 'Oct 26, 2023, 5:00 PM',
    targetAudience: 'Final Year B.E. (Computer, IT, ENTC)',
    department: 'Dept of Placement (TPO)',
    departmentKey: 'ce',
    issuedBy: 'Prof. S. Kulkarni (Head - Training & Placement)',
    attachments: [
      {
        name: 'TCS_Registration_Guidelines_2024.pdf',
        size: '2.4 MB',
        type: 'pdf',
        url: '#'
      },
      {
        name: 'Eligible_Students_List_V1.xlsx',
        size: '1.1 MB',
        type: 'excel',
        url: '#'
      }
    ],
    accentColor: 'warning',
  },
  {
    id: 'notice-2',
    title: 'Revised End Semester Examination Schedule (Winter 2023)',
    category: 'Examination',
    date: 'Today, 09:00 AM',
    time: '09:00 AM',
    summary: 'The end semester examination schedule for Third Year & Final Year Computer Engineering has been revised in accordance with SPPU university circular.',
    content: 'Revised timetable for theory and practical examinations for Winter 2023 session. Please download the official circular for subject-wise slot changes.',
    fullBody: {
      salutation: 'Attention: SE, TE & BE Students,',
      introduction: 'In compliance with Savitribai Phule Pune University (SPPU) circular no. EX/2023/892, the timetable for the upcoming Winter Semester Theory and Practical Examinations has been restructured to accommodate statutory university events.',
      sections: [
        {
          title: 'Key Revisions',
          items: [
            'Computer Networks theory exam moved from Nov 14 to Nov 18 (10:00 AM - 01:00 PM).',
            'Cloud Computing elective paper scheduled for Nov 21.',
            'Practical viva slots allocated department-wise starting Nov 04.'
          ]
        },
        {
          title: 'Examination Guidelines',
          items: [
            'Hall tickets will be distributed from the department desk starting Monday.',
            'Entry to examination hall will close 15 minutes before the paper commencement.',
            'No electronic gadgets or smartwatches permitted inside examination halls.'
          ]
        }
      ],
      callout: 'Ensure fee clearance before collecting the physical hall ticket from your respective class teachers.'
    },
    important: true,
    urgent: false,
    targetAudience: 'SE, TE & BE (All Departments)',
    department: 'Examination Cell',
    departmentKey: 'all',
    issuedBy: 'Controller of Examinations (CoE)',
    attachments: [
      {
        name: 'Revised_Exam_TimeTable_Winter2023.pdf',
        size: '3.8 MB',
        type: 'pdf',
      }
    ],
    accentColor: 'warning',
  },
  {
    id: 'notice-3',
    title: 'Mandatory Anti-Ragging Affidavit Submission for AY 2023-24',
    category: 'Administrative',
    date: 'Yesterday, 04:30 PM',
    time: '04:30 PM',
    summary: 'All enrolled students must submit the updated anti-ragging affidavit online via UGC/Anti-Ragging web portal and submit physical copies to the registrar office.',
    content: 'Statutory compliance requirement: All first year, direct second year, and continuing students must complete the UGC anti-ragging undertaking by the due date.',
    fullBody: {
      salutation: 'All ICEM Students & Guardians,',
      introduction: 'As per the Supreme Court of India and UGC regulatory directives, every student admitted to ICEM is required to submit an Anti-Ragging Undertaking at the beginning of each academic year.',
      sections: [
        {
          title: 'Submission Procedure',
          items: [
            'Visit www.antiragging.in and register under ICEM College details.',
            'Fill student information along with parent/guardian contact details.',
            'Download the PDF undertaking containing Reference Number.',
            'Submit signed hard copy to the Student Section Counter No. 3.'
          ]
        }
      ],
      callout: 'Failure to submit the undertaking will result in withholding of semester enrollment.'
    },
    important: true,
    urgent: false,
    actionRequired: true,
    actionDeadline: 'Oct 30, 2023',
    targetAudience: 'All Enrolled Students (UG & PG)',
    department: 'Admin & Student Welfare Cell',
    departmentKey: 'all',
    issuedBy: 'Dean - Student Welfare & Registrar',
    attachments: [
      {
        name: 'Anti_Ragging_StepByStep_Guide.pdf',
        size: '1.2 MB',
        type: 'pdf',
      }
    ],
    accentColor: 'primary',
  },
  {
    id: 'notice-4',
    title: 'Guest Lecture on AI in Cloud Computing & Distributed Systems',
    category: 'Academic',
    date: 'Oct 24, 2023',
    time: '02:00 PM',
    summary: 'Distinguished industry expert session by Prof. Sharma (Lead Cloud Architect at Google Cloud) on large-scale AI infrastructure and distributed workflows.',
    content: 'Special technical session organized by the Department of Computer Engineering. Topics include GPU orchestration, Kubernetes in ML pipelines, and LLM inference scaling.',
    fullBody: {
      salutation: 'Dear Students & Faculty Members,',
      introduction: 'The Department of Computer Engineering is delighted to invite all students and faculty to an exclusive guest lecture on cutting-edge developments in Artificial Intelligence on Cloud Infrastructure.',
      sections: [
        {
          title: 'Session Details',
          items: [
            'Date & Time: Thursday, Oct 26, 2023 | 02:00 PM - 04:30 PM',
            'Venue: ICEM Central Seminar Hall (Block B, 3rd Floor)',
            'Speaker: Prof. Rajesh Sharma, Principal Cloud Architect & Google Developer Expert',
            'Target Audience: TE, BE Computer Engineering & Information Technology'
          ]
        }
      ],
      callout: 'Certificates of attendance will be issued to all registered participants.'
    },
    important: false,
    targetAudience: 'SE, TE, BE Computer Engineering & IT',
    department: 'Computer Engineering',
    departmentKey: 'ce',
    issuedBy: 'Prof. Sharma (HOD Computer Engineering)',
    facultyAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    attachments: [
      {
        name: 'Guest_Lecture_Brochure.pdf',
        size: '1.8 MB',
        type: 'pdf',
      }
    ],
    accentColor: 'secondary',
  },
  {
    id: 'notice-5',
    title: 'Inter-Department Basketball & Futsal Tryouts 2023',
    category: 'Sports',
    date: 'Oct 25, 2023',
    time: '05:00 PM',
    summary: 'Annual inter-department sports tournament selection trials open for all years. Represent your department in the upcoming Pune University Inter-College Trophy.',
    content: 'Selection rounds for Men and Women Basketball teams and Futsal squad at the college sports complex.',
    fullBody: {
      salutation: 'Calling All Athletes,',
      introduction: 'Trials for college sports teams representing ICEM at the Pune University Inter-Collegiate Championship will be held starting this Friday.',
      sections: [
        {
          title: 'Trial Schedule',
          items: [
            'Basketball (Men & Women): Friday, Oct 27 | 04:30 PM (Outdoor Court)',
            'Futsal / Football: Saturday, Oct 28 | 08:00 AM (Main Sports Turf)'
          ]
        }
      ],
      callout: 'Proper athletic footwear and college sports jersey are mandatory.'
    },
    important: false,
    targetAudience: 'All Undergraduate Students',
    department: 'Sports Complex & Physical Education',
    departmentKey: 'all',
    issuedBy: 'Director of Physical Education',
    accentColor: 'info',
  },
  {
    id: 'notice-6',
    title: 'New IEEE & ACM Digital Library Journals Available Offline & IP-Based Access',
    category: 'Library',
    date: 'Oct 22, 2023',
    time: '11:00 AM',
    summary: 'The Central Library has renewed subscriptions to IEEE Xplore, ACM Digital Library, and Springer Nature journals. Access available across campus Wi-Fi and digital terminals.',
    content: 'Access thousands of peer-reviewed research papers and conference proceedings for academic projects and publications.',
    fullBody: {
      salutation: 'Research Scholars & Students,',
      introduction: 'We are pleased to announce that ICEM Central Library has expanded its digital repository with direct IP-authenticated access to top-tier engineering libraries.',
      sections: [
        {
          title: 'How to Access',
          items: [
            'Connect to ICEM-Campus Wi-Fi or access the terminals in Central Library 2nd Floor.',
            'Visit ieeexplore.ieee.org or dl.acm.org for automatic institutional login.',
            'Remote access credentials can be collected from the chief librarian.'
          ]
        }
      ]
    },
    important: false,
    targetAudience: 'All Faculty & Students',
    department: 'Central Library',
    departmentKey: 'all',
    issuedBy: 'Dr. M. Joshi (Chief Librarian)',
    attachments: [
      {
        name: 'Digital_Library_Access_Manual.pdf',
        size: '950 KB',
        type: 'pdf',
      }
    ],
    accentColor: 'neutral',
  },
  {
    id: 'notice-7',
    title: 'Pre-Placement Talk & Technical Briefing: TechCorp Solutions',
    category: 'Placement',
    date: 'Oct 28, 2023',
    time: '10:30 AM',
    summary: 'Company presentation and direct technical interaction with TechCorp Solutions engineering team for Software Development Engineer (SDE-1) positions.',
    content: 'Comprehensive overview of CTC breakdown, job roles, interview evaluation metrics, and tech stack expectations.',
    fullBody: {
      salutation: 'Final Year Registered Candidates,',
      introduction: 'TechCorp Solutions will conduct their pre-placement presentation in the Main Auditorium. Attendance is mandatory for registered eligible candidates.',
      sections: [
        {
          title: 'Placement Metrics',
          items: [
            'Role: Associate Software Engineer (Full Stack & Cloud)',
            'CTC: 8.5 LPA to 12.0 LPA (based on hackathon round performance)',
            'Location: Pune / Bangalore (Hybrid)'
          ]
        }
      ]
    },
    important: true,
    targetAudience: 'Final Year B.E. (Computer, IT, ENTC)',
    department: 'Dept of Placement (TPO)',
    departmentKey: 'ce',
    issuedBy: 'TPO Placement Cell',
    accentColor: 'primary',
  },
  {
    id: 'notice-8',
    title: 'Campus Central Wi-Fi & Firewall Maintenance Schedule',
    category: 'General',
    date: 'Oct 21, 2023',
    time: '06:00 PM',
    summary: 'Routine maintenance of core switchboards and firewall hardware scheduled for Saturday night. Brief intermittent connectivity interruptions expected.',
    content: 'Network operations center will carry out scheduled fiber upgrade on Saturday between 11:00 PM and 04:00 AM.',
    targetAudience: 'All Campus Residents & Labs',
    department: 'IT Infrastructure & Networking Cell',
    departmentKey: 'all',
    issuedBy: 'Network Operations Head',
    accentColor: 'neutral',
  },
  {
    id: 'notice-9',
    title: 'Final Year Capstone Project Allocation & Guide Mapping List',
    category: 'Academic',
    date: 'Oct 20, 2023',
    time: '03:15 PM',
    summary: 'Approved project titles, assigned faculty mentors, and stage-1 synopsis submission schedule for final year Computer Engineering groups.',
    content: 'Review the assigned guides and schedule the initial project problem-statement review before the deadline.',
    fullBody: {
      salutation: 'Final Year Project Batches,',
      introduction: 'The Department Project Evaluation Committee (DPEC) has completed the review of project proposals and assigned faculty guides.',
      sections: [
        {
          title: 'Next Deliverables',
          items: [
            'Stage-1 Synopsis Document Submission: Oct 26, 2023',
            'Literature Survey & Architecture Diagram Review: Nov 05, 2023',
            'Base Paper verification with guide by end of this week'
          ]
        }
      ],
      callout: 'Synopsis must follow the standard IEEE double-column format signed by the guide.'
    },
    important: true,
    actionRequired: true,
    actionDeadline: 'Oct 26, 2023',
    targetAudience: 'BE Computer Engineering Batches',
    department: 'Computer Engineering',
    departmentKey: 'ce',
    issuedBy: 'Project Coordinator (Comp Dept)',
    attachments: [
      {
        name: 'BE_Project_Allocation_List_2023_24.pdf',
        size: '1.6 MB',
        type: 'pdf',
      },
      {
        name: 'Project_Synopsis_Template.docx',
        size: '420 KB',
        type: 'doc',
      }
    ],
    accentColor: 'warning',
  },
  {
    id: 'notice-10',
    title: 'Annual Tech Fest "Innovate \'24" — Call for Student Leads & Volunteers',
    category: 'Events',
    date: 'Oct 20, 2023',
    time: '12:00 PM',
    summary: 'Join the organizing committee for Western Maharashtra\'s largest annual inter-college technical extravaganza. Open leadership roles across 8 verticals.',
    content: 'Applications open for Event Management, Hackathon Coordination, Sponsorship, Design & Media, Technical Infrastructure, and Hospitality teams.',
    fullBody: {
      salutation: 'Calling All Creative & Technical Minds!',
      introduction: 'Indira College of Engineering & Management is proud to announce "Innovate \'24", our flagship national-level technical symposium. We invite student organizers to lead the flagship events.',
      sections: [
        {
          title: 'Verticals Available',
          items: [
            'National 24-Hour Hackathon & Coding Arena',
            'RoboWars & Drone Racing Challenge',
            'AI / ML Paper Presentation & Project Exhibition',
            'Sponsorship, PR & Industry Relations'
          ]
        }
      ],
      callout: 'Leadership experience will be recognized with official certificates and portfolio credits.'
    },
    important: false,
    targetAudience: 'FE, SE, TE & BE Students (All Branches)',
    department: 'Student Council & Events Cell',
    departmentKey: 'all',
    issuedBy: 'Faculty Convener - Innovate 24',
    attachments: [
      {
        name: 'Innovate24_Event_Brochure.pdf',
        size: '4.5 MB',
        type: 'pdf',
      },
      {
        name: 'Innovate24_Poster_HighRes.png',
        size: '3.2 MB',
        type: 'image',
      }
    ],
    accentColor: 'primary',
  },
  {
    id: 'notice-11',
    title: 'Important Update: SPPU University Examination Form Extension',
    category: 'Examination',
    date: 'Oct 18, 2023',
    time: '01:00 PM',
    summary: 'The Savitribai Phule Pune University portal has extended online exam form submission with regular fees until Oct 28.',
    content: 'Students who experienced gateway errors or pending approvals can now finalize their forms without penalty.',
    targetAudience: 'All Batches (UG & PG)',
    department: 'Examination Cell',
    departmentKey: 'all',
    issuedBy: 'Examination Section',
    attachments: [
      {
        name: 'SPPU_Official_Extension_Circular.pdf',
        size: '800 KB',
        type: 'pdf',
      }
    ],
    accentColor: 'warning',
  },
  {
    id: 'notice-12',
    title: 'Central Library Sunday Maintenance & Digital Inventory Upgrade',
    category: 'General',
    date: 'Oct 15, 2023',
    time: '10:00 AM',
    summary: 'The physical reading hall and book circulation counters will remain closed this Sunday for barcode cataloging and server upgrades.',
    content: 'Online portal and digital repository will remain 100% operational throughout the maintenance window.',
    targetAudience: 'All College Members',
    department: 'Central Library',
    departmentKey: 'all',
    issuedBy: 'Library Administration',
    accentColor: 'neutral',
  },
  {
    id: 'notice-13',
    title: 'Infosys Placement Mock Technical & Behavioral Interview Session',
    category: 'Placement',
    date: 'Oct 12, 2023',
    time: '04:00 PM',
    summary: 'Special alumni mentoring and 1-on-1 mock technical interviews conducted by alumni engineers working at Infosys and Accenture.',
    content: 'Mandatory mock round for all registered final year candidates to fine-tune problem-solving, behavioral questions, and resume walkthroughs.',
    targetAudience: 'Final Year Registered Students',
    department: 'Dept of Placement (TPO)',
    departmentKey: 'ce',
    issuedBy: 'Training & Placement Office',
    attachments: [
      {
        name: 'Infosys_Mock_Slots_Schedule.pdf',
        size: '1.4 MB',
        type: 'pdf',
      }
    ],
    accentColor: 'primary',
  },
  {
    id: 'notice-14',
    title: 'Indira Annual Cultural Gathering "Gusto \'24" — Registrations & Auditions',
    category: 'Events',
    date: 'Oct 26, 2023',
    time: '11:30 AM',
    summary: 'Auditions for Dance, Music, Theatre, Fashion Show, and Anchor teams commence from next Monday. Exciting events, external celebrity judges, and prizes worth ₹3,50,000.',
    content: 'All students are invited to register for stage events and backstage management committees for Gusto \'24. Download the official circular and audition guidelines.',
    fullBody: {
      salutation: 'Dear Students & Cultural Enthusiasts,',
      introduction: 'The Student Council is thrilled to announce the 2024 edition of "Gusto", the flagship annual cultural celebration of Indira College of Engineering & Management.',
      sections: [
        {
          title: 'Audition & Screening Schedule',
          items: [
            'Celebrity Band Night & Solo Vocals: Dec 14, 2023 (Open-Air Amphitheatre)',
            'Dance Battles (Crew & Duet): Dec 15, 2023 (Sports Complex Arena)',
            'Fashion Show & One-Act Theatre: Dec 16, 2023 (Main Auditorium)'
          ]
        },
        {
          title: 'Participation Guidelines',
          items: [
            'All academic branches and years are eligible to participate.',
            'College duty leave will be sanctioned for official rehearsals.',
            'Winner trophies and certificates validated by university council.'
          ]
        }
      ],
      callout: 'Participants representing college at inter-collegiate festivals will be awarded academic attendance allowances.'
    },
    important: true,
    actionRequired: true,
    actionDeadline: 'Nov 05, 2023',
    targetAudience: 'All First Year, SE, TE & BE Students',
    department: 'Student Cultural Council & Dean Welfare',
    departmentKey: 'all',
    issuedBy: 'Prof. Anjali Deshpande (Cultural Head)',
    attachments: [
      {
        name: 'Gusto24_Rulebook_Categories.pdf',
        size: '3.8 MB',
        type: 'pdf',
      },
      {
        name: 'Cultural_Audition_Form.pdf',
        size: '760 KB',
        type: 'pdf',
      }
    ],
    accentColor: 'secondary',
  },
  {
    id: 'notice-15',
    title: 'National Innovation Hackathon \'24 — 24-Hour Code Sprint (₹2.5L Cash Prizes)',
    category: 'Events',
    date: 'Oct 23, 2023',
    time: '10:00 AM',
    summary: 'National level 24-hour software and hardware development sprint open for inter-collegiate engineering teams. Problem statements released on IoT, AI, and Sustainable Energy.',
    content: 'Registration portal is live for team formations. Mentorship provided by Google and AWS senior architects during the competition.',
    fullBody: {
      salutation: 'Attention Hackers & Innovators,',
      introduction: 'Indira College of Engineering & Management announces the National Innovation Hackathon 2024. Build transformative software and hardware prototypes in 24 hours.',
      sections: [
        {
          title: 'Sprint Details',
          items: [
            'Date: November 15-16, 2023 | 09:00 AM (24 Hours Uninterrupted)',
            'Venue: ICEM Innovation Lab & Engineering Quad',
            'Team Size: 3 to 4 members per team',
            'Cash Prizes: 1st Prize ₹1,00,000 | 2nd Prize ₹75,000 | 3rd Prize ₹50,000'
          ]
        }
      ],
      callout: 'High-speed internet, power stations, and overnight meals will be provided to all verified participants.'
    },
    important: true,
    actionRequired: true,
    actionDeadline: 'Nov 10, 2023',
    targetAudience: 'Engineering & Polytechnic Students',
    department: 'Innovation & Entrepreneurship Cell',
    departmentKey: 'all',
    issuedBy: 'Hackathon Organizing Committee',
    attachments: [
      {
        name: 'Hackathon24_Problem_Statements.pdf',
        size: '2.1 MB',
        type: 'pdf',
      }
    ],
    accentColor: 'primary',
  },
  {
    id: 'notice-16',
    title: 'Rangmanch \'24 — Inter-Collegiate One-Act Drama Championship',
    category: 'Events',
    date: 'Oct 22, 2023',
    time: '02:30 PM',
    summary: 'State-level dramatic competition hosting top collegiate theatre troupes from Maharashtra across Marathi, Hindi, and English one-act plays.',
    content: 'Submit script synopses and stage layout requirements by November 20. Evaluated by renowned Marathi theatre directors and NSD alumni.',
    fullBody: {
      salutation: 'Calling All Dramatic Artists,',
      introduction: 'Indira NatyaRang invites submissions for "Rangmanch \'24", our signature inter-collegiate theatrical competition.',
      sections: [
        {
          title: 'Stage Rules',
          items: [
            'Time Limit: 30 minutes including stage set up and clearance',
            'Venue: Main Auditorium (Block A)',
            'Languages: Marathi, Hindi, and English',
            'Dates: November 28-29, 2023'
          ]
        }
      ],
      callout: 'Best Play, Best Actor, Best Director, and Best Technical Design trophies will be awarded.'
    },
    important: false,
    targetAudience: 'College Drama Societies',
    department: 'Cultural & Theatre Guild',
    departmentKey: 'all',
    issuedBy: 'Director of Cultural Affairs',
    attachments: [
      {
        name: 'Rangmanch24_Guidelines.pdf',
        size: '1.5 MB',
        type: 'pdf',
      }
    ],
    accentColor: 'info',
  },
  {
    id: 'notice-17',
    title: 'Tarang \'24 — Classical & Western Dance Championship Call for Entries',
    category: 'Events',
    date: 'Oct 21, 2023',
    time: '04:00 PM',
    summary: 'Solo, duet, and group choreography battles across Bollywood, Hip-Hop, Contemporary, and Classical fusion styles.',
    content: 'Departmental selections and inter-college entries are now open. Limited 15 team slots on a first-come first-served basis.',
    fullBody: {
      salutation: 'Attention Dance Crews,',
      introduction: 'Showcase your choreography on the biggest stage. Tarang 2024 registrations are officially open.',
      sections: [
        {
          title: 'Event Schedule',
          items: [
            'Event Date: December 02, 2023 | 03:00 PM onwards',
            'Venue: Central Sports Complex Arena',
            'Categories: Solo, Duet, Mega-Crew (8-20 members)'
          ]
        }
      ],
      callout: 'Music audio tracks must be submitted in MP3 format to the cultural desk 48 hours prior to the event.'
    },
    important: false,
    targetAudience: 'All College Dance Enthusiasts',
    department: 'Dance Society & Student Council',
    departmentKey: 'all',
    issuedBy: 'Student Council President',
    attachments: [
      {
        name: 'Tarang24_Rulebook.pdf',
        size: '950 KB',
        type: 'pdf',
      }
    ],
    accentColor: 'secondary',
  },
  {
    id: 'notice-18',
    title: 'Symphony Music Club & NatyaRang Theatre Audition Schedule 2023',
    category: 'Events',
    date: 'Oct 19, 2023',
    time: '03:00 PM',
    summary: 'Open auditions for singers, instrumentalists, percussionists, and actors representing ICEM at Purushottam and Firodiya Karandak.',
    content: 'Walk-in screening sessions across Monday through Wednesday at the Music Studio and Auditorium stage.',
    fullBody: {
      salutation: 'Dear Students,',
      introduction: 'Join ICEM\'s premiere student cultural bodies. Auditions will be conducted by senior coordinators and faculty mentors.',
      sections: [
        {
          title: 'Audition Slots',
          items: [
            'Vocalists & Instrumentalists: Nov 06, 2023 | 03:00 PM (Music Studio)',
            'Actors & Scriptwriters: Nov 07, 2023 | 03:30 PM (Auditorium Stage)'
          ]
        }
      ],
      callout: 'Bring your college ID card. Instruments will be available in the studio.'
    },
    important: false,
    targetAudience: 'All Enrolled Students',
    department: 'Music & Fine Arts Cell',
    departmentKey: 'all',
    issuedBy: 'Faculty Coordinator - Cultural Affairs',
    attachments: [
      {
        name: 'Audition_Registration_Form.pdf',
        size: '500 KB',
        type: 'pdf',
      }
    ],
    accentColor: 'neutral',
  }
];

export const mockStudentProfile = {
  name: 'John Student',
  rollNo: '2023BCSE042',
  prn: '722419082B',
  year: 'First Year (FY)',
  branch: 'Computer Engineering',
  division: 'Div A',
  department: 'Department of Computer Engineering',
  email: 'john.student@indiraicem.ac.in',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
  unreadNotifications: 3,
};
