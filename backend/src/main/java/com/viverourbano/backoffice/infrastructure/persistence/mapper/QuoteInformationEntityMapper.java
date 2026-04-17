package com.viverourbano.backoffice.infrastructure.persistence.mapper;

import com.viverourbano.backoffice.domain.model.QuoteInformation;
import com.viverourbano.backoffice.infrastructure.persistence.entity.QuoteInformationEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuoteInformationEntityMapper {
    QuoteInformation toDomain(QuoteInformationEntity entity);
    QuoteInformationEntity toEntity(QuoteInformation domain);
}
