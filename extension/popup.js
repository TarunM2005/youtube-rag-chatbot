document.addEventListener("DOMContentLoaded", async () => {

    const chat = document.getElementById("chat");
    const historyDiv = document.getElementById("history");
    const textarea = document.getElementById("question");

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const url = new URL(tab.url);

    let videoId = url.searchParams.get("v");

    const storageKey = "chat_" + videoId;

    // 🔥 Save title
    localStorage.setItem("title_" + videoId, tab.title);

    function saveChat() {
        localStorage.setItem(storageKey, chat.innerHTML);
    }

    function addMessage(text, cls) {
        const div = document.createElement("div");
        div.className = "msg " + cls;
        div.innerText = text;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
        saveChat();
    }

    async function ask(question) {
        addMessage(question, "user");

        const loading = document.createElement("div");
        loading.className = "msg bot";
        loading.innerText = "Thinking...";
        chat.appendChild(loading);

        const res = await fetch("http://127.0.0.1:8000/ask", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                video_id: videoId,
                question: question
            })
        });

        const data = await res.json();

        chat.removeChild(loading);
        addMessage(data.answer, "bot");
    }

    // 🔥 LOAD EXISTING CHAT ONLY (NO AUTO SUMMARY)
    if (localStorage.getItem(storageKey)) {
        chat.innerHTML = localStorage.getItem(storageKey);
    }

    // 🔥 Send button
    document.getElementById("ask").onclick = () => {
        const q = textarea.value.trim();
        if (!q) return;
        textarea.value = "";
        ask(q);
    };

    // 🔥 Enter to send
    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.getElementById("ask").click();
        }
    });

    // 🔥 Clear
    document.getElementById("clear").onclick = () => {
        chat.innerHTML = "";
        localStorage.removeItem(storageKey);
    };

    // 🔥 Load history
    function loadHistory() {
        historyDiv.innerHTML = "";

        for (let key in localStorage) {
            if (key.startsWith("chat_")) {

                const vid = key.replace("chat_", "");
                const title = localStorage.getItem("title_" + vid);

                const item = document.createElement("div");
                item.className = "history-item";
                item.innerText = title || vid;

                item.onclick = () => {
                    chat.innerHTML = localStorage.getItem(key);
                };

                historyDiv.appendChild(item);
            }
        }
    }

    loadHistory();

});