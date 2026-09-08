package de.railsuite.core.digital.protocol.z21;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class Z21TurnoutEventPublisher {

    private final Set<SseEmitter> emitters =
            ConcurrentHashMap.newKeySet();

    public SseEmitter subscribe() {
        SseEmitter emitter =
                new SseEmitter(0L);

        emitters.add(emitter);

        emitter.onCompletion(
                () -> emitters.remove(emitter)
        );

        emitter.onTimeout(
                () -> emitters.remove(emitter)
        );

        emitter.onError(
                error -> emitters.remove(emitter)
        );

        return emitter;
    }

    public void publish(
            Z21TurnoutEvent event
    ) {
        for (SseEmitter emitter : emitters) {

            try {
                emitter.send(
                        SseEmitter.event()
                                .name("turnout")
                                .data(event)
                );

            } catch (IOException exception) {

                emitters.remove(
                        emitter
                );

                emitter.completeWithError(
                        exception
                );
            }
        }
    }
}