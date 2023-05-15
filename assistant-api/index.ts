import express, { Request, Response } from "express";
import { Configuration } from "openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { ConversationalRetrievalQAChain } from "langchain/chains";
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORGNIZATION,
});

/* Initialize the LLM to use to answer the question */
const model = new ChatOpenAI(
  {
    modelName: "gpt-3.5-turbo",
  },
  configuration
);

export const search = async (question: string, chat_history: Array<string> = []): Promise<string> => {
  let res: string;

  try {
    console.log("Query, ", question);

    // Load the vector store from the same directory
    const loadedVectorStore = await HNSWLib.load("./embeddings", new OpenAIEmbeddings({}, configuration));
    console.log("loadedVectorStore ", loadedVectorStore);

    const qaTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. format the answer in Markdown.
{context}
Question: {question}
Helpful Answer:`;

    const chain = ConversationalRetrievalQAChain.fromLLM(model, loadedVectorStore.asRetriever(), { qaTemplate });
    /* Ask it a question */
    const llm_res = await chain.call({ question, chat_history });

    res = llm_res.text;
  } catch (error) {
    console.log("An error occurred ", error);
  }
  return res!;
};

// const callbackManager = CallbackManager.fromHandlers({
//   handleLLMStart: async (llm: { name: string }, prompts: string[]) => {
//     console.log(JSON.stringify(llm, null, 2));
//     console.log(JSON.stringify(prompts, null, 2));
//   },
//   handleLLMEnd: async (output: LLMResult) => {
//     console.log(JSON.stringify(output, null, 2));
//   },
//   handleLLMError: async (err: Error) => {
//     console.error(err);
//   },
// });

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 3001;

app.post("/ask", async (req: Request, res: Response) => {
  console.log("req.body ", req.body);

  const { body } = req;

  const chainResponse = await search(body.question, body.chat_history);

  console.log("Chain response ", chainResponse);

  res.send(chainResponse.toString());
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
