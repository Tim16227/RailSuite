import useDialogs from "./useDialogs";

// Dialoge
import TurnoutDialog from "../../layout/TurnoutDialog/TurnoutDialog";
import BlockPropertiesDialog from "../../layout/BlockPropertiesDialog/BlockPropertiesDialog";

export default function DialogManager() {
    const {
        dialog,
        close,
    } = useDialogs();

    switch (
        dialog.type
    ) {
        case "layout-turnout":
            return (
                <TurnoutDialog
                    {...dialog.props}
                    onClose={
                        close
                    }
                />
            );

        case "layout-block":
            return (
                <BlockPropertiesDialog
                    {...dialog.props}
                    onClose={
                        close
                    }
                />
            );

        default:
            return null;
    }
}