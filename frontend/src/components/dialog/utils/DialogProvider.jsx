import { createContext, useState } from "react";

export const DialogContext = createContext(null);

export function DialogProvider({ children }) {

    const [dialog, setDialog] = useState({
        type: null,
        props: {},
    });

    function open(type, props = {}) {
        setDialog({
            type,
            props,
        });
    }

    function close() {
        setDialog({
            type: null,
            props: {},
        });
    }

    return (
        <DialogContext.Provider
            value={{
                dialog,
                open,
                close,
            }}
        >
            {children}
        </DialogContext.Provider>
    );
}
