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
    streaming: true,
  },
  configuration
);

const src_regex = /^\/media\/Datas\/novorender\/docs|\.mdx?$|\/index\.md$/g;
const res_separator = "@@----------@@";

export const search = async (expressResponse: Response, question: string, chat_history: Array<string> = []): Promise<{ sources: Array<string> }> => {
  let res: {
    sources: Array<string>;
  };

  let sentInitialPayload = false;
  let currentRunId: string;
  let shouldWriteRes = false;

  try {
    console.log("Query, ", question);

    // Load the vector store from the same directory
    const loadedVectorStore = await HNSWLib.load("./embeddings", new OpenAIEmbeddings({}, configuration));
    // console.log("loadedVectorStore ", loadedVectorStore);

    const qaTemplate = `You are a very enthusiastic representative for NovoRender (a company that enables engineering teams to share their advanced 3D-models with employees, customers and business partners, regardless of 3D formats and file sizes.) who loves to help people! Given the following sections from the documentation, answer the question using only that information, output in Markdown format. If you are unsure and the answer is not explicitly written in the documentation, say "Apologies, I'm not familiar with the answer to your question. However, I suggest trying to rephrase the question as it may facilitate finding a solution.".

    Context:
    {context}
    
    Question: {question}
    
    Answer (including related code snippets if available):`;

    const chain = ConversationalRetrievalQAChain.fromLLM(model, loadedVectorStore.asRetriever(), { qaTemplate, returnSourceDocuments: true });
    /* Ask it a question */
    const { sourceDocuments } = await chain.call({ question, chat_history }, [
      {
        handleLLMNewToken(token: string, runid: string) {
          console.log(token);
          // handleLLMNewToken is also emitting the followup question in the response, we need to skip it.
          if (!chat_history?.length || (chat_history?.length && currentRunId && currentRunId !== runid) || shouldWriteRes) {
            shouldWriteRes = true;
            if (!sentInitialPayload) {
              expressResponse.status(200);
              expressResponse.write(JSON.stringify({ sender: "ai" }));
              expressResponse.write(res_separator); // just a separator for making client-side parsing easy.
              sentInitialPayload = !sentInitialPayload;
            }
            expressResponse.write(token);
          }
          currentRunId = runid;
        },
      },
    ]);

    let sources: Array<string> = sourceDocuments
      .map((d: any) => d.metadata.source)
      .filter((s: string) => s?.endsWith(".mdx") || s?.endsWith(".md"))
      .map((s: string) => s.replace(src_regex, ""));

    sources = [...new Set(sources)];

    res = { sources };
  } catch (error) {
    console.log("An error occurred ", error);
    res = { sources: [] };
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

  const { sources } = await search(res, question, chat_history);

  res.write(res_separator); // just a separator for making client-side parsing easy.
  res.write(JSON.stringify(sources));

  res.end();
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
