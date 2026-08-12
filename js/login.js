document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const res = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({password})

    });
    if (res.ok){
        window.location.href = "admin.html";
    } else {
        document.getElementById("error").textContent = "Wrong password.";

    }
});