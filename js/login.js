document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");
    const {data, error} = await supabaseClient.auth.signInWithPassword({email, password});
    if (error) {msg.textContent = error.message; msg.style.color = "var(--brick)"; return;}

    const res = await fetch("/api/is-admin", {
        headers: {Authorization: `Bearer ${data.session.access_token}`}
    });
    const {isAdmin} = await res.json();

    if(isAdmin) {
        location.href = "admin.html";
    } else {
        msg.textContent = "This account isn't an admin account";
        msg.style.color = "var(--brick)";
        await supabaseClient.auth.signOut();
    }
});