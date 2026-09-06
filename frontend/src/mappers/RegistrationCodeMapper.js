import RegistrationCode from "../models/RegistrationCode";


export function toRegistrationCodeModel(dto) {

    return new RegistrationCode(dto);
}


export function toRegistrationCodeModels(dtos = []) {

    return dtos.map(toRegistrationCodeModel);
}


export function toRegistrationCodeDTO(model) {

    return {
        canteenId: model.canteen.id,
        membershipType: model.membershipType
    };
}