import { tool } from "@langchain/core/tools";
import z from "zod";
import { google } from "googleapis";
import tokens from "./tokens.json";

//https://developers.google.com/workspace/calendar/api/quickstart/nodejs
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
);
oauth2Client.setCredentials({
  access_token:process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token:process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//*----------------------------------------------------------------

export const GetEvents = tool(
  async (params) => {
    /* 
     parameter to implement:
     timeMin,
     tiemMax,
     q
     */
     
     

    const { timeMax, timeMin, q } = params;
    console.log("params", params);
    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin,
        timeMax,
        q, 
        singleEvents: true,
        orderBy: "startTime",
      });

      const result =  response.data.items?.map((event)=>{
        return {
          id: event.id,
          summary: event.summary,
          status:event.status,
          organiser: event.organizer,
          start:event.start,
          end:event.end,
          attendees:event.attendees,
          meetingLink:event.hangoutLink,
          eventType:event.eventType
        }
      })
      return JSON.stringify(result)
    } catch (error) {
      console.log("get-evt-err", error);
    }
  },
  {
    name: "Get-Events",
    description: "Call to get calender events.",
    schema: z.object({
      q: z
        .string()
        .describe(
          "The query to be used to get events from google calendar. It can be one of these values: summary, description, location, attendees display name, attendees email, organiser's name, organiser's email",
        ),
      timeMin: z
        .string()
        .describe("the 'from' datetime for the event"),
      timeMax: z
        .string()
        .describe("the 'to' datetime to get event"),
    }),
  },
);


 type attendee = {
  email:string
  displayName: string
 }
  type EventData = {
    summary:string
    start:{
      dateTime:string
      timeZone:string
    }
    end:{
      dateTime:string
      timeZone:string
    }
    attendees:attendee[]

  }
export const CreateEvent = tool(
  async (eventData) => {
    const {summary,start,end,attendees} = eventData as EventData
   const response =  await calendar.events.insert({calendarId:'primary',
      sendUpdates:'all' ,
       conferenceDataVersion: 1,
      requestBody:{
        summary,
        start,
        end,
        attendees,
        conferenceData:{
          createRequest:{
            requestId: crypto.randomUUID(),
            conferenceSolutionKey:{
              type:'hangoutsMeet'
            }
          }
        }
        
      }    

     })
     console.log('create-evt',response)
    // hardcoded
    if(response.statusText === "OK"){
      return "meeting has been created"
    }
    return "not able to create meeting"
  },
  {
    name: "Create-Event",
    description: "Call to create calendar events.",
    schema: z.object({
      summary: z.string().describe("Title of the event"),
      start: z.object({
        dateTime: z.string().describe("Start datetime"),
        timeZone: z.string().describe("Current IANA timezone"),
      }),
      end: z.object({
        dateTime: z.string().describe("End datetime"),
        timeZone: z.string().describe("Current IANA timezone"),
      }),
      attendees: z.array(
        z.object({
          email: z.string(),
          displayName: z.string().optional(),
        })
      ).optional().describe("List of attendees"),
    }),
  },
);
