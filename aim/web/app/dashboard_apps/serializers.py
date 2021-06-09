from aim.web.app.dashboard_apps.models import ExploreState
from aim.web.app.utils import BaseModelSerializer, BaseSerializer, Field, ModelField, json_loads_or_none


def explore_state_response_serializer(es_object):
    if not isinstance(es_object, ExploreState):
        return None

    response_schema = {
        'id': es_object.uuid,
        'updated_at': es_object.updated_at,
        'created_at': es_object.created_at,
        'app_state': {
            'chart': {
                'focused': {
                    'step': es_object.chart_focused_step,
                    'metric': {
                        'runHash': es_object.chart_focused_metric_run_hash,
                        'metricName': es_object.chart_focused_metric_metric_name,
                        'traceContext': es_object.chart_focused_metric_trace_context,
                    },
                    'circle': {
                        'active': es_object.chart_focused_circle_active,
                        'runHash': es_object.chart_focused_circle_run_hash,
                        'metricName': es_object.chart_focused_circle_metric_name,
                        'traceContext': es_object.chart_focused_metric_trace_context,
                        'step': es_object.chart_focused_circle_step,
                    },
                    'settings': {
                        'zoomMode': es_object.chart_settings_zoom_mode,
                        'singleZoomMode': es_object.chart_settings_single_zoom_mode,
                        'zoomHistory': json_loads_or_none(es_object.chart_settings_zoom_history),
                        'highlightMode': es_object.chart_settings_highlight_mode,
                        'persistent': {
                            'displayOutliers': es_object.chart_settings_persistent_display_outliers,
                            'zoom': json_loads_or_none(es_object.chart_settings_persistent_zoom),
                            'indicator': es_object.chart_settings_persistent_indicator,
                            'xAlignment': json_loads_or_none(es_object.chart_settings_persistent_x_alignment),
                            'xScale': es_object.chart_settings_persistent_x_scale,
                            'yScale': es_object.chart_settings_persistent_y_scale,
                            'pointsCount': es_object.chart_settings_persistent_points_count,
                            'smoothingAlgorithm': es_object.chart_settings_persistent_smoothing_algorithm,
                            'smoothFactor': es_object.chart_settings_persistent_smooth_factor,
                            'aggregated': es_object.chart_settings_persistent_aggregated,
                        },
                    },
                    'hiddenMetrics': json_loads_or_none(es_object.chart_hidden_metrics),
                },
            },
            'search': {
                'query': es_object.search_query,
                'v': es_object.search_v,
            },
            'searchInput': {
                'value': es_object.search_input_value,
                'selectInput': es_object.search_input_select_input,
                'selectConditionInput': es_object.search_input_select_condition_input,
            },
            'contextFilter': {
                'groupByColor': json_loads_or_none(es_object.context_filter_group_by_color),
                'groupByStyle': json_loads_or_none(es_object.context_filter_group_by_style),
                'groupByChart': json_loads_or_none(es_object.context_filter_group_by_chart),
                'groupAgainst': {
                    'color': es_object.context_filter_group_against_color,
                    'style': es_object.context_filter_group_against_style,
                    'chart': es_object.context_filter_group_against_chart,
                },
                'aggregatedArea': es_object.context_filter_aggregated_area,
                'aggregatedLine': es_object.context_filter_aggregated_line,
                'seed': {
                    'color': es_object.context_filter_seed_color,
                    'style': es_object.context_filter_seed_style,
                },
                'persist': {
                    'color': es_object.context_filter_persist_color,
                    'style': es_object.context_filter_seed_style,
                }
            },
            'colorPalette': es_object.color_palette,
            'sortFields': json_loads_or_none(es_object.sort_fields),
            'rowHeightMode': es_object.row_height_mode,
            'columnsOrder': {
                'left': json_loads_or_none(es_object.columns_order_left),
                'middle': json_loads_or_none(es_object.columns_order_middle),
                'right': json_loads_or_none(es_object.columns_order_right),
            },
            'columnsWidth': json_loads_or_none(es_object.columns_width),
            'excludedFields': json_loads_or_none(es_object.excluded_fields),
            'viewMode': es_object.view_mode,
            'panelFlex': es_object.panel_flex,
        }
    }

    return response_schema


class ExploreStateModelSerializer(BaseModelSerializer):
    class ChartSerializer(BaseSerializer):
        class FocusedSerializer(BaseSerializer):
            class MetricSerializer(BaseSerializer):
                chart_focused_metric_run_hash = ModelField(type=str, source='runHash')
                chart_focused_metric_metric_name = ModelField(type=str, source='metricName')
                chart_focused_metric_trace_context = ModelField(type=str, source='traceContext')

            class CircleSerializer(BaseSerializer):
                chart_focused_circle_active = ModelField(type=bool)
                chart_focused_circle_run_hash = ModelField(type=str, source='runHash')
                chart_focused_circle_metric_name = ModelField(type=str, source='metricName')
                chart_focused_circle_trace_context = ModelField(type=str, source='traceContext')
                chart_focused_circle_step = ModelField(type=int, source='step')

            metric = Field(type=MetricSerializer)
            circle = Field(type=CircleSerializer)
            chart_focused_step = ModelField(type=int, source='step')

        class SettingsSerializer(BaseSerializer):
            class PersistentSerializer(BaseSerializer):
                chart_settings_persistent_display_outliers = ModelField(type=bool, source='displayOutliers')
                chart_settings_persistent_zoom = ModelField(type=dict, source='zoom')
                chart_settings_persistent_indicator = ModelField(type=bool, source='indicator')
                chart_settings_persistent_x_alignment = ModelField(type=(str, list), source='xAlignment')
                chart_settings_persistent_x_scale = ModelField(type=int, source='xScale')
                chart_settings_persistent_y_scale = ModelField(type=int, source='yScale')
                chart_settings_persistent_points_count = ModelField(type=int, source='pointsCount')
                chart_settings_persistent_smoothing_algorithm = ModelField(type=str, source='smoothingAlgorithm')
                chart_settings_persistent_smooth_factor = ModelField(type=float, source='smoothFactor')
                chart_settings_persistent_aggregated = ModelField(type=bool, source='aggregated')

            chart_settings_zoom_mode = ModelField(type=bool, source='zoomMode')
            chart_settings_single_zoom_mode = ModelField(type=bool, source='singleZoomMode')
            chart_settings_zoom_history = ModelField(type=bool,
                                                     source='zoomHistory')  # list[tuple[str, dict[str, tuple[int, int]]]]
            chart_settings_highlight_mode = ModelField(type=str, source='highlightMode')
            persistent = Field(type=PersistentSerializer)

        focused = Field(type=FocusedSerializer)
        settings = Field(type=SettingsSerializer)
        chart_hidden_metrics = ModelField(type=list, source='hiddenMetrics')

    class SearchSerializer(BaseSerializer):
        search_query = ModelField(type=str, source='query')
        search_v = ModelField(type=str, source='v')

    class SearchInputSerializer(BaseSerializer):
        search_input_value = ModelField(type=str, source='value')
        search_input_select_input = ModelField(type=str, source='selectInput')
        search_input_select_condition_input = ModelField(type=str, source='selectConditionInput')

    class ContextFilterSerializer(BaseSerializer):
        class GroupAgainstSerializer(BaseSerializer):
            context_filter_group_against_color = ModelField(type=list, source='groupByColor')
            context_filter_group_against_style = ModelField(type=list, source='groupByColor')
            context_filter_group_against_chart = ModelField(type=list, source='groupByColor')

        class SeedSerializer(BaseSerializer):
            context_filter_seed_color = ModelField(type=int, source='color')
            context_filter_seed_style = ModelField(type=int, source='style')

        class PersistSerializer(BaseSerializer):
            context_filter_persist_color = ModelField(type=int, source='color')
            context_filter_persist_style = ModelField(type=int, source='style')

        context_filter_group_by_color = ModelField(type=list, source='groupByColor')
        context_filter_group_by_style = ModelField(type=list, source='groupByStyle')
        context_filter_group_by_chart = ModelField(type=list, source='groupByChart')
        context_filter_aggregated_area = ModelField(type=str, source='aggregatedArea')
        context_filter_aggregated_line = ModelField(type=str, source='aggregatedLine')
        group_against = Field(type=GroupAgainstSerializer, source='groupAgainst')
        seed = Field(type=SeedSerializer)
        persist = Field(type=PersistSerializer)

    class ColumnsOrderSerializer(BaseSerializer):
        columns_order_left = ModelField(type=list, source='left')
        columns_order_middle = ModelField(type=list, source='middle')
        columns_order_right = ModelField(type=list, source='right')

    chart = Field(type=ChartSerializer)
    search = Field(type=SearchSerializer)
    search_input = Field(type=SearchInputSerializer, source='searchInput')
    context_filter = Field(type=ContextFilterSerializer, source='contextFilter')
    color_palette = ModelField(type=int, source='colorPalette')
    sort_fields = ModelField(type=list, source='sortFields')
    row_height_mode = ModelField(type=str, source='rowHeightMode')
    columns_order = Field(type=ColumnsOrderSerializer, source='columnsOrder')
    columns_width = ModelField(type=dict, source='columnsWidth')
    excluded_fields = ModelField(type=list, source='excludedFields')
    view_mode = ModelField(type=str, source='viewMode')
    panel_flex = ModelField(type=float, source='panelFlex')
