
(function () {
  const ticker = document.querySelector(".tips-ticker");
  if (!ticker) return;

  const spanish = document.documentElement.lang === "es";
  const track = ticker.querySelector(".ticker-track");
  const label = ticker.querySelector(".ticker-label");

  label.textContent = spanish
    ? "Fechas y consejos"
    : "Deadlines & Tips";

  fetch("deadlines.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Calendar unavailable");
      return response.json();
    })
    .then(deadlines => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = deadlines
        .map(item => {
          const [year, month, day] = item.date
            .split("-")
            .map(Number);

          const deadline = new Date(year, month - 1, day);

          return {
            ...item,
            days: Math.round(
              (deadline - today) / 86400000
            )
          };
        })
        .filter(item => item.days >= 0)
        .sort((a, b) => a.days - b.days)
        .slice(0, 3);

      const messages = upcoming.map(item => {
        const span = document.createElement("span");
        span.className = "ticker-tip";

        const link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        let countdown;

        if (item.days === 0) {
          countdown = spanish ? "¡Hoy!" : "Today!";
        } else if (item.days === 1) {
          countdown = spanish
            ? "¡Queda 1 día!"
            : "1 day left!";
        } else {
          countdown = spanish
            ? `Faltan ${item.days} días`
            : `${item.days} days left`;
        }

        link.textContent =
          `${spanish ? item.es : item.en} — ${countdown} ↗`;

        span.appendChild(link);
        return span;
      });

      if (messages.length === 0) {
        const span = document.createElement("span");
        span.className = "ticker-tip";
        span.textContent = spanish
          ? "Consulta las fechas oficiales."
          : "Check official college deadlines.";
        messages.push(span);
      }

      track.replaceChildren();

      for (let copy = 0; copy < 2; copy++) {
        const group = document.createElement("div");
        group.className = "ticker-group";

        if (copy === 1) {
          group.setAttribute("aria-hidden", "true");
        }

        messages.forEach(message => {
          const clone = message.cloneNode(true);

          if (copy === 1) {
            clone.querySelectorAll("a").forEach(link => {
              link.tabIndex = -1;
            });
          }

          group.appendChild(clone);
        });

        track.appendChild(group);
      }
    })
    .catch(() => {
      label.textContent = spanish
        ? "Consejos universitarios"
        : "College Success Tips";
    });
})();
