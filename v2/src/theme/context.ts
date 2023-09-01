import { createContext } from "react";

export const PlaygroundContext = createContext({
	runningPlaygroundId: "",
	setRunningPlaygroundId: (id: string) => {},
});
