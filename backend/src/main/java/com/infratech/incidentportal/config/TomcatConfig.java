package com.infratech.incidentportal.config;

import org.apache.coyote.http11.Http11NioProtocol;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {

    /**
     * Configura el límite máximo de tamaño de headers HTTP en Tomcat directamente
     * a nivel de protocolo, garantizando que los headers grandes (p.ej. cookies
     * de desarrollo) no provoquen un 400 Bad Request.
     */
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            if (connector.getProtocolHandler() instanceof Http11NioProtocol protocol) {
                // 1 MB = 1048576 bytes
                protocol.setMaxHttpRequestHeaderSize(1048576);
            }
        });
    }
}
