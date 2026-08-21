

//reader-dashboard
const ALL_TOPICS =["ml" , "physics" , "biotech","quantum" ,"genetics"]


async function authHeader() {
    const { data} = await supabaseClient.auth.getSession();
    if(!data.session) { location.href = "reader-login.html" ;throw new Error("no session"); }
    return {Authorization: `Bearer ${data.session.access_token}`};

}



async function loadLibrary() {
    const res = await fetch("/api/bookmarks", {headers:{"Content-Type":"application/json", ...(await authHeader())}});
    const papers = await res.json();
    document.getElementById("stat-saved").textContent = papers.length;

    const list = document.getElementById("library-list");
    list.innerHTML = "";
    if (papers.length === 0) {
        list.innerHTML= `<p style = "color:var(--ink-faint); font-size: 0.88rem;"> Nothing saved yet. Visit a paper's breakdown page to bookmark it.</p>`;
        return;

    }

    papers.forEach((p) => {
        const row = document.createElement("div");
        row.className = "item-row";
        row.innerHTML = `
        <div><h3>${p.title}</h3><p>${p.difficulty}</p></div>
        <button class = "remove-btn" data-id="${p.id}">Remove</button>`;

        row.querySelector("button").addEventListener("click", async() => {
            await fetch(`/api/bookmarks/${p.id}`,{method: "DELETE" , headers: {"Content-Type":"application/json" , ...(await authHeader())}} );
            loadLibrary();
        });
        list.appendChild(row);
    });
}



async function loadTopics() {
    const res = await fetch("/api/preferences", {headers: {"Content-Type": "application/json" , ...(await authHeader())}});
    const prefs = await res.json();
    const active = (prefs.topics || "").split(",").map(t => t.trim()).filter(Boolean);
    const wrap = document.getElementById("topic-toggles");
    wrap.innerHTML = "";
    ALL_TOPICS.forEach((topic) =>{
        const btn = document.createElement("button");
        btn.className = "topic-toggle" + (active.includes(topic) ? " on" : "");
        btn.textContent = topic;
        btn.addEventListener("click" , async() => {
            btn.classList.toggle("on");
            const chosen = [...wrap.querySelectorAll(".topic-toggle.on")].map(b => b.textContent);
            await fetch("/api/preferences" , {
                method: "PUT",
                headers: {"Content-Type": "application/json" , ...(await authHeader())},
                body: JSON.stringify({topics:chosen.join(",")})
            });
        });
        wrap.appendChild(btn);
    })
}

async function loadNotes() {
    const res = await fetch("/api/notes", {headers: {"Content-Type" : "application/json" , ...(await authHeader())}});
    const notes = await res.json();
    document.getElementById("stat-notes").textContent = notes.length;
    const list = document.getElementById("notes-list");
    list.innerHTML = "";
    notes.forEach((n) => {
        const item = document.createElement("div");
        item.className = "note-item";
        item.innerHTML = `<p>${n.content}</p>
        <small>${n.paper_title || "General"} ${new Date(n.created_at).toLocaleDateString()}</small>
        <button class = "remove-btn" style="margin:0.6rem;cursor:pointer;">Remove</button>`;
        item.querySelector("button").addEventListener("click", async() => {
            await fetch(`/api/notes/${n.id}`, {method: "DELETE" , headers: await authHeader()});
             loadNotes();
        });
       
        list.appendChild(item);
    
    });
}

document.getElementById("note-form").addEventListener("submit",async(e) => {
    e.preventDefault();
    const content = document.getElementById("note-content").value;
    if(!content.trim()) return;
    await fetch("/api/notes",{
        method: "POST",
        headers: {"Content-Type" : "application/json", ...(await authHeader())},
        body: JSON.stringify({content})
    });
    document.getElementById("note-content").value  = "";
    loadNotes();
});


document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
});
document.getElementById("logout-btn").addEventListener("click", async() => {
    await supabaseClient.auth.signOut();
    location.href = "index.html";
});

async function boot() {
    const {data} = await supabaseClient.auth.getSession();
    if (!data.session) {
        location.href = "reader-login.html";
        return;
    }

    document.getElementById("user-name").textContent = data.session.user.user_metadata?.display_name || data.session.user.email
    
    loadLibrary();
    loadTopics();
    loadNotes();

}

boot();