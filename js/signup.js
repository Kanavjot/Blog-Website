document.getElementById("signup-form").addEventListener("submit", async(e) =>{
e.preventDefault();
const name = document.getElementById("name").value;
const email = document.getElementById("email").value
const password = document.getElementById("password").value
const messageEl = document.getElementById("message");

const {data, error} = await supabaseClient.auth.signUp({email , password, options: {data: {display_name: name}}});
if (error) {
    messageEl.textContent = error.message;
    messageEl.style.color = "var(--brick)";
}
else {
    messageEl.textContent = "Check your email to verify your account before logging in.";
    messageEl.style.color = "var(--accent)"
    
}

});