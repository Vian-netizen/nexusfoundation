import { resolveClearanceFromRoles } from "./lib/clearanceResolver.js";

export const handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing OAuth code"
      })
    };
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
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
      }
    );

    const token = await tokenResponse.json();

    if (!token.access_token) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to obtain Discord access token",
          discord: token
        })
      };
    }

    // Fetch Discord user
    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      }
    );

    const user = await userResponse.json();

    // Fetch guild member to obtain roles
    const memberResponse = await fetch(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${user.id}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!memberResponse.ok) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "User is not a member of the Discord server."
        })
      };
    }

    const member = await memberResponse.json();

    const clearance = resolveClearanceFromRoles(member.roles);

    const params = new URLSearchParams({
      uid: user.id,
      username: user.username,
      clearance
    });

    const frontend =
      process.env.DISCORD_FRONTEND_URL ||
      "https://nexusfoundation.netlify.app";

    return {
      statusCode: 302,
      headers: {
        Location: `${frontend}/?${params.toString()}`
      }
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Discord callback failed",
        message: err.message
      })
    };
  }
};