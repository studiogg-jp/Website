async function loadNews() {
  const container = document.getElementById("news-content");

  if (!container) {
    return;
  }

  const showAll = container.dataset.mode === "all";
  const listLimit = showAll ? Infinity : 3;

  try {
    const response = await fetch("news.json");

    if (!response.ok) {
      throw new Error("Failed to load news data.");
    }

    const news = await response.json();
    const featured = news.featured;
    const items = Array.isArray(news.items) ? news.items.slice(0, listLimit) : [];

    const featuredHtml = featured
      ? `
        <article class="featured-news">
          <time datetime="${featured.date}">${featured.displayDate}</time>
          <h3>${featured.title}</h3>
          <p>${featured.body}</p>
        </article>
      `
      : "";

    const listHtml = items.length
      ? `
        <ul class="news-list">
          ${items
            .map(
              (item) => `
                <li>
                  <time datetime="${item.date}">${item.displayDate}</time>
                  <span>${item.text}</span>
                </li>
              `
            )
            .join("")}
        </ul>
      `
      : "";

    const moreHtml = !showAll && Array.isArray(news.items) && news.items.length > listLimit
      ? `
        <div class="news-more">
          <a class="button secondary" href="news.html">ニュース一覧を見る</a>
        </div>
      `
      : "";

    container.innerHTML = featuredHtml + listHtml + moreHtml;
  } catch (error) {
    container.innerHTML = `
      <article class="featured-news">
        <h3>ニュースを読み込めませんでした</h3>
        <p>ローカル確認時は Live Server などの簡易サーバー経由で開いてください。</p>
      </article>
    `;
  }
}

loadNews();
