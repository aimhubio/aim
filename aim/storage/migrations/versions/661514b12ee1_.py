"""empty message

Revision ID: 661514b12ee1
Revises: 46b89d830ad8
Create Date: 2025-06-05 19:52:31.221392

"""
from alembic import op
import sqlalchemy as sa
from alembic.context import get_context


# revision identifiers, used by Alembic.
revision = '661514b12ee1'
down_revision = '46b89d830ad8'
branch_labels = None
depends_on = None



def upgrade():
    # Get the SQLite connection context
    context = get_context()
    naming_convention = {
        "fk":
            "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
    # Use batch operations for SQLite
    with op.batch_alter_table('run_tag', naming_convention=naming_convention) as batch_op:
        # First drop the existing foreign key
        batch_op.drop_constraint('fk_run_tag_run_id_run', type_='foreignkey')
        batch_op.drop_constraint('fk_run_tag_tag_id_tag', type_='foreignkey')

        # Then create a new one with CASCADE
        batch_op.create_foreign_key('fk_run_tag_run_id_run', 'run', ['run_id'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key('fk_run_tag_tag_id_tag', 'tag', ['tag_id'], ['id'], ondelete='CASCADE')


    with op.batch_alter_table('note', naming_convention=naming_convention) as batch_op:
        # First drop the existing foreign key
        batch_op.drop_constraint('fk_note_run_id_run', type_='foreignkey')

        # Then create a new one with CASCADE
        batch_op.create_foreign_key('fk_note_run_id_run', 'run', ['run_id'], ['id'], ondelete='CASCADE')


def downgrade():
    # Use batch operations for SQLite
    naming_convention = {
        "fk":
            "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
    # Use batch operations for SQLite
    with op.batch_alter_table('run_tag', naming_convention=naming_convention) as batch_op:
        # Drop the CASCADE foreign key
        batch_op.drop_constraint('fk_run_tag_run_id_run', type_='foreignkey')
        batch_op.drop_constraint('fk_run_tag_tag_id_tag', type_='foreignkey')

        # Then create a new one with CASCADE
        batch_op.create_foreign_key('fk_run_tag_run_id_run', 'run', ['run_id'], ['id'],)
        batch_op.create_foreign_key('fk_run_tag_tag_id_tag', 'tag', ['tag_id'], ['id'],)

    with op.batch_alter_table('note', naming_convention=naming_convention) as batch_op:
        # First drop the existing foreign key
        batch_op.drop_constraint('fk_note_run_id_run', type_='foreignkey')

        # Then create a new one with CASCADE
        batch_op.create_foreign_key('fk_note_run_id_run', 'run', ['run_id'], ['id'],)

