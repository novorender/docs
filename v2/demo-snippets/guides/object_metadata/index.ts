import { demo } from "../../demo";
import { SearchDemoHost } from "../../hosts";

import fromPick from "./metadata_from_pick.ts?raw";
import fromSearch from "./metadata_from_search.ts?raw";
import flyTo from "./fly_to.ts?raw";

export const objectMetadata = {
    ...demo("object_metadata", "metadata_from_pick", "Getting metadata from 'pick'", fromPick, SearchDemoHost, {}, "Metadata from picking objects."),
    ...demo("object_metadata", "metadata_from_search", "Getting metadata via search", fromSearch, SearchDemoHost, {}, "Metadata from search."),
    ...demo(
        "object_metadata",
        "fly_to",
        "Flying to objects",
        flyTo,
        SearchDemoHost,
        {},
        "How to fly to objects using CameraController.zoomTo(), When the example runs it will first do a quick search for 4 objects and fly to them. After that it will fly to any object you click."
    ),
};
