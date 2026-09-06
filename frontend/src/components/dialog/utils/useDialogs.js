import { useContext } from "react";
import { DialogContext } from "./DialogProvider";

export default function useDialogs() {
    const context = useContext(DialogContext);

    if (!context) {
        throw new Error("useDialogs muss innerhalb eines DialogProviders verwendet werden.");
    }

    return context;
}
