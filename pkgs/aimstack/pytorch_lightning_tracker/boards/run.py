run_hash = session_state.get('container_hash')

ui.board('experiment_tracker:run.py', state={'container_hash': run_hash})

ui.board_link('runs.py', "Back to all PL Runs")
