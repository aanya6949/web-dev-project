
import { pipeline } from
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const chatArea = document.getElementById("chatArea");

let generator;
let busy = false;

// Load the AI model in the browser
async function loadAI() {
    if (generator) return generator;

    addMessage("Loading AI model... This may take a while the first time.", "ai");

    generator = await pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-0.5B-Instruct",
        { dtype: "q4" }
    );

    return generator;
}

// Create chat messages safely
function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = "message";

    const avatar = document.createElement("div");
    avatar.className = "avatar " +
        (sender === "user" ? "user-avatar" : "ai-avatar");
    avatar.textContent = sender === "user" ? "A" : "✦";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("strong");
    name.textContent = sender === "user" ? "You" : "My AI";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    content.append(name, paragraph);
    message.append(avatar, content);
    messages.appendChild(message);

    chatArea.scrollTop = chatArea.scrollHeight;

    return message;
}

// Send messages to the local model
chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text || busy) return;

    busy = true;
    welcome.style.display = "none";

    addMessage(text, "user");
    messageInput.value = "";

    const waiting = addMessage("Thinking...", "ai");
    const output = waiting.querySelector("p");

    try {
        const ai = await loadAI();

        output.textContent = "Generating response...";

        const result = await ai(text, {
            max_new_tokens: 120,
            do_sample: false
        });

        output.textContent =
            result[0]?.generated_text || "No response generated.";

    } catch (error) {
        console.error(error);

        output.textContent =
            "Unable to load the AI model. Check your internet connection, browser compatibility, and console for errors.";
    } finally {
        busy = false;
        chatArea.scrollTop = chatArea.scrollHeight;
    }
});
