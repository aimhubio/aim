from datetime import datetime

from openai_logger import Experiment

# FIXIT:
# There is LOTS of repeat non-ui code in these files.
# To be moved to "server functions" once its available (to be shipped as part of stable)

# FIXIT:
# There is lots of repeat UI code that should be moved into template.
# This is exactly the same page as the one in release.
# In real world these would be different pages built on the same base.
# We need to enable __init__.py in the UI folders so devs can precisely define what files get rendered and what become reusable templates.


##################
# Utils
##################


def get_experiments(query="", param=None):
    sessions = Experiment.filter(query)
    sessions = sorted(
        sessions, key=lambda sess: sess["params"].get("started") or 0, reverse=True
    )
    if param is not None:
        return [session.get(param) for session in sessions]
    return sessions


def get_experiment(session_hash):
    sessions = Experiment.filter(f'c.hash == "{session_hash}"')
    if sessions and len(sessions):
        return sessions[0]
    return None


##################


def experiment(exp_hash):
    exp = get_experiment(exp_hash)
    if not exp:
        ui.text("Pick an experiment")
        return

    ui.header(f'Experiment "{exp_hash}"')

    overview, memory, llm, tools, agent = ui.tabs(
        ["Overview", "Memory", "LLM", "Tools", "Agent"]
    )

    overview.json(
        {
            "release": exp["params"].get("release"),
            "version": exp["params"].get("version"),
            "model": exp["params"].get("model"),
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
    
    

##################
# Page
##################

try:
    exp_hash = state["dev/experiment.py"]["experiment_hash"]
except:
    exp_hash = ""

experiments = get_experiments("", "hash")

if experiments:
    default_exp = experiments.index(exp_hash) if exp_hash != "" else 0
    exp_hash = ui.select(options=experiments, index=default_exp)
    experiment(exp_hash)
