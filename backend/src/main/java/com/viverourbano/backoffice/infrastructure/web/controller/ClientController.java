package com.viverourbano.backoffice.infrastructure.web.controller;

import com.viverourbano.backoffice.application.dto.ClientDTO;
import com.viverourbano.backoffice.application.dto.CreateClientRequest;
import com.viverourbano.backoffice.application.dto.PagedResponse;
import com.viverourbano.backoffice.application.usecase.ClientUseCase;
import com.viverourbano.backoffice.domain.model.ClientStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controlador REST para la gestión de clientes.
 * Expuesto en /api/v1/clients
 *
 * @Tag → documenta el grupo en Swagger UI
 */
@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Gestión de clientes y prospectos")
public class ClientController {

    private final ClientUseCase clientUseCase;

    @GetMapping
    @Operation(summary = "Listar clientes", description = "Devuelve clientes paginados con filtros opcionales")
    public ResponseEntity<PagedResponse<ClientDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ClientStatus status
    ) {
        return ResponseEntity.ok(clientUseCase.listClients(page, size, search, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<ClientDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientUseCase.getById(id));
    }

    @PostMapping
    @Operation(summary = "Crear cliente")
    public ResponseEntity<ClientDTO> create(
            @Valid @RequestBody CreateClientRequest request,
            @RequestHeader(value = "X-Device-Id", defaultValue = "unknown") String deviceId
    ) {
        ClientDTO created = clientUseCase.create(request, deviceId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cliente (soft delete)")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Device-Id", defaultValue = "unknown") String deviceId
    ) {
        clientUseCase.delete(id, deviceId);
        return ResponseEntity.noContent().build();
    }
}
