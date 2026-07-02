export async function handler(event) {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code"
    };
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.DISCORD_CLIENT_ID);
  params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify(tokenData)
    };
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const user = await userRes.json();

  return {
    statusCode: 302,
    headers: {
      Location: `/login?discord_id=${user.id}&username=${user.username}`
    }
  };
}