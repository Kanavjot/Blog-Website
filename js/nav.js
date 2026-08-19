//builds and injects site header on every page

async function renderNav() {
    const page = location.pathname.split("/").pop() || "index.html";

    const links = [
        {href: "index.html" , label: "Home"},
        {href : "papers.html" , label: "Papers"},
        {href : "updates.html" , label : "Updates"},
        {href : "about.html" , label : "About"},
        {href : "signup.html" , label : "Sign Up"},
    ];

    const linksHtml = links.map(l =>
    `<a href="${l.href}"${page === l.href ? ' aria-current="page"' : ''}>${l.label}</a>`
  ).join("\n");

  let readerLink = `<a href = "reader-login.html">Log in</a>`;
  try {
    const {data} = await supabaseClient.auth.getSession();
    
    if (data.session) {
      readerLink = `<a href = "dashboard.html">My Account</a>`;
      fetch("/api/ensure-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`},
          body: JSON.stringify({displayName: data.session.user.user_metadata?.display_name || ""})
      }).catch(() => {});
    }
  } catch (err) {
    console.error("session check failed", err);
  }
  const header = `
  <header class = "site-header">
    <div class = "site-header__inner">
    <a href = "index.html" class = "site-mark">Marginalia</a>
        <nav class = "site-nav">
            ${linksHtml}
            ${readerLink}
                <a href = "login.html" class = "nav-admin">Admin</a>
                <label class = "theme-switch" aria-label = "Toggle light and dark mode">
                    <input type = "checkbox" id = "theme-toggle">
                    <span class = "theme-switch__track">
                        <span class = "theme-switch__thumb">
                            <span class = "theme-switch__icon icon-sun">
                                <svg viewBox="0 0 24 24" width = "12" height = "12" fill = "none" stroke = "currentColor" stroke-width = "2" stroke-linecap = "round">
                                    <circle cx = "12" cy = "12" r = "4"/>
                                    <line x1 = "12" y1 = "2" x2 = "12" y2 = "4"/>
                                    <line x1 = "12" y1 = "20" x2 ="12" y2 = "22"/>
                                    <line x1 = "4.2" y1 = "4.2" x2 = "5.6" y2 = "5.6"/>
                                    <line x1 = "18.4" y1 = "18.4" x2= "19.8" y2 = "19.8"/>
                                    <line x1 = "2" y1 = "12" x2 = "4" y2 = "12"/>
                                    <line x1 = "20" y1 = "12" x2 = "22" y2 = "12"/>
                                    <line x1 = "4.2" y1 = "19.8" x2 = "5.6" y2 = "18.4"/>
                                    <line x1 = "18.4" y1 = "5.6" x2 = "19.8" y2 = "4.2"/>
                                 </svg>
                            </span> 
                            <span class = "theme-switch__icon icon-moon">
                                <svg viewBox = "0 0 24 24" width = "12" height = "12" fill = "currentColor">
                                    <path d = "M20.7 15.6A9 9 0 1 1 8.4 3.3a7 7 0 0 0 12.3 12.3z"/>
                                </svg>
                            </span>
                        </span>
            
                    </span>
                </label>
            </nav>
        </div>
        <div id = "progress-bar"></div>
    </header>
  `;

  const slot = document.getElementById("site-header");
  if (slot) slot.innerHTML = header;
}
renderNav();
