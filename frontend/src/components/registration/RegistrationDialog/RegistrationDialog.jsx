import "./RegistrationDialog.css";

import { useState } from "react";
import { toast } from "react-toastify";

import Dialog from "../../dialog/Dialog/Dialog";
import { createNewRegistrationCode } from "../../../services/registrationCodeService";

export default function RegistrationDialog({
    canteens = [],
    onClose,
    onCreated,
}) {

    const [form, setForm] = useState({
        canteenId: "",
    });


    function handleChange(e) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }


    async function handleSubmit(e) {
        e.preventDefault();


        if (!form.canteenId) {
            toast.error("Bitte eine Kantine auswählen.");
            return;
        }


        try {

            const registration = await createNewRegistrationCode({
                canteenId: Number(form.canteenId),
                membershipType: "CUSTOMER",
            });


            onCreated?.(registration);


            toast.success(
                "Registrierungscode erfolgreich erstellt."
            );


            onClose();


        } catch (error) {

            console.error(error);


            toast.error(
                error?.response?.data?.message ??
                error?.message ??
                "Fehler beim Erstellen des Registrierungscodes."
            );

        }
    }


    return (
        <Dialog
            title="Registrierungscode erstellen"
            onClose={onClose}
            onSubmit={handleSubmit}
        >

            <div className="form-row">

                <label>
                    Kantine
                </label>


                <select
                    name="canteenId"
                    value={form.canteenId}
                    onChange={handleChange}
                    required
                >

                    <option value="">
                        Bitte auswählen...
                    </option>


                    {canteens.map(canteen => (

                        <option
                            key={canteen.id}
                            value={canteen.id}
                        >
                            {canteen.name}
                        </option>

                    ))}

                </select>

            </div>

        </Dialog>
    );
}