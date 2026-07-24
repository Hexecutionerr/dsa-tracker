import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { transformSheetData } from './utils';

import sampleData from './assets/sheet.json';

export const defaultResumeData = {
  name: "Hasnain Khan",
  tagline: "Computer Engineering Student (Class of 2027) & Full Stack Developer",
  location: "Mumbai, India",
  phone: "+91-9892998637",
  email: "hasnain.khan.ce@gmail.com",
  linkedin: "https://linkedin.com",
  github: "https://github.com",
  leetcode: "https://leetcode.com",
  summary: "Computer Engineering student (Class of 2027) with hands-on experience in full-stack web development. Skilled in Java, JavaScript, and backend development using modern frameworks (MERN, Redis, Socket.io, Gemini AI). Currently building real-world scalable applications and improving problem-solving skills through data structures and algorithms. Strong interest in software engineering, AI/ML, and scalable web application development.",
  skills: [
    { label: "Languages & Paradigms", val: "Java, Python, JavaScript; OOP, Functional Programming" },
    { label: "Front-End", val: "HTML5, CSS3, JavaScript, React.js; Responsive & Component-Based UI" },
    { label: "Back-End & Cloud", val: "Node.js, Express.js, Firebase, MongoDB, PostgreSQL, Redis, Socket.io; REST APIs" },
    { label: "Systems & Tools", val: "Unix/Linux, Git/GitHub, Postman, Jupyter Notebook, Google Colab, VS Code, Docker" },
    { label: "Algorithms & DS", val: "Data Structures & Algorithms, Complexity Analysis, Competitive Programming" },
    { label: "Data Analysis & ML", val: "Pandas, NumPy, Matplotlib, Seaborn, Data Cleaning, Scikit-learn" },
  ],
  projects: [
    {
      id: "p1",
      title: "Bastain – AI-Powered Food Delivery Platform",
      year: "2026",
      stack: "React.js, Node.js, Express.js, MongoDB, Redis, Socket.io, Google Gemini AI, Stripe, Firebase",
      bullets: [
        "Built a production-ready AI-powered food delivery platform using the MERN stack with Redis caching, Socket.io, Stripe payments, Firebase notifications, and Google Gemini AI integration.",
        "Developed an AI recommendation engine using Google Gemini that converts natural language queries into structured MongoDB filters.",
        "Implemented a cache-first architecture with Redis and automatic cache invalidation, significantly reducing database load.",
        "Engineered real-time order tracking via Socket.io with Firebase Cloud Messaging for live delivery updates."
      ]
    },
    {
      id: "p2",
      title: "AL Huda – ERP Billing & Invoice Management Platform",
      year: "2025",
      stack: "React.js, Redux, Node.js, Express.js, MongoDB, JWT, HTML-PDF, Nodemailer",
      bullets: [
        "Built a full-stack ERP Billing & Invoice Management Platform using MERN stack with payment tracking and JWT authentication.",
        "Engineered a server-side PDF generation engine using Node.js and HTML-PDF, eliminating temporary file storage and reducing latency by ~78%.",
        "Optimized PDF rendering via an HTML5 Canvas image compression pipeline in React, reducing uploaded logo payloads by 95%+."
      ]
    }
  ],
  experiences: [
    {
      id: "e1",
      company: "Miraeko Infotech",
      role: "Full Stack Developer Intern (Hybrid)",
      date: "Dec 2025 – Jan 2026",
      bullets: [
        "Developed and maintained a responsive tourism booking platform (Disney Yatra) using React.js, Node.js, Express.js, and MongoDB.",
        "Designed modules for tour package browsing, inquiry forms, booking requests, and admin content management."
      ]
    },
    {
      id: "e2",
      company: "CDAC / USM, Mumbai",
      role: "Database & Backend Development Training",
      date: "Jun 2025",
      bullets: [
        "Completed 60-hour training covering MySQL, MongoDB, SQL optimization, database design, indexing, and backend REST API integration."
      ]
    }
  ],
  education: {
    institute: "Vidyalankar Institute of Technology",
    degree: "B.E. in Computer Engineering (2023 – 2027)",
    cgpa: "8.5 / 10.0"
  },
  certifications: [
    "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate — Oracle (Nov 2025)",
    "MySQL & MongoDB Certificate — C-DAC / USM (Jun 2025)",
    "Digital Marketing & E-commerce Certifications — Google (Oct 2025)"
  ]
};

export const useSheetStore = create(
  persist(
    (set) => ({
      data: transformSheetData(sampleData),

      // ── Resume Data ───────────────────────────────────────────
      resumeData: defaultResumeData,

      updateResumeData: (newResumeData) => set(() => ({
        resumeData: newResumeData,
      })),

      // ── Theme Mode ─────────────────────────────────────────────
      themeMode: 'dark',
      toggleThemeMode: () => set((state) => ({
        themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
      })),

      // ── Daily Goal ─────────────────────────────────────────────
      dailyGoal: { target: 5 },

      setDailyGoal: (target) => set(() => ({
        dailyGoal: { target: Math.max(1, Number(target)) },
      })),

      toggleQuestionStatus: (topicId, subTopicId, questionId) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  const nowSolved = !q.isSolved;
                  return {
                    ...q,
                    isSolved: nowSolved,
                    solvedAt: nowSolved ? new Date().toISOString() : null,
                  };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      deleteQuestion: (topicId, subTopicId, questionId) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.filter(q => q.id !== questionId)
              };
            })
          };
        });
        return { data: newData };
      }),

      addTopic: (title) => set((state) => ({
        data: [
          ...state.data,
          { id: `new-topic-${Date.now()}`, title, subTopics: [] }
        ]
      })),

      deleteTopic: (topicId) => set((state) => ({
        data: state.data.filter(topic => topic.id !== topicId)
      })),

      editTopicTitle: (topicId, newTitle) => set((state) => ({
        data: state.data.map(topic => 
          topic.id === topicId ? { ...topic, title: newTitle } : topic
        )
      })),

      addSubTopic: (topicId, title) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: [
              ...topic.subTopics,
              { id: `sub-${Date.now()}`, title, questions: [] }
            ]
          };
        });
        return { data: newData };
      }),

      addQuestion: (topicId, subTopicId, { title, url, difficulty, platform }) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: [
                  ...sub.questions,
                  {
                    id: `q-${Date.now()}`,
                    title,
                    url: url || '#',
                    difficulty: difficulty || 'Medium',
                    platform: platform || 'custom',
                    isSolved: false,
                    isStarred: false,
                    notes: '',
                    tags: []
                  }
                ]
              };
            })
          };
        });
        return { data: newData };
      }),

      toggleStarQuestion: (topicId, subTopicId, questionId) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  return { ...q, isStarred: !q.isStarred };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      updateQuestionNote: (topicId, subTopicId, questionId, notes) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  return { ...q, notes, noteEditedAt: new Date().toISOString() };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      // ── Mistake Tags System ─────────────────────────────────────
      toggleQuestionTag: (topicId, subTopicId, questionId, tag) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  const currentTags = Array.isArray(q.tags) ? q.tags : [];
                  const exists = currentTags.includes(tag);
                  const updatedTags = exists
                    ? currentTags.filter(t => t !== tag)
                    : [...currentTags, tag];
                  return { ...q, tags: updatedTags };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      // ── Revision System ────────────────────────────────────────
      scheduleRevision: (topicId, subTopicId, questionId, revisionDate) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  return {
                    ...q,
                    revisionDate,          // 'YYYY-MM-DD'
                    revisionAddedAt: new Date().toISOString(),
                    revisionDoneAt: null,  // reset if rescheduled
                  };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      completeRevision: (topicId, subTopicId, questionId) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  return { ...q, revisionDoneAt: new Date().toISOString() };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      removeRevision: (topicId, subTopicId, questionId) => set((state) => {
        const newData = state.data.map(topic => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subTopics: topic.subTopics.map(sub => {
              if (sub.id !== subTopicId) return sub;
              return {
                ...sub,
                questions: sub.questions.map(q => {
                  if (q.id !== questionId) return q;
                  return { ...q, revisionDate: null, revisionAddedAt: null, revisionDoneAt: null };
                })
              };
            })
          };
        });
        return { data: newData };
      }),

      reorder: (result) => set((state) => {
        const { source, destination, type } = result;
        if (!destination) return state;

        const newData = [...state.data];

        if (type === 'TOPIC') {
          const [removed] = newData.splice(source.index, 1);
          newData.splice(destination.index, 0, removed);
          return { data: newData };
        }

        if (type === 'SUBTOPIC') {
          const topicIndex = newData.findIndex(t => t.id === source.droppableId.split('::')[1]);
          const topic = newData[topicIndex];
          const newSubTopics = [...topic.subTopics];
          const [removed] = newSubTopics.splice(source.index, 1);
          newSubTopics.splice(destination.index, 0, removed);
          newData[topicIndex] = { ...topic, subTopics: newSubTopics };
          return { data: newData };
        }

        if (type === 'QUESTION') {
          const [_, topicId, subId] = source.droppableId.split('::');

          const topicIndex = newData.findIndex(t => t.id === topicId);
          const subIndex = newData[topicIndex].subTopics.findIndex(s => s.id === subId);

          const subTopic = newData[topicIndex].subTopics[subIndex];
          const newQuestions = [...subTopic.questions];
          const [removed] = newQuestions.splice(source.index, 1);
          newQuestions.splice(destination.index, 0, removed);

          newData[topicIndex].subTopics[subIndex] = { ...subTopic, questions: newQuestions };
          return { data: newData };
        }

        return { data: newData };
      }),

      // ── Data Management ───────────────────────────────────────
      resetData: () => set(() => ({
        data: transformSheetData(sampleData),
        dailyGoal: { target: 5 },
      })),

      importData: ({ data: importedData, dailyGoal: importedGoal }) => set((state) => ({
        data: Array.isArray(importedData) ? importedData : state.data,
        dailyGoal: importedGoal && importedGoal.target ? importedGoal : state.dailyGoal,
      })),
    }),
    {
      name: 'dsa-sheet-storage', // localStorage key — change this if you ever want to force a reset for all users
    }
  )
);
