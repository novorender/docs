import searchByPath from '!!./search_by_path.ts?raw';
import fluffySearch from '!!./fluffy_search.ts?raw';
import exactSearch from '!!./exact_search.ts?raw';
import exactSearchExcludingResult from '!!./exact_search_excluding_result.ts?raw';

import { demo } from "../../misc";

export const searching = {
    ...demo("searching", "searchByPath", searchByPath, { hiddenAreas: [{ startLineNumber: 0, endLineNumber: 13 }, { startLineNumber: 57, endLineNumber: 136 }] }, 'Demonstration path search pattern where the resulting objects are isolated in the view.'),
    ...demo("searching", "fluffySearch", fluffySearch, { hiddenAreas: [{ startLineNumber: 0, endLineNumber: 13 }, { startLineNumber: 53, endLineNumber: 132 }] }, 'Fluffy search pattern which will search all properties for words starting with "Roof".'),
    ...demo("searching", "exactSearch", exactSearch, { hiddenAreas: [{ startLineNumber: 0, endLineNumber: 13 }, { startLineNumber: 54, endLineNumber: 133 }] }, 'Exact search only checking the property "ifcClass" and the exact value "ifcRoof".'),
    ...demo("searching", "exactSearchExcludingResult", exactSearchExcludingResult, { hiddenAreas: [{ startLineNumber: 0, endLineNumber: 13 }, { startLineNumber: 56, endLineNumber: 135 }] }, 'Same as the Exact search pattern, but with exclude. This will return all objects except the ones found above.'),
};
