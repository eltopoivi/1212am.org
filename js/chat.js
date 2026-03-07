document.addEventListener("DOMContentLoaded", () => {
  // === ⚠️ CONFIGURA AQUÍ TU SUPABASE ⚠️ ===
  const SUPABASE_URL = "https://zgbaakccwajzgvfiqyky.supabase.co"; 
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYmFha2Njd2Fqemd2ZmlxeWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODE2MDMsImV4cCI6MjA4ODI1NzYwM30.Xor-c2M5whbLvTxAbc2Md1ztPSCZlYujK3OpkA-P6y0";
  // =======================================

  // --- ESTADO GLOBAL ---
  let currentUser = JSON.parse(localStorage.getItem('user')) || null;
  let aiChats = []; // Ahora lo cargaremos de la base de datos
  let activeChatId = null;

  // --- LOGIN CON DISCORD ---
  const discordBtn = document.getElementById('discord-login-btn');
  if(discordBtn) {
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      const clientId = "1347604595304726588"; 
      const redirect = encodeURIComponent("https://1212am.org/api/auth/callback");
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
      localStorage.setItem('user', JSON.stringify(currentUser));
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
      localStorage.removeItem('user');
      updateChatProfileUI();
      initGuestChats(); 
    } else {
      window.navigate("auth");
    }
  }

  if(chatAuthBtn) chatAuthBtn.addEventListener("click", handleAuthClick);
  if(mobileAuthBtn) mobileAuthBtn.addEventListener("click", handleAuthClick);


  // --- GESTIÓN DE CHATS EN SUPABASE ---
  async function fetchChatsFromDB() {
    if (!currentUser) {
      initGuestChats();
      return;
    }

    try {
      // Pedimos a Supabase los chats de este usuario, ordenados por el más reciente
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_chats?user_id=eq.${currentUser.id}&order=updated_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      const data = await response.json();

      if (data && data.length > 0) {
        aiChats = data;
        activeChatId = aiChats[0].id;
        window.renderChatUI();
      } else {
        window.startNewChat();
      }
    } catch (error) {
      console.error("Error descargando chats de Supabase:", error);
      initGuestChats(); // Fallback por si no hay internet
    }
  }

  async function saveChatToDB(chatId) {
    if (!currentUser) return; // Los invitados no guardan en la nube

    const chatToSave = aiChats.find(c => c.id === chatId);
    if (!chatToSave) return;

    chatToSave.updated_at = new Date().toISOString();

    try {
      // Usamos el header Prefer: resolution=merge-duplicates para hacer "Upsert" (Crear o Actualizar)
      await fetch(`${SUPABASE_URL}/rest/v1/ai_chats`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(chatToSave)
      });
    } catch (error) {
      console.error("Error guardando en Supabase:", error);
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
      user_id: currentUser ? currentUser.id : 'guest',
      updated_at: new Date().toISOString()
    };
    aiChats.unshift(newChat);
    activeChatId = newChat.id;
    window.renderChatUI();
    if(currentUser) saveChatToDB(newChat.id);
  }

  window.switchChat = function(id) {
    activeChatId = id;
    window.renderChatUI();
  }

  window.renderChatUI = function() {
    const list = document.getElementById("chat-history-list");
    const container = document.getElementById("chat-messages-container");
    if(!list || !container) return;

    // Render Sidebar
    list.innerHTML = '';
    const currentUid = currentUser ? currentUser.id : 'guest';
    aiChats.filter(c => c.user_id === currentUid).forEach(c => {
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

    // Titular el chat automáticamente con el primer mensaje
    if(activeChat.messages.length === 0) activeChat.title = message.length > 20 ? message.substring(0, 20) + "..." : message;

    activeChat.messages.push({ role: 'user', text: message });
    input.value = '';
    input.style.height = 'auto';
    
    // UI Rápida: Mostramos el mensaje instantáneamente y guardamos
    window.renderChatUI();
    saveChatToDB(activeChat.id); 
    
    chatSendBtn.disabled = true;

    // Loading State
    const loadingId = 'loading-' + Date.now();
    const container = document.getElementById("chat-messages-container");
    container.innerHTML += `<div class="chat-msg ai-msg" id="${loadingId}"><div class="chat-avatar">AI</div><div class="chat-bubble">...</div></div>`;
    container.scrollTop = container.scrollHeight;

    // Llamada al cerebro en n8n
    const reply = await fetchN8nResponse(message, currentUser?.id || 'guest');
    
    // Actualizamos respuesta de la IA
    activeChat.messages.push({ role: 'ai', text: reply.replace(/\n/g, '<br>') });
    
    chatSendBtn.disabled = false;
    window.renderChatUI();
    saveChatToDB(activeChat.id); // Guardado final en la nube
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
      
      if(btn) btn.innerText = "Log out"; 
      if(mobileBtn) mobileBtn.innerText = "Log out"; 
    } else {
      userInfo.innerHTML = `<div class="chat-avatar">G</div><span>Guest</span>`;
      if(btn) btn.innerText = "Log in";
      if(mobileBtn) mobileBtn.innerText = "Log in";
    }
  }

  // --- ARRANQUE ---
  updateChatProfileUI();
  fetchChatsFromDB(); // Al cargar la web, traemos los chats de Supabase
});
