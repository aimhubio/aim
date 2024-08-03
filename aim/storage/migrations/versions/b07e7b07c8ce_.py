"""empty message

Revision ID: b07e7b07c8ce
Revises: 3c4f22db7a46
Create Date: 2022-04-01 23:49:20.982718

"""

import sqlalchemy as sa

from alembic import op


# revision identifiers, used by Alembic.
revision = 'b07e7b07c8ce'
down_revision = '3c4f22db7a46'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'note',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('run_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ['run_id'],
            ['run.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'note_audit_log',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.Column('datetime', sa.DateTime(), nullable=True),
        sa.Column('action', sa.Text(), nullable=True),
        sa.Column('before_edit', sa.Text(), nullable=True),
        sa.Column('after_edit', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['note_id'], ['note.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('note_audit_log')
    op.drop_table('note')
    # ### end Alembic commands ###
