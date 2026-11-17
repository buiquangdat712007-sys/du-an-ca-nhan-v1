const accountMessage = document.querySelector("#form-message");
const logoutButton = document.querySelector("#logout-button");
const accountAchievements = document.querySelector("#account-achievements");
const accountBadges = document.querySelector("#account-badges");
const forumPostStorageKeys = [
    "bai_viet_dien-dan-lien-quan.html",
    "bai_viet_dien-dan-lang-vit.html",
    "bai_viet_dien-dan-mobi.html",
];
const forumBadgeRules = [
    { name: "Người mở lời", icon: "✍️", earnedBy: member => member.posts >= 1 },
    { name: "Thành viên tích cực", icon: "🔥", earnedBy: member => member.posts >= 5 },
    { name: "Được yêu thích", icon: "❤️", earnedBy: member => member.likes >= 3 },
    { name: "Người kết nối", icon: "💬", earnedBy: member => member.comments >= 5 },
];

function getEarnedForumBadges(displayName) {
    const memberName = displayName.trim().toLocaleLowerCase("vi-VN");
    const member = { posts: 0, likes: 0, comments: 0 };

    forumPostStorageKeys.forEach(storageKey => {
        const storedPosts = localStorage.getItem(storageKey);
        if (storedPosts === null) {
            return;
        }

        const posts = JSON.parse(storedPosts);
        if (!Array.isArray(posts)) {
            throw new Error("Dữ liệu bài viết không đúng định dạng: " + storageKey);
        }

        posts.forEach(post => {
            if (
                !post
                || typeof post.ten !== "string"
                || (post.daThich !== undefined && typeof post.daThich !== "boolean")
                || (post.binhLuan !== undefined && !Array.isArray(post.binhLuan))
            ) {
                throw new Error("Dữ liệu bài viết không đúng định dạng: " + storageKey);
            }
            if (post.ten.trim().toLocaleLowerCase("vi-VN") !== memberName) {
                return;
            }

            member.posts += 1;
            member.likes += post.daThich === true ? 1 : 0;
            member.comments += post.binhLuan ? post.binhLuan.length : 0;
        });
    });

    return forumBadgeRules.filter(badge => badge.earnedBy(member));
}

function renderEarnedForumBadges(displayName) {
    try {
        const badges = getEarnedForumBadges(displayName);
        accountBadges.replaceChildren();
        badges.forEach(badge => {
            const item = document.createElement("li");
            item.className = "account-badge";
            item.textContent = badge.icon + " " + badge.name;
            accountBadges.appendChild(item);
        });
        accountAchievements.hidden = badges.length === 0;
    } catch (error) {
        accountMessage.textContent = "Không thể tải danh hiệu diễn đàn từ bộ nhớ trình duyệt.";
        console.error("Không thể tải danh hiệu diễn đàn:", error);
    }
}

async function loadAccount() {
    try {
        const user = await window.OrangeAuth.request("/api/auth/me");
        document.querySelector("#account-display-name").textContent = user.display_name;
        document.querySelector("#account-role").textContent =
            user.role === "admin" ? "Quản trị viên" : "Người dùng";
        renderEarnedForumBadges(user.display_name);
    } catch (error) {
        if (error.message === "Vui lòng đăng nhập.") {
            window.location.replace("/frontend/html/dang-nhap.html?next=%2Ffrontend%2Fhtml%2Ftrang-chu.html");
            return;
        }
        accountMessage.textContent = error.message;
    }
}

logoutButton?.addEventListener("click", async () => {
    accountMessage.textContent = "";
    logoutButton.disabled = true;
    try {
        await window.OrangeAuth.request("/api/auth/logout", { method: "POST", body: "{}" });
        window.location.replace("/frontend/html/dang-nhap.html");
    } catch (error) {
        accountMessage.textContent = error.message;
        logoutButton.disabled = false;
    }
});

loadAccount();
