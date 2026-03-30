import { tool } from "@langchain/core/tools";
import z from "zod";
import { google } from "googleapis";


//https://developers.google.com/workspace/calendar/api/quickstart/nodejs
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
);

const calendar = google.calendar({version:'v3', auth:oauth2Client})


//*----------------------------------------------------------------

 export const GetEvents = tool(
  async () => {
    try {
      const response = calendar.events.list({calendarId:'shaikhasif78866@gmail.com'})
      console.log("get-evt-response",response)
    } catch (error) {
      console.log("get-evt-err",error)
      
    }
    return JSON.stringify([
      {
        Title: "Meeting",
        Time: "1pm",
        Location: "Zoom",
      },
    ]);
  },
  {
    name: "Get-Events",
    description: "Call to get calender events.",
    schema: z.object({}),
  },
);

 export const CreateEvent = tool(
  async () => {
    // hardcoded
    return " event created"
  },
  {
    name: "Create-Event",
    description: "Call to create calender events.",
    schema: z.object({}),
  },
);
