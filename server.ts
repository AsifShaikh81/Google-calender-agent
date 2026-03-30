import express from "express";
import { google } from "googleapis";
const app = express();

// https://www.npmjs.com/package/googleapis
// https://www.npmjs.com/package/googleapis#oauth2-client
//note: refer diagram (notion.so)

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
);

app.get("/auth", (req, res) => {
  
  // generate a url that asks permissions for Google Calendar scopes
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
  ];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    prompt:'consent',

    // If you only need one scope, you can pass it as a string
    scope: scopes,
  });

  
  res.redirect(url);
  console.log("url",url)
});

app.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const {tokens} = await oauth2Client.getToken(code)

  console.log("tokens",tokens)

  // exchange code with access token/refresh token
  res.send("connected , You can close this tab now");
});

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})