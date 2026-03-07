document.addEventListener("DOMContentLoaded", () => {
  // === ⚠️ CONFIGURA TUS CLAVES ⚠️ ===
  const SUPABASE_URL = "https://zgbaakccwajzgvfiqyky.supabase.co"; 
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYmFha2Njd2Fqemd2ZmlxeWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODE2MDMsImV4cCI6MjA4ODI1NzYwM30.Xor-c2M5whbLvTxAbc2Md1ztPSCZlYujK3OpkA-P6y0";
  // =======================================

  const AI_LOGO_HTML = `<img src="/Gemini_Generated_Image_tz20mhtz20mhtz20_Nero_AI_Background_Remover_transparent.png" class="ai-avatar-img" alt="12:12am AI">`;

  let currentUser = JSON.parse(localStorage.getItem('user')) || null;
  let aiChats = []; 
  let activeChatId = null;

  // --- LOGIN DISCORD ---
  const discordBtn = document.getElementById('discord-login-btn');
  if(discordBtn) {
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      const clientId = "1347604595304726588"; 
      const redirect = encodeURIComponent("https://1212am.org/api/auth/callback");
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=identify%20email`;
    });
  }

  // --- LOGOUT ---
  const handleAuthClick = () => {
    if(currentUser) {
      localStorage.removeItem('user');
      location.reload();
    } else {
      window.navigate('auth');
    }
  };
  document.getElementById("chat-auth-action-btn")?.addEventListener("click", handleAuthClick);
  document.getElementById("mobile-auth-action-btn")?.addEventListener("click", handleAuthClick);

  // --- SUPABASE: CARGAR CHATS ---
  async function fetchChatsFromDB() {
    if (!currentUser) { renderChatUI(); return; }

    console.log("Intentando descargar chats de Supabase para:", currentUser.id);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_chats?user_id=eq.${currentUser.id}&order=updated_at.desc`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });

      if (!response.ok) throw new Error("Error en respuesta de Supabase");
      
      const data = await response.json();
      console.log("Chats descargados:", data);

      if (data && data.length > 0) {
        aiChats = data;
        activeChatId = aiChats[0].id;
      } else {
        startNewChat();
      }
      renderChatUI();
    } catch (error) {
      console.error("❌ Fallo al cargar chats:", error);
      startNewChat();
    }
  }

  // --- SUPABASE: GUARDAR CHATS ---
  async function saveChatToDB(chatId) {
    if (!currentUser) return; 

    const chatToSave = aiChats.find(c => c.id === chatId);
    if (!chatToSave) return;

    chatToSave.updated_at = new Date().toISOString();

    console.log("Guardando chat en Supabase...", chatToSave);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_chats`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates' // Esto es lo que permite el "Upsert"
        },
        body: JSON.stringify(chatToSave)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error de Supabase al guardar:", errorText);
      } else {
        console.log("✅ Chat guardado correctamente");
      }
    } catch (error) {
      console.error("❌ Error de red al guardar:", error);
    }
  }

  // --- LÓGICA DE INTERFAZ ---
  window.startNewChat = function() {
    const newChat = { 
      id: "chat-" + Date.now(), 
      title: "New session", 
      messages: [],
      user_id: currentUser ? currentUser.id : 'guest',
      updated_at: new Date().toISOString()
    };
    aiChats.unshift(newChat);
    activeChatId = newChat.id;
    renderChatUI();
    if(currentUser) saveChatToDB(newChat.id);
  };

  window.switchChat = function(id) {
    activeChatId = id;
    renderChatUI();
  };

  function renderChatUI() {
    const list = document.getElementById("chat-history-list");
    const container = document.getElementById("chat-messages-container");
    if(!list || !container) return;

    list.innerHTML = '';
    const currentUid = currentUser ? currentUser.id : 'guest';
    aiChats.filter(c => c.user_id === currentUid).forEach(c => {
      const active = c.id === activeChatId ? 'active' : '';
      list.innerHTML += `<div class="chat-hist-item ${active}" onclick="switchChat('${c.id}')">${c.title}</div>`;
    });

    const activeChat = aiChats.find(c => c.id === activeChatId);
    container.innerHTML = '';

    if(!activeChat || activeChat.messages.length === 0) {
      container.innerHTML = `<div class="chat-msg ai-msg"><div class="chat-avatar">${AI_LOGO_HTML}</div><div class="chat-bubble">Archives ready. User: ${currentUser ? currentUser.name : 'Guest'}. How can I assist you?</div></div>`;
    } else {
      activeChat.messages.forEach(msg => {
        const isAi = msg.role === 'ai';
        container.innerHTML += `<div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}"><div class="chat-avatar">${isAi ? AI_LOGO_HTML : (currentUser?.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img">` : 'U')}</div><div class="chat-bubble">${msg.text}</div></div>`;
      });
    }
    container.scrollTop = container.scrollHeight;
  }

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
    renderChatUI();

    const reply = await fetchN8nResponse(message, currentUser?.id || 'guest');
    activeChat.messages.push({ role: 'ai', text: reply.replace(/\n/g, '<br>') });
    
    renderChatUI();
    saveChatToDB(activeChat.id); 
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

  document.getElementById("chat-send-btn")?.addEventListener('click', handleSendMessage);
  document.getElementById("chat-input-field")?.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }});

  updateChatProfileUI();
  fetchChatsFromDB(); 
});
