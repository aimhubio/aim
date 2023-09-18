from collections import Counter
from datetime import datetime

from llamaindex_logger import SessionProd, UserActions, UserActivity

##################
# Utils
##################


def get_user(username):
    sessions = UserActivity.filter(f'c.username == "{username}"')
    if sessions and len(sessions):
        return sessions[0]
    return None


def get_users(query='', param=None):
    sessions = UserActivity.filter(query)
    sessions = sorted(
        sessions, key=lambda sess: sess['params'].get('username') or '', reverse=False
    )
    if param is not None:
        return [
            session.get(param) or session['params'].get(param) for session in sessions
        ]
    return sessions


def daily_count(unix_time_array):
    # Convert the array to datetime
    datetime_array = [
        datetime.fromtimestamp(unix_time).date() for unix_time in unix_time_array
    ]

    # Count occurrences per day
    counter = Counter(datetime_array)

    # Build list of tuples for output
    return {
        'date': [
            date.strftime('%Y-%m-%d %H:%M:%S')
            for date, count in sorted(counter.items())
        ],
        'count': [count for date, count in sorted(counter.items())],
    }


def hourly_count(unix_time_array):
    # Convert the array to datetime
    datetime_array = [
        datetime.fromtimestamp(unix_time).replace(minute=0, second=0)
        for unix_time in unix_time_array
    ]

    # Count occurrences per hour
    counter = Counter(datetime_array)

    # Build list of tuples for output
    return {
        'date': [
            date.strftime('%Y-%m-%d %H:%M:%S')
            for date, count in sorted(counter.items())
        ],
        'count': [count for date, count in sorted(counter.items())],
    }


##################


def overview(username):
    if not username:
        ui.text('Pick a user')
        return

    user = get_user(username)
    if not user:
        ui.text('User not found')
        return

    ui.header(f'User Activity: "{user["params"].get("username")}"')
    # ui.json(user)


def user_sessions(username):
    user = get_user(username)
    if not user:
        return

    all_user_sessions = SessionProd.filter(f'c.username == "{username}"')
    ui.text(f"Sessions count: {len(all_user_sessions)}")

    # ui.json(all_user_sessions)
    timestamps = [
        session['params'].get('started') or 0 for session in all_user_sessions
    ]
    if not timestamps:
        return

    controls_row = ui.rows(1)[0]

    breakdown_type = controls_row.toggle_button(
        'Breakdown by:', left_value='Days', right_value='Hours'
    )

    if breakdown_type == 'Hours':
        data = hourly_count(timestamps)
    else:
        data = daily_count(timestamps)

    vis_tye = controls_row.toggle_button(
        'Visualize via:', left_value='Table', right_value='Chart'
    )

    if vis_tye == 'Table':
        ui.table(data)
    else:
        d = []
        for i in zip(data['date'], data['count']):
            d.append(
                {
                    'date': i[0],
                    'count': i[1],
                    'name': str(i[0]),
                }
            )
        ui.bar_chart(data=d, x='date', y='count', color=['name'])


##################
# Page
##################

try:
    username = state['analytics.py']['username']
except:
    username = ''

users = get_users('', 'username')
if users:
    default_user = users.index(username) if username != '' else 0
    username = ui.select(options=users, index=default_user)

if username:
    overview(username)
    user_sessions(username)
else:
    ui.header('No users')
