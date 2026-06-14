// Lazy-load YouTube players: each card renders a lightweight thumbnail facade,
// and we only mount the real iframe when the visitor clicks play. Keeps the page
// fast and gives YouTube the player only on intent.

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

document.addEventListener("click", (event) => {
    const facade = event.target.closest(".yt-facade");
    if (!facade) return;

    const id = facade.dataset.id || "";
    if (!VIDEO_ID.test(id)) return; // guard: only mount well-formed video ids

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    iframe.title = facade.dataset.title || "YouTube video player";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    facade.replaceWith(iframe);
});
