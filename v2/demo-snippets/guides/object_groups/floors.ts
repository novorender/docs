import type { RenderStateChanges, View } from "@novorender/api";
import type { API, ObjectGroup, SceneData } from "@novorender/data-js-api";

// Condos demo scene
const SCENE_ID = "c132d3eecf4f4247ace112410f4219aa";
export async function main(view: View, sceneData: SceneData, dataAPI: API) {
    try {
        // Destructure relevant properties into variables
        const { objectGroups } = sceneData;

        // Find floor groups
        const floors = objectGroups.filter((group) => group.grouping?.toLowerCase() === "floors");

        // Create buttons
        createFloorButtons(view.canvas.parentElement!, floors, async (floor: ObjectGroup | undefined) => {
            if (floor) {
                // Hide all floors
                floors.forEach((floor) => (floor.hidden = true));
                // Show clicked
                floor.hidden = false;
            } else {
                // Show all floors
                floors.forEach((floor) => (floor.hidden = false));
            }

            // Handle visibility changes
            const renderState = await handleVisibilityChanges(dataAPI, objectGroups);
            view.modifyRenderState(renderState);
        });
    } catch (e) {
        console.warn(e);
    }
}

// ID to track if handleVisibilityChanges has been called again before IDs have finished loading
let refillId = 0;

/**
 * Hide check groups' .hidden property and toggle their objects' visibility
 */
async function handleVisibilityChanges(dataApi: API, groups: ObjectGroup[]): Promise<RenderStateChanges> {

    // For groups that have large .ids lists we have to explicitly load the IDs
    // when needed as to not bloat the .loadScene() response
    const groupIdRequests: Promise<void>[] = groups.map(async (group) => {
        if ((group.selected || group.hidden) && !group.ids) {
            group.ids = await dataApi.getGroupIds(SCENE_ID, group.id).catch(() => {
                console.warn("failed to load ids for group - ", group.id);
                return [];
            });
        }
    });

    // Increment current refillId and assign local copy
    const id = ++refillId;

    // Wait for IDs to be loaded if necessary
    await Promise.all(groupIdRequests);

    // Abort changes if they are stale
    if (id !== refillId) {
        return {};
    }

    const objectIds: number[] = [];
    // Hide groups that have .hidden == true
    groups.filter((group) => group.hidden).forEach((group) => objectIds.push(...group.ids as Array<number>));

    return {
        highlights: {
            groups: [{ action: "hide", objectIds }],
        },
    };
}

// HiddenRangeStarted
// UI setup
function createFloorButtons(container: HTMLElement, floors: ObjectGroup[], onClick: (floor?: ObjectGroup) => void): void {
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    floors.forEach((floor) => {
        const btn = document.createElement("button");
        btn.innerText = floor.name;
        btn.onclick = () => {
            onClick(floor);
        };
        wrapper.append(btn);
    });
    const btn = document.createElement("button");
    btn.innerText = "All";
    btn.onclick = () => {
        onClick();
    };
    wrapper.append(btn);
    container.append(wrapper);
}
// HiddenRangeEnded
