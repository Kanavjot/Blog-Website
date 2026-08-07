async function loadHome() {
  try {
    const res = await fetch("/api/papers");
    const papers = await res.json();

    renderStats(papers);
    renderRecent(papers.slice(0, 4));

  } catch (err) {
    console.error("Failed to load homepage papers:", err);
    document.getElementById("recent-papers").innerHTML =
      `<p class="home-loading">Couldn't load papers right now.</p>`;
  }
}

function renderStats(papers) {
  const topics = new Set();
  papers.forEach((p) => {
    p.tags.split(",").forEach((t) => topics.add(t.trim().toLowerCase()));
  });

  document.getElementById("stats-bar").innerHTML = `
    <span><strong>${papers.length}</strong> papers</span>
    <span><strong>${topics.size}</strong> topics covered</span>
  `;
}

function renderRecent(papers) {
  const container = document.getElementById("recent-papers");
  container.innerHTML = "";

  if (papers.length === 0) {
    container.innerHTML = `<p class="home-loading">Nothing here yet — check the full archive.</p>`;
    return;
  }

  papers.forEach((paper) => {
    const li = document.createElement("div");
    li.className = paper.link ? "entry" : "entry entry-soon";

    const tagsHtml = paper.tags.split(",").map(t => `<span class="tag-chip">${t.trim()}</span>`).join("");

    const innerHtml = `
      <div class="entry-meta">
        <span>${paper.date || "Coming Soon"}</span>
        <span>${paper.read_time}</span>
        <span class="difficulty difficulty--${paper.difficulty}">${paper.difficulty}</span>
      </div>
      <h3 class="entry-title">${paper.title}</h3>
      <p class="entry-summary">${paper.summary}</p>
      <div class="entry-tags">${tagsHtml}</div>
    `;

    li.innerHTML = paper.link ? `<a href="${paper.link}">${innerHtml}</a>` : innerHtml;
    container.appendChild(li);
  });
}

loadHome();