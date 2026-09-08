import keycloak from "../auth/keycloak";

export async function listenToTurnoutEvents(
    onEvent,
    signal
) {
    await keycloak.updateToken(30);

    const response =
        await fetch(
            "/api/digital-events/turnouts",
            {
                method: "GET",
                headers: {
                    Accept:
                        "text/event-stream",
                    Authorization:
                        `Bearer ${keycloak.token}`,
                },
                signal,
            }
        );

    if (!response.ok) {
        throw new Error(
            `Turnout event stream failed: ${response.status}`
        );
    }

    if (!response.body) {
        throw new Error(
            "Turnout event stream has no response body"
        );
    }

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let buffer = "";

    while (!signal.aborted) {

        const {
            value,
            done,
        } = await reader.read();

        if (done) {
            break;
        }

        buffer +=
            decoder.decode(
                value,
                {
                    stream: true,
                }
            );

        const events =
            buffer.split(
                "\n\n"
            );

        buffer =
            events.pop() ?? "";

        for (
            const event of events
        ) {
            parseEvent(
                event,
                onEvent
            );
        }
    }
}

function parseEvent(
    event,
    onEvent
) {
    const lines =
        event.split("\n");

    let eventName = null;
    let data = "";

    for (
        const line of lines
    ) {
        if (
            line.startsWith(
                "event:"
            )
        ) {
            eventName =
                line.substring(
                    6
                ).trim();
        }

        if (
            line.startsWith(
                "data:"
            )
        ) {
            data +=
                line.substring(
                    5
                ).trim();
        }
    }

    if (
        eventName !==
        "turnout"
    ) {
        return;
    }

    if (!data) {
        return;
    }

    try {
        const parsed =
            JSON.parse(
                data
            );

        onEvent(
            parsed
        );

    } catch (error) {

        console.error(
            "Ungültiges Z21 turnout event:",
            data,
            error
        );
    }
}