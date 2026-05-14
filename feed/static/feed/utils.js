function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// auto-refresh для auth
async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");

  const res = await fetch("/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  return true;
}
// Аутентификация по JWT
async function authFetch(url, options = {}) {
  let token = localStorage.getItem("access_token");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let res = await fetch(url, { ...options, headers });

  // если токен умер
  if (res.status === 401 || res.status === 403) {
    const refreshed = await refreshToken();

    if (refreshed) {
      token = localStorage.getItem("access_token");

      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login/";
      return;
    }
  }

  return res;
}

function createPostElement(post, accessToken) {
  const postDiv = document.createElement("div");
  postDiv.classList.add("post");
  postDiv.id = `post-${post.id}`;
  postDiv.style.cssText =
    "border-radius: 20px; padding: 20px; margin-bottom: 0; scroll-margin-top: 40px;";

  const author = post.author || {};
  const authorName = author.first_name || author.username || "User";
  const authorId = author.id || "";
  const profileUrl = authorId ? `/profile/${authorId}/` : "#";

  const ratingAvg = post.rating_avg || 0;
  const ratingCount = post.rating_count || 0;

  let valueLabel = "";
  let valueColor = "#8b8b9b";

  if (post.score >= 0.2) {
    valueLabel = "🔥 Ценный";
    valueColor = "#4bad1d";
  } else if (post.score >= 0.1) {
    valueLabel = "👍 Норм";
    valueColor = "#ffa940";
  } else {
    valueLabel = "🫤 Слабый";
    valueColor = "#8b8b9b";
  }
  const dateObj = new Date(post.created_at);
  const formattedDate = dateObj.toLocaleDateString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
  });

  const mediaHtml = post.media
    ? `<img src="${post.media}" style="width: 100%; border-radius: 12px; margin-top: 16px; object-fit: cover;" />`
    : "";

  const titleHtml = post.title
    ? `<h2 class="post-title" style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #ffffff;">${post.title}</h2>`
    : "";

  let currentLikes = post.likes_count || 0;
  let isLiked = post.is_liked || false;
  const csrftoken = getCookie("csrftoken");

  let commentsHtml = "";
  (post.comments || []).forEach((c) => {
    const cAuthor = c.author
      ? c.author.first_name || c.author.username
      : "User";
    const cAuthorId = c.author ? c.author.id : "";
    const cProfileUrl = cAuthorId ? `/profile/${cAuthorId}/` : "#";
    const cLiked = c.is_liked || false;
    const cLikesCount = c.likes_count || 0;

    commentsHtml += `
      <div style="padding: 10px 14px; background: #2a2a35; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div style="flex: 1;">
          <a href="${cProfileUrl}" style="color: #ffffff; font-weight: 600; margin-right: 6px; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='#8b8b9b'" onmouseout="this.style.color='#ffffff'">${cAuthor}:</a>
          <span style="color: #cccccc;">${c.text}</span>
        </div>
        
        <div class="comment-like-btn" data-comment-id="${c.id}" data-liked="${cLiked}" data-likes="${cLikesCount}" style="display: flex; align-items: center; gap: 4px; cursor: pointer; margin-top: 2px;">
          <svg width="14" height="14" fill="${cLiked ? "#ff4d4f" : "#8b8b9b"}" viewBox="0 0 24 24" style="transition: fill 0.2s;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span style="color: ${cLiked ? "#ff4d4f" : "#8b8b9b"}; font-size: 12px; font-weight: 500; transition: color 0.2s;">${cLikesCount}</span>
        </div>
      </div>`;
  });

  let firstCommentHtml = "";
  if (post.comments && post.comments.length > 0) {
    const fc = post.comments[0];
    const fcAuthor = fc.author
      ? fc.author.first_name || fc.author.username
      : "User";
    const fcAuthorId = fc.author ? fc.author.id : "";
    const fcProfileUrl = fcAuthorId ? `/profile/${fcAuthorId}/` : "#";
    const fcLiked = fc.is_liked || false;
    const fcLikesCount = fc.likes_count || 0;

    firstCommentHtml = `
      <div class="first-comment-preview" style="margin-top: 16px; padding: 10px 14px; background: #2a2a35; border-radius: 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div style="flex: 1;">
          <a href="${fcProfileUrl}" style="color: #ffffff; font-weight: 600; margin-right: 6px; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='#8b8b9b'" onmouseout="this.style.color='#ffffff'">${fcAuthor}:</a>
          <span style="color: #cccccc;">${fc.text}</span>
        </div>
        <div class="comment-like-btn" data-comment-id="${fc.id}" data-liked="${fcLiked}" data-likes="${fcLikesCount}" style="display: flex; align-items: center; gap: 4px; cursor: pointer; margin-top: 2px;">
          <svg width="14" height="14" fill="${fcLiked ? "#ff4d4f" : "#8b8b9b"}" viewBox="0 0 24 24" style="transition: fill 0.2s;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span style="color: ${fcLiked ? "#ff4d4f" : "#8b8b9b"}; font-size: 12px; font-weight: 500; transition: color 0.2s;">${fcLikesCount}</span>
        </div>
      </div>
    `;
  }

  const avatarHtml = author.avatar
    ? `<img src="${author.avatar}" style="
        width:100%;
        height:100%;
        border-radius:50%;
        object-fit:cover;
      ">`
    : authorName.charAt(0).toUpperCase();

  postDiv.innerHTML = `
      <div class="post-header" style="display: flex; align-items: center; margin-bottom: 16px;">

        <div class="post-user-info" style="display: flex; align-items: center; gap: 12px; width: 100%;">

          <!-- Avatar -->
          <div class="avatar" style="width: 44px; height: 44px; background: #ffffff; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">
            ${avatarHtml}
          </div>

          <!-- Name block -->
          <div style="display: flex; flex-direction: column;">
            <div style="font-weight: 600; font-size: 15px;">
              <a href="${profileUrl}" style="text-decoration:none; color:#ffffff;">
                ${authorName}
              </a>
            </div>

            <div style="color: #8b8b9b; font-size: 13px;">
              @${author.username || "user"}
            </div>
          </div>

          <!-- RIGHT BLOCK (VALUE + RATING) -->
          <div style="
              margin-left: auto;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 6px;
          ">
            
            <!-- VALUE BADGE -->
            <div style="
                font-size: 12px;
                font-weight: 600;
                color: ${valueColor};
                background: #1c1c22;
                padding: 5px 10px;
                border-radius: 10px;
                white-space: nowrap;
            ">
              ${valueLabel}
            </div>

            <!-- RATING -->
            <div style="
                font-size: 12px;
                color: #8b8b9b;
                white-space: nowrap;
            ">
              Рейтинг: ${
                ratingCount > 0
                  ? `${ratingAvg.toFixed(1)} / 5 (${ratingCount} оцен${ratingCount === 1 ? "ка" : "ки"})`
                  : "нет оценок"
              }
            </div>

          </div>
        </div>
      </div>
      
      ${titleHtml}
      <p class="post-text" style="margin: 0 0 16px 0; color: #cccccc; line-height: 1.5; font-size: 15px;">${post.content || ""}</p>
      ${mediaHtml}
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #ffffff0d;">
        <div class="post-actions" style="display: flex; gap: 24px; align-items: center; color: #8b8b9b;">
          <div class="action-btn like-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;">
            <svg class="like-icon" width="22" height="22" fill="${isLiked ? "#ff4d4f" : "#8b8b9b"}" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="likes-count" style="color: ${isLiked ? "#ff4d4f" : "#8b8b9b"}; font-weight: 500;">${currentLikes}</span>
          </div>
          
          <div class="action-btn comment-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;">
            <svg width="22" height="22" fill="#8b8b9b" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
            </svg>
            <span style="font-weight: 500;">${post.comments_count || 0}</span>
          </div>
          <div class="action-btn rate-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;">
            <svg width="22" height="22" fill="#8b8b9b" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span style="font-weight: 400;">
              ${post.rating_count > 0
                ? `${post.rating_avg.toFixed(1)}`
                : "Оценить"}
            </span>
          </div>
        </div>

        <div class="post-footer" style="font-size: 13px; color: #6a6a8a; font-weight: 500;">
          ${formattedDate}
        </div>
      </div>

      ${firstCommentHtml}

      <div class="comment-section" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #ffffff0d;">
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <input type="text" class="comment-input" placeholder="Написать комментарий..." style="flex: 1; padding: 10px 14px; border-radius: 8px; background: #1e1e24; color: #ffffff; border: 1px solid #333333; outline: none; font-size: 14px;">
          <button class="btn-submit-comment" style="padding: 10px 20px; border-radius: 8px; background: #ffffff; color: #000000; font-weight: 600; border: none; cursor: pointer;">OK</button>
        </div>
        <div class="comments-list" style="font-size: 14px; display: flex; flex-direction: column;">
          ${commentsHtml}
        </div>
      </div>
  `;

  // Логика лайка поста
  const lBtn = postDiv.querySelector(".like-btn");
  
  lBtn.addEventListener("click", async () => {
    isLiked = !isLiked;
    currentLikes += isLiked ? 1 : -1;
    lBtn
      .querySelector("svg")
      .setAttribute("fill", isLiked ? "#ff4d4f" : "#8b8b9b");
    lBtn.querySelector("span").textContent = currentLikes;
    lBtn.querySelector("span").style.color = isLiked ? "#ff4d4f" : "#8b8b9b";

    await authFetch(`/api/v1/posts/${post.id}/like/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
      },
    });
  });
  // Оценка поста
  const rateBtn = postDiv.querySelector(".rate-btn");
  const ratingMenu = document.createElement("div");
  ratingMenu.style.cssText = `
    position: fixed;
    background: #1c1c22;
    border: 1px solid #2a2a35;
    border-radius: 12px;
    padding: 8px;
    display: none;
    flex-direction: column;
    gap: 6px;
    z-index: 999;
  `;

  for (let i = 5; i >= 1; i--) {
    const btn = document.createElement("button");
    btn.textContent = `${i} ★`;
    btn.style.cssText = `
      background: transparent;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 6px 10px;
      text-align: left;
      border-radius: 8px;
    `;

    btn.onmouseover = () => btn.style.background = "#2a2a35";
    btn.onmouseout = () => btn.style.background = "transparent";

    btn.addEventListener("click", async () => {
      try {
        await authFetch(`/api/v1/posts/${post.id}/rate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({ value: i }),
        });

        rateBtn.querySelector("span").textContent = `${i} ★`;
        ratingMenu.style.display = "none";
      } catch (e) {
        console.error("Ошибка оценки:", e);
      }
    });

    ratingMenu.appendChild(btn);
  }
  postDiv.appendChild(ratingMenu);
  rateBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  const rect = rateBtn.getBoundingClientRect();

  ratingMenu.style.left = rect.left + "px";
  ratingMenu.style.top = rect.bottom + "px";

  ratingMenu.style.display =
    ratingMenu.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", () => {
  ratingMenu.style.display = "none";
});
  // Открытие/закрытие комментариев
  const cBtn = postDiv.querySelector(".comment-btn");
  const cSec = postDiv.querySelector(".comment-section");
  const preview = postDiv.querySelector(".first-comment-preview");

  cBtn.addEventListener("click", () => {
    const isHidden = cSec.style.display === "none";
    cSec.style.display = isHidden ? "block" : "none";
    if (preview) {
      preview.style.display = isHidden ? "none" : "block";
    }
  });

  // Логика лайков комментариев
  postDiv.addEventListener("click", async (e) => {
    const likeBtn = e.target.closest(".comment-like-btn");
    if (!likeBtn) return;

    const commentId = likeBtn.getAttribute("data-comment-id");
    if (!commentId) return;

    let isCommentLiked = likeBtn.getAttribute("data-liked") === "true";
    let commentLikesCount = parseInt(likeBtn.getAttribute("data-likes")) || 0;

    isCommentLiked = !isCommentLiked;
    commentLikesCount += isCommentLiked ? 1 : -1;

    const allMatchingBtns = postDiv.querySelectorAll(
      `.comment-like-btn[data-comment-id="${commentId}"]`,
    );

    allMatchingBtns.forEach((btn) => {
      btn.setAttribute("data-liked", isCommentLiked);
      btn.setAttribute("data-likes", commentLikesCount);

      const svg = btn.querySelector("svg");
      const span = btn.querySelector("span");
      svg.setAttribute("fill", isCommentLiked ? "#ff4d4f" : "#8b8b9b");
      span.textContent = commentLikesCount;
      span.style.color = isCommentLiked ? "#ff4d4f" : "#8b8b9b";
    });

    try {
      await authFetch(`/api/v1/posts/${post.id}/comments/${commentId}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-CSRFToken": csrftoken,
        },
      });
    } catch (err) {
      console.error("Ошибка при лайке комментария:", err);
    }
  });

  // Логика создания нового комментария
  const subC = postDiv.querySelector(".btn-submit-comment");
  const inpC = postDiv.querySelector(".comment-input");
  const commentsListWrapper = postDiv.querySelector(".comments-list");

  inpC.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      subC.click();
    }
  });

  subC.addEventListener("click", async () => {
    const val = inpC.value.trim();
    if (!val) return;

    const myName = document.getElementById("current-username")
      ? document.getElementById("current-username").textContent
      : "Я";

    // Получаем ссылку на наш собственный профиль из меню
    const myProfileHref =
      document.getElementById("dropdown-profile-link")?.getAttribute("href") ||
      "#";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `
      <div style="padding: 10px 14px; background: #2a2a35; border-radius: 12px; margin-bottom: 8px; opacity: 0.6;">
        <a href="${myProfileHref}" style="color: #ffffff; font-weight: 600; margin-right: 6px; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='#8b8b9b'" onmouseout="this.style.color='#ffffff'">${myName}:</a>
        <span style="color: #cccccc;">${val}</span>
        <span style="color: #8b8b9b; font-size: 11px; margin-left: 10px;">отправка...</span>
      </div>`;

    commentsListWrapper.prepend(tempDiv);
    inpC.value = "";

    try {
      const res = await authFetch("/api/v1/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ post: post.id, text: val }),
      });

      if (res.ok) {
        const newComment = await res.json();
        tempDiv.outerHTML = `
          <div style="padding: 10px 14px; background: #2a2a35; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div style="flex: 1;">
              <a href="${myProfileHref}" style="color: #ffffff; font-weight: 600; margin-right: 6px; text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='#8b8b9b'" onmouseout="this.style.color='#ffffff'">${myName}:</a>
              <span style="color: #cccccc;">${val}</span>
            </div>
            <div class="comment-like-btn" data-comment-id="${newComment.id}" data-liked="false" data-likes="0" style="display: flex; align-items: center; gap: 4px; cursor: pointer; margin-top: 2px;">
              <svg width="14" height="14" fill="#8b8b9b" viewBox="0 0 24 24" style="transition: fill 0.2s;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span style="color: #8b8b9b; font-size: 12px; font-weight: 500; transition: color 0.2s;">0</span>
            </div>
          </div>`;

        const commentCountSpan = cBtn.querySelector("span");
        commentCountSpan.textContent =
          parseInt(commentCountSpan.textContent) + 1;
      } else {
        tempDiv.innerHTML = `<span style="color: #ff4d4f; padding: 10px;">Ошибка отправки</span>`;
      }
    } catch (e) {
      console.error(e);
      tempDiv.innerHTML = `<span style="color: #ff4d4f; padding: 10px;">Ошибка сети</span>`;
    }
  });

  return postDiv;
}

window.initNotifications = async function (accessToken) {
  const openBtn = document.getElementById("open-notifications-btn");
  const modal = document.getElementById("notifications-modal");
  const closeBtn = document.getElementById("close-notifications");
  const listContainer = document.getElementById("notifications-list");
  const badge = document.getElementById("notifications-badge");

  if (!openBtn || !modal) return;

  if (!document.getElementById("notif-scrollbar-style")) {
    const style = document.createElement("style");
    style.id = "notif-scrollbar-style";
    style.textContent = `
      #notifications-list::-webkit-scrollbar { width: 6px; }
      #notifications-list::-webkit-scrollbar-track { background: transparent; }
      #notifications-list::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 10px; }
      #notifications-list::-webkit-scrollbar-thumb:hover { background: #3a3a45; }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      modal.style.display = "none";
    }
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  openBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    modal.style.display = "flex";

    if (badge.style.display !== "none") {
      badge.style.display = "none";
      badge.textContent = "0";

      const unreadItems = listContainer.querySelectorAll(".notif-item.unread");
      unreadItems.forEach((item) => {
        item.style.background = "transparent";
        item.style.borderLeft = "1px solid #ffffff0d";
        item.classList.remove("unread");
      });

      try {
        await authFetch("/api/v1/notifications/read_all/", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-CSRFToken": getCookie("csrftoken"),
          },
        });
      } catch (error) {
        console.error("Ошибка при пометке прочитанным:", error);
      }
    }
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  try {
    const res = await authFetch("/api/v1/notifications/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      const notifs = data.results || data;

      listContainer.innerHTML = "";

      if (notifs.length === 0) {
        listContainer.innerHTML =
          '<div style="color: #8b8b9b; text-align: center; padding: 20px;">Нет новых уведомлений</div>';
        return;
      }

      const unreadCount = notifs.filter((n) => !n.is_read).length;
      if (unreadCount > 0) {
        badge.style.display = "flex";
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;

        badge.style.width = "auto";
        badge.style.minWidth = "18px";
        badge.style.height = "18px";
        badge.style.top = "-6px";
        badge.style.right = "-6px";
        badge.style.padding = "0 4px";
        badge.style.boxSizing = "border-box";
        badge.style.fontSize = "11px";
        badge.style.color = "#fff";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";
      }

      notifs.forEach((notif) => {
        const textLower = (notif.text || "").toLowerCase();
        let targetUrl = "#";
        let iconHtml = "🔔";

        const myProfileUrl =
          document
            .getElementById("dropdown-profile-link")
            ?.getAttribute("href") || "#";
        const postId =
          typeof notif.post === "object" ? notif.post?.id : notif.post;

        if (textLower.includes("подписал")) {
          targetUrl = `/profile/${notif.actor.id}/`;
          iconHtml = "👤";
        } else if (textLower.includes("новый пост")) {
          targetUrl = `/profile/${notif.actor.id}/#post-${postId}`;
          iconHtml = "📝";
        } else if (textLower.includes("комментар")) {
          targetUrl = `${myProfileUrl}#post-${postId}`;
          iconHtml = "💬";
        } else if (textLower.includes("оценил") || textLower.includes("лайк")) {
          targetUrl = `${myProfileUrl}#post-${postId}`;
          iconHtml = "❤️";
        } else if (postId) {
          targetUrl = `${myProfileUrl}#post-${postId}`;
        }

        const a = document.createElement("a");
        a.href = targetUrl;
        a.className = notif.is_read ? "notif-item" : "notif-item unread";

        const bgStyle = notif.is_read
          ? "background: transparent; border: 1px solid #ffffff0d;"
          : "background: #2a2a35; border-left: 4px solid #ff4d4f;";

        a.style.cssText = `padding: 14px 16px; border-radius: 16px; ${bgStyle} display: flex; align-items: center; gap: 14px; font-size: 15px; transition: 0.2s; box-sizing: border-box; text-decoration: none; color: inherit;`;

        a.onmouseover = () => {
          if (notif.is_read) a.style.background = "#ffffff05";
        };
        a.onmouseout = () => {
          if (notif.is_read) a.style.background = "transparent";
        };

        a.onclick = () => {
          modal.style.display = "none";
        };

        const actorName =
          notif.actor && notif.actor.username ? notif.actor.username : "?";
        const initial = actorName.charAt(0).toUpperCase();

        const dateObj = new Date(notif.created_at);
        const timeString = dateObj.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateString = dateObj.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        });

        a.innerHTML = `
          <div style="position: relative; flex-shrink: 0;">
            <div style="width: 44px; height: 44px; background: #ffffff; color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
              ${initial}
            </div>
            <div style="position: absolute; bottom: -4px; right: -4px; background: #1c1c22; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid #1c1c22;">
               ${iconHtml}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="color: #ffffff; line-height: 1.4; font-size: 14px;">
              ${notif.text || "У вас новое уведомление!"}
            </div>
            <div style="color: #8b8b9b; font-size: 12px; font-weight: 500;">
              ${dateString} в ${timeString}
            </div>
          </div>
        `;
        listContainer.appendChild(a);
      });
    }
  } catch (e) {
    console.error("Ошибка загрузки уведомлений", e);
  }
};

window.initUserMenu = function () {
  const btn = document.getElementById("user-menu-btn");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("dropdown-logout-btn");

  if (btn && dropdown) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("access_token");
      window.location.href = "/login/";
    });
  }
};
