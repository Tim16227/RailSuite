/*
 * Copyright (c) 2026 RailSuite. All rights reserved.
 *
 * File:        UserDTOMapper.java
 * Description: Mapper component responsible for converting between
 *              User entity objects and ViewCustomerDto instances.
 */
package de.railsuite.core.user.mapper;

import de.railsuite.core.user.User;
import de.railsuite.core.user.dto.ViewCustomerDTO;

public class UserDTOMapper {

    public static ViewCustomerDTO toDTO(User user) {
        ViewCustomerDTO viewCustomerDTO = new ViewCustomerDTO();

        viewCustomerDTO.setId(user.getId());
        viewCustomerDTO.setUsername(user.getUsername());
        viewCustomerDTO.setFirstName(user.getFirstName());
        viewCustomerDTO.setLastName(user.getLastName());
        viewCustomerDTO.setEmail(user.getEmail());
        viewCustomerDTO.setCreatedAt(user.getCreatedAt());
        viewCustomerDTO.setUpdatedAt(user.getUpdatedAt());

        return viewCustomerDTO;
    }

}
