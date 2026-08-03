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