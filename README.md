# Marginalia

A small research notebook to help other people understand complex research papers by breaking them down into plain language. There are fully worked-out guides for every paper (except for the ones labelled coming soon). This was built as a personal project for Hack Club's Macondo program.

**Live Site:** https://blog-website-plum-nine-74.vercel.app/

See `updates.html` on the live site for the full, dated changelog.

# Why I built this

I read a lot of research papers and I often find them to be hard to understand at first. It would act as a polished notebook that I would use for noting down my understanding of the research paper. I was filling up too many notebooks, and it was getting more and more difficult to organize my notes. Marginalia is essentially a blog website about STEM research papers. It's part reading tool and part personal research log.


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

# Hosting it Locally

**Prerequisites**

- Install Node.js (v18 or higher)
- Install Git
- Have a Hosted PostgreSQL instance (Supabase) for db

**Steps**

1) Clone the repository
2) Install dependencies with `code` npm install `code`
3) Configure environement varibles. You can copy the template for your `code`.env`code` file using the given `code`.env.example`code` file in the directory.
4) Run the project locally through `code`npx vercel dev`code`
5) Visit `code`http://localhost:3000`code`

