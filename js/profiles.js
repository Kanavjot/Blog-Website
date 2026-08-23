//account settings

//const { supabaseClient } = require("@supabase/supabase-js");

document.getElementById("name-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { data } = await supabaseClient.auth.getSession();
    const token =data.session?.access_token;
    if (!token) return;
    const name = document.getElementById("display-name").value;
    const msg = document.getElementById("name-msg");


    await supabaseClient.auth.updateUser({data: {display_name: name}});
    const rez = await fetch("/api/profile", {method: "PUT",headers: {"Content-Type":"application/json" , Authorization: `Bearer ${token}`}, body: JSON.stringify({displayName: name})});
    msg.textContent = rez.ok?"Saved" : "Something went wrong";
    msg.style.color =rez.ok? "var(--accent)": "var(--brick)";
});

document.getElementById("email-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const email = document.getElementById("new-email").value;
    const msg = document.getElementById("email-msg");
    const {error} = await supabaseClient.auth.updateUser({email});
    msg.textContent = error ?error.message :"Check your inbox to confirm changes";
    msg.style.color = error? "var(--brick)":"var(--accent)";
})

document.getElementById("password-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const password = document.getElementById("new-password").value;
    const msg = document.getElementById("password-msg");
    const{error} = await supabaseClient.auth.updateUser({password})
    msg.textContent = error? error.message: "Password updated";
    msg.style.color = error? "var(--brick)" : "var(--accent)";
    if (!error) document.getElementById("new-password").value = "";
});

let session = null;
async function startup () {
    const {data} =await supabaseClient.auth.getSession();
    if(!data.session) {location.href = "reader-login.html"; return;}
    session = data.session;

    document.getElementById("current-email").textContent = `Currently: ${session.user.email}`;
    document.getElementById("display-name").value = session.user.user_metadata?.display_name || "";
}

startup();