///archive page filtering - search + tags + difficulty pills

const searchInput = document.getElementById("search-input");
const filterBtns = document.querySelectorAll(".pill");
const entries = document.querySelectorAll(".entry");
const noResults = document.getElementById("no-results");

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

searchInput.addEventListener("input",applyFilters);

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