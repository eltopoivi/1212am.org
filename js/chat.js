document.addEventListener("DOMContentLoaded", () => {

  let currentUser = null; 
  let isLoginMode = true;

  const authSwitchLink = document.getElementById("auth-switch-link");
  const authSwitchText = document.getElementById("auth-switch-text");
  const authTitle = document.getElementById("auth-title");
  const authForm = document.getElementById("auth-form");

  if(authSwitchLink) {
    authSwitchLink.addEventListener("click", (e) => {
      e.preventDefault();
      isLoginMode = !isLoginMode;
      if(isLoginMode) {
        authTitle.innerText = "Welcome back";
        authSwitchText.innerText = "Don't have an account?";
        authSwitchLink.innerText = "Sign up";
      } else {
        authTitle.innerText = "Create your account";
        authSwitchText.innerText = "Already have an account?";
        authSwitchLink.innerText = "Log in";
      }
    });
  }

  if(authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-email").value;
      currentUser = { email: email, name: email.split('@')[0] };
      await fetchChatsFromDB();
      updateChatProfileUI();
      window.navigate("ai36912"); 
    });
  }

  const chatAuthBtn = document.getElementById("chat-auth-action-btn");
  const mobileAuthBtn = document.getElementById("mobile-auth-action-btn");
  
  function handleAuthClick() {
    if(currentUser) {
      currentUser = null;
      updateChatProfileUI();
      initGuestChats(); 
    } else {
      window.navigate("auth");
    }
  }

  if(chatAuthBtn) chatAuthBtn.addEventListener("click", handleAuthClick);
  if(mobileAuthBtn) mobileAuthBtn.addEventListener("click", handleAuthClick);

  function updateChatProfileUI() {
    const userInfo = document.getElementById("chat-user-info");
    if(!userInfo || !chatAuthBtn || !mobileAuthBtn) return;

    if(currentUser) {
      userInfo.innerHTML = `<div class="chat-avatar" style="background:var(--y); color:var(--bk);">${currentUser.name.charAt(0).toUpperCase()}</div><span>${currentUser.name}</span>`;
      chatAuthBtn.innerText = "Log out";
      mobileAuthBtn.innerText = "Log out";
    } else {
      userInfo.innerHTML = `<div class="chat-avatar" style="background:var(--gr); color:var(--wh);">G</div><span>Guest</span>`;
      chatAuthBtn.innerText = "Log in";
      mobileAuthBtn.innerText = "Log in";
    }
  }

  let aiChats = []; 
  let activeChatId = null;

  const chatInput = document.getElementById("chat-input-field");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatContainer = document.getElementById("chat-messages-container");
  const chatHistoryList = document.getElementById("chat-history-list");

  async function fetchChatsFromDB() {
    aiChats = [
      { id: "id-" + Date.now(), title: "System diagnostics", messages: [{role: 'ai', text: 'Diagnostics complete.'}] }
    ];
    activeChatId = aiChats[0].id;
    window.renderChatUI();
  }

  function initGuestChats() {
    aiChats = [];
    window.startNewChat();
  }

  window.startNewChat = function() {
    const newChat = { id: "chat-" + Date.now(), title: "New chat", messages: [] };
    aiChats.unshift(newChat); 
    activeChatId = newChat.id;
    window.renderChatUI();
  }

  window.switchChat = function(id) {
    activeChatId = id;
    window.renderChatUI();
  }

  window.renderChatUI = function() {
    if(!chatHistoryList || !chatContainer) return;

    chatHistoryList.innerHTML = '';
    aiChats.forEach(c => {
      const isActive = c.id === activeChatId ? 'active' : '';
      chatHistoryList.innerHTML += `<div class="chat-hist-item ${isActive}" onclick="switchChat('${c.id}')">${c.title}</div>`;
    });

    const activeChat = aiChats.find(c => c.id === activeChatId);
    chatContainer.innerHTML = '';

    if(!activeChat || activeChat.messages.length === 0) {
      chatContainer.innerHTML = `
        <div class="chat-msg ai-msg">
          <div class="chat-avatar">AI</div>
          <div class="chat-bubble">We are time. Welcome to 36912ai. How can I assist you today?</div>
        </div>
      `;
      return;
    }

    activeChat.messages.forEach(msg => {
      const isAi = msg.role === 'ai';
      chatContainer.innerHTML += `
        <div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}">
          <div class="chat-avatar">${isAi ? 'AI' : 'U'}</div>
          <div class="chat-bubble">${msg.text}</div>
        </div>
      `;
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function saveChatToDB(chatId) {
    if(!currentUser) return; 
    const chatToSave = aiChats.find(c => c.id === chatId);
    console.log("Chat guardado en DB:", chatToSave.title);
  }

  if(chatInput) {
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      if(this.value.trim() === '') this.style.height = 'auto';
    });

    chatInput.addEventListener('keydown', function(e) {
      if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if(chatSendBtn) chatSendBtn.addEventListener('click', handleSendMessage);

  async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    if (!activeChatId) window.startNewChat();
    const activeChat = aiChats.find(c => c.id === activeChatId);

    if(activeChat.messages.length === 0) {
      activeChat.title = message.length > 20 ? message.substring(0, 20) + "..." : message;
    }

    activeChat.messages.push({ role: 'user', text: message });
    chatInput.value = ''; chatInput.style.height = 'auto';
    window.renderChatUI();
    
    chatSendBtn.disabled = true;
    const loadingId = 'loading-' + Date.now();
    chatContainer.innerHTML += `<div class="chat-msg ai-msg" id="${loadingId}"><div class="chat-avatar">AI</div><div class="chat-bubble">...</div></div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const reply = await fetchN8nResponse(message);

    activeChat.messages.push({ role: 'ai', text: reply.replace(/\n/g, '<br>') });
    chatSendBtn.disabled = false;
    window.renderChatUI();
    saveChatToDB(activeChat.id); 
  }

  async function fetchN8nResponse(userMessage) {
    const N8N_WEBHOOK_URL = 'https://x36912ai.app.n8n.cloud/webhook/42eb1319-51f2-48a6-bb1f-fe67d105b741'; 
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatInput: userMessage })
      });
      if (!response.ok) throw new Error("Wormhole connection lost.");
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return data.output || "I couldn't find an answer in the archives.";
      } else return await response.text();
    } catch (error) {
      console.error("AI Fetch Error:", error);
      return "System offline. Unable to connect to the wormhole.";
    }
  }

  initGuestChats();
});
