fetch("/api/session-check").then(r => r.json()).then(data => {
    if (!data.loggedIn){
        window.location.href = "/login.html";
    }
});

const form = document.getElementById("paper-form");
const statusEl = document.getElementById("status");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        title: document.getElementById("title").value,
        tags: document.getElementById("tags").value,
        difficulty: document.getElementById("difficulty").value,
        summary: document.getElementById("summary").value,
        read_time: document.getElementById("read_time").value,
        date: document.getElementById("date").value,
        link: document.getElementById("link").value
    };
    try {
        const res = await fetch("/api/papers", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    statusEl.textContent = `Added "${data.title}" successfully!`;
    statusEl.className = "success";
    form.reset();
    } catch (err) {
        statusEl.textContent = err.message;
        statusEl.className = "error";
    }
});

async function loadAdminPapers() {
    const res = await fetch("/api/papers");
    const papers = await res.json();
    const container = document.getElementById("papers-list");
    container.innerHTML = "";
    papers.forEach((paper) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center; justify-content:space-between; border-bottom: 1px solid var(--rule); padding: 0.6rem 0";
        row.innerHTML = `
            <span style = "font-size: 0.9rem; color:var(--ink);">${paper.title} </span>
            <button data-id = "${paper.id}" style = "background: var(--brick); color: var(--bg-raised); border: none; padding: 0.3rem 0.7rem; border-radius: var(--radius);font-size: 0.8rem; cursor:pointer;">Delete</button>
        `;
        container.appendChild(row);
    });
    
    container.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (!confirm("Delete this paper?")) return;
            const res = await fetch(`/api/papers/${id}`, { method: "DELETE" });
            if (res.ok) {
                loadAdminPapers();
            } else {
                alert("Failed to Delete");
            }
        });
    });
}

loadAdminPapers();  