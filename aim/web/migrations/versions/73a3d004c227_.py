"""empty message

Revision ID: 73a3d004c227
Revises: 5ae8371b7481
Create Date: 2021-08-31 20:57:56.503417

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73a3d004c227'
down_revision = '5ae8371b7481'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('commits')
    op.drop_table('explore_states')
    op.drop_table('commit_tag')
    op.drop_table('tf_summary_logs')
    op.drop_table('dashboards')
    op.drop_table('tags')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tags',
    sa.Column('uuid', sa.TEXT(), nullable=False),
    sa.Column('name', sa.TEXT(), nullable=True),
    sa.Column('color', sa.TEXT(), nullable=True),
    sa.Column('created_at', sa.DATETIME(), nullable=True),
    sa.Column('is_archived', sa.BOOLEAN(), nullable=True),
    sa.Column('is_hidden', sa.BOOLEAN(), nullable=True),
    sa.PrimaryKeyConstraint('uuid')
    )
    op.create_table('dashboards',
    sa.Column('uuid', sa.TEXT(), nullable=False),
    sa.Column('name', sa.TEXT(), nullable=True),
    sa.Column('description', sa.TEXT(), nullable=True),
    sa.Column('created_at', sa.DATETIME(), nullable=True),
    sa.Column('updated_at', sa.DATETIME(), nullable=True),
    sa.Column('is_archived', sa.BOOLEAN(), nullable=True),
    sa.PrimaryKeyConstraint('uuid')
    )
    op.create_table('tf_summary_logs',
    sa.Column('uuid', sa.TEXT(), nullable=False),
    sa.Column('log_path', sa.TEXT(), nullable=True),
    sa.Column('params', sa.TEXT(), nullable=True),
    sa.Column('created_at', sa.DATETIME(), nullable=True),
    sa.Column('is_archived', sa.BOOLEAN(), nullable=True),
    sa.PrimaryKeyConstraint('uuid')
    )
    op.create_table('commit_tag',
    sa.Column('commit_id', sa.TEXT(), nullable=True),
    sa.Column('tag_id', sa.TEXT(), nullable=True),
    sa.ForeignKeyConstraint(['commit_id'], ['commits.uuid'], ),
    sa.ForeignKeyConstraint(['tag_id'], ['tags.uuid'], )
    )
    op.create_table('explore_states',
    sa.Column('uuid', sa.TEXT(), nullable=False),
    sa.Column('created_at', sa.DATETIME(), nullable=True),
    sa.Column('updated_at', sa.DATETIME(), nullable=True),
    sa.Column('is_archived', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_focused_step', sa.INTEGER(), nullable=True),
    sa.Column('chart_focused_metric_run_hash', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_metric_metric_name', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_metric_trace_context', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_circle_active', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_focused_circle_run_hash', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_circle_metric_name', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_circle_step', sa.INTEGER(), nullable=True),
    sa.Column('chart_focused_circle_trace_context', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_circle_param', sa.TEXT(), nullable=True),
    sa.Column('chart_focused_circle_content_type', sa.TEXT(), nullable=True),
    sa.Column('chart_settings_zoom_mode', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_settings_single_zoom_mode', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_settings_zoom_history', sa.TEXT(), nullable=True),
    sa.Column('chart_settings_highlight_mode', sa.TEXT(), nullable=True),
    sa.Column('chart_settings_persistent_display_outliers', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_settings_persistent_zoom', sa.TEXT(), nullable=True),
    sa.Column('chart_settings_persistent_interpolate', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_settings_persistent_indicator', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_settings_persistent_x_alignment', sa.TEXT(), nullable=True),
    sa.Column('chart_settings_persistent_x_scale', sa.INTEGER(), nullable=True),
    sa.Column('chart_settings_persistent_y_scale', sa.INTEGER(), nullable=True),
    sa.Column('chart_settings_persistent_points_count', sa.INTEGER(), nullable=True),
    sa.Column('chart_settings_persistent_smoothing_algorithm', sa.TEXT(), nullable=True),
    sa.Column('chart_settings_persistent_smooth_factor', sa.FLOAT(), nullable=True),
    sa.Column('chart_settings_persistent_aggregated', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_hidden_metrics', sa.TEXT(), nullable=True),
    sa.Column('chart_tooltip_options_display', sa.BOOLEAN(), nullable=True),
    sa.Column('chart_tooltip_options_fields', sa.TEXT(), nullable=True),
    sa.Column('search_query', sa.TEXT(), nullable=True),
    sa.Column('search_v', sa.INTEGER(), nullable=True),
    sa.Column('search_input_value', sa.TEXT(), nullable=True),
    sa.Column('search_input_select_input', sa.TEXT(), nullable=True),
    sa.Column('search_input_select_condition_input', sa.TEXT(), nullable=True),
    sa.Column('context_filter_group_by_color', sa.TEXT(), nullable=True),
    sa.Column('context_filter_group_by_style', sa.TEXT(), nullable=True),
    sa.Column('context_filter_group_by_chart', sa.TEXT(), nullable=True),
    sa.Column('context_filter_group_against_color', sa.BOOLEAN(), nullable=True),
    sa.Column('context_filter_group_against_style', sa.BOOLEAN(), nullable=True),
    sa.Column('context_filter_group_against_chart', sa.BOOLEAN(), nullable=True),
    sa.Column('context_filter_aggregated_area', sa.TEXT(), nullable=True),
    sa.Column('context_filter_aggregated_line', sa.TEXT(), nullable=True),
    sa.Column('context_filter_seed_color', sa.INTEGER(), nullable=True),
    sa.Column('context_filter_seed_style', sa.INTEGER(), nullable=True),
    sa.Column('context_filter_persist_color', sa.BOOLEAN(), nullable=True),
    sa.Column('context_filter_persist_style', sa.BOOLEAN(), nullable=True),
    sa.Column('color_palette', sa.INTEGER(), nullable=True),
    sa.Column('sort_fields', sa.TEXT(), nullable=True),
    sa.Column('table_row_height_mode', sa.TEXT(), nullable=True),
    sa.Column('table_columns_order_left', sa.TEXT(), nullable=True),
    sa.Column('table_columns_order_middle', sa.TEXT(), nullable=True),
    sa.Column('table_columns_order_right', sa.TEXT(), nullable=True),
    sa.Column('table_columns_widths', sa.TEXT(), nullable=True),
    sa.Column('table_excluded_fields', sa.TEXT(), nullable=True),
    sa.Column('screen_view_mode', sa.TEXT(), nullable=True),
    sa.Column('screen_panel_flex', sa.FLOAT(), nullable=True),
    sa.Column('dashboard_id', sa.TEXT(), nullable=True),
    sa.ForeignKeyConstraint(['dashboard_id'], ['dashboards.uuid'], ),
    sa.PrimaryKeyConstraint('uuid')
    )
    op.create_table('commits',
    sa.Column('uuid', sa.TEXT(), nullable=False),
    sa.Column('hash', sa.TEXT(), nullable=True),
    sa.Column('experiment_name', sa.TEXT(), nullable=True),
    sa.Column('session_started_at', sa.INTEGER(), nullable=True),
    sa.Column('session_closed_at', sa.INTEGER(), nullable=True),
    sa.Column('created_at', sa.DATETIME(), nullable=True),
    sa.Column('is_archived', sa.BOOLEAN(), nullable=True),
    sa.PrimaryKeyConstraint('uuid'),
    sa.UniqueConstraint('experiment_name', 'hash')
    )
    # ### end Alembic commands ###
