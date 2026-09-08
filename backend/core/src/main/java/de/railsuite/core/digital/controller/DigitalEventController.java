package de.railsuite.core.digital.controller;

import de.railsuite.core.digital.protocol.z21.Z21TurnoutEventPublisher;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/digital-events")
public class DigitalEventController {

    private final Z21TurnoutEventPublisher publisher;

    public DigitalEventController(
            Z21TurnoutEventPublisher publisher
    ) {
        this.publisher = publisher;
    }

    @GetMapping(
            value = "/turnouts",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter turnoutEvents() {
        return publisher.subscribe();
    }
}