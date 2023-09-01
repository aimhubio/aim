from asp import Metric, SystemMetric

from openai_logger import Experiment, Release, SessionDev, SessionProd


def getReleasesCount():
    releases = Release.filter("")
    return len(releases)


def getProdSessionsCount():
    sessions = SessionProd.filter("")
    return len(sessions)


def getDevSessionsCount():
    sessions = SessionDev.filter("")
    return len(sessions)


def getExperimentsCount():
    exps = Experiment.filter("")
    return len(exps)


ui.header("ChatBot Logger HomePage")

overview_row, navigation_row = ui.rows(2)

table = overview_row.table(
    {
        "Releases": [getReleasesCount()],
        "Production Sessions": [getProdSessionsCount()],
        "Dev Sessions": [getDevSessionsCount()],
        "OpenAI Experiments": [getExperimentsCount()],
    }
)

col_system, col_prod, col_user, col_releases = navigation_row.columns(4)


with col_system:
    col_system.subheader("System Lineage")
    col_system.board_link("system_lineage.py", "Full System Lineage")
with col_prod:
    col_prod.subheader("Production Sessions")
    col_prod.board_link("production.py", "Production Overview")
with col_user:
    col_user.subheader("User Analytics")
    col_user.board_link("analytics.py", "User Page")
with col_releases:
    col_releases.subheader("Releases")
    col_releases.board_link("dev/release.py", "Releases")


ui.header("Token Usage per User Session")

# TODO: These metrics may not be fully useful by themselves. The in-progress server functions which enable registering specific functions in the logger and using it in the UI here, would allow lots of utilities such as creating the aggregate metrics of these.
all_metrics = Metric.filter("")
line_chart = ui.line_chart(all_metrics, x="steps", y="values")
line_chart.group("column", ["name"])
line_chart.group("row", ["container.hash"])

ui.header("System metrics across dev and prod sessions")

# TODO: currently this just queries everything. We need to enable querying sequences by container so tht we can only show the Prod Session System metrics
system_metrics = SystemMetric.filter("")
lc = ui.line_chart(system_metrics, x="steps", y="values")
lc.group("column", ["name"])
lc.group("row", ["hash"])
