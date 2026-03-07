export default async function handler(req, res) {
    const { code } = req.query;

    // Si alguien entra sin código de Discord, lo devolvemos al inicio
    if (!code) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return;
    }

    try {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        const redirectUri = 'https://1212am.org/api/auth/callback';

        // Verificamos que las variables de entorno existan en Vercel
        if (!clientId || !clientSecret) {
            throw new Error("Faltan las variables DISCORD_CLIENT_ID o DISCORD_CLIENT_SECRET en Vercel.");
        }

        // 1. Preparamos los datos para pedir el Token a Discord
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri);

        // 2. Pedimos el Token a Discord (Usando fetch nativo, sin axios)
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            throw new Error(`Error al obtener token de Discord: ${errorData}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 3. Pedimos los datos del perfil del usuario
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userResponse.ok) {
            throw new Error("Error al obtener los datos del usuario de Discord.");
        }

        const user = await userResponse.json();

        // Formateamos lo que queremos guardar
        const userData = {
            id: user.id,
            name: user.username,
            email: user.email,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        };

        // 4. Inyectamos los datos en el navegador y redirigimos a la raíz limpia "/"
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <title>Entering the wormhole...</title>
                <style>
                  body { background: #000; color: #FFD600; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                </style>
              </head>
              <body>
                <h2>Synchronizing...</h2>
                <script>
                    // Guardamos los datos de usuario en la memoria del navegador
                    localStorage.setItem('user', JSON.stringify(${JSON.stringify(userData)}));
                    
                    // Obligamos al navegador a ir a la página principal limpia
                    window.location.href = "/";
                </script>
              </body>
            </html>
        `);

    } catch (error) {
        console.error('Error Crítico en OAuth:', error.message);
        
        // Si hay error, mostramos una pantalla negra con el texto rojo para saber qué falló
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send(`
            <div style="background: black; color: red; padding: 2rem; font-family: monospace;">
                <h1>System Failure</h1>
                <p>${error.message}</p>
                <a href="/" style="color: #FFD600; text-decoration: underline;">Return to safety</a>
            </div>
        `);
    }
}
