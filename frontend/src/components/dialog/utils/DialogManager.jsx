import useDialogs from "./useDialogs";

// Dialoge
import TurnoutDialog from "../../layout/TurnoutDialog/TurnoutDialog";

export default function DialogManager() {
    const {
        dialog,
        close,
    } = useDialogs();

    switch (dialog.type) {
        case "layout-turnout":
            return (
                <TurnoutDialog
                    {...dialog.props}
                    onClose={close}
                />
            );

        default:
            return null;
    }
}