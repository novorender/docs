import { Configuration } from "openai";
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

  const dtsLoaderWebglApi = new TextLoader(path.join(process.cwd(), "../node_modules/@novorender/webgl-api/index.d.ts"));
  const dtsLoaderDataJsApi = new TextLoader(path.join(process.cwd(), "../node_modules/@novorender/data-js-api/index.d.ts"));
  const dtsLoaderMeasureApi = new TextLoader(path.join(process.cwd(), "../node_modules/@novorender/measure-api/index.d.ts"));

  const docs_text = await Promise.all([tsLoader.load(), dtsLoaderWebglApi.load(), dtsLoaderDataJsApi.load(), dtsLoaderMeasureApi.load()]).then((e) => e.flat());

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

  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments([...textDocsSplitted, ...markdownDocsSplitted], new OpenAIEmbeddings({}, configuration));

  await vectorStore.save("./embeddings");
};

loadDocsAndCreateLocalEmbeddings();
