async function authHeader() {
    const { data} = await supabaseClient.auth.getSession();
    if(!data.session) return null;
    return {Authorization: `Bearer ${data.session.access_token}`};

}

async function loadPost() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const cont = document.getElementById("post-main");

    if(!id){
        cont.innerHTML = `<p class = "home-loading">No paper specified.</p>`;
        return;
    }
    try{
        const res = await fetch(`/api/papers/${id}`);
        if(!res.ok) throw new Error("Not Found");
        const paper = await res.json();
        document.title = `Marginalia -- ${paper.title}`;
        const tagsHtml =paper.tags.split(",").map(t => `<span class = "tag-chip">${t.trim()}</span>`).join("");

        const citeItems = (paper.citations || "").split("\n").filter(Boolean)
            .map(c=>`<li>${c}</li>`).join("");
        const citeHtml = citeItems ? `<div class = "citations"><h2>Citations</h2><ol>${citeItems}</ol></div>` : "";

        const cleanContent =DOMPurify.sanitize(paper.content_html || "<p>No content added yet.</p>")

        cont.innerHTML = `
        <div class = "post-meta">
        <span>${paper.date || "Coming Soon"}</span>
        <span>${paper.read_time}</span>
        <span class = "difficulty difficulty--${paper.difficulty}">${paper.difficulty}</span>
        </div>
        <h1 class = "post-title">${paper.title}</h1>
        <p class = "post-source">${paper.summary}</p>
        ${paper.content_html || "<p>No content added yet.</p>"}
        ${citeHtml}
        <div class = "post-tags">${tagsHtml}</div>`;

        await Bookmark(paper.id);

        renderMath();
        renderCopybtn();
        buildTOC();
    } catch (err) {
        console.error(err);
        cont.innerHTML = `<p class = "home-loading">Couldn't load this paper.</p>`
    }
}

async function Bookmark(paperId) {
    const headers = await authHeader();
    if (!headers) return;

    const rez =await fetch("/api/bookmarks" , {headers});
    const bookmarks = await rez.json()
    let saved = bookmarks.some(b=> b.id == paperId);

    const btn = document.createElement("button");
    btn.textContent = saved ? "Saved ★" : "Save ☆";
    btn.className = "bookmark-btn"
    btn.addEventListener("click" , async () => {
        const currheaders = await authHeader();
        const method = saved ? "DELETE" : "POST";
        const url = saved ? `/api/bookmarks/${paperId}` : "/api/bookmarks";
        await fetch( url , {
            method,
            headers: {"Content-Type" : "application/json" , ...currheaders},
            body: method ==="POST" ? JSON.stringify({paper_id: paperId}) : undefined
        });
        saved = !saved;
        btn.textContent = saved ? "Saved ★" : "Save ☆"
    })

    
    document.getElementById("post-main").prepend(btn)
}

loadPost();