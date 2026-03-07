document.addEventListener("DOMContentLoaded", () => {
  // --- ESTADO GLOBAL ---
  let currentUser = JSON.parse(localStorage.getItem('user')) || null;
  let aiChats = JSON.parse(localStorage.getItem('ai_chats')) || [];
  let activeChatId = localStorage.getItem('active_chat_id') || null;

  // --- LOGIN CON DISCORD ---
  const discordBtn = document.getElementById('discord-login-btn');
  if(discordBtn) {
    discordBtn.addEventListener('click', () => {
      const clientId = "1347604595304726588"; 
      const redirect = encodeURIComponent("https://1212am.org/api/auth/callback");
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=identify%20email`;
    });
  }

  // --- SISTEMA DE CHATS ---
  window.startNewChat = function() {
    const chat = {
      id: "chat-" + Date.now(),
      title: "New session",
      messages: [],
      userId: currentUser ? currentUser.id : 'guest'
    };
    aiChats.unshift(chat);
    activeChatId = chat.id;
    saveAndRender();
  };

  window.switchChat = function(id) {
    activeChatId = id;
    saveAndRender();
  };

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

    // Render Sidebar (Solo los del usuario actual)
    list.innerHTML = '';
    const currentUid = currentUser ? currentUser.id : 'guest';
    aiChats.filter(c => c.userId === currentUid).forEach(c => {
      const active = c.id === activeChatId ? 'active' : '';
      list.innerHTML += `<div class="chat-hist-item ${active}" onclick="switchChat('${c.id}')">${c.title}</div>`;
    });

    // Render Mensajes
    const activeChat = aiChats.find(c => c.id === activeChatId);
    container.innerHTML = '';

    if(!activeChat || activeChat.messages.length === 0) {
      container.innerHTML = `<div class="chat-msg ai-msg"><div class="chat-avatar">AI</div><div class="chat-bubble">Archives ready. Welcome back, ${currentUser ? currentUser.name : 'Guest'}. What do you need?</div></div>`;
    } else {
      activeChat.messages.forEach(msg => {
        const isAi = msg.role === 'ai';
        container.innerHTML += `
          <div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}">
            <div class="chat-avatar">${isAi ? 'AI' : (currentUser?.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img">` : 'U')}</div>
            <div class="chat-bubble">${msg.text}</div>
          </div>`;
      });
    }
    container.scrollTop = container.scrollHeight;
  };

  // --- ENVÍO DE MENSAJES ---
  const sendBtn = document.getElementById("chat-send-btn");
  const inputField = document.getElementById("chat-input-field");

  async function sendMessage() {
    const text = inputField.value.trim();
    if(!text) return;

    if(!activeChatId) window.startNewChat();
    const chat = aiChats.find(c => c.id === activeChatId);

    // Titular el chat con la primera pregunta
    if(chat.messages.length === 0) chat.title = text.length > 20 ? text.substring(0,20) + "..." : text;

    chat.messages.push({ role: 'user', text: text });
    inputField.value = '';
    saveAndRender();

    // Llamada a n8n
    const response = await fetch('https://x36912ai.app.n8n.cloud/webhook/42eb1319-51f2-48a6-bb1f-fe67d105b741', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput: text, userId: currentUser ? currentUser.id : 'guest' })
    });
    
    const data = await response.json();
    chat.messages.push({ role: 'ai', text: (data.output || "Lost connection to the wormhole.").replace(/\n/g, '<br>') });
    saveAndRender();
  }

  sendBtn?.addEventListener('click', sendMessage);
  inputField?.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }});

  function updateChatProfileUI() {
    const userInfo = document.getElementById("chat-user-info");
    const btn = document.getElementById("chat-auth-action-btn");
    if(!userInfo || !btn) return;

    if(currentUser) {
      userInfo.innerHTML = `<img src="${currentUser.avatar}" class="user-avatar-img"><span>${currentUser.name}</span>`;
      btn.innerText = "Log out";
      btn.onclick = () => { localStorage.removeItem('user'); location.reload(); };
    } else {
      userInfo.innerHTML = `<div class="chat-avatar">G</div><span>Guest</span>`;
      btn.innerText = "Log in";
      btn.onclick = () => window.navigate('auth');
    }
  }

  // Inicializar
  if(aiChats.length === 0) window.startNewChat();
  saveAndRender();
});
