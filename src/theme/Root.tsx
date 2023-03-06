import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import React, { useEffect, useState } from "react";
import { PlaygroundContext } from "./context";

if (ExecutionEnvironment.canUseDOM) {
  window["runtime_process_env"] = {
    DEBUG: true,
  };
}

// Default implementation, that you can customize
export default function Root({ children }) {
  const [runningPlaygroundId, setRunningPlaygroundId] = useState("");

  /**
   * @description login with demo user to store the token localstorage
   * for further usage in the demos that require authentication.
   */
  async function login(): Promise<string> {
    // Hardcoded values for demo purposes
    const username = "demouser";
    const password = "demopassword";

    // POST to the dataserver service's /user/login endpoint
    const res: { token: string } = await fetch("https://data.novorender.com/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${username}&password=${password}`,
    })
      .then((res) => res.json())
      .catch(() => {
        // Handle however you like
        return { token: "" };
      });
    return res.token;
  }

  useEffect(() => {
    (async () => {
      const message = `Unable to obtain access token; some demos requiring an access token may not function; please reload the application to try again.`;
      try {
        const accessToken = await login();
        if (!accessToken) {
          console.warn(message);
          return alert(message);
        }
        localStorage.setItem("demo_access_token", accessToken);
      } catch (error) {
        console.warn(message);
        alert(message);
      }
    })();

    /**
     * Global custom alert component to display any kind of info,
     * mainly intended to be used in the monaco snippets where React
     * components aren't available
     * just do `openAlert('whatever content...')` to show an alert
     */
    window["openAlert"] = (content: string, type: "primary" | "secondary" | "success" | "info" | "warning" | "danger" = "info") => {
      const existing_alert = document.querySelector(".custom-alert-container");
      if (existing_alert) {
        document.body.removeChild(existing_alert);
      }
      const ele = document.createElement("div");
      const close_btn = document.createElement("button");
      close_btn.classList.add("clean-btn", "close");
      close_btn.setAttribute("type", "button");
      close_btn.innerHTML = `<span aria-hidden="true">&times;</span>`;
      close_btn.addEventListener("click", () => {
        document.body.removeChild(ele);
      });
      ele.classList.add("alert", `alert--${type}`, "custom-alert-container");
      ele.appendChild(close_btn);
      ele.append(content);
      document.body.appendChild(ele);
    };
  }, []);

  return <PlaygroundContext.Provider value={{ runningPlaygroundId, setRunningPlaygroundId }}>{children}</PlaygroundContext.Provider>;
}
