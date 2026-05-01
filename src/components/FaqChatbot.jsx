import { useMemo, useRef, useState } from 'react';
import { departmentStats, internships, placements, placementStats, recruiters } from '../data/siteData.js';

const starterPrompts = [
  'What can this portal do?',
  'Which companies visit?',
  'What are the placement stats?',
  'How do I apply?'
];

const defaultReply = 'I can answer common questions about recruiters, placement statistics, internships, placements, resumes, login roles, faculty approvals, and portal policies. Try asking about companies, packages, deadlines, resume approval, or how to apply.';

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s&]/g, ' ');
}

function includesAny(text, words) {
  return words.some(word => text.includes(word));
}

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hi, I can help with common Fr. CRCE Placement Cell questions. Pick a question below or type your own.'
    }
  ]);
  const inputRef = useRef(null);

  const answers = useMemo(() => {
    const statLine = placementStats.map(stat => `${stat.label}: ${stat.value}`).join(', ');
    const departmentLine = departmentStats.map(item => `${item.label}: ${item.value}%`).join(', ');
    const recruiterLine = recruiters.map(item => `${item.name} (${item.roles}, ${item.package})`).join('; ');
    const internshipLine = internships.slice(0, 4).map(item => `${item.company} ${item.role}, deadline ${item.deadline}`).join('; ');
    const placementLine = placements.slice(0, 4).map(item => `${item.company} ${item.role}, deadline ${item.deadline}`).join('; ');

    return [
      {
        keywords: ['feature', 'portal', 'do', 'help', 'purpose', 'what can'],
        answer: 'The portal helps students track placement opportunities, build resumes, manage internship and placement applications, view outcomes, and keep profile details ready for campus hiring.'
      },
      {
        keywords: ['company', 'companies', 'recruiter', 'recruiters', 'visit', 'network'],
        answer: `Featured recruiters include ${recruiterLine}.`
      },
      {
        keywords: ['stat', 'stats', 'statistics', 'placed', 'average', 'highest', 'visited', 'outcome'],
        answer: `Current AY 2025-26 in-progress placement snapshot from the college page: ${statLine}. Department-wise placement is ${departmentLine}.`
      },
      {
        keywords: ['department', 'computer', 'ai', 'ds', 'ecs', 'mechanical', 'branch'],
        answer: `Department-wise placement shown on the site: ${departmentLine}.`
      },
      {
        keywords: ['internship', 'internships', 'stipend', 'duration'],
        answer: `Students can filter internships by company, role, skill, department, and duration. Examples listed include ${internshipLine}.`
      },
      {
        keywords: ['placement', 'placements', 'job', 'jobs', 'full time', 'package'],
        answer: `Students can browse full-time placement opportunities and apply from the portal. Examples listed include ${placementLine}.`
      },
      {
        keywords: ['apply', 'application', 'applications', 'approval', 'approved', 'reapply', 'request'],
        answer: 'Students apply from the Opportunities section. Every internship and placement request is sent to faculty for approval. If a request is rejected, the student can reapply.'
      },
      {
        keywords: ['resume', 'cv', 'download', 'verification'],
        answer: 'The Resume Studio lets students enter education, experience, projects, and skills, save the resume, download it as a TXT file, and send it for faculty verification.'
      },
      {
        keywords: ['login', 'sign in', 'password', 'role', 'student', 'faculty', 'recruiter'],
        answer: 'Use the Login button, choose a role, enter a valid email, and use a password with at least 6 characters. The page supports Student, Faculty, and Recruiter role choices.'
      },
      {
        keywords: ['faculty', 'teacher', 'approve', 'post', 'control'],
        answer: 'Faculty can view student profiles, review resume submissions, approve or reject internship and placement applications, post new opportunities, and see approval analytics.'
      },
      {
        keywords: ['policy', 'rules', 'eligibility', 'deadline', 'deadlines', 'conduct', 'documents'],
        answer: 'Policy basics: keep profile, academic data, and resume records updated before applying; respect stated deadlines; malpractice can lead to debarment; carry resume, transcript, ID proof, and required photographs for offline processes.'
      },
      {
        keywords: ['deadline', 'next deadline', 'jp morgan'],
        answer: 'The homepage highlights the next deadline as JP Morgan, 5 PM. Individual opportunities also show their own portal deadlines.'
      }
    ];
  }, []);

  const getAnswer = question => {
    const normalized = normalize(question);
    const exact = answers.find(item => includesAny(normalized, item.keywords));
    return exact?.answer || defaultReply;
  };

  const sendQuestion = question => {
    const cleaned = question.trim();
    if (!cleaned) return;

    setMessages(current => [
      ...current,
      { from: 'user', text: cleaned },
      { from: 'bot', text: getAnswer(cleaned) }
    ]);
    setDraft('');
  };

  const handleSubmit = event => {
    event.preventDefault();
    sendQuestion(draft);
  };

  const openChat = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 60);
  };

  return (
    <section className={`faq-chatbot ${isOpen ? 'open' : ''}`} aria-label="Placement FAQ chatbot">
      {isOpen && (
        <div className="chatbot-panel">
          <header className="chatbot-header">
            <div>
              <strong>Placement Help</strong>
              <span>Pre-programmed FAQ assistant</span>
            </div>
            <button className="icon-button" type="button" onClick={() => setIsOpen(false)} aria-label="Close FAQ chatbot">
              <span className="material-icons-outlined">close</span>
            </button>
          </header>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message, index) => (
              <p className={`chat-message ${message.from}`} key={`${message.from}-${index}`}>
                {message.text}
              </p>
            ))}
          </div>

          <div className="chatbot-prompts" aria-label="Suggested FAQ questions">
            {starterPrompts.map(prompt => (
              <button type="button" key={prompt} onClick={() => sendQuestion(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder="Ask about placements, resumes, deadlines..."
              aria-label="Ask a placement FAQ question"
            />
            <button className="btn btn-primary" type="submit" aria-label="Send question">
              <span className="material-icons-outlined">send</span>
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chatbot-toggle" type="button" onClick={openChat} aria-label="Open FAQ chatbot">
          <span className="material-icons-outlined bot-icon">smart_toy</span>
          <span>FAQs</span>
        </button>
      )}
    </section>
  );
}
