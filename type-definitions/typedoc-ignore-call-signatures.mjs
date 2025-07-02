// @ts-check
import * as td from "typedoc";
import { MemberRouter } from "typedoc-plugin-markdown";
/**
 * For some reason after updating typedoc (and friends) to 0.28.0 I've started to get an issue:
 * Some link anchors suffix numbers are wrong and thus the links are broken.
 * For example we have 2 functions with the same name one instance - A#b and another static - A.b.
 * Links to the first one are going to be #b and to the second one - #b-1.
 * Those are declarations.
 * But typedoc also generates links for call signatures, which are not used in the markdown files,
 * so the second declaration gets #b-2 suffix, which is wrong - it should be #b-1, because signature wasn't added to the file.
 * 
 * I think better solution could be to go deeper into theme customization and add hidden call signature headers.
 * But this solution is simpler: just ignore call signatures when building anchors.
 * @param {td.Application} app
 * */
export function load(app) {
    app.renderer.defineRouter("member-custom", CustomMemberRouter);
}

class CustomMemberRouter extends MemberRouter {
    buildAnchors(target, pageTarget) {
        if (target.kind === td.ReflectionKind.CallSignature) {
            return;
        }
        return super.buildAnchors(target, pageTarget);
    }
}
