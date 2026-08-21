async function userPrefs() {
  const {data} = await supabaseClient.auth.getSession();
  if (!data?.session) return [];

  const rez = await fetch("/api/preferences", {
    headers: {"Content-Type" : "application/json", Authorization: `Bearer ${data.session.access_token}`}

  });
  if (!rez.ok) return [];

  const prefs = await rez.json();
  return (prefs.topics || "")
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean)   
}




function renderHeroPreview(paper) {
  const box = document.getElementById("hero-preview");
  if(!box) return;
  const url = `post.html?id=${paper.id}`
  const tagsHtml = paper.tags.split(",").map(t => t.trim()).join(" &middot; ");
  box.innerHTML = `<div class = "preview-meta">
  <span class = "pulse-dot"></span>LATEST PREVIEW</div>
  <h3>${paper.published? `<a href = "${url}" class = "hero-title-link">${paper.title}</a>` : paper.title}</h3>
  <p class = "preview-snippet">${paper.summary || "Summary coming soon..."}</p>
  <div class = "hero-margin-note hero-margin-note--accent note-1">
  <span class = "note-label">Tags</span>
  ${tagsHtml}
  </div>
  <div class = "hero-margin-note hero-margin-note--brick note-2">
  <span class = "note-label">Difficulty</span>
  ${paper.difficulty.charAt(0).toUpperCase() + paper.difficulty.slice(1)} ${paper.read_time ? ` &mdash; ${paper.read_time}` : ''}
  </div>`;
}

function renderStats(papers) {
  const topics = new Set();
  papers.forEach((p) => {
    if (p.tags){
      p.tags.split(",").forEach((t) => topics.add(t.trim().toLowerCase()));
    }
  });
  

  const papersCount = papers.length;
  const topicsCount = topics.size;

  document.getElementById("stats-bar").innerHTML = `
    <span><strong id = "stat-papers">0</strong> Paper breakdowns</span>
    <span><strong id = "stat-topics">0</strong> Topics covered</span>
  `;
  animateNum("stat-papers", papersCount)
  animateNum("stat-topics" , topicsCount)
}




function animateNum(elementId , targetNum) {
  const el = document.getElementById(elementId)
  if (!el || targetNum == 0) return;

  let current = 0;
  const duration = 600 //in ms
  const stepTime = Math.max(Math.floor(duration/targetNum), 30);

  const timer = setInterval(() => {
    current +=1;
    el.textContent = current;
    if (current >= targetNum) {
      clearInterval(timer);
    }
  }, stepTime);
}



function renderRecent(papers, userTopics= []) {
  const cont = document.getElementById("recent-papers");
  if (!cont) return;
  cont.innerHTML = "";

  if (papers.length === 0) {
    cont.innerHTML = `<p class="home-loading">Nothing here yet — check the full archive.</p>`;
    return;
  }

  papers.forEach((paper) => {
    const li = document.createElement("div");
    const url = `post.html?id=${paper.id}`;
    li.className = paper.published ? "entry" : "entry entry-soon";

    const tagsHtml = paper.tags.split(",").map((t) => {
      const cl = t.trim();
      const corresponds = userTopics.includes(cl.toLowerCase());
      return `<span class="tag-chip${corresponds? " matched" : ""}">${cl}</span>`;
    }).join("");


    const innerHtml = `
      <div class="entry-meta">
        <span>${paper.date || "Coming Soon"}</span>
        <span>${paper.read_time || ""}</span>
        <span class="difficulty difficulty--${paper.difficulty}">${paper.difficulty}</span>
      </div>
      <h3 class="entry-title">${paper.title}</h3>
      <p class="entry-summary">${paper.summary || ""}</p>
      <div class="entry-tags">${tagsHtml}</div>
    `;

    li.innerHTML = paper.published ? `<a href="${url}">${innerHtml}</a>` : innerHtml;
    cont.appendChild(li);
  });
}

async function loadHome() {
  try {
    const res = await fetch("/api/papers");
    const papers = await res.json();

    renderStats(papers);
    const userTopics = await userPrefs().catch(() => []);
    const featuredPaper = papers.find((p) => p.published);
    let remainingPapers = [];
    

    if (featuredPaper) {
      renderHeroPreview(featuredPaper);
      remainingPapers = papers.filter((p) =>p.id !== featuredPaper.id);
    } else {
      if (papers.length > 0) {
        renderHeroPreview(papers[0]);
        remainingPapers = papers.slice(1);
      } else {
        renderRecent([], userTopics);
        return;
      }
    }

    if (userTopics.length>0) {
      remainingPapers.sort((a,b) => {
        const aTags = (a.tags || "").toLowerCase().split(",").map((t) => t.trim());
        const bTags= (b.tags || "").toLowerCase().split(",").map((t) => t.trim());
        const aMatches = aTags.filter((t) => userTopics.includes(t)).length;
        const bMatches = bTags.filter((t) => userTopics.includes(t)).length
        return bMatches- aMatches;
      })
    }
    renderRecent(remainingPapers.slice(0,4), userTopics);
    
  } catch (err) {
    console.error("Failed to load homepage papers:", err);
    document.getElementById("recent-papers").innerHTML =
      `<p class="home-loading">Couldn't load papers right now.</p>`;

  }
}

loadHome();