import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { resolveClearanceFromRoles } from "./lib/clearanceResolver.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));

app.get("/auth/discord/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    scope: "identify guilds"
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing OAuth code" });
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
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

    const token = await tokenResponse.json();

    if (!token.access_token) {
      return res.status(500).json({
        error: "Failed to obtain Discord access token",
        discord: token
      });
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    const user = await userResponse.json();

    const memberResponse = await fetch(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${user.id}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!memberResponse.ok) {
      return res.status(403).json({
        error: "User is not a member of the Discord server."
      });
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
      `${req.protocol}://${req.get("host")}`;

    return res.redirect(`${frontend}/?${params.toString()}`);
  } catch (err) {
    return res.status(500).json({
      error: "Discord callback failed",
      message: err.message
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});