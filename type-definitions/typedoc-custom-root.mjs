// @ts-check
import * as td from "typedoc";
/**
 * Before updating to api-v2 when using typedoc 0.26.0 we got hierarchy like this:
 * - Data JS API
 *   - API Reference
 *     - Namespaces
 *       - DataJsAPI
 *         - Interfaces
 *         - ...
 * 
 * After updating we got:
 * - Data JS API
 *   - API Reference
 *     - @novorender/data-js-api
 *       - Interfaces
 *       - ...
 * 
 * This plugin just tries to get back the old hierarchy to preserve the old links.
 * `alwaysCreateEntryPointModule: true` in docusaurus.config.js also adds 'data-js-api' node before 'API Reference'.
 * So the fix is that we just rename nodes to match the old hierarchy.
 * - data-js-api -> Namespaces
 * - @novorender/data-js-api -> DataJsAPI
 * 
 * Still it produces different breadcrumbs, but it's not a big deal.
 * 
 * I've tried different typedoc configurations, but couldn't get the same hierarchy as before other way.
 * 
 * @param {td.Application} app 
 * */
export function load(app) {
    app.converter.on("end", (e) => {
      
        const namespaces = e.project.children?.[0];
        if (!namespaces) {
            return;
        }
        const dataJsApi = namespaces.children?.[0];
        if (!dataJsApi) {
            return;
        }

        namespaces.name =
            namespaces.escapedName =
            e.project.packageName =
                "namespaces";
        dataJsApi.name = namespaces.escapedName = "DataJsAPI";
    });
}
