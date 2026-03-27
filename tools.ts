import { tool } from "@langchain/core/tools";
import z from "zod";

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
 export const GetEvents = tool(
  async () => {
    // hardcoded
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