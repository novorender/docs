import React, { useEffect, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { PlaygroundContext } from "./context";
import Head from "@docusaurus/Head";
import * as glMatrix from "gl-matrix";

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
    // async function login(): Promise<string> {
    //     // Hardcoded values for demo purposes
    //     const username = "demouser";
    //     const password = "demopassword";

    //     // POST to the dataserver service's /user/login endpoint
    //     const res: { token: string } = await fetch("https://data.novorender.com/api/user/login", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/x-www-form-urlencoded",
    //         },
    //         body: `username=${username}&password=${password}`,
    //     })
    //         .then((res) => res.json())
    //         .catch(() => {
    //             // Handle however you like
    //             return { token: "" };
    //         });
    //     return res.token;
    // }

    useEffect(() => {
        (async () => {
            /** APIs to be used in the playground/editor */
            const novorender = await import("@novorender/api");
            const dataApi = await import("@novorender/data-js-api");
            window["__novorender__"] = novorender;
            window["__dataApi__"] = dataApi;
            window["__glMatrix__"] = glMatrix;

            // const message = `Unable to obtain access token; some demos requiring an access token may not function; please reload the application to try again.`;
            // try {
            //     const accessToken = await login();
            //     if (!accessToken) {
            //         console.warn(message);
            //         return alert(message);
            //     }
            //     localStorage.setItem("demo_access_token", accessToken);
            // } catch (error) {
            //     console.warn(message);
            //     alert(message);
            // }
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


        // Quick workaround to hide some elements on docs readme file
        // might need to find a better way
        // if (location.pathname === "/docs/web_api/" || location.pathname === "/docs/web_api") {
        //     hideElementsOnReadme(location.pathname);
        // }
        // history.listen(({ pathname }) => {
        //     setTimeout(() => {
        //         hideElementsOnReadme(pathname);
        //     }, 0);
        // });

    }, []);

    // const hideElementsOnReadme = (pathname: string) => {
    //     const ele1 = document.querySelector<HTMLElement>(`div[class*="tableOfContents_"]`);
    //     const ele2 = document.querySelector<HTMLElement>(`header`);
    //     const ele3 = document.querySelector<HTMLElement>(`.pagination-nav`);
    //     if (pathname === "/docs/web_api/" || pathname === "/docs/web_api") {
    //         [ele1, ele2, ele3].forEach(e => {
    //             console.log("EEE ", e);
    //             if (e) {
    //                 e.style.display = "none";
    //             }
    //         });
    //     } else {
    //         [ele1, ele2, ele3].forEach(e => {
    //             if (e) {
    //                 e.style.display = "";
    //             }
    //         });
    //     }
    // }

    const importMap = () => JSON.stringify({ imports: { "@novorender/api": "/api_proxy.js", "gl-matrix": "/gl_matrix_proxy.js", "@novorender/data-js-api": "/data_api_proxy.js" } });

    return (
        <>
            <Head>
                <script type="importmap">{importMap()}</script>
            </Head>
            <PlaygroundContext.Provider value={{ runningPlaygroundId, setRunningPlaygroundId }}>{children}</PlaygroundContext.Provider>
        </>
    );
}
