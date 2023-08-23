import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";

export type TypeString = "class" | "interface" | "type" | "function" | "enum" | "variable";

export default function CodeLink({ type, name }: { readonly type: TypeString; readonly name: string; }): JSX.Element {
  let path = "???";
  let [typeName, ...propNames] = name.split(".");
  propNames = propNames.map((n) => "#" + (n == "new" ? "new-view" : n.toLowerCase()));
  const link = typeName + (propNames.length > 0 ? propNames.join("") : "");
  switch (type) {
    case "class":
      path = `Classes/class.${link}`;
      break;
    case "interface":
      path = `Interfaces/interface.${link}`;
      break;
    case "type":
      path = `Type Aliases/type-alias.${link}`;
      break;
    case "function":
      path = `Functions/function.${link}`;
      break;
    case "enum":
      path = `Enumerations/enumeration.${link}`;
      break;
    case "variable":
      path = `Variables/variable.${link}`;
      break;
  }
  const url = useBaseUrl(`docs/web_api/${path}`);
  return (
    <Link to={url}>
      <code>{name}</code>
    </Link>
  );
};
