import useDialogs from "./useDialogs";

// Dialoge
import CanteenDialog from "../../canteen/CanteenDialog/CanteenDialog";
import MealPlanDialog from "../../mealPlan/MealPlanDialog/MealPlanDialog";
import DishDialog from "../../dish/DishDialog/DishDialog";
import RegistrationDialog from "../../registration/RegistrationDialog/RegistrationDialog";

export default function DialogManager() {

    const { dialog, close } = useDialogs();

    switch (dialog.type) {

        case "canteen":
            return (
                <CanteenDialog
                    {...dialog.props}
                    onClose={close}
                />
            );

        case "mealPlan":
            return (
                <MealPlanDialog
                    {...dialog.props}
                    onClose={close}
                />
            );

        case "dish-delete":
            return (
                <DishDialog
                    {...dialog.props}
                    onClose={close}
                />
            );

        case "user-reg":
            return (
                <RegistrationDialog
                    {...dialog.props}
                    onClose={close}
                />
            );

        default:
            return null;

    }
}
