import { ChatGroq } from "@langchain/groq";
import { CreateEvent, GetEvents } from "./tools";
import { END, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";
import readline from 'readline/promises'
import { content } from "googleapis/build/src/apis/content";
// DEFINE TOOL
const tools = [CreateEvent, GetEvents];

// Init Assistant
const Assistant = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
}).bindTools(tools);

// Assistant node
async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await Assistant.invoke(state.messages);

  return { messages: [response] };
}

// tool node
const toolNode = new ToolNode(tools);

// to make decesion
function ShouldContinue(state:typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return "__end__";
}

//Build he graph
const graph = new StateGraph(MessagesAnnotation)
  //-------node added---------
  .addNode("assistant", callModel)
  .addNode("tools", toolNode)
  //-------edges added---------
  .addEdge("__start__", "assistant")
  .addConditionalEdges("assistant",ShouldContinue, {
    __end__: END,
    tools: "tools",
  })
  .addEdge("tools", "assistant");

// Memory added
const checkpointer = new MemorySaver()

// invoke
const app = graph.compile({checkpointer})

async function main() {
  let config =  {configurable :{thread_id:'1'}}
  const rl = readline.createInterface({input:process.stdin, output:process.stdout})
   
  while(true){
    const userInput = await rl.question('You: ')
    if(userInput === '/bye'){ 
      break
    }
   // get current local time
    const currentDateTime =  new Date().toLocaleString('en-us',{
      hour: 'numeric',
    minute: '2-digit',
    hour12: true // Explicitly request 12-hour format

    }) 
    // timezone
    const timeZoneString =  Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = await app.invoke({
    messages:[
      {role:'system', content:`you are a google calendar agent created by Asifshaikh
      Current datetime:${currentDateTime}
      Current timezone string:${timeZoneString}
        `},
      {role:'user',content:userInput}]
  },
config
)
/* 1. title: project discussion ,2. time: start: 8pm ,end: 10pm 3. attendees: Asif(ceo, shaikhasi5690@gmail.com), john (manager, john@gmail.com) 4. notes:today's discussion is about previous project 5. timezone: Asia/kolkata */
  console.log('AI: ', result.messages[result.messages.length - 1]?.content)
} 
rl.close()
  }


main()