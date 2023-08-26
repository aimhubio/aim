import json
from datetime import datetime

from llamaindex_logger import Experiment, Release, SessionDev

"""
This is a key page in this logger.

For long time we have been tracking code and its lineage as a way to make sure we have a complete picture of our software systems at any point in time.
Tracking the code was enough as it would describe the system deterministically.

The code however no longer deterministically describes the AI Systems.
Data, external APIs, internal models make it harder to base our conviction on the code.
The software development lifecycle is broken.
So we should track the whole System.

In this case System Lineage becomes a key artifact to track, observe and maintain so we can at any point know what is happening in our AI Systems.

The questions of what System Lineage means and how it should be visualized are to become a key topic as we deploy more and more of the AI Systems and reliability, robustness, safety become critical issues.

Aim fundamentally enables tracking of the relationships between all parts of the software and, retrieving them and visualizing them.
This is an amazing journey of discovery of what it means to track and visualize the System Lineage.

This specific view is just the start of it.
"""

##################
# Utils
##################


def get_experiment(session_hash):
    sessions = Experiment.filter(f'c.hash == "{session_hash}"')
    if sessions and len(sessions):
        return sessions[0]
    return None


def get_experiments(query="", param=None):
    sessions = Experiment.filter(query)
    sessions = sorted(
        sessions, key=lambda sess: sess["params"].get("started") or 0, reverse=True
    )
    if param is not None:
        return [session.get(param) for session in sessions]
    return sessions


def get_sessions(query="", param=None):
    sessions = SessionDev.filter(query)
    sessions = sorted(
        sessions, key=lambda sess: sess["params"].get("started") or 0, reverse=True
    )
    if param is not None:
        return [session.get(param) for session in sessions]
    return sessions


def get_releases(query="", param=None):
    sessions = Release.filter(query)
    sessions = sorted(
        sessions,
        key=lambda sess: (sess["params"].get("version") or "0.0.0").split("."),
        reverse=True,
    )
    if param is not None:
        return [session.get(param) for session in sessions]
    return sessions


##################


def experiments():
    ui.subheader("Experiments")
    experiments = get_experiments()
    if not experiments or not len(experiments):
        ui.text("No experiments yet")
        return

    table = ui.table(
        {
            "experiment": [sess["hash"] for sess in experiments],
            "version": [sess["params"].get("version") for sess in experiments],
            "time": [sess["params"].get("started") for sess in experiments],
            "open": [sess["hash"] for sess in experiments],
        },
        {
            "time": lambda x: ui.text(
                datetime.fromtimestamp(x).strftime("%Y-%m-%d %H:%M:%S")
                if x is not None
                else "-"
            ),
            "open": lambda x: ui.board_link(
                "dev/experiment.py", "Experiment Page", state={"experiment_hash": x}
            ),
        },
    )


def sessions_overview():
    sessions = get_sessions()

    if not sessions or not len(sessions):
        return

    ui.subheader("Dev Sessions")

    table = ui.table(
        {
            "session": [sess["hash"] for sess in sessions],
            "experiment": [sess["params"].get("experiment") for sess in sessions],
            "version": [sess["params"].get("chatbot_version") for sess in sessions],
            "model_name": [sess["params"].get("model") for sess in sessions],
            "available_tools": [
                (str([tool["name"] for tool in sess["params"]["available_tools"]]))
                if sess["params"].get("available_tools")
                else "-"
                for sess in sessions
            ],
            "time": [sess["params"].get("started") for sess in sessions],
            "open": [sess["hash"] for sess in sessions],
            "release": [sess["params"].get("chatbot_version") for sess in sessions],
        },
        {
            "time": lambda x: ui.text(
                datetime.fromtimestamp(x).strftime("%Y-%m-%d %H:%M:%S")
                if x is not None
                else "-"
            ),
            "open": lambda x: ui.board_link(
                "dev/dev_session.py", "Open", state={"session_hash": x}
            ),
            "release": lambda x: ui.board_link(
                "dev/release.py", "Release Page", state={"version": x}
            ),
        },
    )


def releases():
    releases = get_releases()

    if not releases or not len(releases):
        ui.text("No releases")
        return

    ui.subheader("Releases")

    table = ui.table(
        {
            "release": [sess["hash"] for sess in releases],
            "version": [sess["params"].get("version") for sess in releases],
            "time": [sess["params"].get("started") for sess in releases],
            "open": [sess["params"].get("version") for sess in releases],
        },
        {
            "time": lambda x: ui.text(
                datetime.fromtimestamp(x).strftime("%Y-%m-%d %H:%M:%S")
                if x is not None
                else "-"
            ),
            "open": lambda x: ui.board_link(
                "dev/release.py", "Open", state={"version": x}
            ),
        },
    )


##################
# Page
##################

ui.header("Chatbot System Lineage")

releases()
experiments()
sessions_overview()
