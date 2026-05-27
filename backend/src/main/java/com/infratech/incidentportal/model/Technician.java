package com.infratech.incidentportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "technicians")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String especialidad;

    @Builder.Default
    private boolean disponible = true;
}
