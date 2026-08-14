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

        
        renderMath();
        renderCopybtn();
        buildTOC();
    } catch (err) {
        console.error(err);
        cont.innerHTML = `<p class = "home-loading">Couldn't load this paper.</p>`
    }
}

loadPost();