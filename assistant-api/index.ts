import express, { Request, Response } from "express";
import { Configuration } from "openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { text } from "body-parser";
const cors = require("cors");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORGNIZATION,
});

/* Initialize the LLM to use to answer the question */
const model = new ChatOpenAI(
  {
    modelName: "gpt-3.5-turbo",
    temperature: 1,
  },
  configuration
);

const src_regex = /^\/media\/Datas\/novorender\/docs|\.mdx?$|\/index\.md$/g;

export const search = async (question: string, chat_history: Array<string> = []): Promise<{ text: string | null; sources: Array<string> }> => {
  let res: {
    text: string | null;
    sources: Array<string>;
  };

  try {
    console.log("Query, ", question);

    // Load the vector store from the same directory
    const loadedVectorStore = await HNSWLib.load("./embeddings", new OpenAIEmbeddings({}, configuration));
    // console.log("loadedVectorStore ", loadedVectorStore);

    const qaTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. format the answer in Markdown, additionally if you encounter any URL or link then enclose it in angle brackets.
{context}
Question: {question}
Helpful Answer:`;

    const chain = ConversationalRetrievalQAChain.fromLLM(model, loadedVectorStore.asRetriever(), { qaTemplate, returnSourceDocuments: true });
    /* Ask it a question */
    const { text, sourceDocuments } = await chain.call({ question, chat_history });

    console.log("llm_res ", sourceDocuments);

    let sources: Array<string> = sourceDocuments
      .map((d: any) => d.metadata.source)
      .filter((s: string) => s?.endsWith(".mdx") || s?.endsWith(".md"))
      .map((s: string) => s.replace(src_regex, ""));

    sources = [...new Set(sources)];

    res = { text, sources };
  } catch (error) {
    console.log("An error occurred ", error);
    res = { text: null, sources: [] };
  }
  return res;
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
app.use(text());
const port = process.env.PORT || 3001;

app.post("/ask", async (req: Request, res: Response) => {
  console.log("req.body ", req.body);

  const { question, chat_history } = JSON.parse(req.body);

  const { text, sources } = await search(question, chat_history);

  res.status(200).json({ text, sources, sender: "ai" });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
