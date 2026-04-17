package com.viverourbano.backoffice.application.dto;

import com.viverourbano.backoffice.domain.model.QuoteStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateQuoteStatusRequest(@NotNull QuoteStatus status) {}
