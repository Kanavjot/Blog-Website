function renderMath() {
  document.querySelectorAll("[data-katex]").forEach((el)=> {
    try{
      katex.render(el.dataset.katex, el , {displayMode: true});
    }catch(err) {
      console.error("Block Katex failure ", el.dataset.katex, err)
    }
  });

  document.querySelectorAll("[data-katex-inline]").forEach((el)=>{
    try{
      katex.render(el.dataset.katexInline, el);
    } catch (err) {
      console.error("Inline Katex failure ", el.dataset.katexInline, err);
    }
  });
}

function renderCopybtn() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click" , async() => {
      const codeEl = btn.closest(".code-block").querySelector("code");
      const text = codeEl.innerText;
      try{
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied"
        btn.dataset.copied = "true";
        setTimeout(() =>{
          btn.textContent = "Copy";
          btn.dataset.copied = "false";
        }, 1400);
      } catch (err) {
        btn.textContent = "Cmd/Ctrl + C"
      }
    });
  });
}




window.addEventListener("load", () => {
  renderMath();
  renderCopybtn();
  buildTOC();

  const themeToggle = document.getElementById("theme-toggle");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.checked = theme === "dark";
  }

  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(saved || (prefersLight ? "light" : "dark"));

  themeToggle.addEventListener("change", () => {
    const next = themeToggle.checked ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  });

});


(function() {
  const saved = localStorage.getItem("theme")
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = saved || (prefersLight? "light" : "dark")
  document.documentElement.setAttribute("data-theme", initial);
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) toggleBtn.textContent = initial === "dark" ? "🌙" : "☀️";
}) ();
function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.getElementById("progress-bar").style.width = `${progress}%`;
}
window.addEventListener("scroll", updateProgressBar);
window.addEventListener("resize", updateProgressBar);





const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`.toc a[href="#${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        document.querySelectorAll(".toc a").forEach((a) => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  },
  { rootMargin: "-20% 0px -70% 0px" }
);

function buildTOC() {
  const headings = document.querySelectorAll(".post-main h2[id], .post-main h3[id]");
  const tocList = document.getElementById("toc-list");
  let currentSubList = null;
  let currentParentLi = null;

  headings.forEach((heading) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;

    if (heading.tagName === "H2") {
      const row = document.createElement("div");
      row.className = "toc__row";

      const toggle = document.createElement("button");
      toggle.className = "toc-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "&#9656;"; // ▶
      toggle.style.visibility = "hidden"; // shown later only if it has children

      row.appendChild(toggle);
      row.appendChild(link);
      li.appendChild(row);

      tocList.appendChild(li);
      currentParentLi = li;

        const thisSubList = document.createElement("ul");
        thisSubList.className = "toc__sublist";
        li.appendChild(thisSubList);

        currentSubList = thisSubList; 

        toggle.addEventListener("click", () => toggleSublist(toggle, thisSubList));

    } else if (heading.tagName === "H3" && currentSubList) {
      li.appendChild(link);
      currentSubList.appendChild(li);

      // this h2 has at least one child + reveal its toggle
      const parentToggle = currentParentLi.querySelector(".toc-toggle");
      parentToggle.style.visibility = "visible";
    }
  });
}
buildTOC();

function toggleSublist(toggle, sublist) {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    sublist.style.maxHeight = "0px";
    toggle.setAttribute("aria-expanded", "false");
  } else {
    sublist.style.maxHeight = sublist.scrollHeight + "px";
    toggle.setAttribute("aria-expanded", "true");
  }
}

document.querySelectorAll(".post-main h2[id], .post-main h3[id]").forEach((h) => observer.observe(h));


