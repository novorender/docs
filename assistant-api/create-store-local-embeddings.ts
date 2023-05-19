import { Configuration } from "openai";
import https from "https";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
require("dotenv").config();
const path = require("path");
// import { HierarchicalNSW } from "";
require("hnswlib-node").HierarchicalNSW;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORGNIZATION,
});

async function loadRemoteJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing JSON data from ${url}: ${(error as Error).message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Error loading JSON from ${url}: ${error.message}`));
    });
  });
}

const loadJson = async (): Promise<string> => {
  try {
    const json_contents = await Promise.all([loadRemoteJSON("https://data.novorender.com/swagger/v1/swagger.json"), loadRemoteJSON("https://data.novorender.com/swagger/v2/swagger.json")]);
    return JSON.stringify(json_contents);
  } catch (error) {
    console.log("Error: An error occurred while reading the open api json of data js api ===> ", error);
    return "";
  }
};

export const loadDocsAndCreateLocalEmbeddings = async () => {
  // console.log("cwd()", path.join(process.cwd(), "docs"));

  const markdownLoader = new DirectoryLoader(path.join(process.cwd(), "../docs"), {
    ".md": (path) => new TextLoader(path),
    ".mdx": (path) => new TextLoader(path),
  });

  const tsLoader = new DirectoryLoader(path.join(process.cwd(), "../demo-snippets/tutorials"), {
    ".ts": (path) => new TextLoader(path),
    // ".md": (path) => new JSONLoader(path, "/texts"),
    // ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    // ".csv": (path) => new CSVLoader(path, "text"),
  });

  const dataJsAPIJson = await loadJson();

  const dtsLoaderWebglApi = new TextLoader(path.join(process.cwd(), "../node_modules/@novorender/webgl-api/index.d.ts"));
  const dtsLoaderDataJsApi = new TextLoader(path.join(process.cwd(), "../node_modules/@novorender/data-js-api/index.d.ts"));
  const dtsLoaderMeasureApi = new TextLoader(path.join(process.cwd(), "../node_modules/@novorender/measure-api/index.d.ts"));

  const docs_text = await Promise.all([tsLoader.load(), dtsLoaderWebglApi.load(), dtsLoaderDataJsApi.load(), dtsLoaderMeasureApi.load()]).then((e) => e.flat());

  const textLoaderMiscInfo = new TextLoader(path.join(process.cwd(), "misc_info.txt"));
  const miscInfoText = await textLoaderMiscInfo.load();

  const docs_markdown = await markdownLoader.load();

  // console.log("textDocs ", docs_text);

  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter();
  const markdownSplitter = new MarkdownTextSplitter();

  const textDocsSplitted = await textSplitter.createDocuments(
    docs_text.map((e) => e.pageContent),
    docs_text.map((e) => e.metadata)
  );

  const markdownDocsSplitted = await markdownSplitter.createDocuments(
    docs_markdown.map((e) => e.pageContent),
    docs_markdown.map((e) => e.metadata)
  );

  const restApiDocsSplitted = await textSplitter.createDocuments([dataJsAPIJson]);

  const miscInfoSplitted = await textSplitter.createDocuments(miscInfoText.map((e) => e.pageContent));

  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments([...miscInfoSplitted, ...restApiDocsSplitted, ...markdownDocsSplitted, ...textDocsSplitted], new OpenAIEmbeddings({}, configuration));

  await vectorStore.save("./embeddings");
};

loadDocsAndCreateLocalEmbeddings()
  .then(() => {
    console.log("Finished!");
  })
  .catch((err) => {
    console.log("An error occurred while loading and creating embeddings ==> ", err);
  });
