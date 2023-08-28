import React, { useContext, useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useColorMode } from "@docusaurus/theme-common";
import { PlaygroundContext } from "@site/src/theme/context";
import MonacoWrapper from "../MonacoWrapper";

/** CSS */
import "./index.styles.css";
/** CSS END */

/** Types */
import type { IDempProps } from "@site/demo-snippets/demo";
/** Types END */

export default function PlaygroundComponent({ code, demoName, description, editorConfig, editUrl, previewImageUrl, dirName, fileName, hostCtor }: IDempProps): JSX.Element {
  const [isPlaygroundActive, setIsPlaygroundActive] = useState<boolean>(false);
  const { runningPlaygroundId, setRunningPlaygroundId } = useContext(PlaygroundContext);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!demoName) {
      throw new Error("Prop `demoName` is required and must be unique");
    }

    return () => {
      // close any existing alerts
      const existing_alert = document.querySelector(".custom-alert-container");
      if (existing_alert) {
        document.body.removeChild(existing_alert);
      }
    };
  }, []);

  const runPlayground = (): void => {
    setRunningPlaygroundId(demoName);
    setIsPlaygroundActive(true);
  };

  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => (
        <div>
          {editorConfig && (
            <div
              style={
                editorConfig.mode === "inline"
                  ? { border: "2px solid #d5275d33", padding: 5 }
                  : {
                    height: "calc(100vh - 60px)",
                    overflow: "hidden",
                    paddingTop: 2,
                  }
              }
            >
              {editorConfig.clickToRun && (!isPlaygroundActive || (isPlaygroundActive && demoName !== runningPlaygroundId)) ? (
                <div style={{ position: "relative" }}>
                  <button onClick={runPlayground} className="cu-button">
                    Click to run the demo
                  </button>
                  {previewImageUrl && (
                    <>
                      <img src={`/v2/img/playground-placeholder-${colorMode}.png`} style={{ filter: "blur(2px)", width: "100%" }} />
                      <img
                        src={previewImageUrl}
                        onError={(e) => {
                          e.currentTarget.src = `/v2/img/playground-demo-placeholder-dark.jpg`;
                        }}
                        style={{
                          width: "100%",
                          position: "absolute",
                          display: "block",
                          bottom: 42,
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                  <MonacoWrapper hostCtor={hostCtor} code={code} demoName={demoName} description={description} editorConfig={editorConfig} editUrl={editUrl} dirName={dirName} fileName={fileName}></MonacoWrapper>
              )}
            </div>
          )}
        </div>
      )}
    </BrowserOnly>
  );
}
