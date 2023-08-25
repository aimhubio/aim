from datetime import datetime

from llamaindex_logger import Experiment, Release

##################
# Utils
##################


def get_releases(query="", param=None):
    sessions = Release.filter(query)
    sessions = sorted(
        sessions,
        key=lambda sess: (sess["params"].get("version") or "0.0.0").split("."),
        reverse=True,
    )
    if param is not None:
        return [
            session.get(param) or session["params"].get(param) for session in sessions
        ]
    return sessions


def get_release(release_version):
    sessions = Release.filter(f'c.version == "{release_version}"')
    if sessions and len(sessions):
        return sessions[0]
    return None


def get_last_experiment(release_version):
    experiments = Experiment.filter(f'c.version == "{release_version}"')
    last = None
    for experiment in experiments:
        if last is None or not last["params"].get("started"):
            last = experiment
            continue
        if (
            experiment["params"].get("started")
            and last["params"]["started"] < experiment["params"]["started"]
        ):
            last = experiment
    return last


##################


def experiment(release_version):
    if not release_version:
        return

    exp = get_last_experiment(release_version)
    if not exp:
        ui.text("No experiment")
        return

    ui.subheader("Experiment")

    overview, memory, llm, tools, agent = ui.tabs(
        ["Overview", "Memory", "LLM", "Tools", "Agent"]
    )

    overview.json(
        {
            "release": exp["params"].get("release"),
            "version": exp["params"].get("version"),
            "started": datetime.fromtimestamp(exp["params"].get("started")).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            if exp["params"].get("started")
            else "-",
        }
    )

    memory.json(exp["params"].get("memory")) if exp["params"].get("memory") else None
    llm.json(exp["params"].get("llm")) if exp["params"].get("llm") else None
    tools.json(exp["params"].get("tools")) if exp["params"].get("tools") else None
    agent.json(exp["params"].get("agent")) if exp["params"].get("agent") else None


def release(release_version):
    release = get_release(release_version)
    if not release:
        ui.text("Pick a release")
        return

    ui.subheader("Release")
    ui.json(release)


##################
# Page
##################

# state is a dictionary that's available for each board.
# Think of it as reactJS props that can be passed down to a component.
try:
    release_version = state["dev/release.py"]["version"]
except:
    release_version = ""

releases = get_releases("", "version")
if releases:
    default_release = releases.index(release_version) if release_version != "" else 0
    release_version = ui.select(options=releases, index=default_release)

if release_version:
    release(release_version)
    experiment(release_version)
else:
    ui.header("No releases")
