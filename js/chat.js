document.addEventListener("DOMContentLoaded", () => {
  // --- ESTADO GLOBAL ---
  let currentUser = JSON.parse(localStorage.getItem('user')) || null;
  let aiChats = JSON.parse(localStorage.getItem('ai_chats')) || [];
  let activeChatId = localStorage.getItem('active_chat_id') || null;

  // --- LOGIN CON DISCORD REPARADO ---
  const discordBtn = document.getElementById('discord-login-btn');
  if(discordBtn) {
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Evita que se quede bloqueado
      const clientId = "1479853900193468640"; // El Client ID real de tu Discord App
      const redirect = encodeURIComponent("https://1212am.org/api/auth/callback");
      
      // Redirige correctamente a la página de autorización
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=identify%20email`;
    });
  }

  // --- EMAIL LOGIN FORM (SIMULADO) ---
  const authForm = document.getElementById("auth-form");
  if(authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-email").value;
      currentUser = { id: "user-" + Date.now(), email: email, name: email.split('@')[0] };
      await fetchChatsFromDB();
      updateChatProfileUI();
      window.navigate("ai36912"); 
    });
  }

  // --- BOTONES DE LOGOUT ---
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


  // --- GESTIÓN DE CHATS ---
  async function fetchChatsFromDB() {
    // Si estás logueado y no hay chats, creamos uno base
    if(aiChats.length === 0) {
       window.startNewChat();
    } else {
       activeChatId = aiChats[0].id;
       window.renderChatUI();
    }
  }

  function initGuestChats() {
    aiChats = [];
    window.startNewChat();
  }

  window.startNewChat = function() {
    const newChat = { 
      id: "chat-" + Date.now(), 
      title: "New chat", 
      messages: [],
      userId: currentUser ? currentUser.id : 'guest'
    };
    aiChats.unshift(newChat);
    activeChatId = newChat.id;
    saveAndRender();
  }

  window.switchChat = function(id) {
    activeChatId = id;
    saveAndRender();
  }

  function saveAndRender() {
    localStorage.setItem('ai_chats', JSON.stringify(aiChats));
    localStorage.setItem('active_chat_id', activeChatId);
    window.renderChatUI();
    updateChatProfileUI();
  }

  window.renderChatUI = function() {
    const list = document.getElementById("chat-history-list");
    const container = document.getElementById("chat-messages-container");
    if(!list || !container) return;

    // Render Sidebar
    list.innerHTML = '';
    const currentUid = currentUser ? currentUser.id : 'guest';
    aiChats.filter(c => c.userId === currentUid).forEach(c => {
      const isActive = c.id === activeChatId ? 'active' : '';
      list.innerHTML += `<div class="chat-hist-item ${isActive}" onclick="switchChat('${c.id}')">${c.title}</div>`;
    });

    // Render Mensajes
    const activeChat = aiChats.find(c => c.id === activeChatId);
    container.innerHTML = '';

    if(!activeChat || activeChat.messages.length === 0) {
      container.innerHTML = `<div class="chat-msg ai-msg"><div class="chat-avatar">AI</div><div class="chat-bubble">Archives ready. Welcome back, ${currentUser ? currentUser.name : 'Guest'}. How can I assist you?</div></div>`;
      return;
    }

    activeChat.messages.forEach(msg => {
      const isAi = msg.role === 'ai';
      container.innerHTML += `
        <div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}">
          <div class="chat-avatar">${isAi ? 'AI' : (currentUser?.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img">` : 'U')}</div>
          <div class="chat-bubble">${msg.text}</div>
        </div>
      `;
    });
    container.scrollTop = container.scrollHeight;
  }

  // --- ENVÍO A N8N ---
  const chatInput = document.getElementById("chat-input-field");
  const chatSendBtn = document.getElementById("chat-send-btn");

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
    const input = document.getElementById("chat-input-field");
    const message = input.value.trim();
    if (!message) return;

    if (!activeChatId) window.startNewChat();
    const activeChat = aiChats.find(c => c.id === activeChatId);

    if(activeChat.messages.length === 0) activeChat.title = message.substring(0, 20);

    activeChat.messages.push({ role: 'user', text: message });
    input.value = '';
    input.style.height = 'auto';
    saveAndRender();

    const reply = await fetchN8nResponse(message, currentUser?.id || 'guest');
    activeChat.messages.push({ role: 'ai', text: reply.replace(/\n/g, '<br>') });
    saveAndRender();
  }

  async function fetchN8nResponse(userMessage, userId) {
    const N8N_URL = 'https://x36912ai.app.n8n.cloud/webhook/42eb1319-51f2-48a6-bb1f-fe67d105b741'; 
    try {
      const response = await fetch(N8N_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: userMessage, userId: userId })
      });
      const data = await response.json();
      return data.output || "Lost signal.";
    } catch (e) { return "System offline."; }
  }

  function updateChatProfileUI() {
    const userInfo = document.getElementById("chat-user-info");
    const btn = document.getElementById("chat-auth-action-btn");
    const mobileBtn = document.getElementById("mobile-auth-action-btn");
    if(!userInfo) return;

    if(currentUser) {
      userInfo.innerHTML = currentUser.avatar 
        ? `<img src="${currentUser.avatar}" class="user-avatar-img"><span>${currentUser.name}</span>`
        : `<div class="chat-avatar" style="background:var(--y); color:var(--bk);">${currentUser.name[0]}</div><span>${currentUser.name}</span>`;
      
      if(btn) { btn.innerText = "Logout"; btn.onclick = () => { localStorage.removeItem('user'); location.reload(); }; }
      if(mobileBtn) { mobileBtn.innerText = "Logout"; mobileBtn.onclick = () => { localStorage.removeItem('user'); location.reload(); }; }
    } else {
      userInfo.innerHTML = `<div class="chat-avatar">G</div><span>Guest</span>`;
      if(btn) { btn.innerText = "Login"; btn.onclick = () => window.navigate('auth'); }
      if(mobileBtn) { mobileBtn.innerText = "Login"; mobileBtn.onclick = () => window.navigate('auth'); }
    }
  }

  // Inicializar todo al arrancar
  updateChatProfileUI();
  if(aiChats.length === 0) initGuestChats();
  else window.renderChatUI();
});
