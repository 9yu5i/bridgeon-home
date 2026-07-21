(() => {
  const imageClasses = [
    "magazine-image--forest",
    "magazine-image--paper",
    "magazine-image--pink",
    "magazine-image--food",
    "magazine-image--blue",
  ];

  const articles = {
    "better-layering-summer": {
      eyebrow: "BEAUTY GUIDE",
      breadcrumb: "Beauty Guide",
      title: "Better Layering For Summer: Sunscreen Routine",
      subtitle: "How editors keep a light, comfortable skincare routine while protecting glow on humid days.",
      author: "BridgeOn Editorial",
      editor: "Editor Nara",
      date: "2026-07-06",
      displayDate: "Jul 6, 2026",
      imageClass: "magazine-image--pink",
      note:
        "Use this page as the article detail template. The image blocks can be replaced with real campaign images later.",
      lede:
        "Summer skin routines work best when each layer has a clear job. Instead of stacking heavy textures, our editors look for fresh hydration, a flexible sunscreen finish, and small reapply-friendly products that sit comfortably through the day.",
      quote: "The best summer routine is the one that still feels clean after lunch.",
      sections: [
        {
          id: "summer-layering",
          title: "Keep The First Layers Thin",
          paragraphs: [
            "Start with a watery toner or mist, then move into a serum that absorbs quickly. This keeps the base soft without making sunscreen feel slippery.",
            "The goal is to make every layer earn its place, so makeup and sunscreen can sit smoothly without pilling.",
          ],
          figureClass: "magazine-image--blue",
          figureCaption: "Light textures and cooling finishes are easier to reapply during humid weather.",
        },
        {
          id: "routine-steps",
          title: "A Simple Editor Routine",
          paragraphs: [
            "Hydrate first, use one targeted serum, choose a sunscreen finish you actually enjoy, and carry a compact product for midday touch-ups.",
          ],
        },
        {
          id: "editor-picks",
          title: "What Editors Are Saving",
          paragraphs: [
            "Cushion sunscreen, gel creams, and airy serums are the most saved categories this week. We also like products that make reapplication feel less like a chore.",
          ],
        },
      ],
      gridClasses: ["magazine-image--paper", "magazine-image--food"],
    },
    "korean-sunscreens": {
      eyebrow: "BEAUTY",
      breadcrumb: "Beauty",
      title: "5 Korean Sunscreens You Should Try",
      subtitle: "A practical editor list for comfortable daily SPF, from watery gels to soft matte finishes.",
      author: "BridgeOn Beauty Team",
      editor: "Editor Nara",
      date: "2026-07-21",
      displayDate: "Jul 21, 2026",
      imageClass: "magazine-image--blue",
      note: "This article is built for quick comparison, so each section highlights texture, finish, and daily use.",
      lede:
        "A good sunscreen should be easy to wear before it tries to be impressive. These picks focus on comfort, light layering, and finishes that work under makeup or on bare skin.",
      quote: "The SPF you reach for every morning is the one that wins.",
      sections: [
        {
          id: "daily-comfort",
          title: "Daily Comfort Comes First",
          paragraphs: [
            "Watery gels are the safest starting point for humid weather. They spread quickly, leave less residue, and are easier to reapply around the nose and cheeks.",
            "For dry skin, look for flexible cream textures that do not sit heavily once the first few minutes pass.",
          ],
          figureClass: "magazine-image--blue",
          figureCaption: "Daily sunscreen should feel predictable from morning to afternoon.",
        },
        {
          id: "finish-check",
          title: "Check The Finish",
          paragraphs: [
            "Soft glow works well for bare skin days, while semi-matte formulas are easier under base makeup. Editors usually test both in indoor light and direct daylight.",
          ],
        },
        {
          id: "spf-bag",
          title: "Keep One In Your Bag",
          paragraphs: [
            "A travel tube or stick makes reapplication less dramatic. If it fits your daily bag, it is more likely to become part of your routine.",
          ],
        },
      ],
      gridClasses: ["magazine-image--pink", "magazine-image--paper"],
    },
    "editor-beauty-cart": {
      eyebrow: "BEAUTY",
      breadcrumb: "Editor's Cart",
      title: "What Is Worth Buying This Month? Editor's Cart",
      subtitle: "The textures, minis, and useful beauty updates our editors would actually add to cart.",
      author: "BridgeOn Editors",
      editor: "Editor Mila",
      date: "2026-07-08",
      displayDate: "Jul 8, 2026",
      imageClass: "magazine-image--paper",
      note: "A shopping-led story for products that feel timely, usable, and easy to recommend.",
      lede:
        "Our monthly cart is less about hype and more about what solves a small problem well. This month, the edit leans into compact skincare, fresh lip color, and summer-friendly base products.",
      quote: "Useful beats viral when the weather gets sticky.",
      sections: [
        {
          id: "cart-rules",
          title: "The Cart Rules",
          paragraphs: [
            "We look for products that fit into an existing routine without adding friction. The best buys have clear use cases and textures that feel current.",
          ],
          figureClass: "magazine-image--paper",
          figureCaption: "Editor carts are built around small upgrades, not full routine resets.",
        },
        {
          id: "small-wins",
          title: "Small Wins To Add",
          paragraphs: [
            "A cushion refill, a gentle toner pad, or a pocket lip product can shift how polished a daily routine feels without requiring a full restock.",
          ],
        },
        {
          id: "what-to-skip",
          title: "What To Skip For Now",
          paragraphs: [
            "Heavy occlusive textures and oversized value sets are better saved for cooler months unless your skin already knows and loves them.",
          ],
        },
      ],
      gridClasses: ["magazine-image--food", "magazine-image--pink"],
    },
    "korean-summer-snacks": {
      eyebrow: "K-FOOD",
      breadcrumb: "K-Food",
      title: "Korean Summer Snacks You Need To Try",
      subtitle: "Crisp, sweet, and cooling snack picks that make hot afternoons feel easier.",
      author: "BridgeOn Food Desk",
      editor: "Editor Jules",
      date: "2026-07-05",
      displayDate: "Jul 5, 2026",
      imageClass: "magazine-image--food",
      note: "This food edit keeps the tone light and giftable, with snack ideas that travel well.",
      lede:
        "Summer snacks should be easy to share and easy to keep nearby. Our editors picked bright flavors, light textures, and a few sweet options that feel especially good chilled.",
      quote: "The best snack is the one that disappears before the movie starts.",
      sections: [
        {
          id: "cool-flavors",
          title: "Start With Cooler Flavors",
          paragraphs: [
            "Fruit, yogurt, and tea-inspired snacks tend to feel less heavy in hot weather. They also make easy gifts for friends who like trying Korean convenience-store favorites.",
          ],
          figureClass: "magazine-image--food",
          figureCaption: "Fruit-forward snacks are easy to pair with iced drinks.",
        },
        {
          id: "crunch-list",
          title: "Keep Something Crunchy",
          paragraphs: [
            "Seaweed snacks, baked chips, and small nut mixes bring texture without making the snack drawer feel too rich.",
          ],
        },
        {
          id: "drink-pairing",
          title: "Pair With A Drink",
          paragraphs: [
            "Iced tea, canned coffee, or a soft fruit drink can turn a simple snack break into a tiny cafe moment.",
          ],
        },
      ],
      gridClasses: ["magazine-image--paper", "magazine-image--blue"],
    },
    "summer-fruit-desserts": {
      eyebrow: "FOOD",
      breadcrumb: "Food",
      title: "Korean Summer Fruit Desserts You Need To Try",
      subtitle: "A sweet editor guide to fruit-forward desserts, cafe bowls, and refreshing summer treats.",
      author: "Name's Magazine",
      editor: "Editor Nara",
      date: "2026-07-21",
      displayDate: "Jul 21, 2026",
      imageClass: "magazine-image--food",
      note: "This story is tied to the editor profile page and shows one selected editor's taste.",
      lede:
        "Fruit desserts are everywhere in Korean summer menus, from shaved ice to jelly cups and bright cafe plates. We focused on treats that look joyful without feeling too heavy.",
      quote: "A summer dessert should feel cold, bright, and a little playful.",
      sections: [
        {
          id: "fruit-first",
          title: "Fruit Comes First",
          paragraphs: [
            "Peach, mango, watermelon, and tomato-based desserts are especially easy to style visually. They also work well with milk, tea, and yogurt notes.",
          ],
          figureClass: "magazine-image--food",
          figureCaption: "Fruit-led desserts create a strong first image for magazine storytelling.",
        },
        {
          id: "texture",
          title: "Add Texture",
          paragraphs: [
            "Soft cream, chewy jelly, crunchy flakes, and ice can make one simple fruit plate feel more complete.",
          ],
        },
        {
          id: "editor-save",
          title: "What Name Saved",
          paragraphs: [
            "Name saved dessert ideas that are colorful, easy to photograph, and simple enough to recommend to first-time shoppers.",
          ],
        },
      ],
      gridClasses: ["magazine-image--pink", "magazine-image--paper"],
    },
    "rescene-kpop-style": {
      eyebrow: "K-POP",
      breadcrumb: "K-POP",
      title: "The Girls Of Rescene: A New K-POP Style",
      subtitle: "A visual notes page for stage styling, soft color palettes, and collectible moments.",
      author: "Name's Magazine",
      editor: "Editor Pim",
      date: "2026-07-21",
      displayDate: "Jul 21, 2026",
      imageClass: "magazine-image--paper",
      note: "Use this article type for artist, album, and styling stories tied to culture content.",
      lede:
        "K-POP style stories work best when they balance fandom detail with visual direction. This article looks at soft styling, collectible imagery, and how a group image becomes memorable.",
      quote: "A good concept gives fans something to remember and something to save.",
      sections: [
        {
          id: "visual-direction",
          title: "Visual Direction",
          paragraphs: [
            "The palette feels soft but graphic, with styling details that are easy to recognize in thumbnails and social posts.",
          ],
          figureClass: "magazine-image--paper",
          figureCaption: "Editorial K-POP stories need strong visual rhythm across images.",
        },
        {
          id: "collectible-details",
          title: "Collectible Details",
          paragraphs: [
            "Small props, printed goods, and album-like compositions help the story feel connected to shopping behavior.",
          ],
        },
        {
          id: "fan-save",
          title: "Why Fans Save It",
          paragraphs: [
            "Fans often save images that communicate a concept quickly. Clear color, readable styling, and repeatable motifs help.",
          ],
        },
      ],
      gridClasses: ["magazine-image--blue", "magazine-image--pink"],
    },
    "bts-anniversary-busan": {
      eyebrow: "K-POP",
      breadcrumb: "K-POP",
      title: "BTS Celebrates 13th Anniversary In Busan",
      subtitle: "A culture recap built around saved moments, city energy, and fan travel notes.",
      author: "Name's Magazine",
      editor: "Editor Ava",
      date: "2026-07-21",
      displayDate: "Jul 21, 2026",
      imageClass: "magazine-image--blue",
      note: "This is an example culture article that can later connect to saved reels or event products.",
      lede:
        "Anniversary stories are part recap and part memory board. This version gathers the moments fans would save, the city details they would revisit, and the small items that make the day feel collectible.",
      quote: "For fans, a city can become part of the archive.",
      sections: [
        {
          id: "busan-mood",
          title: "Busan As The Backdrop",
          paragraphs: [
            "Busan adds coastal light, travel energy, and a sense of occasion. It gives the story more texture than a simple event recap.",
          ],
          figureClass: "magazine-image--blue",
          figureCaption: "Event stories can use city context to feel more editorial.",
        },
        {
          id: "fan-moments",
          title: "Fan Moments",
          paragraphs: [
            "Saved photos, small goods, and route notes can turn one event into a longer shopping and travel journey.",
          ],
        },
        {
          id: "what-to-collect",
          title: "What To Collect",
          paragraphs: [
            "Photobooks, small accessories, and event-inspired goods are the easiest bridges between story content and commerce.",
          ],
        },
      ],
      gridClasses: ["magazine-image--forest", "magazine-image--paper"],
    },
  };

  const titleFromSlug = (slug) =>
    String(slug || "Magazine Story")
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const createFallbackArticle = (slug) => {
    const imageClass = imageClasses[Math.abs(String(slug).length) % imageClasses.length];
    return {
      ...articles["better-layering-summer"],
      eyebrow: "MAGAZINE",
      breadcrumb: "Magazine",
      title: titleFromSlug(slug),
      subtitle: "",
      imageClass,
      sections: [
        {
          id: "story-overview",
          title: "Story Overview",
          paragraphs: [
            "This article template is ready for a full magazine story. Replace the placeholder copy and image areas with the final editorial content when the article is approved.",
          ],
          figureClass: imageClass,
          figureCaption: "Use this image area for the strongest visual from the story.",
        },
        {
          id: "editor-notes",
          title: "Editor Notes",
          paragraphs: [
            "Keep the article focused on a clear topic, add useful shopping or culture context, and make sure the first image explains the story immediately.",
          ],
        },
      ],
      gridClasses: ["magazine-image--paper", "magazine-image--blue"],
    };
  };

  const params = new URLSearchParams(window.location.search);
  const currentSlug = params.get("article") || "better-layering-summer";
  const currentArticle = articles[currentSlug] || createFallbackArticle(currentSlug);

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const setImageClass = (node, imageClass) => {
    if (!node) return;
    node.classList.remove(...imageClasses);
    node.classList.add(imageClass);
    node.textContent = "";
    const label = document.createElement("span");
    label.textContent = "img";
    node.append(label);
  };

  const createParagraph = (text, className = "") => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    if (className) paragraph.className = className;
    return paragraph;
  };

  const createImageBlock = (imageClass) => {
    const image = document.createElement("div");
    image.className = `magazine-image ${imageClass}`;
    const label = document.createElement("span");
    label.textContent = "img";
    image.append(label);
    return image;
  };

  const createArticleHref = (slug) => `./magazine-detail.html?article=${encodeURIComponent(slug)}`;

  const renderBody = (article) => {
    const body = document.querySelector(".magazine-article-body");
    if (!body) return;

    body.textContent = "";
    body.append(createParagraph(article.lede, "magazine-article-lede"));

    article.sections.forEach((section, index) => {
      const heading = document.createElement("h2");
      heading.id = section.id;
      heading.textContent = section.title;
      body.append(heading);

      section.paragraphs.forEach((paragraph) => {
        body.append(createParagraph(paragraph));
      });

      if (section.figureClass) {
        const figure = document.createElement("figure");
        figure.className = "magazine-article-figure";
        figure.append(createImageBlock(section.figureClass));

        if (section.figureCaption) {
          const caption = document.createElement("figcaption");
          caption.textContent = section.figureCaption;
          figure.append(caption);
        }

        body.append(figure);
      }

      if (index === 0 && article.quote) {
        const quote = document.createElement("blockquote");
        quote.textContent = article.quote;
        body.append(quote);
      }
    });

    if (article.gridClasses?.length) {
      const imageGrid = document.createElement("div");
      imageGrid.className = "magazine-article-image-grid";
      article.gridClasses.forEach((imageClass) => imageGrid.append(createImageBlock(imageClass)));
      body.append(imageGrid);
    }
  };

  const renderRelated = () => {
    const grid = document.querySelector(".magazine-related-grid");
    if (!grid) return;

    const relatedArticles = Object.entries(articles)
      .filter(([slug]) => slug !== currentSlug)
      .slice(0, 3);

    grid.textContent = "";
    relatedArticles.forEach(([slug, article]) => {
      const card = document.createElement("article");
      card.className = "magazine-post-card is-popular-visible";
      card.dataset.magazineCategory = article.breadcrumb.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const imageLink = document.createElement("a");
      imageLink.href = createArticleHref(slug);
      imageLink.className = `magazine-post-image magazine-image ${article.imageClass}`;
      imageLink.setAttribute("aria-label", `Read ${article.title}`);
      imageLink.append(document.createElement("span"));
      imageLink.querySelector("span").textContent = "img";

      const category = document.createElement("p");
      category.textContent = article.eyebrow.replace(" GUIDE", "");

      const title = document.createElement("h3");
      const titleLink = document.createElement("a");
      titleLink.href = createArticleHref(slug);
      titleLink.textContent = article.title;
      title.append(titleLink);

      const excerpt = document.createElement("p");
      excerpt.className = "magazine-post-excerpt";
      excerpt.textContent = article.subtitle;

      const date = document.createElement("span");
      date.textContent = article.displayDate;

      card.append(imageLink, category, title, excerpt, date);
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", `Read ${article.title}`);
      card.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        window.location.href = createArticleHref(slug);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (event.target.closest("a")) return;
        event.preventDefault();
        window.location.href = createArticleHref(slug);
      });
      grid.append(card);
    });
  };

  const getArticleCategory = (article) => {
    if (article.category) return String(article.category).trim().toUpperCase();

    const eyebrow = String(article.eyebrow || "").trim();
    if (!eyebrow) return "MAGAZINE";

    const normalized = eyebrow.replace(/\s+GUIDE$/i, "").trim().toUpperCase();
    const categoryMap = {
      "K-FOOD": "FOOD",
      "K-BEAUTY": "BEAUTY",
      "K-DRAMA": "K-DRAMA",
      "K-POP": "K-POP",
      "TOYS & CRAFTS": "TOYS & CRAFTS",
      "STATIONERY & OFFICE": "STATIONERY & OFFICE",
    };

    return categoryMap[normalized] || normalized;
  };

  document.title = `${currentArticle.title} | BridgeOn Magazine`;
  setText(".magazine-breadcrumb span:last-child", currentArticle.breadcrumb);
  setText(".magazine-detail-hero-copy > p", getArticleCategory(currentArticle));
  setText("#magazine-detail-title", currentArticle.title);

  const subtitleNode = document.querySelector(".magazine-detail-hero-copy > span");
  if (subtitleNode) {
    const subtitle = String(currentArticle.subtitle || "").trim();
    subtitleNode.textContent = subtitle;
    subtitleNode.hidden = !subtitle;
  }

  setText(".magazine-article-head p", currentArticle.author);
  setText(".magazine-article-editor", currentArticle.editor || currentArticle.author || "BridgeOn Editor");

  const dateNode = document.querySelector(".magazine-article-head time");
  if (dateNode) {
    dateNode.dateTime = currentArticle.date;
    dateNode.textContent = currentArticle.displayDate;
  }

  setImageClass(document.querySelector(".magazine-detail-hero-image"), currentArticle.imageClass);
  renderBody(currentArticle);
  renderRelated();
})();
