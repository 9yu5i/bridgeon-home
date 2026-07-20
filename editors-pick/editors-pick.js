(() => {
  const page = document.body;
  if (!page.classList.contains("editors-page")) return;

  const editorButtons = Array.from(document.querySelectorAll("[data-editor-tab]"));
  const pickTabs = Array.from(document.querySelectorAll("[data-pick-filter]"));
  const pickList = document.querySelector("[data-editor-pick-list]");
  const magazineGrid = document.querySelector("[data-editor-magazine]");
  const magazineDotsWrap = document.querySelector(".editor-magazine-dots");
  const picksTitle = document.querySelector("#editor-picks-title");
  const magazineTitle = document.querySelector("#editor-mag-title");
  const profileAvatarWrap = document.querySelector(".editor-profile-avatar");
  const profileAvatar = document.querySelector(".editor-profile-avatar .editor-avatar");
  const profileFlag = document.querySelector(".editor-profile-avatar .flag");
  const profileAvatarName = document.querySelector(".editor-profile-avatar h3");
  const profileCopyName = document.querySelector(".editor-profile-copy h3");
  const profileFacts = document.querySelector(".editor-facts");
  const profileBio = document.querySelector(".editor-profile-copy p");
  const profileTags = document.querySelector(".editor-tags");
  const editorNoteText = document.querySelector(".editor-note p");
  const editorNoteSignature = document.querySelector(".editor-note strong");

  const editors = [
    {
      name: "Nara",
      avatar: "seal",
      flag: "kr",
      facts: ["Busan, Korea", "25 years old", "Combo Skin"],
      bio: "Passionate about clean beauty and ingredient-focused skincare. Sharing my favorite finds for healthier skin and everyday wellness.",
      note: "Passionate about clean beauty and ingredient-focused skincare. Sharing my favorite finds for healthier skin and everyday wellness.",
      tags: ["# Skincare Expert", "# Sensitive Skin", "# Clean Beauty", "# Food Lover"],
      picks: [
        {
          category: "beauty",
          image: "rose",
          brand: "Anua",
          name: "PDRN Hyaluronic Acid Hydrating Capsule Mist 100ml",
          rating: "4.8 (1,256)",
          price: "US$18.40",
          originalPrice: "US$23.00",
          reason: "A quick hydration reset with a soft finish, especially good when skin feels tight during the day.",
          tags: ["#Smooth", "#PDRN"],
        },
        {
          category: "beauty",
          image: "blue",
          brand: "Celimax",
          name: "Retinal Shot Tightening Booster 15ml",
          rating: "4.8 (1,256)",
          price: "US$18.48",
          originalPrice: "US$23.00",
          reason: "Gentle enough for a steady routine, but still feels like it is doing real texture work.",
          tags: ["#Retinal", "#Texture", "#Glow"],
        },
        {
          category: "k-food",
          image: "green",
          brand: "K-Snack",
          name: "Daily Green Tea Crunch Snack Pack",
          rating: "4.7 (834)",
          price: "US$12.20",
          originalPrice: "US$16.00",
          reason: "A light snack I keep around for long edit days because it is crisp without feeling too sweet.",
          tags: ["#Tea", "#Crunch"],
        },
      ],
      magazines: [
        {
          tone: "yellow",
          image: "fruit",
          title: "5 Korean Sunscreens You Should Try",
          copy: "Lightweight sunscreen picks for humid days, long commutes, and makeup-friendly routines.",
          meta: "Jul 21, 2026 · Beauty",
        },
        {
          tone: "green",
          image: "paper",
          title: "Clean Beauty Notes From Seoul",
          copy: "A practical look at simple ingredients, fresh textures, and the products worth keeping nearby.",
          meta: "Jul 18, 2026 · Beauty",
        },
        {
          tone: "lavender",
          image: "stage",
          title: "How Editors Build A Calm Routine",
          copy: "Small daily choices that help sensitive skin stay balanced from morning to night.",
          meta: "Jul 12, 2026 · Lifestyle",
        },
      ],
    },
    {
      name: "Mila",
      avatar: "duck",
      flag: "ua",
      facts: ["Kyiv, Ukraine", "24 years old", "Dry Skin"],
      bio: "Focused on comfort-first products, cozy food finds, and rich textures that make routines feel less rushed.",
      note: "My picks lean soft, nourishing, and easy to love on days when skin needs extra comfort.",
      tags: ["# Dry Skin", "# Barrier Care", "# Cozy Picks", "# K-Food"],
      picks: [
        {
          category: "beauty",
          image: "blue",
          brand: "Torriden",
          name: "Dive-In Serum 50ml",
          rating: "4.9 (2,431)",
          price: "US$15.50",
          originalPrice: "US$24.00",
          reason: "A no-drama hydration layer that works well under cream and does not pill under makeup.",
          tags: ["#Hydrating", "#Layering"],
        },
        {
          category: "k-food",
          image: "green",
          brand: "Ottogi",
          name: "Sesame Ramen Comfort Bowl Set",
          rating: "4.7 (912)",
          price: "US$9.80",
          originalPrice: "US$13.00",
          reason: "Warm, simple, and satisfying. This is the kind of pantry pick I actually repurchase.",
          tags: ["#Ramen", "#Comfort"],
        },
        {
          category: "lifestyle",
          image: "rose",
          brand: "Dailylike",
          name: "Pastel Desk Pouch Organizer",
          rating: "4.6 (421)",
          price: "US$11.90",
          originalPrice: "US$15.00",
          reason: "Keeps the little things together and still looks soft enough to sit on a desk all week.",
          tags: ["#Desk", "#Pastel"],
        },
      ],
      magazines: [
        {
          tone: "green",
          image: "paper",
          title: "Barrier Care For Dry Weather",
          copy: "Editor-tested moisturizers and small habits for days when skin feels easily depleted.",
          meta: "Jul 19, 2026 · Beauty",
        },
        {
          tone: "yellow",
          image: "fruit",
          title: "The K-Food Comfort Shelf",
          copy: "Instant meals, teas, and snacks that make a small kitchen feel better stocked.",
          meta: "Jul 14, 2026 · K-Food",
        },
        {
          tone: "lavender",
          image: "stage",
          title: "Soft Desk Essentials",
          copy: "Useful lifestyle pieces that keep daily work calmer, cleaner, and more organized.",
          meta: "Jul 08, 2026 · Lifestyle",
        },
      ],
    },
    {
      name: "Jules",
      avatar: "cat",
      flag: "us",
      facts: ["Austin, USA", "27 years old", "Oily Skin"],
      bio: "Always testing lightweight textures, practical beauty tools, and products that survive busy days.",
      note: "I choose products that are quick to use, easy to compare, and not fussy about timing.",
      tags: ["# Oily Skin", "# Tools", "# Quick Routine", "# K-Pop Fan"],
      picks: [
        {
          category: "beauty",
          image: "green",
          brand: "Beauty of Joseon",
          name: "Matte Sun Stick Mugwort + Camelia",
          rating: "4.8 (3,015)",
          price: "US$17.20",
          originalPrice: "US$22.00",
          reason: "Helpful for midday touchups when you want less shine without disturbing everything underneath.",
          tags: ["#Suncare", "#Matte"],
        },
        {
          category: "beauty",
          image: "rose",
          brand: "Fillimilli",
          name: "Soft Fit Makeup Sponge Trio",
          rating: "4.7 (688)",
          price: "US$8.90",
          originalPrice: "US$11.00",
          reason: "A simple tool upgrade that makes base makeup look smoother with very little effort.",
          tags: ["#Tool", "#Base"],
        },
        {
          category: "k-pop",
          image: "blue",
          brand: "K-POP Goods",
          name: "Mini Photocard Binder Lavender",
          rating: "4.9 (1,104)",
          price: "US$13.40",
          originalPrice: "US$18.00",
          reason: "Compact, sturdy, and cute enough to keep favorite cards in rotation.",
          tags: ["#Photocard", "#Goods"],
        },
      ],
      magazines: [
        {
          tone: "lavender",
          image: "stage",
          title: "Beauty Tools That Earn Space",
          copy: "The small brushes, puffs, and sponges that make daily makeup faster and cleaner.",
          meta: "Jul 22, 2026 · Beauty",
        },
        {
          tone: "green",
          image: "paper",
          title: "How To Reapply Sunscreen",
          copy: "A practical editor guide for touchups over makeup, outdoors, and on hot days.",
          meta: "Jul 16, 2026 · Beauty",
        },
        {
          tone: "yellow",
          image: "fruit",
          title: "Photocard Storage Picks",
          copy: "Cute binders and sleeves for organizing keepsakes without adding bulk.",
          meta: "Jul 10, 2026 · K-POP",
        },
      ],
    },
    {
      name: "Pim",
      avatar: "dog",
      flag: "th",
      facts: ["Bangkok, Thailand", "26 years old", "Combination Skin"],
      bio: "Curates bright beauty, playful snacks, and everyday products that travel well in warm weather.",
      note: "I like products that stay pleasant in heat: fresh, portable, and not too heavy.",
      tags: ["# Humid Weather", "# Travel Kit", "# Bright Beauty", "# Snack Lover"],
      picks: [
        {
          category: "beauty",
          image: "rose",
          brand: "rom&nd",
          name: "The Juicy Lasting Tint Bare Apricot",
          rating: "4.9 (4,322)",
          price: "US$11.80",
          originalPrice: "US$16.00",
          reason: "A fresh color that makes a whole look feel brighter with almost no effort.",
          tags: ["#Tint", "#Apricot"],
        },
        {
          category: "k-food",
          image: "green",
          brand: "Binggrae",
          name: "Banana Milk Mini Drink Pack",
          rating: "4.8 (2,014)",
          price: "US$7.60",
          originalPrice: "US$10.00",
          reason: "Sweet, nostalgic, and easy to share. It is a cheerful pick for weekend plans.",
          tags: ["#Drink", "#Sweet"],
        },
        {
          category: "k-traditional",
          image: "blue",
          brand: "K-Craft",
          name: "Mini Hanok Display Model",
          rating: "4.7 (305)",
          price: "US$18.40",
          originalPrice: "US$24.00",
          reason: "Small enough for a shelf, but detailed enough to feel like a real souvenir.",
          tags: ["#Hanok", "#Decor"],
        },
      ],
      magazines: [
        {
          tone: "yellow",
          image: "fruit",
          title: "Warm Weather Beauty Edits",
          copy: "Fresh tints, light layers, and easy touchups for hot and humid days.",
          meta: "Jul 20, 2026 · Beauty",
        },
        {
          tone: "green",
          image: "paper",
          title: "Sweet Korean Drink Picks",
          copy: "A quick guide to nostalgic drinks, cafe favorites, and refreshing pantry staples.",
          meta: "Jul 13, 2026 · K-Food",
        },
        {
          tone: "lavender",
          image: "stage",
          title: "Tiny Souvenirs With Charm",
          copy: "Small traditional pieces that bring a little story to your shelf or desk.",
          meta: "Jul 07, 2026 · K-Traditional",
        },
      ],
    },
    {
      name: "Ava",
      avatar: "hedgehog",
      flag: "au",
      facts: ["Melbourne, Australia", "29 years old", "Normal Skin"],
      bio: "Loves long-wear basics, editorial trends, and products that make a routine feel polished.",
      note: "My edit is about balance: products that look good, last well, and still feel easy.",
      tags: ["# Normal Skin", "# Editorial Eye", "# Long Wear", "# Lifestyle"],
      picks: [
        {
          category: "beauty",
          image: "blue",
          brand: "numbuzin",
          name: "No.3 PHA Skin Prep Bubble Mask 90ml",
          rating: "4.9 (1,275)",
          price: "US$28.00",
          originalPrice: "US$36.00",
          reason: "A satisfying prep step when skin looks dull and needs a quick reset before makeup.",
          tags: ["#Mask", "#Prep"],
        },
        {
          category: "lifestyle",
          image: "rose",
          brand: "Monami",
          name: "Mood Color Pen Set",
          rating: "4.8 (547)",
          price: "US$6.90",
          originalPrice: "US$9.00",
          reason: "A small stationery pick that makes planning feel more deliberate and fun.",
          tags: ["#Stationery", "#Color"],
        },
        {
          category: "k-pop",
          image: "green",
          brand: "K-POP Goods",
          name: "Concert Lightstick Mini Keyring",
          rating: "4.8 (812)",
          price: "US$14.30",
          originalPrice: "US$20.00",
          reason: "A playful accessory with just enough fandom energy without taking over the bag.",
          tags: ["#Keyring", "#Concert"],
        },
      ],
      magazines: [
        {
          tone: "lavender",
          image: "stage",
          title: "Editorial K-Beauty Trends",
          copy: "The textures, colors, and soft-focus finishes our editors keep seeing this season.",
          meta: "Jul 23, 2026 · Beauty",
        },
        {
          tone: "green",
          image: "paper",
          title: "Stationery For Better Lists",
          copy: "Pens, pouches, and small desk goods that make everyday planning feel less plain.",
          meta: "Jul 17, 2026 · Lifestyle",
        },
        {
          tone: "yellow",
          image: "fruit",
          title: "Small K-POP Goods With Big Charm",
          copy: "Low-commitment accessories and collectibles that still feel personal.",
          meta: "Jul 11, 2026 · K-POP",
        },
      ],
    },
  ];

  let activeEditorIndex = 0;
  let activePickFilter = "beauty";
  let activePickIndex = 0;

  const pickPrev = document.querySelector("[data-pick-prev]");
  const pickNext = document.querySelector("[data-pick-next]");
  const pickMeter = document.querySelector("[data-pick-meter]");
  const pickMeterFill = document.querySelector("[data-pick-meter-fill]");
  const pickMeterLabel = document.querySelector("[data-pick-meter-label]");

  const TAB_ORDER = ["beauty", "k-food", "lifestyle", "k-pop", "k-traditional"];
  const PICK_PAGE_SIZE = 3;

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const titleCaseCategory = (category) => ({
    beauty: "Beauty",
    "k-food": "K-Food",
    lifestyle: "Lifestyle",
    "k-pop": "K-pop",
    "k-traditional": "K-Traditional",
  })[category] || category;

  const factIcons = [
    '<img src="img/location.png" alt="" aria-hidden="true">',
    '<img src="img/birth.png" alt="" aria-hidden="true">',
    '<img src="img/skin.png" alt="" aria-hidden="true">',
  ];

  const renderProfile = (editor) => {
    if (profileAvatar) {
      profileAvatar.className = `editor-avatar editor-avatar--${editor.avatar}`;
      profileAvatar.innerHTML = "<i></i>";
    }

    if (profileFlag) {
      profileFlag.className = `flag flag--${editor.flag}`;
    }

    if (profileAvatarName) profileAvatarName.textContent = editor.name;
    if (profileCopyName) profileCopyName.textContent = editor.name;
    if (profileBio) profileBio.textContent = editor.bio;
    if (editorNoteText) editorNoteText.textContent = editor.note;
    if (editorNoteSignature) editorNoteSignature.innerHTML = `${escapeHtml(editor.name)} <span aria-hidden="true">&#9829;</span>`;

    if (profileFacts) {
      profileFacts.innerHTML = editor.facts
        .map((fact, index) => `<li>${factIcons[index] || ""}${escapeHtml(fact)}</li>`)
        .join("");
    }

    if (profileTags) {
      profileTags.innerHTML = editor.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    }

    profileAvatarWrap?.setAttribute("aria-label", `${editor.name} profile`);
  };

  const renderPickCard = (pick) => `
    <article class="editor-pick-card" data-pick-category="${escapeHtml(pick.category)}">
      <div class="editor-pick-image editor-pick-image--${escapeHtml(pick.image)}" aria-hidden="true"><span></span></div>
      <div class="editor-pick-product">
        <p>${escapeHtml(pick.brand)}</p>
        <h3>${escapeHtml(pick.name)}</h3>
        <div class="editor-rating"><img src="../img/main-img/star.png" alt="" aria-hidden="true">${escapeHtml(pick.rating)}</div>
        <div class="editor-price"><strong>${escapeHtml(pick.price)}</strong><del>${escapeHtml(pick.originalPrice)}</del></div>
        <div class="editor-pick-actions">
          <button type="button" class="editor-cart" aria-label="Add to cart"><img src="../img/listing/cart_hover.png" alt="" aria-hidden="true"></button>
          <button type="button" class="editor-wish" aria-label="Add to wishlist" aria-pressed="false"></button>
        </div>
      </div>
      <aside class="editor-pick-note">
        <h4><span aria-hidden="true"></span> Why I Picked It!</h4>
        <p>${escapeHtml(pick.reason)}</p>
        <div>${pick.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      </aside>
    </article>
  `;

  const getPicksForTab = (editor, tab) =>
    tab === "all"
      ? editor.picks
      : editor.picks.filter((pick) => pick.category === tab);

  const getVisiblePicks = (editor) => getPicksForTab(editor, activePickFilter);

  const getNextTab = (fromTab) => {
    const start = TAB_ORDER.indexOf(fromTab);
    if (start < 0) return null;
    return TAB_ORDER[(start + 1) % TAB_ORDER.length];
  };

  const getPrevTab = (fromTab) => {
    const start = TAB_ORDER.indexOf(fromTab);
    if (start < 0) return null;
    return TAB_ORDER[(start - 1 + TAB_ORDER.length) % TAB_ORDER.length];
  };

  const getPickPageSize = () => PICK_PAGE_SIZE;

  const getMaxPickIndex = (total) => {
    const pageSize = getPickPageSize();
    if (total <= pageSize) return 0;
    return Math.floor((total - 1) / pageSize) * pageSize;
  };

  const updatePickControls = (editor) => {
    const visiblePicks = getVisiblePicks(editor);
    const total = visiblePicks.length;
    const pageSize = getPickPageSize();
    const maxIndex = getMaxPickIndex(total);
    const endIndex = total ? Math.min(total, activePickIndex + pageSize) : 0;
    const canGoNextTab = Boolean(getNextTab(activePickFilter));
    const canGoPrevTab = Boolean(getPrevTab(activePickFilter));

    if (pickPrev) {
      pickPrev.disabled = total > 0
        ? activePickIndex <= 0 && !canGoPrevTab
        : !canGoPrevTab;
    }

    if (pickNext) {
      pickNext.disabled = total > 0
        ? activePickIndex >= maxIndex && !canGoNextTab
        : !canGoNextTab;
    }

    if (pickMeterFill) {
      const progress = total > 0 ? endIndex / total : 0;
      pickMeterFill.style.transform = `scaleX(${progress})`;
    }

    if (pickMeterLabel) {
      if (!total) {
        pickMeterLabel.textContent = "No picks";
      } else {
        const startLabel = activePickIndex + 1;
        const categoryLabel = titleCaseCategory(activePickFilter);
        pickMeterLabel.textContent =
          startLabel === endIndex
            ? `${startLabel} / ${total} · ${categoryLabel}`
            : `${startLabel}-${endIndex} / ${total} · ${categoryLabel}`;
      }
    }

    if (pickMeter) pickMeter.hidden = total <= pageSize;
  };

  const renderPicks = (editor, { resetIndex = true } = {}) => {
    const visiblePicks = getVisiblePicks(editor);
    if (resetIndex) activePickIndex = 0;
    activePickIndex = Math.min(activePickIndex, getMaxPickIndex(visiblePicks.length));

    if (picksTitle) {
      const suffix = visiblePicks.length === 1 ? "item" : "items";
      picksTitle.innerHTML = `${escapeHtml(editor.name)}&rsquo;s Picks <span>(${visiblePicks.length} ${suffix})</span>`;
    }

    if (!pickList) return;

    const pagePicks = visiblePicks.slice(activePickIndex, activePickIndex + getPickPageSize());

    pickList.innerHTML = pagePicks.length
      ? pagePicks.map(renderPickCard).join("")
      : `<p class="editor-empty-message">No ${escapeHtml(titleCaseCategory(activePickFilter))} picks yet.</p>`;

    updatePickControls(editor);
  };

  const goToPick = (nextIndex) => {
    const editor = editors[activeEditorIndex];
    const visiblePicks = getVisiblePicks(editor);
    if (!visiblePicks.length) return;

    activePickIndex = Math.max(0, Math.min(getMaxPickIndex(visiblePicks.length), nextIndex));
    renderPicks(editor, { resetIndex: false });
  };

  const goNextPick = () => {
    const editor = editors[activeEditorIndex];
    const visiblePicks = getVisiblePicks(editor);
    const pageSize = getPickPageSize();
    const maxIndex = getMaxPickIndex(visiblePicks.length);
    const nextIndex = activePickIndex + pageSize;

    if (visiblePicks.length && nextIndex <= maxIndex) {
      goToPick(nextIndex);
      return;
    }

    const nextTab = getNextTab(activePickFilter);
    if (nextTab) setActivePickFilter(nextTab);
  };

  const goPrevPick = () => {
    const editor = editors[activeEditorIndex];
    const visiblePicks = getVisiblePicks(editor);
    const pageSize = getPickPageSize();

    if (visiblePicks.length && activePickIndex > 0) {
      goToPick(Math.max(0, activePickIndex - pageSize));
      return;
    }

    const prevTab = getPrevTab(activePickFilter);
    if (!prevTab) return;

    const prevPicks = getPicksForTab(editor, prevTab);
    setActivePickFilter(prevTab, { startIndex: getMaxPickIndex(prevPicks.length) });
  };

  const setActivePickFilter = (filter, options = {}) => {
    activePickFilter = filter || "beauty";
    activePickIndex = Number.isInteger(options.startIndex) ? options.startIndex : 0;

    pickTabs.forEach((tab) => {
      const isActive = tab.dataset.pickFilter === activePickFilter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    renderPicks(editors[activeEditorIndex], { resetIndex: !Number.isInteger(options.startIndex) });
  };

  const renderMagazineCard = (magazine) => `
    <article class="editor-magazine-card editor-magazine-card--${escapeHtml(magazine.tone)}">
      <div class="editor-magazine-image editor-magazine-image--${escapeHtml(magazine.image)}" aria-hidden="true"></div>
      <h3>${escapeHtml(magazine.title)}</h3>
      <p>${escapeHtml(magazine.copy)}</p>
      <small>${escapeHtml(magazine.meta)}</small>
    </article>
  `;

  const renderMagazines = (editor) => {
    if (magazineTitle) {
      magazineTitle.innerHTML = `From ${escapeHtml(editor.name)}&rsquo;s Magazine`;
    }

    if (magazineGrid) {
      magazineGrid.innerHTML = editor.magazines.map(renderMagazineCard).join("");
      magazineGrid.scrollTo({ left: 0, top: 0, behavior: "auto" });
    }

    if (magazineDotsWrap) {
      magazineDotsWrap.innerHTML = editor.magazines
        .map((_, index) => `<span${index === 0 ? ' class="is-active"' : ""}></span>`)
        .join("");
    }
  };

  const setActiveEditor = (index, options = {}) => {
    const nextIndex = Number.isInteger(index) ? index : 0;
    const editor = editors[nextIndex] || editors[0];
    activeEditorIndex = editors.indexOf(editor);
    if (options.resetFilter !== false) activePickFilter = "beauty";

    editorButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeEditorIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    renderProfile(editor);
    renderMagazines(editor);
    setActivePickFilter(activePickFilter);
    updateMagazineDots();
  };

  const updateMagazineDots = () => {
    if (!magazineGrid || !magazineDotsWrap) return;
    const magazineDots = Array.from(magazineDotsWrap.querySelectorAll("span"));
    if (!magazineDots.length) return;

    const maxScrollLeft = Math.max(1, magazineGrid.scrollWidth - magazineGrid.clientWidth);
    const progress = magazineGrid.scrollLeft / maxScrollLeft;
    const activeIndex = Math.min(magazineDots.length - 1, Math.round(progress * (magazineDots.length - 1)));

    magazineDots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  };

  editorButtons.forEach((button, index) => {
    const editor = editors[index];
    if (editor) {
      const label = button.querySelector("strong");
      if (label) label.textContent = editor.name;
    }

    button.addEventListener("click", () => setActiveEditor(index));
  });

  pickTabs.forEach((button) => {
    button.addEventListener("click", () => {
      setActivePickFilter(button.dataset.pickFilter || "beauty");
    });
  });

  pickPrev?.addEventListener("click", goPrevPick);
  pickNext?.addEventListener("click", goNextPick);

  pickList?.addEventListener("click", (event) => {
    const button = event.target.closest(".editor-wish");
    if (!button) return;

    const isActive = !button.classList.contains("is-active");
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  magazineGrid?.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateMagazineDots);
  }, { passive: true });

  setActiveEditor(0);
})();
