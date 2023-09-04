import { demo } from "../../demo";
import { SearchDemoHost } from "../../hosts";

/** Here goes  code demo code that you can see in the playground */
import searchByPath from "./search_by_path.ts?raw";
import fluffySearch from "./fluffy_search.ts?raw";
import exactSearch from "./exact_search.ts?raw";
import exactSearchExcludingResult from "./exact_search_excluding_result.ts?raw";

const dirName = "searching";

export const searching = {
    ...demo(dirName, "search_by_path", "Search By Path", searchByPath, SearchDemoHost, {}, "Demonstration path search pattern where the resulting objects are isolated in the view."),
    ...demo(dirName, "fluffy_search", "Fluffy Search", fluffySearch, SearchDemoHost, {}, 'Fluffy search pattern which will search all properties for words starting with "Roof".'),
    ...demo(dirName, "exact_search", "Exact Search", exactSearch, SearchDemoHost, {}, 'Exact search only checking the property "ifcClass" and the exact value "ifcRoof".'),
    ...demo(dirName, "exact_search_excluding_result", "Exact Search Excluding Result", exactSearchExcludingResult, SearchDemoHost, {}, "Same as the Exact search pattern, but with exclude. This will return all objects except the ones found above."),
};
