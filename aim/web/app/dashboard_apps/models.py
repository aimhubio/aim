import uuid

from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr

from aim.web.app.db import db
from aim.web.app.utils import datetime_now


class AppMixin(object):
    uuid = db.Column(db.Text, primary_key=True)

    created_at = db.Column(db.DateTime, default=datetime_now)
    updated_at = db.Column(db.DateTime, default=datetime_now, onupdate=datetime_now)
    is_archived = db.Column(db.Boolean, default=False)

    @declared_attr
    def dashboard_id(cls):
        return db.Column('dashboard_id', db.ForeignKey('dashboards.uuid'))

    @declared_attr
    def dashboard(cls):
        return relationship("Dashboard")


class ExploreState(AppMixin, db.Model):
    __tablename__ = 'explore_states'

    chart_focused_step = db.Column(db.Integer)
    chart_focused_metric_run_hash = db.Column(db.Text)
    chart_focused_metric_metric_name = db.Column(db.Text)
    chart_focused_metric_trace_context = db.Column(db.Text)
    chart_focused_circle_active = db.Column(db.Boolean)
    chart_focused_circle_run_hash = db.Column(db.Text)
    chart_focused_circle_metric_name = db.Column(db.Text)
    chart_focused_circle_step = db.Column(db.Integer)
    chart_focused_circle_trace_context = db.Column(db.Text)
    chart_focused_circle_param = db.Column(db.Text)
    chart_focused_circle_content_type = db.Column(db.Text)
    chart_settings_zoom_mode = db.Column(db.Boolean)
    chart_settings_single_zoom_mode = db.Column(db.Boolean)
    chart_settings_zoom_history = db.Column(db.Text)  # list[tuple[str, dict[str, tuple[int, int]]]]
    chart_settings_highlight_mode = db.Column(db.Text)
    chart_settings_persistent_display_outliers = db.Column(db.Boolean)
    chart_settings_persistent_zoom = db.Column(db.Text)  # dict[str, dict[str, tuple[int, int]]]
    chart_settings_persistent_interpolate = db.Column(db.Boolean)
    chart_settings_persistent_indicator = db.Column(db.Boolean)
    chart_settings_persistent_x_alignment = db.Column(db.Text)  # str | tuple[str]
    chart_settings_persistent_x_scale = db.Column(db.Integer)
    chart_settings_persistent_y_scale = db.Column(db.Integer)
    chart_settings_persistent_points_count = db.Column(db.Integer)
    chart_settings_persistent_smoothing_algorithm = db.Column(db.Text)
    chart_settings_persistent_smooth_factor = db.Column(db.Float)
    chart_settings_persistent_aggregated = db.Column(db.Boolean)
    chart_hidden_metrics = db.Column(db.Text)  # list[str]
    chart_tooltip_options_display = db.Column(db.Boolean)
    chart_tooltip_options_fields = db.Column(db.Text)  # list[str]

    search_query = db.Column(db.Text)
    search_v = db.Column(db.Integer)

    search_input_value = db.Column(db.Text)
    search_input_select_input = db.Column(db.Text)
    search_input_select_condition_input = db.Column(db.Text)

    context_filter_group_by_color = db.Column(db.Text)  # list[str]
    context_filter_group_by_style = db.Column(db.Text)  # list[str]
    context_filter_group_by_chart = db.Column(db.Text)  # list[str]
    context_filter_group_against_color = db.Column(db.Boolean)
    context_filter_group_against_style = db.Column(db.Boolean)
    context_filter_group_against_chart = db.Column(db.Boolean)
    context_filter_aggregated_area = db.Column(db.Text)
    context_filter_aggregated_line = db.Column(db.Text)
    context_filter_seed_color = db.Column(db.Integer)
    context_filter_seed_style = db.Column(db.Integer)
    context_filter_persist_color = db.Column(db.Boolean)
    context_filter_persist_style = db.Column(db.Boolean)

    color_palette = db.Column(db.Integer)

    sort_fields = db.Column(db.Text)  # list[tuple[str, str]]

    table_row_height_mode = db.Column(db.Text)
    table_columns_order_left = db.Column(db.Text)  # list[str]
    table_columns_order_middle = db.Column(db.Text)  # list[str]
    table_columns_order_right = db.Column(db.Text)  # list[str]
    table_columns_widths = db.Column(db.Text)  # dict[str, int]
    table_excluded_fields = db.Column(db.Text)  # list[str]

    screen_view_mode = db.Column(db.Text)
    screen_panel_flex = db.Column(db.Float)

    def __init__(self):
        self.uuid = str(uuid.uuid1())
        self.is_archived = False
