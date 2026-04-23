document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "/login/";
    return;
  }

  const csrftoken = getCookie("csrftoken");
  const feedContainer = document.getElementById("feed-posts-container");

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
        document.getElementById("current-avatar").textContent =
          userData.username.charAt(0).toUpperCase();

        const myProfileLink = document.getElementById("my-profile-link");
        if (myProfileLink) {
          myProfileLink.href = `/profile/${userData.id}/`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPosts() {
    try {
      const res = await fetch("/api/v1/posts/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const posts = await res.json();
      const results = posts.results || posts;

      results.forEach((post) => {
        feedContainer.appendChild(createPostElement(post, accessToken));
      });
    } catch (e) {
      console.error(e);
    }
  }

  const sBtn = document.getElementById("submit-post-btn");
  const mediaInp = document.getElementById("new-post-media");
  const attachBtn = document.getElementById("attach-media-btn");
  const fileName = document.getElementById("attached-file-name");

  const titleInput = document.getElementById("new-post-title");
  const contentInput = document.getElementById("new-post-content");

  if (attachBtn) {
    attachBtn.addEventListener("click", () => mediaInp.click());
    mediaInp.addEventListener("change", () => {
      if (mediaInp.files[0]) {
        fileName.textContent = mediaInp.files[0].name;
        attachBtn.setAttribute("fill", "#fff");
      }
    });
  }

  // ДОБАВЛЕНО: Глобальный перехват Enter внутри блока создания поста
  const postCreatorBox = document.querySelector(".post-creator");
  postCreatorBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sBtn.click();
    }
  });

  sBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) return alert("Пожалуйста, напишите текст поста!");

    const fd = new FormData();
    if (title) fd.append("title", title);
    fd.append("content", content);
    if (mediaInp.files[0]) fd.append("media", mediaInp.files[0]);

    sBtn.disabled = true;
    try {
      const res = await fetch("/api/v1/posts/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-CSRFToken": csrftoken,
        },
        body: fd,
      });

      if (res.ok) {
        const newPost = await res.json();
        feedContainer.prepend(createPostElement(newPost, accessToken));
        titleInput.value = "";
        contentInput.value = "";
        mediaInp.value = "";
        fileName.textContent = "";
        attachBtn.setAttribute("fill", "#8b8b9b");
      } else {
        alert(
          "Ошибка сервера. Возможно, в моделях Django заголовок указан как обязательный.",
        );
      }
    } catch (e) {
      console.error(e);
    }
    sBtn.disabled = false;
  });

  loadMyProfile();
  fetchPosts();
});
