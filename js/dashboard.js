(async () =>{
    const {data} = await supabaseClient.auth.getSession();
    if (!data.session) {
        window.location.href = "reader-login.html";
        return;
    }
    document.getElementById("user-email").textContent = data.session.user.email;

})();

document.getElementById("logout-btn").addEventListener("click" , async() =>{
    await supabaseClient.auth.signOut();
    window.location.href = "index.html"
})
