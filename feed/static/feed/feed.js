document.addEventListener("DOMContentLoaded", () => {
  console.log("Шаг 1: JS-файл успешно подключен и скрипт запущен!");

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

      if (posts.length === 0) {
        console.log("Внимание: Массив постов пустой!");
      }

      renderPosts(posts);
    } catch (error) {
      console.error("ПРОИЗОШЛА ОШИБКА:", error);
      feedEnd.textContent =
        "Не удалось загрузить посты. Проверьте консоль разработчика (F12).";
    }
  }

  function renderPosts(posts) {
    console.log("Шаг 5: Начинаем отрисовку постов...");
    posts.forEach((post) => {
      const postElement = createPostElement(post);
      feedContainer.insertBefore(postElement, feedEnd);
    });
    console.log("Шаг 6: Отрисовка завершена!");
  }

  function createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    const authorName = post.author.firstname
      ? post.author.firstname
      : post.author.username;
    const formattedDate = new Date(post.created_at).toLocaleDateString("ru-RU");

    const mediaHtml = post.media
      ? `<img src="${post.media}" alt="${post.title}" style="max-width: 100%; border-radius: 8px; margin-top: 15px;" />`
      : "";

    postDiv.innerHTML = `
          <div class="post-header">
            <div class="post-user-info">
              <div class="avatar">😃</div>
              <div class="user-details">
                <div class="user-name-row">
                  <span class="user-name">${authorName}</span>
                  <span class="user-role">${post.author.job}</span>
                </div>
                <div class="user-name-row">
                  <span class="user-tag">#${post.author.username}</span>
                  <span class="user-badge">${post.author.rank}</span>
                </div>
              </div>
            </div>
            <div style="color: var(--text-muted); cursor: pointer">•••</div>
          </div>
          <h2 class="post-title">${post.title}</h2>
          <p class="post-text">${post.content}</p>
          ${mediaHtml}
          <div class="post-footer" style="margin-top: 10px; font-size: 0.9em; color: var(--text-muted);">
            Опубликовано: ${formattedDate}
          </div>
        `;

    return postDiv;
  }

  fetchPosts();
});
