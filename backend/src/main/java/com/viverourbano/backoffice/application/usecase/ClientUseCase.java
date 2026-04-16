package com.viverourbano.backoffice.application.usecase;

import com.viverourbano.backoffice.application.dto.ClientDTO;
import com.viverourbano.backoffice.application.dto.CreateClientRequest;
import com.viverourbano.backoffice.application.dto.PagedResponse;
import com.viverourbano.backoffice.application.mapper.ClientMapper;
import com.viverourbano.backoffice.domain.model.Client;
import com.viverourbano.backoffice.domain.model.ClientStatus;
import com.viverourbano.backoffice.domain.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Caso de uso para la gestión de clientes.
 * Aquí vive la lógica de negocio — orquesta dominio y repositorio.
 *
 * @Service lo registra como bean de Spring
 * @RequiredArgsConstructor genera el constructor para inyección de dependencias (Lombok)
 */
@Service
@RequiredArgsConstructor
public class ClientUseCase {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    /**
     * Lista clientes con paginación y filtros opcionales.
     */
    public PagedResponse<ClientDTO> listClients(int page, int size, String search, ClientStatus status) {
        List<Client> clients = clientRepository.findAll(page, size, search, status);
        long total = clientRepository.count(search, status);
        List<ClientDTO> dtos = clients.stream().map(clientMapper::toDto).toList();
        return PagedResponse.of(dtos, total, page, size);
    }

    /**
     * Busca un cliente por ID. Lanza excepción si no existe o está eliminado.
     */
    public ClientDTO getById(UUID id) {
        return clientRepository.findById(id)
                .filter(c -> !c.deleted())
                .map(clientMapper::toDto)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado: " + id));
    }

    /**
     * Crea un nuevo cliente a partir del request y el identificador del dispositivo.
     */
    public ClientDTO create(CreateClientRequest request, String deviceId) {
        Client client = Client.create(
                request.name(),
                request.address(),
                request.rif(),
                request.phone(),
                request.clientStatus(),
                deviceId
        );
        return clientMapper.toDto(clientRepository.save(client));
    }

    /**
     * Soft-delete: marca el cliente como eliminado sin borrarlo de la base de datos.
     */
    public void delete(UUID id, String deviceId) {
        clientRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado: " + id));
        clientRepository.deleteById(id, deviceId);
    }
}
