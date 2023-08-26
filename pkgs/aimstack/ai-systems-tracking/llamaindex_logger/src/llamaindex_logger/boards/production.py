import json
from datetime import datetime

from llamaindex_logger import MessagesSequence, ChunkSequence, SessionProd

##################
# Utils
##################


def get_sessions(query="", param=None):
    sessions = SessionProd.filter(query)
    sessions = sorted(
        sessions, key=lambda sess: sess["params"].get("started") or 0, reverse=True
    )
    if param is not None:
        return [session.get(param) for session in sessions]
    return sessions


##################


def sessions_overview():
    # TODO: Add search here once the component is ready.
    query = ""

    sessions = get_sessions(query)

    table = ui.table(
        {
            "session": [sess["hash"] for sess in sessions],
            "version": [sess["params"].get("chatbot_version") for sess in sessions],
            "model_name": [sess["params"].get("model") for sess in sessions],
            "available_tools": [
                (str([tool["name"] for tool in sess["params"]["available_tools"]]))
                if sess["params"].get("available_tools")
                else "-"
                for sess in sessions
            ],
            "username": [sess["params"].get("username") for sess in sessions],
            "time": [sess["params"].get("started") for sess in sessions],
            "open": [sess["hash"] for sess in sessions],
            "release": [sess["params"].get("chatbot_version") for sess in sessions],
        },
        {
            "username": lambda x: x if x is not None else "-",
            "time": lambda x: ui.text(
                datetime.fromtimestamp(x).strftime("%Y-%m-%d %H:%M:%S")
                if x is not None
                else "-"
            ),
            "open": lambda x: ui.board_link(
                "prod_session.py", "Open", state={"session_hash": x}
            ),
            "release": lambda x: ui.board_link(
                "development/release.py", "Release Page", state={"version": x}
            ),
        },
    )

    if table.focused_row:
        history(table.focused_row["session"])
        chunks(table.focused_row["session"])


def history(session_hash):
    if not session_hash:
        return

    qa_sequences = MessagesSequence.filter(
        f's.name == "messages" and c.hash == "{session_hash}"'
    )

    ui.subheader(f"History: {qa_sequences[0]['context']['type']}")

    if qa_sequences and len(qa_sequences):
        history_table = ui.table(
            {
                "prompt": [r["prompt"] for r in qa_sequences],
                "response": [r["response"] for r in qa_sequences],
                "index": [step for (step, _) in enumerate(qa_sequences)],
            }
        )

        if history_table.focused_row:
            ui.subheader("Agent actions")
            step = history_table.focused_row["index"]
            ui.json(qa_sequences[step])

    else:
        ui.text("No message history")


def chunks(session_hash):
    if not session_hash:
        return

    qa_sequences = ChunkSequence.filter(
        f's.name == "document" and c.hash == "{session_hash}"'
    )

    ui.subheader("Chunks")

    if qa_sequences and len(qa_sequences):
        chunks_table = ui.table(
            {
                "id": [r["id"] for r in qa_sequences],
                "chunk": [r["chunk"] for r in qa_sequences],
                "index": [step for (step, _) in enumerate(qa_sequences)],
            }
        )

        if chunks_table.focused_row:
            ui.subheader("Agent actions")
            step = chunks_table.focused_row["index"]
            ui.json(qa_sequences[step])

    else:
        ui.text("No chunk history")


##################
# Page
##################

ui.header("Production Monitoring")

sessions_overview()
