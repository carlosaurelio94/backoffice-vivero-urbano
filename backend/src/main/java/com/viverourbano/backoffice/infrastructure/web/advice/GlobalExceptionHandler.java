package com.viverourbano.backoffice.infrastructure.web.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.NoSuchElementException;

/**
 * Manejador global de excepciones.
 * Usa el estándar RFC 9457 (Problem Details for HTTP APIs) que trae Spring Boot 3.
 * Así todos los errores tienen un formato JSON consistente.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 404 — recurso no encontrado.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ProblemDetail handleNotFound(NoSuchElementException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setType(URI.create("/errors/not-found"));
        return problem;
    }

    /**
     * 400 — error de validación de Bean Validation (@NotBlank, @NotNull, etc.).
     * Devuelve todos los campos inválidos con su mensaje de error.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setType(URI.create("/errors/validation"));
        problem.setTitle("Error de validación");

        // Construye un mapa campo → mensaje de error
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(java.util.stream.Collectors.toMap(
                        org.springframework.validation.FieldError::getField,
                        f -> f.getDefaultMessage() != null ? f.getDefaultMessage() : "inválido",
                        (a, b) -> a
                ));
        problem.setProperty("errors", errors);
        return problem;
    }

    /**
     * 500 — error no esperado. Loguea para debugging sin exponer detalles internos.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
        problem.setType(URI.create("/errors/internal"));
        return problem;
    }
}
