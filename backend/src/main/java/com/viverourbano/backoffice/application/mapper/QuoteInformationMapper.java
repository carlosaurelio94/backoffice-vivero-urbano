package com.viverourbano.backoffice.application.mapper;

import com.viverourbano.backoffice.application.dto.QuoteInformationDTO;
import com.viverourbano.backoffice.domain.model.QuoteInformation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuoteInformationMapper {
    QuoteInformationDTO toDto(QuoteInformation info);
}
