(() => {
  const directory = document.querySelector("[data-brand-directory]");
  const alphaNav = document.querySelector("[data-brand-alpha]");
  const searchInput = document.querySelector("[data-brand-search]");
  const emptyState = document.querySelector("[data-brand-empty]");

  if (!directory || !alphaNav) return;

  const slugify = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const brands = [
    { name: "A'ddict", isNew: false },
    { name: "A'demang", isNew: false },
    { name: "AB6IX", isNew: false },
    { name: "Abib", isNew: false },
    { name: "About Tone", isNew: false },
    { name: "ACOOLDA", isNew: false },
    { name: "ACNE OUT", isNew: false },
    { name: "Adept Cosmetics", isNew: false },
    { name: "ADH DHI", isNew: false },
    { name: "AESTHETIC", isNew: false },
    { name: "AESTURA", isNew: false },
    { name: "AHC", isNew: false },
    { name: "ALIVE LAB", isNew: false },
    { name: "ALLION", isNew: false },
    { name: "ALTERNATIVE STEREO", isNew: false },
    { name: "ALTERNATIVESTEREOLIP", isNew: false },
    { name: "AMUSE", isNew: false },
    { name: "ANEWALL", isNew: false },
    { name: "ANNA SUI", isNew: false },
    { name: "ANOTHER KNOB", isNew: false },
    { name: "ANTARCTIC DOLPHIN", isNew: false },
    { name: "Anua", isNew: true },
    { name: "APR", isNew: false },
    { name: "APRILSKIN", isNew: false },
    { name: "APUTURE", isNew: false },
    { name: "AROCELL", isNew: false },
    { name: "ARTIBITION", isNew: false },
    { name: "Artsdeco", isNew: false },
    { name: "As Mochiin", isNew: false },
    { name: "ATOPALM", isNew: false },
    { name: "Auraice", isNew: false },
    { name: "AVESTANDO", isNew: false },
    { name: "Avica", isNew: false },
    { name: "Axis-Y", isNew: false },
    { name: "AZH", isNew: true },
    { name: "Beauty of Joseon", isNew: false },
    { name: "Celimax", isNew: false },
    { name: "COSRX", isNew: false },
    { name: "medicube", isNew: false },
    { name: "numbuzin", isNew: true },
    { name: "rom&nd", isNew: false },
    { name: "Round Lab", isNew: false },
    { name: "Biodance", isNew: false },
    { name: "Bring Green", isNew: false },
    { name: "CLIO", isNew: false },
    { name: "Dasique", isNew: false },
    { name: "Dr.G", isNew: false },
    { name: "Etude", isNew: false },
    { name: "Goodal", isNew: false },
    { name: "Haruharu Wonder", isNew: false },
    { name: "Innisfree", isNew: false },
    { name: "Isntree", isNew: false },
    { name: "Laneige", isNew: false },
    { name: "Missha", isNew: false },
    { name: "Numbuzin", isNew: false },
    { name: "Peripera", isNew: false },
    { name: "Purito", isNew: false },
    { name: "SKIN1004", isNew: false },
    { name: "Sulwhasoo", isNew: false },
    { name: "TIRTIR", isNew: false },
    { name: "Torriden", isNew: false },
    { name: "VT Cosmetics", isNew: false },
    { name: "3CE", isNew: false },
    { name: "#OOTD", isNew: false },
  ];

  const getBrandLetter = (name) => {
    const first = name.trim().charAt(0).toUpperCase();
    if (/[A-Z]/.test(first)) return first;
    return "#";
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const sortedBrands = [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  );

  const availableLetters = Array.from(
    new Set(sortedBrands.map((brand) => getBrandLetter(brand.name)))
  ).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  let activeLetter = "ALL";
  let searchQuery = "";

  const renderAlphaNav = () => {
    const letters = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];
    alphaNav.replaceChildren(
      ...letters.map((letter) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "brand-alpha-button";
        button.textContent = letter;
        button.dataset.brandLetter = letter;
        button.setAttribute("aria-pressed", activeLetter === letter ? "true" : "false");
        button.classList.toggle("is-active", activeLetter === letter);
        button.disabled = letter !== "ALL" && !availableLetters.includes(letter);
        return button;
      })
    );
  };

  const getFilteredBrands = () => {
    const query = searchQuery.trim().toLowerCase();
    return sortedBrands.filter((brand) => {
      const matchesLetter =
        activeLetter === "ALL" || getBrandLetter(brand.name) === activeLetter;
      const matchesSearch = !query || brand.name.toLowerCase().includes(query);
      return matchesLetter && matchesSearch;
    });
  };

  const groupBrands = (items) => {
    const groups = new Map();
    items.forEach((brand) => {
      const letter = getBrandLetter(brand.name);
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(brand);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });
  };

  const renderDirectory = () => {
    const filtered = getFilteredBrands();
    const groups = groupBrands(filtered);

    directory.replaceChildren(
      ...groups.map(([letter, items]) => {
        const section = document.createElement("section");
        section.className = "brand-group";
        section.id = `brand-letter-${letter === "#" ? "num" : letter.toLowerCase()}`;
        section.setAttribute("aria-labelledby", `brand-group-${letter}`);

        const heading = document.createElement("h2");
        heading.className = "brand-group-letter";
        heading.id = `brand-group-${letter}`;
        heading.textContent = letter;

        const list = document.createElement("ul");
        list.className = "brand-group-list";
        list.replaceChildren(
          ...items.map((brand) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = `./${slugify(brand.name)}.html`;
            link.textContent = brand.name;
            if (brand.isNew) {
              const badge = document.createElement("span");
              badge.className = "brand-new-badge";
              badge.textContent = "N";
              badge.setAttribute("aria-label", "New brand");
              link.append(badge);
            }
            item.append(link);
            return item;
          })
        );

        section.append(heading, list);
        return section;
      })
    );

    if (emptyState) {
      emptyState.hidden = filtered.length > 0;
    }
  };

  const render = () => {
    renderAlphaNav();
    renderDirectory();
  };

  alphaNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-brand-letter]");
    if (!button || button.disabled) return;
    activeLetter = button.dataset.brandLetter || "ALL";
    render();
  });

  searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value;
    if (searchQuery.trim()) activeLetter = "ALL";
    render();
  });

  searchInput?.closest("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  render();
})();
