(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function parseEndDate(issueDate) {
    if (!issueDate) return null;
    var end = String(issueDate).split("~").pop().trim();
    var match = end.match(/(\d{2,4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (!match) return null;
    var year = parseInt(match[1], 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(match[2], 10) - 1, parseInt(match[3], 10), 23, 59, 59);
  }

  function daysUntilEnd(issueDate) {
    var endDate = parseEndDate(issueDate);
    if (!endDate || isNaN(endDate.getTime())) return null;
    var now = new Date();
    var diff = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
    return diff;
  }

  // Remaining days until validity end (KST end-of-day). Prefer real end date when available.
  function parseDaysLeft(value, issueDate) {
    var until = daysUntilEnd(issueDate);
    if (until != null) {
      return until < 0 ? null : until;
    }

    if (value == null) return null;
    var text = String(value).replace(/<[^>]+>/g, " ").trim();
    if (!text) return null;
    if (/ago|past|지남|만료|소멸|expired/i.test(text)) return null;
    var left = text.match(/(\d+)\s*(?:일\s*남음|days?\s*left)/i);
    if (!left) return null;
    return parseInt(left[1], 10);
  }

  function isWithinOneWeek(days) {
    return days != null && days >= 0 && days <= 7;
  }

  function translateCouponUiText(value) {
    if (value == null) return "";
    var text = String(value).replace(/<[^>]+>/g, " ").trim();
    if (!text) return "";

    var daysLeft = text.match(/(\d+)\s*일\s*남음/);
    if (daysLeft) {
      var days = parseInt(daysLeft[1], 10);
      return days + (days === 1 ? " day left" : " days left");
    }

    var daysPast = text.match(/(\d+)\s*일\s*지남/);
    if (daysPast) {
      var past = parseInt(daysPast[1], 10);
      return past + (past === 1 ? " day past" : " days past");
    }

    return text
      .replace(/미사용/g, "Unused")
      .replace(/사용완료|사용함|사용/g, "Used")
      .replace(/기간만료|만료|소멸/g, "Expired")
      .replace(/할인/g, " off")
      .replace(/이상\s*구매\s*시?/g, " min. purchase")
      .replace(/이상/g, " or more")
      .replace(/최대\s*할인\s*금액/g, "Max discount")
      .replace(/최대/g, "Max")
      .replace(/\s+/g, " ")
      .trim();
  }

  function translateTicketUi(root) {
    (root || document).querySelectorAll("[data-coupon-days], [data-coupon-expire], .bo-coupon-terms, .bo-coupon-ticket-top span").forEach(function (el) {
      if (el.closest(".bo-coupon-ticket-actions")) return;
      var next = translateCouponUiText(el.textContent);
      if (next && next !== el.textContent.trim()) el.textContent = next;
    });

    (root || document).querySelectorAll("[data-coupon-sale]").forEach(function (el) {
      var next = translateCouponUiText(el.textContent);
      if (next && next !== el.textContent.trim()) el.textContent = next;
    });
  }

  function formatSaleTitles(root) {
    (root || document).querySelectorAll("[data-coupon-sale]").forEach(function (el) {
      if (el.querySelector("strong")) return;
      var text = (el.textContent || "").trim();
      if (!text) return;
      var match = text.match(/^([US$]*\s*[\d,.]+%?)\s*(.*)$/i);
      if (!match) return;
      el.innerHTML = "";
      var strong = document.createElement("strong");
      strong.textContent = match[1].trim();
      el.appendChild(strong);
      if (match[2]) {
        el.appendChild(document.createTextNode(" " + match[2].trim()));
      }
    });
  }

  function isAppOnlyText(value) {
    return /app\s*only|앱\s*전용|앱에서만|mobile\s*app/i.test(String(value || ""));
  }

  function isNewText(value) {
    return /^(new|신규)$/i.test(String(value || "").trim());
  }

  function ensureTicketTop(ticket) {
    var top = ticket.querySelector(".bo-coupon-ticket-top");
    if (top) return top;
    top = document.createElement("div");
    top.className = "bo-coupon-ticket-top";
    top.setAttribute("data-coupon-top", "");
    ticket.insertBefore(top, ticket.firstChild);
    return top;
  }

  function formatExpireDateLabel(issueDate) {
    var end = String(issueDate || "").split("~").pop().trim();
    end = end.replace(/\s*23:59\s*\(KST\)\s*$/i, "").trim();
    end = end.replace(/^~\s*/, "").trim();
    if (!end) return "";

    var ymd = end.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (ymd) {
      var mm = ("0" + ymd[2]).slice(-2);
      var dd = ("0" + ymd[3]).slice(-2);
      return "~ " + mm + "-" + dd + "-" + ymd[1];
    }

    var mdy = end.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (mdy) {
      return (
        "~ " +
        ("0" + mdy[1]).slice(-2) +
        "-" +
        ("0" + mdy[2]).slice(-2) +
        "-" +
        mdy[3]
      );
    }

    return "~ " + end;
  }

  function formatExpiresOnDate(issueDate) {
    var end = String(issueDate || "").split("~").pop().trim();
    end = end.replace(/\s*23:59\s*\(KST\)\s*$/i, "").trim();
    end = end.replace(/^~\s*/, "").trim();
    if (!end) return "";

    var ymd = end.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (ymd) {
      return ymd[1] + "-" + ("0" + ymd[2]).slice(-2) + "-" + ("0" + ymd[3]).slice(-2);
    }

    var mdy = end.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (mdy) {
      return mdy[3] + "-" + ("0" + mdy[1]).slice(-2) + "-" + ("0" + mdy[2]).slice(-2);
    }

    return end;
  }

  function applyNearExpiryTopExpire(ticket, days) {
    if (!isWithinOneWeek(days)) return false;

    ticket.classList.add("is-expiring-soon");
    ticket.classList.add("has-top-expire");

    var top = ensureTicketTop(ticket);
    var issueDate = ticket.getAttribute("data-issue-date") || "";
    var endLabel = formatExpiresOnDate(issueDate);
    if (!endLabel) return false;

    var daysBadge = top.querySelector("[data-coupon-days]");
    if (!daysBadge) {
      daysBadge = document.createElement("span");
      daysBadge.setAttribute("data-coupon-days", "");
      top.insertBefore(daysBadge, top.firstChild);
    }
    daysBadge.textContent = days + (days === 1 ? " DAY LEFT" : " DAYS LEFT");

    var expireP = top.querySelector("p[data-coupon-expires-on]");
    if (!expireP) {
      expireP = document.createElement("p");
      expireP.setAttribute("data-coupon-expires-on", "");
      top.appendChild(expireP);
    }
    expireP.innerHTML = "<b>Expires on</b> " + endLabel + " 23:59 (KST)";

    var inline = ticket.querySelector("[data-coupon-expire], .bo-coupon-expire-inline");
    if (inline) {
      inline.hidden = true;
      inline.setAttribute("data-hidden-for-top-expire", "1");
    }
    return true;
  }

  function formatExpireInline(root) {
    (root || document).querySelectorAll(".bo-coupon-ticket").forEach(function (ticket) {
      var issueDate = ticket.getAttribute("data-issue-date") || "";
      var dayLimit = ticket.getAttribute("data-day-limit") || "";
      var days = parseDaysLeft(dayLimit, issueDate);
      var status = (ticket.getAttribute("data-use-status") || "").toLowerCase();
      var unused = !status || status === "unused";

      if (unused && applyNearExpiryTopExpire(ticket, days)) {
        return;
      }

      ticket.classList.remove("has-top-expire");
      var topExpire = ticket.querySelector(".bo-coupon-ticket-top p[data-coupon-expires-on]");
      if (topExpire) topExpire.remove();

      var el = ticket.querySelector("[data-coupon-expire], .bo-coupon-expire-inline");
      if (!el) return;
      el.hidden = false;
      el.removeAttribute("data-hidden-for-top-expire");

      var datePart = "";
      if (issueDate) {
        datePart = formatExpireDateLabel(issueDate);
      } else {
        var raw = el.textContent.replace(/\s+/g, " ").trim();
        if (raw.indexOf("|") !== -1) raw = raw.split("|").slice(1).join("|").trim();
        datePart = formatExpireDateLabel(raw);
      }
      if (!datePart) return;

      if (days != null && days >= 0) {
        var label = days + (days === 1 ? " Day Left" : " Days Left");
        el.innerHTML = "<b>" + label + "</b> | " + datePart + " 23:59 (KST)";
      } else {
        el.textContent = datePart + " 23:59 (KST)";
      }
    });
  }

  function normalizeTicketBadges(root) {
    (root || document).querySelectorAll(".bo-coupon-ticket").forEach(function (ticket) {
      var top = ensureTicketTop(ticket);
      var issueDate = ticket.getAttribute("data-issue-date");
      var dayLimit = ticket.getAttribute("data-day-limit");
      var days = parseDaysLeft(dayLimit, issueDate);
      var status = (ticket.getAttribute("data-use-status") || "").toLowerCase();
      var nameText = ((ticket.querySelector(".bo-coupon-name") || {}).textContent || "");
      var existing = Array.prototype.map.call(top.querySelectorAll("span"), function (span) {
        return (span.textContent || "").trim();
      });
      var expireP = top.querySelector("p[data-coupon-expires-on]");

      var badges = [];
      var hasApp = existing.some(isAppOnlyText) || isAppOnlyText(nameText);
      var hasNew = existing.some(isNewText);
      var unused = !status || status === "unused";

      if (hasNew) badges.push("NEW");
      if (unused && isWithinOneWeek(days)) {
        badges.push(days + (days === 1 ? " DAY LEFT" : " DAYS LEFT"));
      }
      if (hasApp) badges.push("App Only");

      top.innerHTML = "";
      badges.forEach(function (label) {
        var span = document.createElement("span");
        if (/DAY LEFT/i.test(label)) span.setAttribute("data-coupon-days", "");
        span.textContent = label;
        top.appendChild(span);
      });
      if (expireP) top.appendChild(expireP);

      if (!badges.length && !expireP) {
        top.remove();
      }
    });
  }

  function cleanTicketTops(root) {
    (root || document).querySelectorAll(".bo-coupon-ticket-top").forEach(function (top) {
      Array.prototype.slice.call(top.querySelectorAll("p:not([data-coupon-expires-on])")).forEach(function (p) {
        p.remove();
      });
      if (!top.querySelector("span, p")) top.remove();
    });
  }

  function forceCouponNameColor(root) {
    (root || document).querySelectorAll(".bo-coupon-name").forEach(function (el) {
      el.style.setProperty("color", "#111", "important");
      el.style.setProperty("-webkit-text-fill-color", "#111", "important");
      el.style.setProperty("opacity", "1", "important");
      Array.prototype.forEach.call(el.querySelectorAll("*"), function (child) {
        child.style.setProperty("color", "#111", "important");
        child.style.setProperty("-webkit-text-fill-color", "#111", "important");
      });
    });
  }

  function decorateTickets(root) {
    translateTicketUi(root || document);
    formatSaleTitles(root || document);
    formatExpireInline(root || document);
    normalizeTicketBadges(root || document);
    cleanTicketTops(root || document);
    forceCouponNameColor(root || document);
  }

  function ticketKey(ticket) {
    return [
      ticket.getAttribute("data-coupon-seq") || "",
      ticket.getAttribute("data-download-seq") || "",
      (ticket.querySelector(".bo-coupon-name") || {}).textContent || "",
      (ticket.querySelector("[data-coupon-sale]") || {}).textContent || "",
    ].join("|");
  }

  function loadAllCouponPages() {
    var pagination = document.querySelector(".bo-coupons-pagination, .bo-coupons-page .paging_navigation");
    var grid =
      document.querySelector("[data-coupon-grid]") ||
      document.querySelector(".bo-coupon-section .bo-coupon-grid");

    if (pagination) {
      pagination.hidden = true;
      pagination.setAttribute("aria-hidden", "true");
    }

    if (!pagination || !grid || typeof window.fetch !== "function") {
      return Promise.resolve();
    }

    var seen = {};
    Array.prototype.forEach.call(grid.querySelectorAll(".bo-coupon-ticket"), function (ticket) {
      seen[ticketKey(ticket)] = true;
    });

    var urls = [];
    Array.prototype.forEach.call(pagination.querySelectorAll("a[href]"), function (link) {
      try {
        var url = new URL(link.getAttribute("href"), window.location.href);
        if (url.origin !== window.location.origin) return;
        url.hash = "";
        if (url.href === window.location.href.replace(/#.*$/, "")) return;
        urls.push(url.href);
      } catch (_error) {
        /* ignore bad paging links */
      }
    });
    urls = urls.filter(function (href, index) {
      return urls.indexOf(href) === index;
    });

    if (!urls.length) return Promise.resolve();

    return Promise.all(
      urls.map(function (href) {
        return fetch(href, {
          credentials: "same-origin",
          headers: { Accept: "text/html" },
        })
          .then(function (response) {
            if (!response.ok) return null;
            return response.text();
          })
          .then(function (html) {
            if (!html) return;
            var doc = new DOMParser().parseFromString(html, "text/html");
            var remoteGrid =
              doc.querySelector("[data-coupon-grid]") ||
              doc.querySelector(".bo-coupon-section .bo-coupon-grid");
            if (!remoteGrid) return;
            Array.prototype.forEach.call(remoteGrid.querySelectorAll(".bo-coupon-ticket"), function (ticket) {
              var key = ticketKey(ticket);
              if (seen[key]) return;
              seen[key] = true;
              grid.appendChild(document.importNode(ticket, true));
            });
          })
          .catch(function () {
            /* keep first page if a later page fails */
          });
      })
    );
  }

  function splitExpiringSoon() {
    var sourceGrid = document.querySelector("[data-coupon-grid]");
    var expiringSection = document.querySelector("[data-coupon-expiring-section]");
    var expiringGrid = document.querySelector("[data-coupon-expiring-grid]");
    if (!sourceGrid || !expiringSection || !expiringGrid) return;

    expiringGrid.innerHTML = "";

    var moved = 0;
    Array.prototype.slice.call(sourceGrid.querySelectorAll("[data-coupon-ticket]")).forEach(function (ticket) {
      var status = (ticket.getAttribute("data-use-status") || "").toLowerCase();
      if (status && status !== "unused") return;

      // Only unused coupons with 0–7 days left until validity end
      var days = parseDaysLeft(
        ticket.getAttribute("data-day-limit"),
        ticket.getAttribute("data-issue-date")
      );
      if (!isWithinOneWeek(days)) return;

      var clone = ticket.cloneNode(true);
      applyNearExpiryTopExpire(clone, days);
      expiringGrid.appendChild(clone);
      moved += 1;
    });

    expiringSection.hidden = moved === 0;
    if (moved > 0) {
      formatSaleTitles(expiringGrid);
      normalizeTicketBadges(expiringGrid);
      cleanTicketTops(expiringGrid);
      forceCouponNameColor(expiringGrid);
    }
  }

  function bindRegisterForm() {
    var form = document.querySelector("[data-coupon-register-form]");
    if (!form || typeof window.jQuery === "undefined") return;

    var $ = window.jQuery;
    var input = form.querySelector("#offline_serialnumber");
    var message = form.querySelector("[data-coupon-register-message]");
    var button = form.querySelector("#offlinecouponbtn");

    function setMessage(text, type) {
      if (!message) return;
      message.textContent = text || "";
      message.classList.toggle("is-success", type === "success");
      if (input) {
        if (type === "error") input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }

    function registerCoupon() {
      var code = input ? String(input.value || "").trim() : "";
      if (!code) {
        if (typeof window.openDialogAlert === "function" && typeof window.getAlert === "function") {
          openDialogAlert(getAlert("mp071"), "400", "140", function () {});
        } else {
          setMessage("Please enter a coupon code.", "error");
        }
        return;
      }

      if (button) button.disabled = true;

      $.ajax({
        url: "../coupon/offlinecoupon_member",
        data: { offline_serialnumber: code },
        type: "post",
        dataType: "json",
        success: function (data) {
          if (data && data.result) {
            setMessage(data.msg || "Coupon registered.", "success");
            if (typeof window.openDialogConfirm === "function") {
              openDialogConfirm(data.msg, "400", "180", function () {
                document.location.href = data.returnurl || "/mypage/coupon";
              }, function () {
                document.location.href = data.returnurl || "/mypage/coupon";
              });
            } else {
              document.location.href = data.returnurl || "/mypage/coupon";
            }
            return;
          }
          setMessage((data && data.msg) || "Could not register this coupon.", "error");
          if (typeof window.openDialogAlert === "function") {
            openDialogAlert((data && data.msg) || "Could not register this coupon.", "400", "140", function () {});
          }
        },
        error: function () {
          setMessage("Could not register this coupon.", "error");
        },
        complete: function () {
          if (button) button.disabled = false;
        }
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      registerCoupon();
    });

    if (input) {
      input.addEventListener("input", function () {
        if (!message || !message.textContent) return;
        setMessage("", "");
      });
    }
  }

  function closeCouponLayers() {
    var manager = document.getElementById("manager_code");
    if (manager) manager.value = "";
    if (typeof window.hideCenterLayer === "function") {
      window.hideCenterLayer();
    }
  }

  function bindLayerOutsideClose() {
    document.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        if (!target || !target.classList || !target.classList.contains("resp_layer_bg")) {
          return;
        }
        closeCouponLayers();
      },
      true
    );
  }

  ready(function () {
    bindRegisterForm();
    bindLayerOutsideClose();
    loadAllCouponPages().then(function () {
      decorateTickets(document);
      splitExpiringSoon();
      var count = document.querySelector("[data-coupon-count]");
      var grid = document.querySelector("[data-coupon-grid]");
      if (count && grid) {
        count.textContent = "(" + grid.querySelectorAll(".bo-coupon-ticket").length + ")";
      }
    });
  });
})();
