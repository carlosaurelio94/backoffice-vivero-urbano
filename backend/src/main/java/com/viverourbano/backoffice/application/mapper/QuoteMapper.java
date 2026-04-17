package com.viverourbano.backoffice.application.mapper;

import com.viverourbano.backoffice.application.dto.QuoteDTO;
import com.viverourbano.backoffice.application.dto.QuoteItemDTO;
import com.viverourbano.backoffice.domain.model.Quote;
import com.viverourbano.backoffice.domain.model.QuoteItem;
import org.mapstruct.Mapper;

/** Mapea entre dominio Quote y QuoteDTO de respuesta. */
@Mapper(componentModel = "spring")
public interface QuoteMapper {
    QuoteDTO    toDto(Quote quote);
    QuoteItemDTO toItemDto(QuoteItem item);
}
