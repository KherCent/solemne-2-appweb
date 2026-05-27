# Portal de Gestión de Incidentes - InfraTech S.A.

Este es un portal interno para la gestión de incidentes técnicos de la empresa InfraTech S.A. Permite a los colaboradores registrar, asignar, resolver y filtrar incidentes, visualizar estadísticas de rendimiento y exportar informes en PDF.

## Arquitectura del Proyecto
El proyecto está dividido en dos partes principales:
- **Backend**: Construido con Spring Boot (Java 17) y JPA/PostgreSQL.
- **Frontend**: Desarrollado con Angular (v17+) con arquitectura modular y standalone components.

## Cómo Ejecutar el Proyecto

### 1. Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js (v18+) y Angular CLI (opcional, para desarrollo local sin Docker).
- Java JDK 17 y Maven (opcional, para desarrollo local sin Docker).

### 2. Ejecución con Docker (Recomendado)
Para levantar todo el entorno (Base de datos PostgreSQL, Backend y Frontend), ejecute el siguiente comando en la raíz del proyecto:
```bash
docker-compose up --build
```
Una vez que los contenedores estén listos, podrá acceder a:
- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:8080`
- **Base de datos**: PostgreSQL corriendo en el puerto `5432`

---

*Desarrollado por Jorge Kevin Herrera Centellas.*
