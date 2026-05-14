document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/login/";
    return;
  }

  const csrftoken = getCookie("csrftoken");
  const feedContainer = document.getElementById("feed-posts-container");
  const feedTitle = document.getElementById("feed-title");
  const feedEndText = document.getElementById("feed-end-text");

  const titleInput = document.getElementById("new-post-title");
  const contentInput = document.getElementById("new-post-content");
  const sBtn = document.getElementById("submit-post-btn");
  const postError = document.getElementById("post-error");
  console.log(postError);

  [titleInput, contentInput].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sBtn.click();
      }
    });
  });

  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  let searchTimeout = null;

  if (searchInput && searchResults) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        searchResults.style.display = "none";

        if (query) {
          performFullSearch(query);
        } else {
          location.reload();
        }
      }
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (searchTimeout) clearTimeout(searchTimeout);
      if (!query) {
        searchResults.style.display = "none";
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/v1/search/?q=${encodeURIComponent(query)}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            renderSearchResults(data);
          }
        } catch (err) {
          console.error(err);
        }
      }, 300);
    });

    async function performFullSearch(query) {
      feedTitle.textContent = `Результаты поиска: "${query}"`;
      feedContainer.innerHTML =
        '<div style="color:#8b8b9b; text-align:center; padding:20px;">Ищем лучшее...</div>';
      feedEndText.style.display = "none";

      try {
        const res = await fetch(
          `/api/v1/search/?q=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          feedContainer.innerHTML = "";

          if (data.posts && data.posts.length > 0) {
            data.posts.forEach((post) => {
              feedContainer.appendChild(createPostElement(post, accessToken));
            });
            feedEndText.textContent = "Это всё, что мы нашли.";
            feedEndText.style.display = "block";
            isFetchingPosts = true;
          } else {
            feedContainer.innerHTML =
              '<div style="color:#8b8b9b; text-align:center; padding:40px;">Постов по вашему запросу не найдено 😔</div>';
          }
        }
      } catch (err) {
        console.error("Ошибка при полном поиске", err);
      }
    }

    function renderSearchResults(data) {
      searchResults.innerHTML = "";
      const { users, posts } = data;
      if (users.length === 0 && posts.length === 0) {
        searchResults.innerHTML =
          '<div style="padding:16px; color:#8b8b9b; text-align:center; font-size:14px;">Ничего не нашли...</div>';
        searchResults.style.display = "block";
        return;
      }

      let html = "";
      if (users.length > 0) {
        html +=
          '<div style="padding:10px 16px; font-size:11px; font-weight:700; color:#8b8b9b; text-transform:uppercase;">Пользователи</div>';
        users.forEach((u) => {
          html += `
            <a href="/profile/${u.id}/" style="display:flex; align-items:center; gap:10px; padding:10px 16px; text-decoration:none; color:inherit; transition:0.2s;" onmouseover="this.style.background='#2a2a35'" onmouseout="this.style.background='transparent'">
              <div style="width:30px; height:30px; background:#fff; color:#000; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">${u.username[0].toUpperCase()}</div>
              <div><div style="color:#fff; font-weight:600; font-size:14px;">${u.first_name || u.username}</div><div style="color:#8b8b9b; font-size:12px;">@${u.username}</div></div>
            </a>`;
        });
      }
      if (posts.length > 0) {
        html +=
          '<div style="padding:10px 16px; font-size:11px; font-weight:700; color:#8b8b9b; text-transform:uppercase; border-top:1px solid #2a2a35;">Посты</div>';
        posts.forEach((p) => {
          html += `
            <a href="/profile/${p.author.id}/#post-${p.id}" style="display:block; padding:10px 16px; text-decoration:none; color:inherit; transition:0.2s;" onmouseover="this.style.background='#2a2a35'" onmouseout="this.style.background='transparent'">
              <div style="color:#fff; font-weight:600; font-size:14px; margin-bottom:2px;">${p.title || "Без заголовка"}</div>
              <div style="color:#8b8b9b; font-size:12px;">Автор: @${p.author.username}</div>
            </a>`;
        });
      }
      searchResults.innerHTML = html;
      searchResults.style.display = "block";
    }

    document.addEventListener("click", (e) => {
      if (!document.getElementById("search-container").contains(e.target)) {
        searchResults.style.display = "none";
      }
    });
  }

  async function loadMyProfile() {
    try {
      const response = await fetch("/api/v1/users/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const userData = await response.json();
        document.getElementById("current-username").textContent =
          userData.username;
        document.getElementById("current-usertag").textContent =
          `@${userData.username}`;
        const avatarEl = document.getElementById("current-avatar");

        if (userData.avatar) {
          avatarEl.innerHTML = `<img src="${userData.avatar}" style="
            width:100%;
            height:100%;
            border-radius:50%;
            object-fit:cover;
          ">`;
        } else {
          avatarEl.textContent = userData.username.charAt(0).toUpperCase();
        }

        document.getElementById("dropdown-profile-link").href =
          `/profile/${userData.id}/`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  let nextPostsUrl = "/api/v1/feed/";
  let isFetchingPosts = false;

  async function fetchPosts() {
    if (!nextPostsUrl || isFetchingPosts) return;

    isFetchingPosts = true;
    try {
      const res = await fetch(nextPostsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();

        const posts = data.results || data;
        posts.forEach((p) =>
          feedContainer.appendChild(createPostElement(p, accessToken)),
        );

        nextPostsUrl = data.next || null;

        if (!nextPostsUrl) {
          feedEndText.style.display = "block";
        } else {
          feedEndText.style.display = "none";
        }
      }
    } catch (e) {
      console.error("Ошибка загрузки ленты:", e);
    }

    isFetchingPosts = false;
  }

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 500
    ) {
      fetchPosts();
    }
  });

  const mediaInp = document.getElementById("new-post-media");
  const attachBtn = document.getElementById("attach-media-btn");
  const fileName = document.getElementById("attached-file-name");

  if (attachBtn) {
    attachBtn.addEventListener("click", () => mediaInp.click());
    mediaInp.addEventListener("change", () => {
      if (mediaInp.files[0]) {
        fileName.textContent = mediaInp.files[0].name;
        attachBtn.setAttribute("fill", "#fff");
      }
    });
  }
  sBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  postError.style.display = "none";
  postError.innerHTML = "";

  if (!content && !mediaInp.files[0]) return;

  const fd = new FormData();

  if (title) fd.append("title", title);
  fd.append("content", content);

  if (mediaInp.files[0]) {
    fd.append("media", mediaInp.files[0]);
  }

  try {
    const res = await fetch("/api/v1/posts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
      },
      body: fd,
    });

    let data = {};

    try {
      data = await res.json();
    } catch {
      data = { error: "Ошибка сервера" };
    }

    if (res.ok) {
      feedContainer.prepend(createPostElement(data, accessToken));

      titleInput.value = "";
      contentInput.value = "";
      mediaInp.value = "";

      fileName.textContent = "";
      attachBtn.setAttribute("fill", "#8b8b9b");

    } else {
      console.log(data);

      const errors = Object.entries(data)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(", ")}`;
          }

          return `${field}: ${messages}`;
        })
        .join("<br>");

      postError.innerHTML = errors || "Ошибка создания поста";
      postError.style.display = "block";
    }

  } catch (e) {
    console.error(e);

    postError.innerHTML = "Ошибка сети";
    postError.style.display = "block";
  }
});

  loadMyProfile();
  fetchPosts();

  // ИЗМЕНЕНО: Запускаем скрипты уведомлений и выпадающего меню
  if (typeof initNotifications === "function") initNotifications(accessToken);
  if (typeof initUserMenu === "function") initUserMenu();
});
