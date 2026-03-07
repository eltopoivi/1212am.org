const axios = require('axios');

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/auth?error=no_code');
    }

    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.DISCORD_CLIENT_ID);
        params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        // IMPORTANTE: DEBE COINCIDIR EXACTO CON DISCORD
        params.append('redirect_uri', 'https://1212am.org/api/auth/callback');

        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const user = userResponse.data;

        const userData = {
            id: user.id,
            name: user.username,
            email: user.email,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        };

        // Redirección con ruta absoluta limpia al final
        res.send(`
            <html>
              <head><title>Loading...</title></head>
              <body>
                <script>
                    localStorage.setItem('user', JSON.stringify(${JSON.stringify(userData)}));
                    window.location.href = "/ai36912";
                </script>
              </body>
            </html>
        `);

    } catch (error) {
        console.error('Error en OAuth:', error.response?.data || error.message);
        res.redirect('/auth?error=failed_login');
    }
}
