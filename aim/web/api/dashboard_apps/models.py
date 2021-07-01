import uuid
import sqlalchemy as sa

from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr

from aim.web.api.db import Base
from aim.web.api.utils import datetime_now


class AppMixin(object):
    uuid = sa.Column(sa.Text, primary_key=True)

    created_at = sa.Column(sa.DateTime, default=datetime_now)
    updated_at = sa.Column(sa.DateTime, default=datetime_now, onupdate=datetime_now)
    is_archived = sa.Column(sa.Boolean, default=False)

    @declared_attr
    def dashboard_id(cls):
        return sa.Column('dashboard_id', sa.ForeignKey('dashboards.uuid'))

    @declared_attr
    def dashboard(cls):
        return relationship("Dashboard")


class ExploreState(AppMixin, Base):
    __tablename__ = 'explore_states'

    chart_focused_step = sa.Column(sa.Integer)
    chart_focused_metric_run_hash = sa.Column(sa.Text)
    chart_focused_metric_metric_name = sa.Column(sa.Text)
    chart_focused_metric_trace_context = sa.Column(sa.Text)
    chart_focused_circle_active = sa.Column(sa.Boolean)
    chart_focused_circle_run_hash = sa.Column(sa.Text)
    chart_focused_circle_metric_name = sa.Column(sa.Text)
    chart_focused_circle_step = sa.Column(sa.Integer)
    chart_focused_circle_trace_context = sa.Column(sa.Text)
    chart_focused_circle_param = sa.Column(sa.Text)
    chart_focused_circle_content_type = sa.Column(sa.Text)
    chart_settings_zoom_mode = sa.Column(sa.Boolean)
    chart_settings_single_zoom_mode = sa.Column(sa.Boolean)
    chart_settings_zoom_history = sa.Column(sa.Text)  # list[tuple[str, dict[str, tuple[int, int]]]]
    chart_settings_highlight_mode = sa.Column(sa.Text)
    chart_settings_persistent_display_outliers = sa.Column(sa.Boolean)
    chart_settings_persistent_zoom = sa.Column(sa.Text)  # dict[str, dict[str, tuple[int, int]]]
    chart_settings_persistent_interpolate = sa.Column(sa.Boolean)
    chart_settings_persistent_indicator = sa.Column(sa.Boolean)
    chart_settings_persistent_x_alignment = sa.Column(sa.Text)  # str | tuple[str]
    chart_settings_persistent_x_scale = sa.Column(sa.Integer)
    chart_settings_persistent_y_scale = sa.Column(sa.Integer)
    chart_settings_persistent_points_count = sa.Column(sa.Integer)
    chart_settings_persistent_smoothing_algorithm = sa.Column(sa.Text)
    chart_settings_persistent_smooth_factor = sa.Column(sa.Float)
    chart_settings_persistent_aggregated = sa.Column(sa.Boolean)
    chart_hidden_metrics = sa.Column(sa.Text)  # list[str]
    chart_tooltip_options_display = sa.Column(sa.Boolean)
    chart_tooltip_options_fields = sa.Column(sa.Text)  # list[str]

    search_query = sa.Column(sa.Text)
    search_v = sa.Column(sa.Integer)

    search_input_value = sa.Column(sa.Text)
    search_input_select_input = sa.Column(sa.Text)
    search_input_select_condition_input = sa.Column(sa.Text)

    context_filter_group_by_color = sa.Column(sa.Text)  # list[str]
    context_filter_group_by_style = sa.Column(sa.Text)  # list[str]
    context_filter_group_by_chart = sa.Column(sa.Text)  # list[str]
    context_filter_group_against_color = sa.Column(sa.Boolean)
    context_filter_group_against_style = sa.Column(sa.Boolean)
    context_filter_group_against_chart = sa.Column(sa.Boolean)
    context_filter_aggregated_area = sa.Column(sa.Text)
    context_filter_aggregated_line = sa.Column(sa.Text)
    context_filter_seed_color = sa.Column(sa.Integer)
    context_filter_seed_style = sa.Column(sa.Integer)
    context_filter_persist_color = sa.Column(sa.Boolean)
    context_filter_persist_style = sa.Column(sa.Boolean)

    color_palette = sa.Column(sa.Integer)

    sort_fields = sa.Column(sa.Text)  # list[tuple[str, str]]

    table_row_height_mode = sa.Column(sa.Text)
    table_columns_order_left = sa.Column(sa.Text)  # list[str]
    table_columns_order_middle = sa.Column(sa.Text)  # list[str]
    table_columns_order_right = sa.Column(sa.Text)  # list[str]
    table_columns_widths = sa.Column(sa.Text)  # dict[str, int]
    table_excluded_fields = sa.Column(sa.Text)  # list[str]

    screen_view_mode = sa.Column(sa.Text)
    screen_panel_flex = sa.Column(sa.Float)

    def __init__(self):
        self.uuid = str(uuid.uuid1())
        self.is_archived = False
