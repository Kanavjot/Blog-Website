///archive page filtering - search + tags + difficulty pills



let entries = document.querySelectorAll(".entry");
const noResults = document.getElementById("no-results");

let allPapers = []

async function loadPapers() {
    const res = await fetch("/api/papers");
    if (!res.ok) return;
    const data = await res.json();
    allPapers = data;
    
    const userTopics = await userPrefs().catch(() => []);

    if (userTopics.length > 0) {
        allPapers.sort((a,b) => {
            const aTags = (a.tags || "").toLowerCase().split(",").map((t) => t.trim());
            const bTags = (b.tags || "").toLowerCase().split(",").map((t) => t.trim());
            const aMatches = aTags.filter((t) => userTopics.includes(t)).length;
            const bMatches = bTags.filter((t) => userTopics.includes(t)).length;
            return bMatches- aMatches;
        });
    }
  renderPapers(allPapers, userTopics)
  
}

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


function renderPapers(papers, userTopics =[]) {
    const list = document.getElementById("papersList");
    list.innerHTML = "";
    const frag = document.createDocumentFragment();
    papers.forEach((paper) => {
    const li = document.createElement("li")
        const url = `post.html?id=${paper.id}`;


        li.className = paper.published ? "entry" : "entry entry-soon"
        li.dataset.tags = paper.tags.replace(/\s/g , "");
        li.dataset.difficulty = paper.difficulty;

        const tagsHtml = paper.tags.split(",").map((t) => {
            const cl = t.trim();
            if (!cl) return "";
            const corresponds = userTopics.includes(cl.toLowerCase());
            return `<span class="tag-chip${corresponds ? " matched": ""}">${cl}</span>`;
        }).join("");

        const innerHtml = `
            <div class="entry-meta">
                <span> ${paper.date || "Coming Soon"} </span>
                <span> ${paper.read_time}</span>
                <span class = "difficulty difficulty--${paper.difficulty}"> ${paper.difficulty}</span>
            </div>
            <h2 class="entry-title">${paper.title}</h2>
            <p class = "entry-summary">${paper.summary}</p>
            <div class="entry-tags">
                ${tagsHtml}
            </div>
        `;
        li.innerHTML = paper.published ? `<a href = "${url}">${innerHtml}</a>` : innerHtml;
        
        frag.appendChild(li);
    });
        list.appendChild(frag)
        entries = document.querySelectorAll(".entry");
    }

loadPapers();

let tagFilter = "all";
let diffFilter = "all";

const filterBtns = document.querySelectorAll(".pill");

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.filterType;
        const val = btn.dataset.value;

        document.querySelectorAll(`.pill[data-filter-type="${type}"]`).forEach((b) => {
            b.classList.remove("active");
        });
        btn.classList.add("active");

        if (type === "tag") tagFilter = val;
        else diffFilter = val;

        applyFilters();
    });
});


function delayFilters(func, delay = 250) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", delayFilters(applyFilters, 250));

    function applyFilters() {
        const q = searchInput.value.trim().toLowerCase();
        let shown = 0;

        entries.forEach((entry) => {
            const tags = entry.dataset.tags;
            const diff = entry.dataset.difficulty;
            const text = entry.textContent.toLowerCase();
            const tagOk = tagFilter === "all" || tags.includes(tagFilter);
            const diffOk = diffFilter === "all" || diff === diffFilter;
            const searchOk = !q || text.includes(q);

            const visible = tagOk && diffOk && searchOk;
            entry.toggleAttribute("hidden", !visible);
            if (visible) shown++;
        });

        noResults.hidden = shown > 0;
    }

