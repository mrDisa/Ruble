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

function createPostElement(post, accessToken) {
  const postDiv = document.createElement("div");
  postDiv.classList.add("post");

  postDiv.style.cssText =
    "border-radius: 20px; padding: 20px; margin-bottom: 0;";

  const author = post.author || {};
  const authorName = author.first_name || author.username || "User";
  const authorId = author.id || "";
  const profileUrl = authorId ? `/profile/${authorId}/` : "#";

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
    commentsHtml += `
      <div style="padding: 10px 14px; background: #2a2a35; border-radius: 12px; margin-bottom: 8px;">
        <span style="color: #ffffff; font-weight: 600; margin-right: 6px;">${cAuthor}:</span>
        <span style="color: #cccccc;">${c.text}</span>
      </div>`;
  });

  let firstCommentHtml = "";
  if (post.comments && post.comments.length > 0) {
    const fc = post.comments[0];
    const fcAuthor = fc.author
      ? fc.author.first_name || fc.author.username
      : "User";
    firstCommentHtml = `
      <div class="first-comment-preview" style="margin-top: 16px; padding: 10px 14px; background: #2a2a35; border-radius: 12px;">
        <span style="color: #ffffff; font-weight: 600; margin-right: 6px;">${fcAuthor}:</span>
        <span style="color: #cccccc;">${fc.text}</span>
      </div>
    `;
  }

  postDiv.innerHTML = `
      <div class="post-header" style="display: flex; align-items: center; margin-bottom: 16px;">
        <div class="post-user-info" style="display: flex; align-items: center; gap: 12px;">
          <div class="avatar" style="width: 44px; height: 44px; background: #ffffff; color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">
            ${authorName.charAt(0).toUpperCase()}
          </div>
          <div class="user-details">
            <div class="user-name-row" style="font-weight: 600; font-size: 15px;">
                <a href="${profileUrl}" style="text-decoration:none; color:#ffffff;" class="user-name">${authorName}</a>
            </div>
            <div class="user-tag-row" style="color: #8b8b9b; font-size: 13px;">
                <span class="user-tag" style="color: #8b8b9b;">@${author.username || "user"}</span>
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

  const lBtn = postDiv.querySelector(".like-btn");
  lBtn.addEventListener("click", async () => {
    isLiked = !isLiked;
    currentLikes += isLiked ? 1 : -1;
    lBtn
      .querySelector("svg")
      .setAttribute("fill", isLiked ? "#ff4d4f" : "#8b8b9b");
    lBtn.querySelector("span").textContent = currentLikes;
    lBtn.querySelector("span").style.color = isLiked ? "#ff4d4f" : "#8b8b9b";

    await fetch(`/api/v1/posts/${post.id}/like/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
      },
    });
  });

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

  const subC = postDiv.querySelector(".btn-submit-comment");
  const inpC = postDiv.querySelector(".comment-input");

  // ДОБАВЛЕНО: Отправка комментария по Enter
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

    const div = document.createElement("div");
    div.innerHTML = `<span style="color: #ffffff; font-weight: bold; margin-right: 6px;">${myName}:</span> <span style="color: #cccccc;">${val}</span>`;
    div.style.cssText =
      "padding: 10px 14px; background: #2a2a35; border-radius: 12px; margin-bottom: 8px;";

    postDiv.querySelector(".comments-list").prepend(div);
    inpC.value = "";

    await fetch("/api/v1/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ post: post.id, text: val }),
    });

    const commentCountSpan = cBtn.querySelector("span");
    commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;
  });

  return postDiv;
}
