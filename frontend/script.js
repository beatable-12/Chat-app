const chat = document.querySelector(".chat");
const chatWindow = document.querySelector(".chat-window");
const messagesContainer = document.querySelector(".messages");
const usernameLabel = document.querySelector(".username");
let chatHistory = [];
let currentUsername = "";

const socket = io();

socket.on("receive-messages", (data) => {
  const { chatHistory, username } = data || {};
  if (username !== undefined) {
    currentUsername = username;
    updateUsername(username);
  }
  render(chatHistory);
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  const message = chat.elements.message.value.trim();
  if (!message) return;
  sendMessage(message);
  chat.elements.message.value = "";
});

async function sendMessage(message) {
  socket.emit("post-message", {
    message,
  });
}

function render(chatHistory) {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    messagesContainer.innerHTML =
      '<div class="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-4 py-8 text-center text-sm text-gray-500">No messages yet. Start the conversation 👋</div>';
    return;
  }

  const html = chatHistory
    .map(function ({ username, message }) {
      return messageTemplate(username, message, username === currentUsername);
    })
    .join("\n");
  messagesContainer.innerHTML = html;
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateUsername(username) {
  usernameLabel.textContent = username;
}

function messageTemplate(username, message, isCurrentUser) {
  const safeUsername = escapeHTML(username);
  const safeMessage = escapeHTML(message);
  const wrapperClass = isCurrentUser ? "items-end" : "items-start";
  const bubbleClass = isCurrentUser
    ? "bg-indigo-600 text-white"
    : "bg-white text-gray-800 border border-gray-200";
  const usernameClass = isCurrentUser ? "text-indigo-200" : "text-gray-500";
  const alignmentClass = isCurrentUser ? "text-right" : "text-left";

  return `<div class="flex flex-col ${wrapperClass}">
      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide ${usernameClass} ${alignmentClass}">${safeUsername}</p>
      <div class="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${bubbleClass}">
        ${safeMessage}
      </div>
    </div>`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
