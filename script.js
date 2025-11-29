const BACKEND_URL = "https://money-mentor-h42d.onrender.com";

// 1. Creating DOM elements
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatContainer = document.getElementById("chat-container");
const sendBtn = document.getElementById("send-btn");

// 2. Create a message bubble
function addMessage(role, text) {
  const msgEl = document.createElement("div");
  msgEl.classList.add("message", role);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = role === "user" ? "You" : "MM";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);

  chatContainer.appendChild(msgEl);

  // scroll to bottom on every new message
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show a temporary "Money Mentor is thinking…" message
function addTypingMessage() {
  const msgEl = document.createElement("div");
  msgEl.classList.add("message", "bot");
  msgEl.dataset.typing = "true";

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = "MM";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = "Money Mentor is thinking...";

  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatContainer.appendChild(msgEl);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// removing the temporary message
function removeTypingMessage() {
  const typingEl = chatContainer.querySelector('[data-typing="true"]');
  if (typingEl) typingEl.remove();
}

// Sending the message to the backend
async function sendMessageToBackend(message) {
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }), // convert JS object to JSON string
  });

  if (!res.ok) {
    throw new Error("Network or server error");
  }

  const data = await res.json(); // convert backend JSON to a JS object
  if (data.error) {
    throw new Error(data.error);
  }
  return data.reply;
}

// Form submit handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim(); // ✅ fixed
  if (!text) return;

  // show user message
  addMessage("user", text);
  userInput.value = "";

  // Disable input while waiting
  userInput.disabled = true;
  sendBtn.disabled = true;

  // Show Thinking indicator
  addTypingMessage();

  try {
    const reply = await sendMessageToBackend(text);
    removeTypingMessage();
    addMessage("bot", reply); // ✅ fixed
  } catch (err) {
    console.error(err);
    removeTypingMessage();
    addMessage(
      "bot",
      "Sorry, something went wrong while talking to Money Mentor. Please try again."
    );
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
});

// focus input on load
window.addEventListener("load", () => {
  userInput.focus();
});
