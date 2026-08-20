///archive page filtering - search + tags + difficulty pills

const searchInput = document.getElementById("search-input");
const filterBtns = document.querySelectorAll(".pill");
let entries = document.querySelectorAll(".entry");
const noResults = document.getElementById("no-results");

let allPapers = []

async function loadPapers() {
  try {
    const res = await fetch("/api/papers");
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const data = await res.json();
    allPapers = data;
    renderPapers(allPapers);
  } catch (err) {
    console.error("Failed to load papers:", err);
  }
}

function renderPapers(papers) {
    const list = document.getElementById("papersList");
    list.innerHTML = "";
    const frag = document.createDocumentFragment
    papers.forEach((paper) => {
        const li = document.createElement("li");

        const url = `post.htmk?id = ${paper.id}`;
        li.className = paper.published ? "entry" : "entry entry-soon"
        li.dataset.tags = paper.tags.replace(/\s/g , "");
        li.dataset.difficulty = paper.difficulty;


        const tagsHtml = paper.tags.split(",").map(t => `<span class = "tag-chip">${t.trim()}</span>`).join("");

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

        li.innerHTML = paper.published ? `<a href = "$url}">${innerHTML}</a>` : innerHtml;
        
        if (paper.link) {
            li.innerHTML = `<a href="${paper.link}">${innerHtml}</a>`;
        } else {
            li.innerHTML = innerHtml;
        }

        frag.appendChild(li);
    });
        list.appendChild(frag)
        entries = document.querySelectorAll(".entry");
    }

loadPapers();

let tagFilter = "all";
let diffFilter = "all";

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

