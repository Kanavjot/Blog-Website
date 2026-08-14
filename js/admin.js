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

const session = supabaseClient.auth.getSession();
const token = session?.access_token;

fetch("/api/is-admin", {
    headers: {Authorization: `Bearer ${token}`}
})
.then(r=> r.json())
.then(data => {
    if (!data.isAdmin) {
        window.location.href = "login.html"
    }
})


tinymce.init({
    selector: '#content',
    height: 500,
    plugins: "code table lists link image",
    toolbar: "undo redo | blocks | bold italic | bullist numlist | table link image | callout katexblock katexinline codeblock | code ",
    skin:"oxide-dark",
    content_css:"dark",
    setup: (editor) => {
        editor.ui.registry.addButton("callout", {
            text:"Callout",
            onAction: () => {
                editor.windowManager.open({
                    title: "Insert Callout",
                    body: {
                        type: "panel",
                        items: [
                            {type: "selectbox", name: "kind",label:"Type",items:[
                                {text:"Abstract",value:""},
                                {text: "Key Takeaway", value: "callout--takeaway"}
                            ]},
                            {type:"input" , name:"label" , label:"Label"},
                            {type:"textarea", name: "text", label: "Text"}
                        ]
                    },
                    buttons: [{type: "submit", text:"Insert"}],
                    onSubmit: (dialog) => {
                        const d = dialog.getData();
                        editor.insertContent(
                            `<div class = "callout ${d.kind}"><p class = "callout__label">${d.label}</p><p>${d.text}</p></div>`
                        );
                        dialog.close();
                    }
                });
            }
        });

        editor.ui.registry.addButton("katexblock", {
            text: "Equation",
            onAction: () => {
                editor.windowManager.open({
                    title:"Insert Equation",
                    body: {type:"panel",items:[{type:"textarea", name:"latex", label: "LaTeX"}]},
                    buttons: [{type: "submit", text: "Insert"}],
                    onSubmit: (dialog) => {
                        const latex = dialog.getData().latex.replace(/"/g, "&quot;");
                        editor.insertContent(`<div class = "math-block-wrap" data-katex="${latex}"></div>`);
                        dialog.close();
                    }
                });
            }
        });

        editor.ui.registry.addButton("katexinline", {
            text:"Inline Eq",
            onAction: () => {
                editor.windowManager.open({
                    title:"Insert Inline Equation",
                    body: {type:"panel", items:[{type:"input" , name:"latex" , label:"LaTeX"}]},
                    buttons:[{type:"submit", text:"Insert"}],
                    onSubmit: (dialog) => {
                        const latex = dialog.getData().latex.replace(/"/g , "&quot;");
                        editor.insertContent(`<span data-katex-inline="${latex}"></span>`);
                        dialog.close();
                    }
                });
            }
        });

        editor.ui.registry.addButton("codeblock", {
            text:"Code",
            onAction:()=>{
                editor.windowManager.open({
                    title: "Insert Code Block",
                    body: {
                        type:"panel",
                        items:[
                            {type:"input", name:"lang", label:"Language"},
                            {type:"textarea", name:"code", label: "Code"}
                        ]
                    },
                    buttons: [{type:"submit", text: "Insert"}],
                    onSubmit: (dialog) => {
                        const d = dialog.getData();
                        const escaped = d.code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        editor.insertContent(`
                            <div class = "code-block">
                            <div class = "code-block__bar">
                            <span class = "code-block__lang">${d.lang}</span>
                            <button class = "copy-btn">Copy</button>
                            </div>
                            <pre class = "language-${d.lang}"><code class = "language-${d.lang}">${escaped}</code></pre>
                            </div>
                            `);
                            dialog.close();
                    }
                });
            }
        });
    }
});

function assignHeadingIds(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    temp.querySelectorAll("h2 , h3").forEach((h) => {
        if(!h.id) {
            h.id = h.textContent.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
        }
    });
    return temp.innerHTML
}

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
        link: document.getElementById("link").value,
        content_html: assignHeadingIds(tinymce.get("content").getContent()),
        citations: document.getElementById("citations").value
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
    const container = document.getElementById("papers-list");
    if (!container) return;

    try{
        const res = await fetch("/api/papers");
        if (!res.ok) throw new Error("Failed to load papers");

        const papers = await res.json();
        if(!Array.isArray(papers)) return;

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
            const res2 = await fetch(`/api/papers/${id}`, { method: "DELETE" });
            if (res2.ok) {
                loadAdminPapers();
            } else {
                alert("Failed to Delete");
            }
        });
    });
} catch(err) {
    console.error("Error loading admin papers:",err);
    }
}

loadAdminPapers();