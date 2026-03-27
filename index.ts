import { ChatGroq } from "@langchain/groq";
import { CreateEvent, GetEvents } from "./tools";

const tools = [CreateEvent,GetEvents]


const LLM = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
}).bindTools(tools);