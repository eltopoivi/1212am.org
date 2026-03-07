document.addEventListener("DOMContentLoaded", () => {
  // === ⚠️ CONFIGURA TUS CLAVES DE SUPABASE ⚠️ ===
  const SUPABASE_URL = "https://zgbaakccwajzgvfiqyky.supabase.co"; 
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYmFha2Njd2Fqemd2ZmlxeWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODE2MDMsImV4cCI6MjA4ODI1NzYwM30.Xor-c2M5whbLvTxAbc2Md1ztPSCZlYujK3OpkA-P6y0";
  // ===========================================

  const AI_LOGO_HTML = `<img src="/Gemini_Generated_Image_tz20mhtz20mhtz20_Nero_AI_Background_Remover_transparent.png" class="ai-avatar-img" alt="AI">`;

  let currentUser = JSON.parse(localStorage.getItem('user')) || null;
  let aiChats = []; 
  let activeChatId = null;

  // --- LOGIN CON DISCORD (ID ACTUALIZADO) ---
  const discordBtn = document.getElementById('discord-login-btn');
  if(discordBtn) {
    discordBtn.onclick = (e) => {
      e.preventDefault();
      const clientId = "1479853900193468640"; // <--- TU NUEVO ID
      const redirect = encodeURIComponent("https://1212am.org/api/auth/callback");
      // prompt=consent obliga a Discord a reconocer el cambio de cuenta si fuera necesario
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=identify%20email&prompt=consent`;
    };
  }

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem('user');
    location.href = "/ai36912"; 
  };
  document.getElementById("chat-auth-action-btn")?.addEventListener("click", () => currentUser ? logout() : window.navigate('auth'));

  // --- LÓGICA DE BASE DE DATOS (SUPABASE) ---
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
  }

  // --- GESTIÓN DE INTERFAZ ---
  window.startNewChat = function() {
    const chat = { id: "chat-" + Date.now(), title: "New session", messages: [], user_id: currentUser ? currentUser.id : 'guest' };
    aiChats.unshift(chat);
    activeChatId = chat.id;
    renderChatUI();
  };

  window.switchChat = (id) => { activeChatId = id; renderChatUI(); };

  function renderChatUI() {
    const list = document.getElementById("chat-history-list");
    const container = document.getElementById("chat-messages-container");
    if(!list || !container) return;

    list.innerHTML = '';
    const currentUid = currentUser ? currentUser.id : 'guest';
    aiChats.filter(c => c.user_id === currentUid).forEach(c => {
      list.innerHTML += `<div class="chat-hist-item ${c.id === activeChatId ? 'active' : ''}" onclick="switchChat('${c.id}')">${c.title}</div>`;
    });

    const activeChat = aiChats.find(c => c.id === activeChatId);
    container.innerHTML = '';
    const welcomeText = currentUser ? `Identify complete. Welcome, ${currentUser.name}.` : "System ready. Guest access.";

    if(!activeChat || activeChat.messages.length === 0) {
      container.innerHTML = `<div class="chat-msg ai-msg"><div class="chat-avatar">${AI_LOGO_HTML}</div><div class="chat-bubble">${welcomeText}</div></div>`;
    } else {
      activeChat.messages.forEach(msg => {
        const isAi = msg.role === 'ai';
        container.innerHTML += `<div class="chat-msg ${isAi ? 'ai-msg' : 'user-msg'}">
          <div class="chat-avatar">${isAi ? AI_LOGO_HTML : (currentUser?.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img">` : 'U')}</div>
          <div class="chat-bubble">${msg.text}</div>
        </div>`;
      });
    }
    container.scrollTop = container.scrollHeight;
  }

  async function handleSendMessage() {
    const input = document.getElementById("chat-input-field");
    const msg = input.value.trim();
    if(!msg) return;

    if(!activeChatId) window.startNewChat();
    const chat = aiChats.find(c => c.id === activeChatId);
    if(chat.messages.length === 0) chat.title = msg.substring(0,25);

    chat.messages.push({ role: 'user', text: msg });
    input.value = '';
    renderChatUI();

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
    
    renderChatUI();
    saveChatToDB(chat.id);
  }

  document.getElementById("chat-send-btn")?.addEventListener('click', handleSendMessage);
  document.getElementById("chat-input-field")?.addEventListener('keydown', e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage()));

  function updateChatProfileUI() {
    const info = document.getElementById("chat-user-info");
    const btn = document.getElementById("chat-auth-action-btn");
    if(!info || !btn) return;
    if(currentUser) {
      info.innerHTML = currentUser.avatar ? `<img src="${currentUser.avatar}" class="user-avatar-img"><span>${currentUser.name}</span>` : `<span>${currentUser.name}</span>`;
      btn.innerText = "Log out";
    } else {
      info.innerHTML = `<span>Guest</span>`;
      btn.innerText = "Log in";
    }
  }

  updateChatProfileUI();
  fetchChatsFromDB();
});
