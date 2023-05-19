import React, { Fragment, useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import Spinner from "@site/src/components/misc/spinner";
import Head from "@docusaurus/Head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faHurricane } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** CSS */
import "./index.styles.css";
/** CSS END */

interface IMessage {
  sender: "me" | "ai";
  content: string;
  timestamp: number;
  sources?: Array<string>;
}

export default function Chat(): JSX.Element {
  const [message, setMessage] = useState<IMessage>();
  const [lastMessageText, setLastMessageText] = useState<string>("");
  const [messages, setMessages] = useState<Array<IMessage>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const res_separator = "@@----------@@";

  const chatInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!message || message?.content?.trim() === "") return;

    setIsLoading(true);

    console.log("messages ", messages);

    const requestBody = {
      question: message.content,
      chat_history: messages
        .slice()
        .reverse()
        .slice(0, -1)
        .map((m) => m.content),
    };

    console.log("Sending Message ==> ", message);
    (async () => {
      await fetchData(requestBody);
    })();
  }, [message]);

  const fetchData = async (requestBody) => {
    try {
      const response = await fetch("https://docs-assistant-api.onrender.com/ask", {
        method: "post",
        body: JSON.stringify(requestBody),
      });
      const reader = response.body?.getReader();
      let chunks = "";

      const processChunk = async ({ done, value }: { done: boolean; value: Uint8Array }) => {
        if (done) {
          setLastMessageText("");

          // All chunks received, process the accumulated data
          const chunksSplit = chunks.split(res_separator);

          const newMessage = {
            content: chunksSplit[1], // index 1 will always contain content
            timestamp: new Date().getTime(),
            sources: JSON.parse(chunksSplit[2]), // index 2 will always include sources
            ...JSON.parse(chunksSplit[0]), // finally the 0 index will return `sender`
          };

          setMessages((messages) => messages.concat(newMessage));
          setIsLoading(false);

          return;
        }

        let sep_no: 0 | 1 = 1;
        // Accumulate the chunks
        let decodedValue = new TextDecoder().decode(value);
        chunks += decodedValue;
        if (decodedValue.includes(res_separator)) {
          // chunk is not part of message

          decodedValue = decodedValue.split(res_separator)[sep_no];
          if (sep_no === 1) sep_no = 0;
        }
        setLastMessageText((m) => (m += decodedValue));

        // Process the next chunk
        return reader?.read().then(processChunk);
      };

      return reader?.read().then(processChunk);
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  //   const handleMessageChange = (event) => {
  //     setMessage(event.target.value);
  //   };

  const handleSendMessage = () => {
    console.log("message ", chatInput.current?.value);

    if (chatInput.current?.value.trim() === "") return;

    const _message = chatInput.current?.value;

    const newMessage: IMessage = {
      sender: "me",
      content: _message,
      timestamp: new Date().getTime(),
    };

    setMessages((messages) => messages.concat(newMessage));
    setMessage(newMessage);
    chatInput.current.value = "";
    // setLastSender(lastSender === "me" ? "them" : "me");
  };

  return (
    <BrowserOnly fallback={<Spinner wrapperStyles={{ width: 32, height: 32, position: "absolute", margin: "auto", top: 0, bottom: 0, left: 0, right: 0 }} />}>
      {() => {
        return (
          <>
            <Head>
              <meta name="description" content="NovoRender AI Assisted Chat Support for documentation" />
              <meta property="og:description" content="NovoRender AI Assisted Chat Support for documentation" />
              <title>NovoRender | AI Assisted Chat Support for Docs</title>
            </Head>
            <Layout title="AI Assisted Chat Support for Docs">
              <div className="chat-ui">
                <div className="chat-header">
                  <div className="avatar">
                    <FontAwesomeIcon icon={faRobot} />
                  </div>
                  <div className="info">
                    <div className="name">Envisioner</div>
                    <div className="status">Novorender's AI Bot</div>
                  </div>
                </div>
                <div className="messages">
                  {lastMessageText && (
                    <div className={`message-container ai`}>
                      <div className="message">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lastMessageText}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {messages
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((m) => (
                      <div key={m.timestamp} className={`message-container ${m.sender}`}>
                        <div className="message">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          {m?.sources?.length && (
                            <div className="message-sources">
                              <p>sources:</p>
                              <span>
                                {m.sources.map((s, i) => (
                                  <Fragment key={i}>
                                    <Link to={s}>{s}</Link>
                                    <br />
                                  </Fragment>
                                ))}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="input-area">
                  <input type="text" placeholder="Type a message..." ref={chatInput} />
                  <button onClick={handleSendMessage} className="button button--sm button--primary">
                    {isLoading ? <FontAwesomeIcon style={{ fontSize: 16 }} spin={true} icon={faHurricane} /> : <span>Send</span>}
                  </button>
                </div>
              </div>
            </Layout>
          </>
        );
      }}
    </BrowserOnly>
  );
}
