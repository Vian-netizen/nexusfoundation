export const handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing OAuth code"
    };
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });

    const token = await tokenRes.json();

    if (!token.access_token) {
      return {
        statusCode: 500,
        body: JSON.stringify(token)
      };
    }

    // 2. Get Discord user
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    const user = await userRes.json();

    // 3. Get guild member (requires bot in server)
    const memberRes = await fetch(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${user.id}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    );

    const member = await memberRes.json();
    const roleIds = member.roles || [];

    // 4. Map roles → clearance
    const { resolveClearanceFromRoles } = await import(
      "../../src/lib/clearanceResolver.js"
    );

    const clearance = resolveClearanceFromRoles(roleIds);

    // 5. Redirect into frontend (session stored client-side)
    const redirectUrl =
      `${process.env.DISCORD_FRONTEND_URL || "https://nexusfoundation.netlify.app"}` +
      `/Home` +
      `?uid=${user.id}` +
      `&username=${encodeURIComponent(user.username)}` +
      `&clearance=${encodeURIComponent(clearance)}`;

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Discord callback failed",
        details: err.message
      })
    };
  }
};