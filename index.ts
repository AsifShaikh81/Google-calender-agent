import { ChatGroq } from "@langchain/groq";

const tools:any = []

const LLM = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
}).bindTools(tools);