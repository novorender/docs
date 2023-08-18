import fromPick from "./metadata_from_pick.ts?raw";
import fromSearch from "./metadata_from_search.ts?raw";
import flyTo from "./fly_to.ts?raw";
import { demo } from "../../misc";

export const objectMetadata = {
  ...demo("object_metadata", "metadata_from_pick", fromPick, {}, "Metadata from picking objects."),
  ...demo("object_metadata", "metadata_from_search", fromSearch, {}, "Metadata from search."),
  ...demo("object_metadata", "fly_to", flyTo, {}, "How to fly to objects using CameraController.zoomTo(), When the example is run it will first do a quick search for 4 objects and fly to them. After that it will fly to any object you click."),
};
