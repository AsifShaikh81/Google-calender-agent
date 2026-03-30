import { ChatGroq } from "@langchain/groq";
import { CreateEvent, GetEvents } from "./tools";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";

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

// invoke
const app = graph.compile()

async function main() {
  const result = await app.invoke({
    messages:[{role:'user',content:'do i have any meeting scheduled?'}]
  })

  console.log('AI: ', result.messages[result.messages.length - 1]?.content)
}
main()