async function start() {
    const {data} =await supabaseClient.auth.getSession();
    if (!data.session) {location.href = "login.html" ; return;}
    const token =data.session.access_token;
    const res = await fetch("/api/admin/stats", {headers: {Authorization : `Bearer ${token}`}});
    if (!res.ok) {location.href = "index.html"; return ;}
    const stats = await res.json();

    document.getElementById("stat-grid").innerHTML = `
    <div class = "stat-card"><strong>${stats.totalPapers}</strong><span>Papers</span></div>
    <div class ="stat-card"><strong>${stats.totalReaders}</strong><span>Readers</span></div>
    <div class = "stat-card"><strong>${stats.totalBookmarks}</strong><span>Bookmarks</span></div>
    <div class ="stat-card"><strong>${stats.totalNotes}</strong><span>Notes</span></div>

    `;

    document.getElementById("top-list").innerHTML = stats.topPapers
    .map(p => `<li><span>${p.title}</span><span>${p.views} views</span></li>`).join("");
}
start();