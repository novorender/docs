import express, { Request, Response } from "express";
import { Configuration } from "openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
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
  },
  configuration
);

export const search = async (query: string): Promise<string> => {
  let res: string;

  try {
    // Load the vector store from the same directory
    const loadedVectorStore = await HNSWLib.load("./embeddings", new OpenAIEmbeddings({}, configuration));
    console.log("loadedVectorStore ", loadedVectorStore);

    const result = await loadedVectorStore.similaritySearch(query, 5);

    console.log("similaritySearch results ", result);

    const prompt = `provide an answer based on the given context and format the response in Markdown. If the answer is not known, respond with "I don't know."\n\nContext: {context}\n\nQuestion: {question}`;

    const promptTemplate = new PromptTemplate({
      template: prompt,
      inputVariables: ["context", "question"],
    });

    const fewShots: Array<HumanChatMessage | AIChatMessage> = [];

    const promptWithActualQuestion = await promptTemplate.format({ context: `${result.map((r) => r.pageContent).join("\n")}\n`, question: query });
    fewShots.push(new HumanChatMessage(promptWithActualQuestion));

    const { text } = await model.call(fewShots);

    console.log("match ", text);

    res = text;
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
const port = process.env.PORT || 3001;

// lightweight function to validate query params
function validateQuery(fields: string[]) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    for (const field of fields) {
      if (!req.query[field]) {
        // Field isn't present, end request
        return res.status(400).send(`${field} is required`);
      }
    }
    next(); // All fields are present, proceed
  };
}

app.get("/ask", validateQuery(["query"]), async (req: Request, res: Response) => {
  const { query } = req.query;

  const chainResponse = await search(query as string);

  res.send(chainResponse.toString());
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
