document.addEventListener("DOMContentLoaded", () => {
  // === CONFIGURACIÓN DE SUPABASE ===
  const SUPABASE_URL = "https://zgbaakccwajzgvfiqyky.supabase.co"; 
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYmFha2Njd2Fqemd2ZmlxeWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODE2MDMsImV4cCI6MjA4ODI1NzYwM30.Xor-c2M5whbLvTxAbc2Md1ztPSCZlYujK3OpkA-P6y0";
  // =================================

  const AI_LOGO_HTML = `<img src="/Gemini_Generated_Image_tz20mhtz20mhtz20_Nero_AI_Background_Remover_transparent.png" class="ai-avatar-img" alt="AI">`;
  
  // Iconos SVG para UI
  const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const ICON_TRASH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

  let currentUser = JSON.parse(localStorage.getItem('user')) || null;
  let aiChats = []; 
  let activeChatId = null;

  // --- LOGIN CON DISCORD ---
  const discordBtn = document.getElementById('discord-login-btn');
  if(discordBtn) {
    discordBtn.onclick = (e) => {
      e.preventDefault();
      const clientId = "1479853900193468640"; 
      const redirect = encodeURIComponent("https://1212am.org/api/auth/callback");
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=identify%20email&prompt=consent`;
    };
  }

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem('user');
    location.href = "/ai36912"; 
  };
  document.getElementById("chat-auth-action-btn")?.addEventListener("click", () => currentUser ? logout() : window.navigate('auth'));
  document.getElementById("mobile-auth-action-btn")?.addEventListener("click", () => currentUser ? logout() : window.navigate('auth'));

  // --- BASE DE DATOS (SUPABASE) ---
  async function fetchChatsFromDB() {
    if (!currentUser) { renderChatUI(); return; }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_chats?user_id=eq.${currentUser.id}&order=updated_at.desc`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        aiChats = data;
        activeChatId = aiChats[0].id;
      } else {
        startNewChat();
      }
      renderChatUI();
    } catch (e) { console.error("Error Supabase:", e); startNewChat(); }
  }

  async function saveChatToDB(chatId) {
    if (!currentUser) return;
    const chat = aiChats.find(c => c.id === chatId);
    if (!chat) return;
    chat.updated_at = new Date().toISOString();
    
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/ai_chats`, {
        method: 'POST',
        headers: { 
          'apikey': SUPABASE_ANON_KEY, 
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
          'Content-Type': 'application/json', 
          'Prefer': 'resolution=merge-duplicates' 
        },
        body: JSON.stringify(chat)
      });
    } catch (err) { console.error("Error guardando chat", err); }
  }

  // --- FUNCIONALIDAD: BORRAR CHAT ---
  window.deleteChat = async function(e, id) {
    e.stopPropagation(); 
    
    aiChats = aiChats.filter(c => c.id !== id);
    if(activeChatId === id) {
      activeChatId = aiChats.length > 0 ? aiChats[0].id : null;
    }
    
    if(!activeChatId) window.startNewChat();
    else renderChatUI();

    if (currentUser) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/ai_chats?id=eq.${id}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
      } catch (err) { console.error("Error borrando chat en Supabase:", err); }
    }
  };

  // --- FUNCIONALIDAD: COPIAR MENSAJE ---
  window.copyMessage = function(btn) {
    const bubble = btn.parentElement.querySelector('.chat-bubble');
    if(!bubble) return;
    
    navigator.clipboard.writeText(bubble.innerText).then(() => {
      btn.innerHTML = ICON_CHECK;
      setTimeout(() => { btn.innerHTML = ICON_COPY; }, 2000);
    });
  };

  // --- GESTIÓN DE INTERFAZ ---
  window.startNewChat = function() {
    const chat = { id: "chat-" + Date.now(), title: "New session", messages: [], user_id: currentUser ? currentUser.id : 'guest', updated_at: new Date().toISOString() };
    aiChats.unshift(chat);
    activeChatId = chat.id;
    renderChatUI();
    if(currentUser) saveChatToDB(chat.id);
  };

  window.switchChat = (id) => { activeChatId = id; renderChatUI(); };

  window.renderChatUI = function() {
    const list = document.getElementById("chat-history-list");
    const container = document.getElementById("chat-messages-container");
    if(!list || !container) return;

    // Sidebar: Lista de chats con botón de borrar
    list.innerHTML = '';
    const currentUid = currentUser ? currentUser.id : 'guest';
    aiChats.filter(c => c.user_id === currentUid).forEach(c => {
      list.innerHTML += `
        <div class="chat-hist-item ${c.id === activeChatId ? 'active' : ''}" onclick="switchChat('${c.id}')">
          <span>${c.title}</span>
          <button class="delete-chat-btn" onclick="deleteChat(event, '${c.id}')" title="Delete chat">${ICON_TRASH}</button>
        </div>
      `;
    });

    const activeChat = aiChats.find(c => c.id === activeChatId);
    container.innerHTML = '';
    const welcomeText = currentUser ? `Identify complete. Welcome, ${currentUser.name}.` : "System ready. Guest access.";

    // Mensajes: Con botón de copiar
    if(!activeChat || activeChat.messages.length === 0) {
      container.innerHTML = `<div class="chat-msg ai-msg"><div class="chat-avatar">${AI_LOGO_HTML}</div><div class="chat-content-wrapper"><div class="chat-bubble">${welcomeText}</div></div></div>`;
    } else {
      activeChat.messages.forEach(msg => {
        const isAi = msg.role === 'ai';
        container.innerHTML += `
          <div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}">
            <div class="chat-avatar">${isAi ? AI_LOGO_HTML : (currentUser?.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img">` : 'U')}</div>
            <div class="chat-content-wrapper">
              <div class="chat-bubble">${msg.text}</div>
              <button class="copy-msg-btn" onclick="copyMessage(this)" title="Copy message">${ICON_COPY}</button>
            </div>
          </div>
        `;
      });
    }
    container.scrollTop = container.scrollHeight;
  }

  // --- ENVÍO DE MENSAJES (n8n) ---
  async function handleSendMessage() {
    const input = document.getElementById("chat-input-field");
    const msg = input.value.trim();
    if(!msg) return;

    if(!activeChatId) window.startNewChat();
    const chat = aiChats.find(c => c.id === activeChatId);
    if(chat.messages.length === 0) chat.title = msg.substring(0,25);

    chat.messages.push({ role: 'user', text: msg });
    input.value = '';
    input.style.height = 'auto';
    renderChatUI();
    saveChatToDB(chat.id); // Guardamos la pregunta inmediatamente

    // Indicador de carga
    const container = document.getElementById("chat-messages-container");
    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `<div class="chat-msg ai-msg" id="${loadingId}"><div class="chat-avatar">${AI_LOGO_HTML}</div><div class="chat-content-wrapper"><div class="chat-bubble">...</div></div></div>`;
    container.scrollTop = container.scrollHeight;

    const btn = document.getElementById("chat-send-btn");
    if(btn) btn.disabled = true;

    try {
      const res = await fetch('https://x36912ai.app.n8n.cloud/webhook/42eb1319-51f2-48a6-bb1f-fe67d105b741', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: msg, userId: currentUser ? currentUser.id : 'guest' })
      });
      const data = await res.json();
      chat.messages.push({ role: 'ai', text: (data.output || "No signal received.").replace(/\n/g, '<br>') });
    } catch (err) {
      chat.messages.push({ role: 'ai', text: "Wormhole connection timed out." });
    }
    
    if(btn) btn.disabled = false;
    renderChatUI();
    saveChatToDB(chat.id); // Guardamos la respuesta
  }

  document.getElementById("chat-send-btn")?.addEventListener('click', handleSendMessage);
  document.getElementById("chat-input-field")?.addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSendMessage(); 
    }
  });

  // --- PERFIL DE USUARIO ---
  function updateChatProfileUI() {
    const info = document.getElementById("chat-user-info");
    const btn = document.getElementById("chat-auth-action-btn");
    const mobileBtn = document.getElementById("mobile-auth-action-btn");
    if(!info || !btn) return;
    
    if(currentUser) {
      info.innerHTML = currentUser.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img"><span>${currentUser.name}</span>` : `<span>${currentUser.name}</span>`;
      btn.innerText = "Log out";
      if(mobileBtn) mobileBtn.innerText = "Log out";
    } else {
      info.innerHTML = `<span>Guest</span>`;
      btn.innerText = "Log in";
      if(mobileBtn) mobileBtn.innerText = "Log in";
    }
  }

  // --- ARRANQUE ---
  updateChatProfileUI();
  fetchChatsFromDB();
});
