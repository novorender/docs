import {
    RenderStateChanges,
    type RenderStateDynamicObject,
    type View,
    downloadGLTF,
} from "@novorender/api";
import { vec3 } from "gl-matrix";

const DATA_API_SERVICE_URL = "https://data-v2.novorender.com";

type File = {
    id: string;
    name: string;
};

export async function main(view: View) {
    const sceneId = view.renderState.scene?.config.id;
    if (!sceneId) {
        return;
    }

    // Even public scene we're using in most of the guides don't allow accessing files directly
    // TODO change to login
    const accessToken = "...";
    // const accessToken = await login();

    // Fetch repository root folder.
    const rootFilesResp = await fetch(
        `${DATA_API_SERVICE_URL}/projects/${sceneId}/folders`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const rootFiles = await rootFilesResp.json();

    // Pick a file called Condos.ifc in the root folder.
    // If you want to find a file in a subfolder - you may need to search for it recursively.
    const condosFile = rootFiles.files.find(
        (file: File) => file.name === "Condos.ifc"
    );
    if (!condosFile) {
        console.error("Condos.ifc file not found in the root folder.");
        return;
    }

    // Fetch file preview.
    // To process file we'll use downloadGLTF method, but it can't handle authentication,
    // so convert the file to data URI first.
    const filePreviewResp = await fetch(
        `${DATA_API_SERVICE_URL}/projects/${sceneId}/files/${condosFile.id}/preview`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const filePreviewBlob = await filePreviewResp.blob();
    const reader = new FileReader();
    reader.readAsDataURL(filePreviewBlob);
    await new Promise((resolve, reject) => {
        reader.onloadend = resolve;
        reader.onerror = reject;
    });
    const fileDataUri = new URL(reader.result as string);

    // Process GLTF and build a model.
    // Since we pass file as a data URL - it's necessary to specify the format explicitly.
    let objects = await downloadGLTF(fileDataUri, undefined, undefined, "glb");

    objects = objects.map((object) => {
        return {
            ...object,
            instances: object.instances.map((instance) => {
                // Convert model position to GL coordinates
                const position = vec3.fromValues(
                    instance.position[0],
                    -instance.position[2],
                    instance.position[1]
                );

                // Shift model so it doesn't overlap with the scene in the beginning
                position[0] += 40;

                return { ...instance, position };
            }),
        };
    });

    createControls(view);

    return {
        dynamic: { objects },
    };
}

// Create simple buttons to move the model around
function createControls(view: View) {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "8px";
    container.style.left = "8px";
    container.style.display = "flex";
    container.style.gap = "4px";
    view.canvas.parentElement?.appendChild(container);

    const addButton = (text: string, offsetX: number, offsetY: number) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.addEventListener("click", () => {
            const objects: readonly RenderStateDynamicObject[] =
                view.renderState.dynamic.objects.map((object) => {
                    const instances = object.instances.map((instance) => {
                        const position = vec3.clone(instance.position);
                        position[0] += offsetX;
                        position[1] += offsetY;
                        return { ...instance, position };
                    });
                    return { ...object, instances };
                });

            view.modifyRenderState({
                dynamic: { objects },
            } as RenderStateChanges);
        });
        container.appendChild(button);
    };

    addButton("⬅️", -1, 0);
    addButton("➡️", 1, 0);
    addButton("⬆️", 0, 1);
    addButton("⬇️", 0, -1);
}
// HiddenRangeStarted
async function login(): Promise<string> {
    // Hardcoded values for demo purposes
    const username = "demouser";
    const password = "demopassword";

    // POST to the dataserver service's /user/login endpoint
    // We're using username+password here but you probably need OAuth for getting access token
    const res: { token: string } = await fetch(
        "https://data.novorender.com/api/user/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `username=${username}&password=${password}`,
        }
    )
        .then((res) => res.json())
        .catch(() => {
            // Handle however you like
            return { token: "" };
        });

    return res.token;
}
// HiddenRangeEnded
