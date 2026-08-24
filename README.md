# Marginalia

A small research notebook to help other people understand complex research papers by breaking them down into plain language. There are fully worked-out guides for every paper, with worked-out math and code. This was built as a personal project for Hack Club's Macondo program.

**Live Site:** https://blog-website-plum-nine-74.vercel.app/

# Why I built this

Marginalia is essentially a blog website about STEM research papers. It's part reading tool and part personal research log. I want it to act as a polished notebook that I would use for noting down my understanding of the research paper. I was filling up too many notebooks, and it was getting more and more difficult to organize my notes.


# Features
- Light/Dark Theme
- LaTeX math rendering (KaTeX), for both blocks and inline
- Syntax-highlighted code blocks using prism.js
- Hoverable jargon definitions
- Automatic equation numbering
- Difficulty badges
- Paper archive with filters and live search
- Sign-up, email verification, and login via Supabase Auth
- A small reader and admin dashboard
- Bookmarking system
- A role-based auth system
- A TinyMCE text editor with custom buttons
- Full CRUD on papers: create, edit, publish/unpublish
- Preference tag-based paper ordering through a custom comparator sort algorithm.

# Services Used

| Element | Tech |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | PostgreSQL, hosted on Supabase |
| Auth | Supabase Auth |
| Math | KaTeX |
| Code highlighting | Prism.js |
| Rich text editing | TinyMCE |
| Content sanitization | DOMPurify |
| Hosting | Vercel |

