document.getElementById("login-form").addEventListener("submit" , async(e) =>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("message");

const {data, error} = await supabaseClient.auth.signInWithPassword({email , password});

if (error) {
    msg.textContent = error.message;
    msg.style.color = "var(--brick)"
} else {
    const token = data.session.access_token;
    await fetch("/api/ensure-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    window.location.href = "dashboard.html"
}
});