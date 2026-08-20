let editingId = null;

async function authHeader() {
    const{data} = await supabaseClient.auth.getSession();
    if (!data.session) {location.href = "login.html"; throw new Error("no session");}
    return {Authorization: `Bearer ${data.session.access_token}`};
}

async function bootupAdmin() {
    const ifAdmin = await fetch("/api/is-admin", {headers: await authHeader()});
    const adData = await ifAdmin.json();
    if (!adData.isAdmin) {window.location.href = "login.html"; return;}

    loadAdminPapers();
}





bootupAdmin();

function fillForm(paper) {
    editingId  =paper.id;
    document.getElementById("title").value = paper.title;
    document.getElementById("tags").value = paper.tags;
    document.getElementById("difficulty").value = paper.difficulty;
    document.getElementById("summary").value = paper.summary;
    document.getElementById("read_time").value = paper.read_time;
    document.getElementById("date").value = paper.date;
    document.getElementById("link").value = paper.link;
    document.getElementById("citations").value = paper.citations || "";
    document.getElementById("published").checked = Boolean(paper.published);
    tinymce.get("content").setContent(paper.content_html || "");
    document.querySelector('button[type = "submit"]').textContent = "Save Changes";
}




function resetForm() {
    editingId = null;
    form.reset();
    tinymce.get("content").setContent("");
    document.querySelector('button[type ="submit"]').textContent = "Add Paper";
}



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
        citations: document.getElementById("citations").value,
        published: document.getElementById("published").checked
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/papers/${editingId}` : "/api/papers";

    try {
        const res = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json", ...(await authHeader())},    
            body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    statusEl.textContent = editingId?`Updated "${data.title}" successfully`:`Added "${data.title}" successfully`;
    statusEl.className = "success";
    resetForm();
    loadAdminPapers();
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
                <span>
                    <button data-id = "${paper.id}" class = "edit-btn admin-btn">Edit</button>
                    <button data-id = "${paper.id}" class = "delete-btn admin-btn">Delete</button>
                </span>
            `;

            row.querySelector(".edit-btn").addEventListener("click" , async() =>{
                const rez = await fetch(`/api/papers/${paper.id}`, {headers: {"Content-Type": "application/json", ...(await authHeader())}});
                fillForm(await rez.json());
            });
            container.appendChild(row);
    });
    
    container.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (!confirm("Delete this paper?")) return;
            const res2 = await fetch(`/api/papers/${id}`, { method: "DELETE", headers: {"Content-Type" : "application/json", ...(await authHeader())}});

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