document.addEventListener("DOMContentLoaded", () => {
  console.log("Шаг 1: JS-файл успешно подключен и скрипт запущен!");

  // Функция получения CSRF-токена из куки
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
  const csrftoken = getCookie("csrftoken");

  const apiUrl = "/api/v1/posts/";
  const feedContainer = document.querySelector(".feed");
  const feedEnd = document.querySelector(".feed-end");

  async function fetchPosts() {
    console.log(`Шаг 2: Отправляем запрос на ${apiUrl}...`);
    try {
      const response = await fetch(apiUrl);
      console.log("Шаг 3: Сервер ответил. Статус:", response.status);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const posts = await response.json();
      console.log("Шаг 4: Полученные данные от API:", posts);

      if (!posts.results || posts.results.length === 0) {
        console.log("Внимание: Массив постов пустой!");
        feedEnd.textContent =
          "Пока нет постов. Выложите что-нибудь интересное!";
        return;
      }

      renderPosts(posts.results);
    } catch (error) {
      console.error("ПРОИЗОШЛА ОШИБКА:", error);
      feedEnd.textContent =
        "Не удалось загрузить посты. Проверьте консоль разработчика (F12).";
    }
  }

  function renderPosts(resultsArray) {
    console.log("Шаг 5: Начинаем отрисовку постов...");
    resultsArray.forEach((post) => {
      const postElement = createPostElement(post);
      feedContainer.insertBefore(postElement, feedEnd);
    });
    console.log("Шаг 6: Отрисовка завершена!");
  }

  function createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    // Данные автора
    const author = post.author || {};
    const authorName = author.firstname
      ? author.firstname
      : author.username || "Неизвестный";

    // Генерируем заглавную букву для аватарки
    const avatarLetter = authorName.charAt(0).toUpperCase();

    // Форматируем дату безопасно
    const dateObj = new Date(post.created_at || Date.now());
    const formattedDate = dateObj.toLocaleDateString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "long",
    });

    const mediaHtml = post.media
      ? `<img src="${post.media}" alt="${post.title || ""}" style="max-width: 100%; border-radius: 12px; margin-top: 15px; object-fit: cover;" />`
      : "";

    // Данные для лайков и комментариев
    let currentLikesCount = post.likes_count || 0;
    let currentIsLiked = post.is_liked || false;
    let currentCommentsCount = post.comments_count || 0;
    let currentComments = post.comments || [];

    const likeColor = currentIsLiked ? "#ff4d4f" : "#8b8b9b";

    let commentsHtml = "";
    if (Array.isArray(currentComments) && currentComments.length > 0) {
      currentComments.forEach((comment) => {
        const text =
          typeof comment === "string"
            ? comment
            : comment.content || comment.text || "";
        commentsHtml += `<div style="margin-bottom: 5px; padding: 8px; background: #2a2a35; border-radius: 8px;"><span style="color: white; font-weight: bold;">Пользователь:</span> ${text}</div>`;
      });
    }

    // Собираем HTML поста (с обновленным дизайном и буквенной аватаркой)
    postDiv.innerHTML = `
          <div class="post-header">
            <div class="post-user-info">
              <div class="avatar">${avatarLetter}</div>
              <div class="user-details">
                <div class="user-name-row">
                  <span class="user-name">${authorName}</span>
                  <span class="user-role">${author.job || "Не указана"}</span>
                </div>
                <div class="user-tag-row">
                  <span class="user-tag">#${author.username || "user"}</span>
                  <span class="user-badge">${author.rank || "Новичок"}</span>
                </div>
              </div>
            </div>
            <div style="color: var(--text-muted); cursor: pointer">•••</div>
          </div>
          
          <h2 class="post-title" style="margin-top: 15px;">${post.title || ""}</h2>
          <p class="post-text">${post.content || ""}</p>
          
          ${mediaHtml}

          <div class="post-actions" style="display: flex; gap: 24px; margin-top: 16px; align-items: center; color: #8b8b9b; font-weight: 500;">
            <div class="action-btn like-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;">
              <svg class="like-icon" width="22" height="22" fill="${likeColor}" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="likes-count" style="color: ${likeColor}">${currentLikesCount}</span>
            </div>

            <div class="action-btn comment-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;">
              <svg width="22" height="22" fill="#8b8b9b" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
              </svg>
              <span class="comments-count">${currentCommentsCount}</span>
            </div>
          </div>

          <div class="comment-section" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #2a2a35;">
            <div style="display: flex; gap: 10px;">
              <input type="text" class="comment-input" placeholder="Написать комментарий..." style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #333; background: #1e1e24; color: white;">
              <button class="btn-submit-comment" style="padding: 10px 16px; border-radius: 8px; background: #fff; color: #000; border: none; cursor: pointer; font-weight: bold;">Отправить</button>
            </div>
            <div class="comments-list" style="margin-top: 12px; font-size: 0.9em; color: #ccc; display: flex; flex-direction: column; gap: 8px;">
              ${commentsHtml}
            </div>
          </div>

          <div class="post-footer" style="margin-top: 12px; font-size: 0.8em; color: #8b8b9b; text-align: right;">
            ${formattedDate}
          </div>
        `;

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

    const likeBtn = postDiv.querySelector(".like-btn");
    const likeIcon = postDiv.querySelector(".like-icon");
    const likesCountSpan = postDiv.querySelector(".likes-count");

    const commentBtn = postDiv.querySelector(".comment-btn");
    const commentSection = postDiv.querySelector(".comment-section");
    const commentInput = postDiv.querySelector(".comment-input");
    const submitCommentBtn = postDiv.querySelector(".btn-submit-comment");
    const commentsList = postDiv.querySelector(".comments-list");
    const commentsCountSpan = postDiv.querySelector(".comments-count");

    const postUpdateUrl = `/api/v1/posts/${post.id}/`;

    // 1. ЛАЙКИ
    likeBtn.addEventListener("click", async () => {
      currentIsLiked = !currentIsLiked;
      currentLikesCount += currentIsLiked ? 1 : -1;

      const newColor = currentIsLiked ? "#ff4d4f" : "#8b8b9b";
      likeIcon.setAttribute("fill", newColor);
      likesCountSpan.style.color = newColor;
      likesCountSpan.textContent = currentLikesCount;

      try {
        const response = await fetch(postUpdateUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({
            is_liked: currentIsLiked,
            likes_count: currentLikesCount,
          }),
        });

        if (!response.ok) throw new Error("Не удалось сохранить лайк");
      } catch (error) {
        console.error("Ошибка при лайке:", error);
        currentIsLiked = !currentIsLiked;
        currentLikesCount += currentIsLiked ? 1 : -1;
        const revertColor = currentIsLiked ? "#ff4d4f" : "#8b8b9b";
        likeIcon.setAttribute("fill", revertColor);
        likesCountSpan.style.color = revertColor;
        likesCountSpan.textContent = currentLikesCount;
      }
    });

    // 2. ОТКРЫТИЕ ПОЛЯ КОММЕНТАРИЕВ
    commentBtn.addEventListener("click", () => {
      if (commentSection.style.display === "none") {
        commentSection.style.display = "block";
        commentInput.focus();
      } else {
        commentSection.style.display = "none";
      }
    });

    // 3. ОТПРАВКА КОММЕНТАРИЯ
    submitCommentBtn.addEventListener("click", async () => {
      const text = commentInput.value.trim();
      if (!text) return;

      currentCommentsCount++;
      commentsCountSpan.textContent = currentCommentsCount;

      const newCommentData = { content: text };
      currentComments.push(newCommentData);

      const newCommentDiv = document.createElement("div");
      newCommentDiv.innerHTML = `<span style="color: white; font-weight: bold;">Ты:</span> ${text}`;
      newCommentDiv.style.cssText =
        "padding: 8px; background: #2a2a35; border-radius: 8px; margin-bottom: 5px;";
      commentsList.prepend(newCommentDiv);

      commentInput.value = "";

      try {
        const response = await fetch(postUpdateUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({
            comments_count: currentCommentsCount,
            comments: currentComments,
          }),
        });

        if (!response.ok) throw new Error("Не удалось сохранить комментарий");
      } catch (error) {
        console.error("Ошибка при комментировании:", error);
      }
    });

    commentInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") submitCommentBtn.click();
    });

    return postDiv;
  }

  fetchPosts();
});
