/* fetch("/api/session-check").then(res = res.json()).then(auth =>{
    if (!auth.loggedIn) window.location.href = "/login.html"

});

document.getElementById("logout-btn").addEventListener("click", async() => {
    await fetch("/api/logout", {method: "POST"});
    window.location.href = "/login.html"; //throwing them back to login
});

const aF = document.getElementById("paper-form");
const UIF = document.getElementById("status");

aF.addEventListener("submit", async(e) =>{
    e.preventDefault();

    const dI = {
        title:document.getElementById("title").value.trim(),
        tags:document.getElementById("tags").value.trim().toLowerCase(),
        difficulty:document.getElementById("difficulty").value,
        summary:document.getElementById("summary").value.trim(),
        read_time:document.getElementById("read_time").value.trim(),
        date: document.getElementById("date").value.trim(),
        content:document.getElementById("content").value.trim()
    };

    if(dI.read_time && !dI.read_time.includes("min read")){
        UIF.textContent = "Read time must include exactly 'min read' (e.g. '5 min read')"
        UIF.style.color = "var(--brick)";
        return;
    }

    //regex check

    const dreg = /^\d{4}-\d{2}-\d{2}$/;
    if (dI.date && !dreg.test(dI.date)) {
        UIF.textContent = "Format date in the following format : YYYY-MM-DD.";
        UIF.style = "var(--brick)";
        return;
    }

    try{
        const resObj = await fetch("/api/papers",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dI)
        });
        const dbRes = await resObj.json();

        if(!resObj.ok){
            console.error("Backend Refused", dbRes);
            throw new Error(dbRes.error || "Supabase ingestion failed");

        }

        UIF.textContent = `"${dbRes.title}" is live.`;
        UIF.style.color = "var(--accent)";
        aF.reset();

        Dashview();

    }
    catch(postErr){
        UIF.textContent = `Upload Failed. ${postErr.message}`;
        UIF.style.color = "var(--brick)"

    }
});

function cDashStats(dbRecords){
    const statsW = document.getElementById("analytics-container");
    const tC = dbRecords.length;
    let uT = new Set();
    let aC = 0;

    dbRecords.forEach(record => {
        if (record.tags) {
            record.tags.split(",").forEach(t => {
                const sanitized = t.trim();
                if (sanitized)
                    uT.add(sanitized);
            });
        }

        if (record.difficulty === "advanced")aC++;

    });

    statsW.innerHTML =`
    <div class = "stat-card">
    <span class = "stat-num">${tC}</span>
    <span class = "stat-label"> Total Papers</span>
    </div>

    <div class = "stat-card">
    <span class = "stat-num">${uT.size}</span>
    <span class = "stat-label">Unique Topics</span>

    <div class = "stat-card">
    <span class = "stat-num">${aC}</span>
    <span class = "stat-label">Advanced Reads</span>
    </div>
    `;
}

async function Dashview() {
    try{
        const rawData = await fetch("/api/papers")
        if (!rawData.ok) throw new Error("Couldn't pull from Postgres");
        const activePapers = await rawData.json();
        cDashStats(activePapers);

        const lWrap = document.getElementById("papers-list")
        lWrap.innerHTML = "";
        
        activePapers.forEach((p) => {
            const lNode = document.createElement("div");
            lNode.className = "paper-row";
            lNode.innerHTML = `
            <div>
            <strong style = "color: var(--ink);font-family:var(--font-display); font-size: 1.1rem;">${p.title}</strong><br>
            <span style = "font-size:0.8rem; color:var(--ink-faint); font-family:var(--font-mono);">${p.date || 'No Date'} &bull; ${p.difficulty}</span>
            </div>
            <button data-db-id="${p.id}" class = "delete-btn">Nuke It</button> `;
            lWrap.appendChild(lNode);
        });
        
        lWrap.querySelectorAll(".delete-btn").forEach((killBtn) => {
            killBtn.addEventListener("click", async() => {
                const targetId = killBtn.getAttribute("data-db-id");
                if(!confirm("Are you 100% sure? This permanently deletes the paper from Supabase.")) return;

                const delRes = await fetch(`/api/papers/${targetId}`, {method: "DELETE"});

                if (delRes.ok) {
                    Dashview();

                } else{
                    const errData = await delRes.json();
                    alert(`Deletion Failed: ${errData.error || 'Unknown Network Error'}`);
                }

            });
        });

    }catch (fetchErr){
        console.error("Dashboard hydration crashed:", fetchErr)

    }

}

Dashview(); */



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