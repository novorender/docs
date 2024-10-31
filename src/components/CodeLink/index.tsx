import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";

export type TypeString = "class" | "interface" | "type" | "function" | "enum" | "variable";

export default function CodeLink({ type, name }: { readonly type: TypeString; readonly name: string }): JSX.Element {
    let path = "???";
    let [typeName, ...propNames] = name.split(".");
    propNames = propNames.map((n) => "#" + (n == "new" ? "new-view" : n.toLowerCase()));
    const link = typeName + (propNames.length > 0 ? propNames.join("") : "");
    switch (type) {
        case "class":
            path = `classes/${link}`;
            break;
        case "interface":
            path = `interfaces/${link}`;
            break;
        case "type":
            path = `type-aliases/${link}`;
            break;
        case "function":
            path = `functions/${link}`;
            break;
        case "enum":
            path = `enumerations/${link}`;
            break;
        case "variable":
            path = `variables/${link}`;
            break;
    }
    const url = useBaseUrl(`docs/web_api/api_reference/${path}`);
    return (
        <Link to={url}>
            <code>{name}</code>
        </Link>
    );
}
