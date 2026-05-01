function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSection(section) {
  const paragraphs = Array.isArray(section.paragraphs)
    ? section.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")
    : "";

  const items = Array.isArray(section.items) && section.items.length
    ? `
      <ul>
        ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `
    : "";

  const notes = Array.isArray(section.notes) && section.notes.length
    ? section.notes
        .map(
          (note) => `
            <h4>${escapeHtml(note.heading)}</h4>
            <p>${escapeHtml(note.body)}</p>
          `
        )
        .join("")
    : "";

  return `
    <section class="zoowars-update-detail">
      <h3>${escapeHtml(section.heading)}</h3>
      ${paragraphs}
      ${items}
      ${notes}
    </section>
  `;
}

function renderUpdate(update, isLatest) {
  const label = isLatest ? "Latest Update" : "Past Update";
  const summary = Array.isArray(update.summary) && update.summary.length
    ? `
      <ul class="zoowars-update-summary">
        ${update.summary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `
    : "";

  const overview = Array.isArray(update.overview)
    ? update.overview.map((text) => `<p>${escapeHtml(text)}</p>`).join("")
    : "";

  const details = Array.isArray(update.sections)
    ? update.sections.map(renderSection).join("")
    : "";

  return `
    <article class="zoowars-update-card zoowars-update-card-left">
      <p class="zoowars-eyebrow">${label}</p>
      <h2>${escapeHtml(update.title)}</h2>
      <p class="zoowars-update-date">${escapeHtml(update.displayDate)}</p>
      ${overview}
      ${summary}
      ${details}
    </article>
  `;
}

function renderPastUpdates(updates) {
  if (!updates.length) {
    return `
      <section class="account-transfer-section">
        <div class="zoowars-shell">
          <article class="balance-update-card">
            <section>
              <details class="zoowars-past-updates">
                <summary>過去のアップデート</summary>
                <p>現在、過去のアップデートはありません。</p>
              </details>
            </section>
          </article>
        </div>
      </section>
    `;
  }

  return `
    <section class="account-transfer-section">
      <div class="zoowars-shell">
        <article class="balance-update-card">
          <section>
            <h2>過去のアップデート</h2>
            <div class="zoowars-past-update-list">
              ${updates
                .map(
                  (update) => `
                    <details class="zoowars-past-updates">
                      <summary>
                        <time datetime="${escapeHtml(update.date)}">${escapeHtml(update.displayDate)}</time>
                        <span>${escapeHtml(update.title)}</span>
                      </summary>
                      <div class="zoowars-past-update-body">
                        ${renderUpdate(update, false)}
                      </div>
                    </details>
                  `
                )
                .join("")}
            </div>
          </section>
        </article>
      </div>
    </section>
  `;
}

async function loadUpdates() {
  const container = document.getElementById("updates-content");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("updates.json");

    if (!response.ok) {
      throw new Error("Failed to load updates data.");
    }

    const updates = await response.json();
    const sortedUpdates = Array.isArray(updates)
      ? [...updates].sort((a, b) => String(b.date).localeCompare(String(a.date)))
      : [];

    if (!sortedUpdates.length) {
      throw new Error("No updates found.");
    }

    const [latest, ...pastUpdates] = sortedUpdates;

    container.innerHTML = `
      <div class="zoowars-shell">
        ${renderUpdate(latest, true)}
      </div>
    `;
    container.insertAdjacentHTML("afterend", renderPastUpdates(pastUpdates));
  } catch (error) {
    container.innerHTML = `
      <div class="zoowars-shell">
        <article class="zoowars-update-card zoowars-update-card-left">
          <h2>アップデート情報を読み込めませんでした</h2>
          <p>ローカル確認時は Live Server などの簡易サーバー経由で開いてください。</p>
        </article>
      </div>
    `;
  }
}

loadUpdates();
