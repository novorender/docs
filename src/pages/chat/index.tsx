import React, { useEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import Spinner from "@site/src/components/misc/spinner";
import Head from "@docusaurus/Head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faHurricane } from "@fortawesome/free-solid-svg-icons";
const unified = require("unified");
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";

/** CSS */
import "./index.styles.css";
/** CSS END */

interface IMessage {
  sender: "me" | "ai";
  content: string;
  parsedMarkdown?: string;
  timestamp: number;
}

export default function Chat(): JSX.Element {
  const [message, setMessage] = useState<IMessage>();
  const [messages, setMessages] = useState<Array<IMessage>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    fetch("https://docs-assistant-api.onrender.com/ask", {
      method: "post",
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        return res.json();
      })
      .then(async (res) => {
        console.log("res ", res);

        const newMessage = {
          sender: res.sender,
          content: res.text,
          parsedMarkdown: await parseMarkdown(res.text),
          timestamp: new Date().getTime(),
        };

        setMessages((messages) => messages.concat(newMessage));
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("en error occurred ", err);
        setIsLoading(false);
      });
  }, [message]);

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

  const parseMarkdown = async (mdString: string): Promise<string> => {
    return String(await unified().use(remarkParse).use(remarkHtml).process(mdString));
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
                  {messages
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((m, i) => (
                      <div key={m.timestamp} className={`message-container ${m.sender}`}>
                        {m.parsedMarkdown ? <div className="message" dangerouslySetInnerHTML={{ __html: m.parsedMarkdown }}></div> : <div className="message">{m.content}</div>}
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
