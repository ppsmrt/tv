window.addEventListener('DOMContentLoaded', () => {
  // Get page name from pathname
  let path = window.location.pathname.split("/").filter(Boolean).pop() || 'index'; 
  const pageName = path.toLowerCase(); // e.g., 'signin', 'signup', or 'index' for '/'

  const formatTitle = (name) => {
    if (name === "index") return "Home";
    if (name === "signin") return "Sign In";
    if (name === "signup") return "Sign Up";
    if (name === "player") return "Live Player";
    return name.replace(/[-_]/g, " ")
               .split(" ")
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(" ");
  };

  const pickIcon = (name) => {
    switch (name) {
      case "index": return "live_tv";
      case "playlist": return "queue_music";
      case "notifications": return "notifications";
      case "dashboard": return "dashboard";
      case "iptv-applications": return "apps";
      case "player": return "live_tv";
      case "signin": return "login";
      case "signup": return "person_add";
      default: return "description";
    }
  };

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const header = document.createElement('header');
  header.className = 'flex items-center justify-between p-3 bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50';

  const leftIcon = document.createElement('span');
  leftIcon.className = 'material-icons cursor-pointer text-2xl';
  leftIcon.textContent = pageName === "index" ? "live_tv" : "arrow_back";
  leftIcon.onclick = () => {
    if (pageName === "index") {
      window.location.href = "/";
    } else {
      window.history.back();
    }
  };

  const titleContainer = document.createElement('div');
  titleContainer.className = 'flex items-center flex-1 truncate ml-2';

  const pageIcon = document.createElement('span');
  pageIcon.className = 'material-icons text-base mr-1';
  pageIcon.textContent = pickIcon(pageName);
  titleContainer.appendChild(pageIcon);

  const title = document.createElement('h1');
  title.className = 'text-lg font-bold truncate text-white';
  title.textContent = formatTitle(pageName);
  titleContainer.appendChild(title);

  let rightIcon, notifBadge;
  if (pageName === "index") {
    rightIcon = document.createElement('span');
    rightIcon.className = 'material-icons cursor-pointer text-2xl relative';
    rightIcon.textContent = "notifications";
    rightIcon.onclick = () => window.location.href = '/notifications';

    notifBadge = document.createElement('span');
    notifBadge.className = 'absolute top-0 right-0 w-4 h-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center';
    notifBadge.style.fontSize = '10px';
    notifBadge.style.display = 'none';
    rightIcon.appendChild(notifBadge);
  }

  header.appendChild(leftIcon);
  header.appendChild(titleContainer);
  if (rightIcon) header.appendChild(rightIcon);

  headerContainer.innerHTML = "";
  headerContainer.appendChild(header);

  // Firebase notifications for index page
  if (pageName === "index" && notifBadge) {
    const notifRef = ref(db, 'notifications');
    onValue(notifRef, (snapshot) => {
      const notifications = snapshot.val() || {};
      const count = Object.keys(notifications).length;
      notifBadge.style.display = count > 0 ? 'flex' : 'none';
      if (count > 0) notifBadge.textContent = count;
    });
  }
});
