(function () {
  const catalog = window.STL_CATALOG;
  if (!catalog) return;

  const state = {
    category: "all",
    section: "all",
    search: "",
  };

  const els = {
    authGate: document.getElementById("auth-gate"),
    authForm: document.getElementById("auth-form"),
    authCode: document.getElementById("auth-code"),
    authError: document.getElementById("auth-error"),
    appShell: document.getElementById("app-shell"),
    siteTitle: document.getElementById("site-title"),
    siteSubtitle: document.getElementById("site-subtitle"),
    heroTitle: document.getElementById("hero-title"),
    heroDescription: document.getElementById("hero-description"),
    supportLink: document.getElementById("support-link"),
    serverNotice: document.getElementById("server-notice"),
    noticeBadge: document.getElementById("notice-badge"),
    noticeTitle: document.getElementById("notice-title"),
    noticeMessage: document.getElementById("notice-message"),
    categoryNav: document.getElementById("category-nav"),
    totalModules: document.getElementById("total-modules"),
    activeCategoryTitle: document.getElementById("active-category-title"),
    resultsCount: document.getElementById("results-count"),
    modulesGrid: document.getElementById("modules-grid"),
    emptyState: document.getElementById("empty-state"),
    searchInput: document.getElementById("search-input"),
    resetFilters: document.getElementById("reset-filters"),
    typeFilters: document.getElementById("type-filters"),
    sidebar: document.getElementById("sidebar"),
    menuToggle: document.getElementById("menu-toggle"),
  };

  function initAuth() {
    if (!catalog.auth?.enabled) return;

    const unlocked = sessionStorage.getItem("stl_member_unlocked") === "true";
    if (unlocked) return;

    els.authGate.classList.remove("hidden");
    els.appShell.classList.add("hidden");

    els.authForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = els.authCode.value.trim();
      if (input === catalog.auth.accessCode) {
        sessionStorage.setItem("stl_member_unlocked", "true");
        els.authGate.classList.add("hidden");
        els.appShell.classList.remove("hidden");
      } else {
        els.authError.classList.remove("hidden");
      }
    });
  }

  function getTotalCatalogFiles() {
    return catalog.categories.reduce((acc, cat) => {
      if (cat.id === "all" || cat.id === "available-only") return acc;
      return acc + (cat.fileCount || 0);
    }, 0);
  }

  function formatNumber(num) {
    return Number(num).toLocaleString("pt-BR");
  }

  function applySiteInfo() {
    els.siteTitle.textContent = catalog.site.title;
    els.siteSubtitle.textContent = catalog.site.subtitle;
    els.heroTitle.textContent = catalog.site.heroTitle;
    els.heroDescription.textContent = catalog.site.heroDescription;
    els.supportLink.href = catalog.site.supportUrl || "#";
    els.totalModules.textContent = formatNumber(getTotalCatalogFiles());

    if (catalog.notice?.enabled) {
      els.noticeBadge.textContent = catalog.notice.badge || "Atualização";
      els.noticeTitle.textContent = catalog.notice.title || "";
      els.noticeMessage.textContent = catalog.notice.message || "";
      els.serverNotice.classList.remove("hidden");
    }
  }

  function countByCategory(categoryId) {
    if (categoryId === "all") return formatNumber(getTotalCatalogFiles());
    const cat = catalog.categories.find((c) => c.id === categoryId);
    if (cat && typeof cat.fileCount === "number") {
      return formatNumber(cat.fileCount);
    }
    return catalog.modules.filter((m) => m.categoryId === categoryId).length;
  }

  function renderCategories() {
    els.categoryNav.innerHTML = "";
    let lastGroup = null;

    catalog.categories.forEach((cat) => {
      if (cat.group && cat.group !== lastGroup) {
        lastGroup = cat.group;
        const groupTitle = document.createElement("div");
        groupTitle.className = "sidebar-group-title";
        groupTitle.textContent = cat.group;
        els.categoryNav.appendChild(groupTitle);
      }

      const btn = document.createElement("button");
      btn.className = `cat-btn ${state.category === cat.id ? "active" : ""}`;
      btn.innerHTML = `
        <span class="cat-btn-left">
          <span>${cat.icon}</span>
          <span>${cat.name}</span>
        </span>
        <span class="cat-count">${countByCategory(cat.id)}</span>
      `;
      btn.addEventListener("click", () => {
        state.category = cat.id;
        els.sidebar.classList.remove("open");
        renderCategories();
        renderModules();
      });
      els.categoryNav.appendChild(btn);
    });
  }

  function getFilteredModules() {
    const query = state.search.trim().toLowerCase();

    return catalog.modules.filter((mod) => {
      const matchCategory =
        state.category === "all" ||
        (state.category === "available-only" && mod.status === "available") ||
        mod.categoryId === state.category;

      const matchSection =
        state.section === "all" ||
        (state.section === "available" && mod.status === "available") ||
        mod.section === state.section;

      const matchSearch =
        !query ||
        mod.title.toLowerCase().includes(query) ||
        (mod.fileName || "").toLowerCase().includes(query) ||
        mod.description.toLowerCase().includes(query) ||
        (mod.tags || []).some((tag) => tag.toLowerCase().includes(query));

      return matchCategory && matchSection && matchSearch;
    });
  }

  function renderModules() {
    const activeCat = catalog.categories.find((c) => c.id === state.category);
    els.activeCategoryTitle.textContent = activeCat ? activeCat.name : "Todas as Coleções";

    const items = getFilteredModules();
    els.resultsCount.textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;

    els.modulesGrid.innerHTML = "";

    if (items.length === 0) {
      els.emptyState.classList.remove("hidden");
      return;
    }

    els.emptyState.classList.add("hidden");

    items.forEach((mod) => {
      const card = document.createElement("article");
      card.className = "module-card";

      const isAvailable = mod.status === "available";
      const tagsHtml = (mod.tags || [])
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("");

      const coverHtml = mod.coverImage
        ? `<img src="${mod.coverImage}" alt="${mod.title}" loading="lazy" />`
        : `<div class="card-icon">${mod.icon || "📁"}</div>`;

      const badgeClass = isAvailable ? "card-badge-available" : "card-badge-migrating";
      const catInfo = catalog.categories.find((c) => c.id === mod.categoryId);
      const badgeText = isAvailable
        ? mod.badge || "Disponível"
        : `${catInfo?.fileCount ? formatNumber(catInfo.fileCount) + " arquivos • " : ""}Em migração`;

      const footerHtml = isAvailable
        ? `
          <div class="card-footer">
            <a
              href="${mod.openUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary"
            >
              Abrir ↗
            </a>
            <a
              href="${mod.downloadUrl}"
              target="_blank"
              rel="noopener noreferrer"
              download
              class="btn-primary"
            >
              Baixar ↓
            </a>
          </div>
        `
        : `
          <div class="card-footer card-footer-single">
            <button type="button" class="btn-migrating" disabled>
              ⏳ Transferindo para o servidor...
            </button>
          </div>
        `;

      card.innerHTML = `
        <div class="card-cover">
          ${coverHtml}
          <span class="card-badge-overlay ${badgeClass}">${badgeText}</span>
        </div>
        <div class="card-content">
          <div class="card-body">
            <h3>${mod.title}</h3>
            ${mod.fileName ? `<div class="card-filename">${mod.fileName}</div>` : ""}
            <p>${mod.description}</p>
            <div class="card-meta">${tagsHtml}</div>
          </div>
          ${footerHtml}
        </div>
      `;

      els.modulesGrid.appendChild(card);
    });
  }

  function bindEvents() {
    els.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderModules();
    });

    els.typeFilters.addEventListener("click", (event) => {
      const btn = event.target.closest(".pill");
      if (!btn) return;

      state.section = btn.dataset.section;
      els.typeFilters.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderModules();
    });

    els.resetFilters.addEventListener("click", () => {
      state.category = "all";
      state.section = "all";
      state.search = "";
      els.searchInput.value = "";
      els.typeFilters.querySelectorAll(".pill").forEach((p) => {
        p.classList.toggle("active", p.dataset.section === "all");
      });
      renderCategories();
      renderModules();
    });

    els.menuToggle.addEventListener("click", () => {
      els.sidebar.classList.toggle("open");
    });
  }

  initAuth();
  applySiteInfo();
  renderCategories();
  renderModules();
  bindEvents();
})();
