import searchByPath from "!!./search_by_path.ts?raw";
import fluffySearch from "!!./fluffy_search.ts?raw";
import exactSearch from "!!./exact_search.ts?raw";
import exactSearchExcludingResult from "!!./exact_search_excluding_result.ts?raw";
import semanticSearch from "!!./semantic_search.ts?raw";
import semanticSearch001 from "!!./semantic_search_001.ts?raw";

import { demo } from "../../misc";

export const searching = {
  ...demo("searching", "searchByPath", searchByPath, {}, "Demonstration path search pattern where the resulting objects are isolated in the view."),
  ...demo("searching", "fluffySearch", fluffySearch, {}, 'Fluffy search pattern which will search all properties for words starting with "Roof".'),
  ...demo("searching", "exactSearch", exactSearch, {}, 'Exact search only checking the property "ifcClass" and the exact value "ifcRoof".'),
  ...demo("searching", "exactSearchExcludingResult", exactSearchExcludingResult, {}, "Same as the Exact search pattern, but with exclude. This will return all objects except the ones found above."),
  ...demo("searching", "semanticSearch", semanticSearch, {}, "Semantic search test."),
  ...demo("searching", "semanticSearch001", semanticSearch001, {}, "Semantic search test."),
};
