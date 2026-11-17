
const duongDanHienTai = window.location.pathname;
const header = document.querySelector(".header");
const navbar = document.querySelector(".navbar");

if (navbar instanceof HTMLElement && !navbar.querySelector(".account-link")) {
    const accountLink = document.createElement("a");
    accountLink.className = "account-link";
    accountLink.href = "/frontend/html/trang-chu.html";
    accountLink.textContent = "Tài khoản";
    navbar.append(accountLink);
}

const cacLienKet = document.querySelectorAll(".navbar a");
const navItems = navbar instanceof HTMLElement
    ? Array.from(navbar.querySelectorAll(":scope > a, .menu-dien-dan > a"))
    : [];

cacLienKet.forEach(function(lienKet) {
    lienKet.classList.remove("active");
});

let activeItem = navItems.find((link) => new URL(link.href).pathname === duongDanHienTai);

if (!activeItem) {
    const forumItem = navItems.find((link) => new URL(link.href).pathname.endsWith("/dien-dan.html"));

    if (forumItem) {
        const forumDirectory = new URL(".", forumItem.href).pathname;

        if (duongDanHienTai.startsWith(forumDirectory)) {
            activeItem = forumItem;
        }
    }
}

if (activeItem) {
    activeItem.classList.add("active");
}

if (header instanceof HTMLElement && navbar instanceof HTMLElement) {
    const mobileMenu = document.createElement("details");
    mobileMenu.className = "mobile-nav-menu";

    const trigger = document.createElement("summary");
    trigger.className = "mobile-nav-trigger";

    const currentLabel = document.createElement("span");
    currentLabel.textContent = (activeItem?.textContent ?? "Chọn trang")
        .replace(/\s*▾\s*$/, "")
        .trim();

    const arrow = document.createElement("span");
    arrow.className = "mobile-nav-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";
    trigger.append(currentLabel, arrow);

    const options = document.createElement("nav");
    options.className = "mobile-nav-options";
    options.setAttribute("aria-label", "Điều hướng");

    navItems.forEach((link) => {
        const option = document.createElement("a");
        option.href = link.href;
        option.textContent = (link.textContent ?? "").replace(/\s*▾\s*$/, "").trim();

        if (link === activeItem) {
            option.classList.add("active");
        }

        option.addEventListener("click", () => {
            mobileMenu.open = false;
        });
        options.append(option);
    });

    mobileMenu.append(trigger, options);
    header.insertBefore(mobileMenu, navbar);

    document.addEventListener("click", (event) => {
        if (event.target instanceof Node && !mobileMenu.contains(event.target)) {
            mobileMenu.open = false;
        }
    });
}
